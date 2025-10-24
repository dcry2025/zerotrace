// src/notes/notes.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import type { ClientMeta } from '../common/decorators';

describe('NotesController', () => {
  let controller: NotesController;
  let service: NotesService;

  const mockNotesService = {
    createNote: jest.fn(),
    readNote: jest.fn(),
    checkNoteStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [
        {
          provide: NotesService,
          useValue: mockNotesService,
        },
      ],
    }).compile();

    controller = module.get<NotesController>(NotesController);
    service = module.get<NotesService>(NotesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createNote', () => {
    it('should create a note', async () => {
      const createNoteDto = {
        content: 'Test content',
      };

      const clientMeta: ClientMeta = {
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Test Browser)',
      };

      const expectedResult = {
        uniqueLink: 'test-link',
        message: 'Note created successfully',
      };

      mockNotesService.createNote.mockResolvedValue(expectedResult);

      const result = await controller.createNote(createNoteDto, clientMeta);

      expect(result).toEqual(expectedResult);
      expect(service.createNote).toHaveBeenCalledWith(
        createNoteDto,
        clientMeta.ipAddress,
        clientMeta.userAgent,
      );
    });
  });

  describe('checkNoteStatus', () => {
    it('should return note status', async () => {
      const expectedResult = {
        exists: true,
        isRead: false,
        hasPassword: false,
      };

      mockNotesService.checkNoteStatus.mockResolvedValue(expectedResult);

      const result = await controller.checkNoteStatus('test-link');

      expect(result).toEqual(expectedResult);
      expect(service.checkNoteStatus).toHaveBeenCalledWith('test-link');
    });
  });
});
