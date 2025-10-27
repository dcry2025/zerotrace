// src/notes/dto/note-response.dto.ts

export class CreateNoteResponseDto {
  uniqueLink: string;
  deleteLink: string;
  message: string;
}

export class ReadNoteResponseDto {
  content: string;
}

export class NoteStatusResponseDto {
  exists: boolean;
  isRead: boolean;
  hasPassword: boolean;
}
