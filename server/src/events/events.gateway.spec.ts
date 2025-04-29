import {Test, TestingModule} from '@nestjs/testing';
import {EventsGateway} from './events.gateway';
import {MaterialsService} from '../materials/materials.service';
import {MaterialsExportService} from '../materials/materialsExport.service';
import {Server, Socket} from 'socket.io';
import {WsException} from '@nestjs/websockets';
import {Types} from 'mongoose';
import {createMock} from '@golevelup/ts-jest';
import {ConfigService} from '@nestjs/config';
import {UsersService} from '../users/users.service';

jest.mock('../auth/auth.guard', () => ({
    WSOptionalAuthenticationGuard: jest.fn().mockImplementation(() => ({
        canActivate: jest.fn().mockReturnValue(true)
    }))
}));

describe('EventsGateway', () => {
    let gateway: EventsGateway;
    let materialsService: MaterialsService;
    let materialsExportService: MaterialsExportService;
    let server: Server;

    const mockMaterial = {
        id: 'material-id-1',
        _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
        user: new Types.ObjectId('507f1f77bcf86cd799439012'),
        name: 'Test Material',
        slides: [
            {
                id: 'slide-id-1',
                thumbnail: '',
                position: 0,
                data: {
                    editor: {
                        size: {width: 1920, height: 1080},
                        color: '#ffffff'
                    },
                    blocks: []
                }
            }
        ],
        plugins: [],
        method: 'MANUAL',
        automaticTime: 5000,
        sizing: 'FIT_TO_SCREEN',
        visibility: 'PRIVATE',
        attendees: [new Types.ObjectId('507f1f77bcf86cd799439013')],
        markModified: jest.fn(),
        save: jest.fn().mockResolvedValue(true),
        updatedAt: new Date()
    };

    const createMockSocket = (id: string, userData: any = null): Socket => {
        return {
            id,
            data: {
                user: userData,
                editorRoom: null,
                playerRoom: null
            },
            join: jest.fn(),
            leave: jest.fn(),
            emit: jest.fn(),
            to: jest.fn().mockReturnValue({
                emit: jest.fn()
            }),
            on: jest.fn()
        } as unknown as Socket;
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EventsGateway,
                {
                    provide: MaterialsService,
                    useValue: {
                        findById: jest.fn().mockResolvedValue(mockMaterial)
                    }
                },
                {
                    provide: MaterialsExportService,
                    useValue: {
                        exportSlideThumbnails: jest.fn().mockResolvedValue(true)
                    }
                },
                {
                    provide: UsersService,
                    useValue: {
                        findById: jest.fn().mockResolvedValue({_id: 'user-id', name: 'Test User'}),
                        validateUser: jest.fn().mockResolvedValue(true)
                    }
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key) => {
                            if (key === 'JWT_SECRET') return 'test-secret';
                            return null;
                        })
                    }
                }
            ]
        }).compile();

        gateway = module.get<EventsGateway>(EventsGateway);
        materialsService = module.get<MaterialsService>(MaterialsService);
        materialsExportService = module.get<MaterialsExportService>(MaterialsExportService);
        server = createMock<Server>();
        gateway.server = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    describe('joinEditorMaterialRoom', () => {
        it('should throw an exception when material is not found', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});
            jest.spyOn(materialsService, 'findById').mockResolvedValue(null);

            await expect(gateway.handleJoinEditor('non-existent-id', client)).rejects.toThrow(WsException);
            await expect(gateway.handleJoinEditor('non-existent-id', client)).rejects.toThrow('Material not found');
        });

        it('should throw an exception when user is not authorized', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439099')});

            await expect(gateway.handleJoinEditor('material-id-1', client)).rejects.toThrow(WsException);
            await expect(gateway.handleJoinEditor('material-id-1', client)).rejects.toThrow('You cannot start edit this material');
        });

        it('should create a new room when room does not exist', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});

            await gateway.handleJoinEditor('material-id-1', client);

            expect(client.join).toHaveBeenCalled();
            expect(client.data.editorRoom).toBeDefined();
        });

        it('should add client to existing room', async () => {
            const client1 = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});
            const client2 = createMockSocket('client-2', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});

            await gateway.handleJoinEditor('material-id-1', client1);
            await gateway.handleJoinEditor('material-id-1', client2);

            expect(client1.join).toHaveBeenCalled();
            expect(client2.join).toHaveBeenCalled();
            expect(client1.data.editorRoom).toBeDefined();
            expect(client2.data.editorRoom).toBeDefined();

            // note(Matej) We can't directly compare rooms because of how Jest works with complex objects
            const room1 = gateway.getEditorRoom('material-id-1');
            expect(room1).toBeDefined();
            expect(client1.data.editorRoom).toBeTruthy();
            expect(client2.data.editorRoom).toBeTruthy();
        });

        it('should handle leaving previous room', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});
            const mockRoom = {
                removeListener: jest.fn(),
                getMaterialId: jest.fn().mockReturnValue('old-material-id')
            };
            client.data.editorRoom = mockRoom as any;

            await gateway.handleJoinEditor('material-id-1', client);

            expect(mockRoom.removeListener).toHaveBeenCalledWith(client);
        });
    });

    describe('leaveEditorMaterialRoom', () => {
        it('should remove client from room', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});
            const mockRoom = {
                removeListener: jest.fn()
            };
            client.data.editorRoom = mockRoom as any;

            await gateway.handleLeaveEditor(client);

            expect(mockRoom.removeListener).toHaveBeenCalledWith(client);
            expect(client.data.editorRoom).toBeNull();
        });

        it('should do nothing when client is not in a room', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});
            client.data.editorRoom = null;

            await gateway.handleLeaveEditor(client);

            expect(client.data.editorRoom).toBeNull();
        });
    });

    describe('changeSlide', () => {
        it('should throw exception when not in editor room', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});
            client.data.editorRoom = null;
            client.data.playerRoom = null;

            await expect(gateway.handleChangeSlide({slideId: 'slide-id-1'}, client)).rejects.toThrow(WsException);
            await expect(gateway.handleChangeSlide({slideId: 'slide-id-1'}, client)).rejects.toThrow('You are not in the editor room');
        });

        it('should change attendee slide', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});
            const mockRoom = {
                changeAttendeeSlide: jest.fn()
            };
            client.data.editorRoom = mockRoom as any;

            await gateway.handleChangeSlide({slideId: 'slide-id-1'}, client);

            expect(mockRoom.changeAttendeeSlide).toHaveBeenCalledWith(client, 'slide-id-1');
        });

        it('should let presenter change slide in player room', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});
            const mockPlayerRoom = {
                isPresenter: jest.fn().mockReturnValue(true),
                changeSlide: jest.fn()
            };
            client.data.playerRoom = mockPlayerRoom as any;

            await gateway.handleChangeSlide({slideId: 'slide-id-1'}, client);

            expect(mockPlayerRoom.changeSlide).toHaveBeenCalledWith('slide-id-1');
        });
    });

    describe('joinPlayerMaterialRoom', () => {
        it('should throw exception when material is not found', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});
            jest.spyOn(materialsService, 'findById').mockResolvedValue(null);

            await expect(gateway.handleJoinPlayer({
                materialId: 'non-existent-id',
                code: 'code',
                slideId: 'slide-id-1'
            }, client))
                .rejects.toThrow(WsException);
            await expect(gateway.handleJoinPlayer({
                materialId: 'non-existent-id',
                code: 'code',
                slideId: 'slide-id-1'
            }, client))
                .rejects.toThrow('Material not found');
        });

        it('should throw exception when user is not authorized', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439099')});

            await expect(gateway.handleJoinPlayer({
                materialId: 'material-id-1',
                code: 'code',
                slideId: 'slide-id-1'
            }, client))
                .rejects.toThrow(WsException);
            await expect(gateway.handleJoinPlayer({
                materialId: 'material-id-1',
                code: 'code',
                slideId: 'slide-id-1'
            }, client))
                .rejects.toThrow('You cannot start watch in this material');
        });

        it('should create new player room when room does not exist', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});

            await gateway.handleJoinPlayer({materialId: 'material-id-1', code: 'code', slideId: 'slide-id-1'}, client);

            expect(client.data.playerRoom).toBeDefined();
            expect(client.join).toHaveBeenCalled();
        });
    });

    describe('leavePlayerMaterialRoom', () => {
        it('should remove client from room', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});
            const mockRoom = {
                removeListener: jest.fn()
            };
            client.data.playerRoom = mockRoom as any;

            await gateway.handleLeavePlayer(client);

            expect(mockRoom.removeListener).toHaveBeenCalledWith(client);
            expect(client.data.playerRoom).toBeNull();
        });
    });

    describe('synchronizeDraw', () => {
        it('should throw exception when not in player room', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});
            client.data.playerRoom = null;

            await expect(gateway.handleSynchronizeDraw({content: 'drawing-data'}, client)).rejects.toThrow(WsException);
            await expect(gateway.handleSynchronizeDraw({content: 'drawing-data'}, client)).rejects.toThrow('You are not in the player room');
        });

        it('should throw exception when not the presenter', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});
            const mockRoom = {
                isPresenter: jest.fn().mockReturnValue(false)
            };
            client.data.playerRoom = mockRoom as any;

            await expect(gateway.handleSynchronizeDraw({content: 'drawing-data'}, client)).rejects.toThrow(WsException);
            await expect(gateway.handleSynchronizeDraw({content: 'drawing-data'}, client)).rejects.toThrow('You are not the presenter');
        });

        it('should synchronize drawing', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});
            const mockRoom = {
                isPresenter: jest.fn().mockReturnValue(true),
                synchronizeDraw: jest.fn()
            };
            client.data.playerRoom = mockRoom as any;

            await gateway.handleSynchronizeDraw({content: 'drawing-data'}, client);

            expect(mockRoom.synchronizeDraw).toHaveBeenCalledWith('drawing-data');
        });
    });

    describe('synchronizeBlock', () => {
        it('should throw exception when not in editor room', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});
            client.data.editorRoom = null;

            await expect(gateway.handleSynchronizeBlock({block: {id: 'block-1'}}, client)).rejects.toThrow(WsException);
            await expect(gateway.handleSynchronizeBlock({block: {id: 'block-1'}}, client)).rejects.toThrow('You are not in the editor room');
        });

        it('should synchronize block', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});
            const mockRoom = {
                synchronizeBlock: jest.fn()
            };
            client.data.editorRoom = mockRoom as any;
            const blockData = {id: 'block-1', content: 'test'};

            await gateway.handleSynchronizeBlock({block: blockData}, client);

            expect(mockRoom.synchronizeBlock).toHaveBeenCalledWith(client, blockData);
        });
    });

    describe('removeBlock', () => {
        it('should throw exception when not in editor room', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});
            client.data.editorRoom = null;

            await expect(gateway.handleRemoveBlock({blockId: 'block-1'}, client)).rejects.toThrow(WsException);
            await expect(gateway.handleRemoveBlock({blockId: 'block-1'}, client)).rejects.toThrow('You are not in the editor room');
        });

        it('should remove block', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});
            const mockRoom = {
                removeBlock: jest.fn()
            };
            client.data.editorRoom = mockRoom as any;

            await gateway.handleRemoveBlock({blockId: 'block-1'}, client);

            expect(mockRoom.removeBlock).toHaveBeenCalledWith(client, 'block-1');
        });
    });

    describe('synchronizeMaterial', () => {
        it('should throw exception when not in editor room', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});
            client.data.editorRoom = null;

            const materialData = {
                plugins: [{plugin: 'plugin-1', release: '1.0.0'}],
                name: 'Updated Material',
                method: 'AUTOMATIC',
                automaticTime: 3000,
                sizing: 'FIT_TO_SCREEN',
                visibility: 'PUBLIC'
            } as any;

            await expect(gateway.handleSynchronizeMaterial(materialData, client)).rejects.toThrow(WsException);
            await expect(gateway.handleSynchronizeMaterial(materialData, client)).rejects.toThrow('You are not in the editor room');
        });

        it('should synchronize material', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});
            const mockRoom = {
                synchronizeMaterial: jest.fn()
            };
            client.data.editorRoom = mockRoom as any;

            const materialData = {
                plugins: [{plugin: 'plugin-1', release: '1.0.0'}],
                name: 'Updated Material',
                method: 'AUTOMATIC',
                automaticTime: 3000,
                sizing: 'FIT_TO_SCREEN',
                visibility: 'PUBLIC'
            } as any;

            await gateway.handleSynchronizeMaterial(materialData, client);

            expect(mockRoom.synchronizeMaterial).toHaveBeenCalledWith(materialData);
        });
    });


    describe('blockMessage handling', () => {
        it('should throw exception when sending block message without being in player room', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});
            client.data.playerRoom = null;
            console.log("going for it");

            await expect(gateway.handleSendBlockMessage({
                message: 'test',
                blockId: 'block-1'
            }, client)).rejects.toThrow(WsException);
            await expect(gateway.handleSendBlockMessage({
                message: 'test',
                blockId: 'block-1'
            }, client)).rejects.toThrow('You are not in the player room');
        });

        it('should throw exception when presenter tries to send block message', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});
            const mockRoom = {
                isPresenter: jest.fn().mockReturnValue(true)
            };
            client.data.playerRoom = mockRoom as any;

            await expect(gateway.handleSendBlockMessage({
                message: 'test',
                blockId: 'block-1'
            }, client)).rejects.toThrow(WsException);
            await expect(gateway.handleSendBlockMessage({
                message: 'test',
                blockId: 'block-1'
            }, client)).rejects.toThrow('You are the presenter');
        });

        it('should send block message from attendee to presenter', async () => {
            const client = createMockSocket('client-1', {_id: new Types.ObjectId('507f1f77bcf86cd799439012')});
            const mockRoom = {
                isPresenter: jest.fn().mockReturnValue(false),
                sendBlockMessage: jest.fn()
            };
            client.data.playerRoom = mockRoom as any;

            await gateway.handleSendBlockMessage({message: 'test', blockId: 'block-1'}, client);

            expect(mockRoom.sendBlockMessage).toHaveBeenCalledWith(client, 'test', 'block-1');
        });
    });
});