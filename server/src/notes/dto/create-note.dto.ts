// src/notes/dto/create-note.dto.ts

// Class validator
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50000, {
    message: 'Note content is too long. Maximum 50,000 characters allowed.',
  })
  content: string;

  @IsOptional()
  @IsString()
  metadataHash?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128, {
    message: 'Password is too long. Maximum 128 characters allowed.',
  })
  password?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30) // Maximum 30 days
  expiresInDays?: number;

  @IsOptional()
  @IsBoolean()
  notifyOnRead?: boolean;
}
