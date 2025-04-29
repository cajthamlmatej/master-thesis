import {Test, TestingModule} from '@nestjs/testing';
import {AuthController} from './auth.controller';
import {UsersService} from '../users/users.service';
import {AuthService} from './auth.service';
import {EmailService} from '../email/email.service';
import {ConfigService} from '@nestjs/config';
import {BadRequestException} from '@nestjs/common';
import InAuthDTO from '../../dto/authentication/InAuthenticationDTO';
import RegisterAuthenticationDTO from '../../dto/authentication/RegisterAuthenticationDTO';
import ActivateAuthenticationDTO from '../../dto/authentication/ActivateAuthenticationDTO';

describe('AuthController', () => {
    let controller: AuthController;
    let usersService: jest.Mocked<UsersService>;
    let authService: jest.Mocked<AuthService>;
    let emailService: jest.Mocked<EmailService>;
    let configService: jest.Mocked<ConfigService>;

    const mockUser = {
        _id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        token: 'verify-token',
        active: false
    } as any;

    beforeEach(async () => {
        usersService = ({
            getByEmail: jest.fn(),
            generateToken: jest.fn(),
            comparePassword: jest.fn(),
            hashPassword: jest.fn(),
            create: jest.fn(),
            getByVerifyToken: jest.fn(),
            activate: jest.fn(),
        } as unknown) as jest.Mocked<UsersService>;

        authService = ({
            hasUserValidRequest: jest.fn(),
            createRequest: jest.fn(),
            getValidByCode: jest.fn(),
            markRequestAsUsed: jest.fn(),
        } as unknown) as jest.Mocked<AuthService>;

        emailService = ({
            sendEmail: jest.fn(),
        } as unknown) as jest.Mocked<EmailService>;

        configService = ({
            get: jest.fn((key: string) => {
                switch (key) {
                    case 'FRONTEND_DOMAIN':
                        return 'http://app.com';
                    case 'FRONTEND_DOMAIN_AUTHENTICATION':
                        return '/login';
                    case 'FRONTEND_DOMAIN_AUTHENTICATION_VALIDATE':
                        return '/activate/{{token}}';
                    default:
                        return '';
                }
            }),
        } as unknown) as jest.Mocked<ConfigService>;

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {provide: UsersService, useValue: usersService},
                {provide: AuthService, useValue: authService},
                {provide: EmailService, useValue: emailService},
                {provide: ConfigService, useValue: configService},
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
    });

    describe('in()', () => {
        it('should initiate email request when no code provided and no valid request exists', async () => {
            const dto: InAuthDTO = {email: mockUser.email, type: 'EMAIL'} as any;
            usersService.getByEmail.mockResolvedValue(mockUser);
            authService.hasUserValidRequest.mockResolvedValue(false);
            authService.createRequest.mockResolvedValue({code: '123456'} as any);

            const result = await controller.in(dto);
            expect(result).toEqual({success: true});
            expect(authService.createRequest).toHaveBeenCalledWith(mockUser);
            expect(emailService.sendEmail).toHaveBeenCalledWith(
                mockUser.email,
                expect.any(Object),
                expect.objectContaining({code: '123456', name: mockUser.name, link: expect.any(String)}),
            );
        });

        it('should throw if user has existing valid email request', async () => {
            const dto: InAuthDTO = {email: mockUser.email, type: 'EMAIL'} as any;
            usersService.getByEmail.mockResolvedValue(mockUser);
            authService.hasUserValidRequest.mockResolvedValue(true);

            await expect(controller.in(dto)).rejects.toThrow(BadRequestException);
            await expect(controller.in(dto)).rejects.toThrow('User already has a valid request for email authentication.');
        });

        it('should authenticate with code and return token', async () => {
            const dto: InAuthDTO = {email: mockUser.email, type: 'EMAIL', code: '654321'} as any;
            usersService.getByEmail.mockResolvedValue(mockUser);
            authService.getValidByCode.mockResolvedValue({code: '654321', user: mockUser._id} as any);
            usersService.generateToken.mockResolvedValue('jwt-token');

            const result = await controller.in(dto);
            expect(result).toEqual({token: 'jwt-token'});
            expect(authService.markRequestAsUsed).toHaveBeenCalled();
        });

        it('should reject invalid code', async () => {
            const dto: InAuthDTO = {email: mockUser.email, type: 'EMAIL', code: '000000'} as any;
            usersService.getByEmail.mockResolvedValue(mockUser);
            authService.getValidByCode.mockResolvedValue(null);

            await expect(controller.in(dto)).rejects.toThrow(BadRequestException);
            await expect(controller.in(dto)).rejects.toThrow('Invalid code.');
        });

        it('should authenticate with email and password', async () => {
            const dto: InAuthDTO = {email: mockUser.email, type: 'EMAIL_PASSWORD', password: 'pass'} as any;
            usersService.getByEmail.mockResolvedValue(mockUser);
            usersService.comparePassword.mockResolvedValue(true);
            usersService.generateToken.mockResolvedValue('jwt-pass');

            const result = await controller.in(dto);
            expect(result).toEqual({token: 'jwt-pass'});
        });

        it('should reject missing password for EMAIL_PASSWORD', async () => {
            const dto: InAuthDTO = {email: mockUser.email, type: 'EMAIL_PASSWORD'} as any;
            usersService.getByEmail.mockResolvedValue(mockUser);

            await expect(controller.in(dto)).rejects.toThrow(BadRequestException);
            await expect(controller.in(dto)).rejects.toThrow('Password is required when using EMAIL_PASSWORD authentication type.');
        });

        it('should reject invalid password', async () => {
            const dto: InAuthDTO = {email: mockUser.email, type: 'EMAIL_PASSWORD', password: 'wrong'} as any;
            usersService.getByEmail.mockResolvedValue(mockUser);
            usersService.comparePassword.mockResolvedValue(false);

            await expect(controller.in(dto)).rejects.toThrow(BadRequestException);
            await expect(controller.in(dto)).rejects.toThrow('Invalid password.');
        });

        it('should reject unknown authentication type', async () => {
            const dto = {email: mockUser.email, type: 'UNKNOWN'} as any;
            usersService.getByEmail.mockResolvedValue(mockUser);

            await expect(controller.in(dto)).rejects.toThrow(BadRequestException);
            await expect(controller.in(dto)).rejects.toThrow('Invalid authentication type.');
        });
    });

    describe('register()', () => {
        it('should throw if user already exists', async () => {
            const dto: RegisterAuthenticationDTO = {name: 'New', email: mockUser.email, password: 'pass'} as any;
            usersService.getByEmail.mockResolvedValue(mockUser);

            await expect(controller.register(dto)).rejects.toThrow(BadRequestException);
            await expect(controller.register(dto)).rejects.toThrow('User already exists.');
        });

        it('should create new user and send verification email', async () => {
            const dto: RegisterAuthenticationDTO = {name: 'New', email: mockUser.email, password: 'pass'} as any;
            usersService.getByEmail.mockResolvedValue(null);
            usersService.hashPassword.mockResolvedValue('hashed');
            usersService.create.mockResolvedValue(mockUser);

            const result = await controller.register(dto);
            expect(result).toEqual({success: true});
            expect(usersService.create).toHaveBeenCalledWith({name: dto.name, email: dto.email, password: 'hashed'});
            expect(emailService.sendEmail).toHaveBeenCalledWith(
                mockUser.email,
                expect.any(Object),
                expect.objectContaining({name: mockUser.name, link: expect.stringContaining('http://app.com')}),
            );
        });
    });

    describe('activate()', () => {
        it('should reject invalid token', async () => {
            const dto: ActivateAuthenticationDTO = {token: 'bad'} as any;
            usersService.getByVerifyToken.mockResolvedValue(null);

            await expect(controller.activate(dto)).rejects.toThrow(BadRequestException);
            await expect(controller.activate(dto)).rejects.toThrow('Invalid token.');
        });

        it('should reject already activated user', async () => {
            const dto: ActivateAuthenticationDTO = {token: 'token'} as any;
            usersService.getByVerifyToken.mockResolvedValue({...mockUser, active: true} as any);

            await expect(controller.activate(dto)).rejects.toThrow(BadRequestException);
            await expect(controller.activate(dto)).rejects.toThrow('User is already activated.');
        });

        it('should activate user and return success', async () => {
            const dto: ActivateAuthenticationDTO = {token: 'token'} as any;
            usersService.getByVerifyToken.mockResolvedValue(mockUser);

            const result = await controller.activate(dto);
            expect(result).toEqual({success: true});
            expect(usersService.activate).toHaveBeenCalledWith(mockUser);
        });
    });
});
