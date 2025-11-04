// src/notes/notes.controller.ts

// Nest js
import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

// Services
import { NotesService } from './notes.service';

// Decorators
import { CustomThrottle, ClientMeta } from '../common/decorators';

// Types
import type { ClientMeta as ClientMetaType } from '../common/decorators';

// Dto
import { CreateNoteDto } from './dto/create-note.dto';
import { ReadNoteDto } from './dto/read-note.dto';
import {
  CreateNoteResponseDto,
  ReadNoteResponseDto,
  NoteStatusResponseDto,
} from './dto/note-response.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  /**
   * Create a new note
   * POST /notes
   * Rate limit: 5 notes per 10 seconds to prevent spam
   */
  @CustomThrottle({ short: { limit: 5, ttl: 10000 } })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createNote(
    @Body() createNoteDto: CreateNoteDto,
    @ClientMeta() clientMeta: ClientMetaType,
  ): Promise<CreateNoteResponseDto> {
    return this.notesService.createNote(
      createNoteDto,
      clientMeta.ipAddress,
      clientMeta.userAgent,
    );
  }

  /**
   * Read a note (marks it as read, but keeps in database)
   * POST /notes/:uniqueLink/read
   */
  @Post(':uniqueLink/read')
  @HttpCode(HttpStatus.OK)
  async readNote(
    @Param('uniqueLink') uniqueLink: string,
    @Body() readNoteDto: ReadNoteDto,
    @ClientMeta() clientMeta: ClientMetaType,
  ): Promise<ReadNoteResponseDto> {
    return this.notesService.readNote(
      uniqueLink,
      readNoteDto,
      clientMeta.ipAddress,
      clientMeta.userAgent,
    );
  }

  /**
   * Check note status without reading
   * GET /notes/:uniqueLink/status
   */
  @Get(':uniqueLink/status')
  @HttpCode(HttpStatus.OK)
  async checkNoteStatus(
    @Param('uniqueLink') uniqueLink: string,
  ): Promise<NoteStatusResponseDto> {
    return this.notesService.checkNoteStatus(uniqueLink);
  }

  /**
   * Destroy note immediately by owner
   * DELETE /notes/:uniqueLink
   * Rate limit: 10 deletions per minute
   */
  @CustomThrottle({ medium: { limit: 10, ttl: 60000 } })
  @Delete(':uniqueLink')
  @HttpCode(HttpStatus.OK)
  async destroyNote(
    @Param('uniqueLink') uniqueLink: string,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.notesService.markNoteAsReadByOwner(uniqueLink);
    return {
      success: result,
      message: result
        ? 'Note destroyed successfully'
        : 'Note not found or already destroyed',
    };
  }

  /**
   * Destroy note by delete link
   * DELETE /notes/delete/:deleteLink
   * Rate limit: 10 deletions per minute
   */
  @CustomThrottle({ medium: { limit: 10, ttl: 60000 } })
  @Delete('delete/:deleteLink')
  @HttpCode(HttpStatus.OK)
  async destroyNoteByDeleteLink(
    @Param('deleteLink') deleteLink: string,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.notesService.destroyNoteByDeleteLink(deleteLink);
    return {
      success: result,
      message: result
        ? 'Note destroyed successfully'
        : 'Note not found or already destroyed',
    };
  }

  /**
   * Destroy note by delete link via GET request (for direct browser access)
   * GET /notes/delete/:deleteLink
   * Rate limit: 10 deletions per minute
   */
  @CustomThrottle({ medium: { limit: 10, ttl: 60000 } })
  @Get('delete/:deleteLink')
  @HttpCode(HttpStatus.OK)
  async destroyNoteByDeleteLinkGet(
    @Param('deleteLink') deleteLink: string,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.notesService.destroyNoteByDeleteLink(deleteLink);
    return {
      success: result,
      message: result
        ? 'Note destroyed successfully'
        : 'Note not found or already destroyed',
    };
  }
}
