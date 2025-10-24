// src/notes/dto/read-note.dto.ts

// Class validator
import { IsString, IsOptional } from 'class-validator';

export class ReadNoteDto {
  @IsOptional()
  @IsString()
  password?: string;
}
