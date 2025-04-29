import {Test, TestingModule} from '@nestjs/testing';
import {DataExportController} from './data-export.controller';
import {DataExportService} from './data-export.service';
import {NotFoundException, StreamableFile} from '@nestjs/common';
import {promises as fsPromises} from 'fs';
import * as path from 'path';
import {RequestWithUser} from '../types';
import {RequiresAuthenticationGuard} from '../auth/auth.guard';
import {UsersService} from '../users/users.service';
import {ConfigService} from '@nestjs/config';

describe('DataExportController', () => {
    let controller: DataExportController;
    let service: { get: jest.Mock; create: jest.Mock; getPath: jest.Mock };
    const mockUser = {id: 'user-id', name: 'Test User', email: 'test@example.com'};
    const req = {user: mockUser} as RequestWithUser;

    beforeEach(async () => {
        service = {
            get: jest.fn(),
            create: jest.fn(),
            getPath: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [DataExportController],
            providers: [
                {provide: DataExportService, useValue: service},
                {provide: RequiresAuthenticationGuard, useValue: {canActivate: jest.fn(() => true)}},
                {provide: UsersService, useValue: {}},
                {provide: ConfigService, useValue: {}},
            ],
        }).compile();

        controller = module.get<DataExportController>(DataExportController);
    });

    describe('get()', () => {
        it('should return data export DTO when exists', async () => {
            const now = new Date();
            const exportDto = {
                id: 'export-1',
                requestedAt: now,
                completedAt: now,
                expiresAt: new Date(now.getTime() + 1000),
            };
            service.get.mockResolvedValue(exportDto);

            const result = await controller.get('ignored-id', req);
            expect(result).toEqual({dataExport: exportDto});
            expect(service.get).toHaveBeenCalledWith(mockUser);
        });

        it('should throw NotFoundException when no data export', async () => {
            service.get.mockResolvedValue(null);
            await expect(controller.get('ignored-id', req)).rejects.toThrow(NotFoundException);
            await expect(controller.get('ignored-id', req)).rejects.toThrow('No data export found');
        });
    });

    describe('create()', () => {
        it('should throw NotFoundException when export already exists', async () => {
            service.get.mockResolvedValue({} as any);
            await expect(controller.create('ignored-id', req)).rejects.toThrow(NotFoundException);
            await expect(controller.create('ignored-id', req)).rejects.toThrow('Data export already exists');
        });

        it('should create new data export when none exists', async () => {
            service.get.mockResolvedValue(null);
            service.create.mockResolvedValue({id: 'new-export'} as any);

            const result = await controller.create('ignored-id', req);
            expect(result).toEqual({success: true});
            expect(service.create).toHaveBeenCalledWith(mockUser);
        });
    });

    describe('getOne()', () => {
        const baseExport = {
            id: 'export-1',
            requestedAt: new Date(),
            completedAt: new Date(Date.now() - 1000),
            expiresAt: new Date(Date.now() + 1000),
        };

        it('should throw when no data export found', async () => {
            service.get.mockResolvedValue(null);
            await expect(controller.getOne('ignored-id', 'export-1', req)).rejects.toThrow(NotFoundException);
            await expect(controller.getOne('ignored-id', 'export-1', req)).rejects.toThrow('No data export found');
        });

        it('should throw when exportId does not match', async () => {
            service.get.mockResolvedValue({...baseExport} as any);
            await expect(controller.getOne('ignored-id', 'other-id', req)).rejects.toThrow(NotFoundException);
            await expect(controller.getOne('ignored-id', 'other-id', req)).rejects.toThrow('Data export not found');
        });

        it('should throw when not completed', async () => {
            service.get.mockResolvedValue({...baseExport, completedAt: undefined} as any);
            await expect(controller.getOne('ignored-id', 'export-1', req)).rejects.toThrow(NotFoundException);
            await expect(controller.getOne('ignored-id', 'export-1', req)).rejects.toThrow('Data export not completed');
        });

        it('should throw when expired', async () => {
            service.get.mockResolvedValue({...baseExport, expiresAt: new Date(Date.now() - 2000)} as any);
            await expect(controller.getOne('ignored-id', 'export-1', req)).rejects.toThrow(NotFoundException);
            await expect(controller.getOne('ignored-id', 'export-1', req)).rejects.toThrow('Data export expired');
        });

        it('should return StreamableFile when valid', async () => {
            // Prepare dummy file
            const tempDir = path.join(__dirname, '../../temp', 'temp-test');
            await fsPromises.mkdir(tempDir, {recursive: true});
            const filePath = path.join(tempDir, 'data-export.zip');
            await fsPromises.writeFile(filePath, 'dummy');

            service.get.mockResolvedValue({...baseExport} as any);
            service.getPath.mockReturnValue(filePath);

            const result = await controller.getOne('ignored-id', 'export-1', req);
            expect(result).toBeInstanceOf(StreamableFile);
            const headers = (result as any).getHeaders();
            console.log(headers);
            expect(headers).toHaveProperty('disposition', "inline; filename=\"data-export.zip\"; filename*=UTF-8''data-export.zip';");
        });
    });
});
