import {Test, TestingModule} from '@nestjs/testing';
import {MaterialsController} from './materials.controller';
import {MaterialsService} from './materials.service';
import {MaterialsExportService} from './materialsExport.service';
import {UsersService} from '../users/users.service';
import {EventsGateway} from '../events/events.gateway';
import {RequestWithUser} from '../types';
import {BadRequestException, StreamableFile, UnauthorizedException} from '@nestjs/common';
import {Readable} from 'stream';
import {ConfigService} from '@nestjs/config';
import {OptionalAuthenticationGuard, RequiresAuthenticationGuard} from '../auth/auth.guard';

jest.mock('../utils/normalize', () => ({normalizeString: (s: string) => s}));

describe('MaterialsController', () => {
    let controller: MaterialsController;
    let materialsService: jest.Mocked<MaterialsService>;
    let materialsExportService: jest.Mocked<MaterialsExportService>;
    let userService: jest.Mocked<UsersService>;
    let eventsGateway: jest.Mocked<EventsGateway>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MaterialsController],
            providers: [
                {
                    provide: MaterialsService,
                    useValue: {
                        getFeaturedMaterials: jest.fn(),
                        findAllForUser: jest.fn(),
                        findById: jest.fn(),
                        update: jest.fn(),
                        create: jest.fn(),
                        remove: jest.fn(),
                        updateFeatured: jest.fn(),
                    },
                },
                {
                    provide: MaterialsExportService,
                    useValue: {
                        getToken: jest.fn(),
                        exportMaterial: jest.fn(),
                    },
                },
                {
                    provide: UsersService,
                    useValue: {
                        getById: jest.fn(),
                        getByEmail: jest.fn(),
                    },
                },
                {
                    provide: EventsGateway,
                    useValue: {
                        getEditorRoom: jest.fn(),
                    },
                },
                {provide: RequiresAuthenticationGuard, useValue: {canActivate: jest.fn(() => true)}},
                {provide: OptionalAuthenticationGuard, useValue: {canActivate: jest.fn(() => true)}},
                {provide: ConfigService, useValue: {get: jest.fn()}},
            ],
        }).compile();

        controller = module.get<MaterialsController>(MaterialsController);
        materialsService = module.get(MaterialsService) as jest.Mocked<MaterialsService>;
        materialsExportService = module.get(MaterialsExportService) as jest.Mocked<MaterialsExportService>;
        userService = module.get(UsersService) as jest.Mocked<UsersService>;
        eventsGateway = module.get(EventsGateway) as jest.Mocked<EventsGateway>;
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('featured', () => {
        it('should return featured materials', async () => {
            const featured = [{id: '1', user: 'user1', thumbnail: 'thumb1', name: 'name1'}];
            materialsService.getFeaturedMaterials.mockResolvedValue(featured);
            const result = await controller.featured('ignored', {} as RequestWithUser);
            expect(result).toEqual({materials: featured});
        });
    });

    describe('findAllForUser', () => {
        const now = new Date();
        it('should throw if unauthorized', async () => {
            const req = {user: {id: 'user2'}} as RequestWithUser;
            await expect(controller.findAllForUser('user1', req)).rejects.toThrow(UnauthorizedException);
        });

        it('should return materials for user', async () => {
            const req = {user: {id: 'user1'}} as RequestWithUser;
            const materials = [
                {
                    id: 'm1',
                    name: 'Mat1',
                    createdAt: now,
                    updatedAt: now,
                    slides: [{thumbnail: 't1'}],
                    user: 'user1',
                    featured: false
                },
            ];
            materialsService.findAllForUser.mockResolvedValue(materials as any);
            const result = await controller.findAllForUser('user1', req);
            expect(result).toEqual({
                materials: [
                    {
                        id: 'm1',
                        name: 'Mat1',
                        createdAt: now,
                        updatedAt: now,
                        thumbnail: 't1',
                        user: 'user1',
                        featured: false
                    }
                ]
            });
        });
    });

    describe('findOne', () => {
        const now = new Date();
        let materialDoc: any;

        beforeEach(() => {
            materialDoc = {
                id: 'm1',
                name: 'Mat1',
                plugins: [],
                visibility: 'PUBLIC',
                method: 'MANUAL',
                automaticTime: 1000,
                sizing: 'FIT_TO_SCREEN',
                createdAt: now,
                updatedAt: now,
                user: 'user1',
                slides: [{
                    id: 's1',
                    thumbnail: 't1',
                    position: 0,
                    data: {editor: {size: {width: 100, height: 100}, color: 'white'}, blocks: []}
                }],
                attendees: [],
                featured: true,
                populate: jest.fn().mockResolvedValue({attendees: [{id: 'a1', name: 'Att1'}]}),
            };
            eventsGateway.getEditorRoom.mockReturnValue(undefined);
        });

        it('should throw if not found', async () => {
            materialsService.findById.mockResolvedValue(null);
            await expect(controller.findOne('m1', {} as any, undefined)).rejects.toThrow(BadRequestException);
        });

        it('should return material data for public', async () => {
            materialsService.findById.mockResolvedValue(materialDoc);
            const result = await controller.findOne('m1', {} as RequestWithUser, undefined);
            expect(result).toEqual({
                material: {
                    id: 'm1', name: 'Mat1', plugins: [], visibility: 'PUBLIC', method: 'MANUAL', automaticTime: 1000,
                    sizing: 'FIT_TO_SCREEN', createdAt: now, updatedAt: now, user: 'user1',
                    slides: [{id: 's1', thumbnail: 't1', position: 0, data: materialDoc.slides[0].data}],
                    attendees: [{id: 'a1', name: 'Att1'}], featured: true,
                }
            });
        });
    });

    describe('update', () => {
        const updateDto = {name: 'NewName'} as any;
        let material: any;

        beforeEach(() => {
            material = {id: 'm1', user: 'owner', attendees: [], toString: () => 'm1'};
            materialsService.findById.mockResolvedValue(material);
        });

        it('should throw if not found', async () => {
            materialsService.findById.mockResolvedValue(null);
            await expect(controller.update('m1', updateDto, {user: {id: 'owner'}} as any)).rejects.toThrow(BadRequestException);
        });

        it('should throw if unauthorized', async () => {
            material.user = 'owner';
            const req = {user: {id: 'other'}} as RequestWithUser;
            await expect(controller.update('m1', updateDto, req)).rejects.toThrow(UnauthorizedException);
        });

        it('should update for attendee', async () => {
            material.user = 'owner';
            material.attendees = ['attendee'];
            const req = {user: {id: 'attendee'}} as RequestWithUser;
            await controller.update('m1', updateDto, req);
            expect(materialsService.update).toHaveBeenCalledWith(material, updateDto);
        });

        it('should update for owner and refresh featured', async () => {
            material.user = 'owner';
            material.attendees = [];
            const req = {user: {id: 'owner'}} as RequestWithUser;
            const dtoWithFeatured = {featured: true} as any;
            materialsService.getFeaturedMaterials.mockResolvedValue([]);
            await controller.update('m1', dtoWithFeatured, req);
            expect(materialsService.update).toHaveBeenCalled();
            expect(materialsService.updateFeatured).toHaveBeenCalled();
        });
    });

    describe('create', () => {
        it('should create and return material', async () => {
            const now = new Date();
            const createDto = {
                name: 'New',
                plugins: [{plugin: 'p1', release: 'r1'}],
                visibility: 'PUBLIC',
                method: 'MANUAL',
                automaticTime: 500,
                sizing: 'FIT_TO_SCREEN',
                slides: []
            } as any;
            const saved = {
                id: 'm2',
                name: 'New',
                plugins: [{plugin: 'p1', release: 'r1'}],
                visibility: 'PUBLIC',
                method: 'MANUAL',
                automaticTime: 500,
                sizing: 'FIT_TO_SCREEN',
                user: 'u1',
                createdAt: now,
                updatedAt: now,
                slides: [],
                featured: false
            } as any;
            materialsService.create.mockResolvedValue(saved);
            const result = await controller.create(createDto, {user: {id: 'u1'}} as any);
            expect(result).toEqual({material: saved});
        });
    });

    describe('remove', () => {
        it('should throw if not found', async () => {
            materialsService.findById.mockResolvedValue(null);
            await expect(controller.remove('m1', {user: {id: 'u1'}} as any)).rejects.toThrow(BadRequestException);
        });

        it('should throw if unauthorized', async () => {
            const mat = {id: 'm1', user: 'owner'} as any;
            materialsService.findById.mockResolvedValue(mat);
            await expect(controller.remove('m1', {user: {id: 'u2'}} as any)).rejects.toThrow(UnauthorizedException);
        });

        it('should remove if owner', async () => {
            const mat = {id: 'm1', user: 'u1'} as any;
            materialsService.findById.mockResolvedValue(mat);
            await controller.remove('m1', {user: {id: 'u1'}} as any);
            expect(materialsService.remove).toHaveBeenCalledWith(mat);
        });
    });

    describe('export', () => {
        it('should throw if not found', async () => {
            materialsService.findById.mockResolvedValue(null);
            await expect(controller.export('m1', {user: {id: 'u1'}} as any, 'pdf')).rejects.toThrow(BadRequestException);
        });

        it('should throw if unauthorized', async () => {
            const mat = {id: 'm1', user: 'owner', attendees: []} as any;
            materialsService.findById.mockResolvedValue(mat);
            await expect(controller.export('m1', {user: {id: 'u1'}} as any, 'pdf')).rejects.toThrow(UnauthorizedException);
        });

        it('should return streamable file on success', async () => {
            const mat = {id: 'm1', name: 'TestMat', user: 'u1', attendees: []} as any;
            materialsService.findById.mockResolvedValue(mat);
            const fakeStream = Readable.from(['data']);
            materialsExportService.exportMaterial.mockResolvedValue(fakeStream as any);
            const result = await controller.export('m1', {user: {id: 'u1'}} as any, 'pdf');
            expect(result).toBeInstanceOf(StreamableFile);
            const headers = (result as any).getHeaders();
            expect(headers.disposition).toContain('inline; filename="TestMat"');
        });

        it('should throw wrong format error', async () => {
            const mat = {id: 'm1', user: 'u1', attendees: []} as any;
            materialsService.findById.mockResolvedValue(mat);
            materialsExportService.exportMaterial.mockRejectedValue(new Error('fail'));
            await expect(controller.export('m1', {user: {id: 'u1'}} as any, 'txt')).rejects.toThrow(BadRequestException);
            await expect(controller.export('m1', {user: {id: 'u1'}} as any, 'txt')).rejects.toThrow('Wrong format provided');
        });
    });
});
