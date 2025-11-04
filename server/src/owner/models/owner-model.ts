// src/owner/models/owner.model.ts

import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Note } from '../../notes/models/note-model';

@Table({
  tableName: 'owners',
  timestamps: true,
  underscored: true,
})
export class Owner extends Model<Owner> {
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    unique: true,
    field: 'telegram_chat_id',
    comment: 'Telegram chat ID (unique per user)',
  })
  telegramChatId: string;

  @Column({
    type: DataType.STRING(32),
    allowNull: true,
    field: 'telegram_username',
    comment: 'Telegram username (optional)',
  })
  telegramUsername: string;

  // Relation: Owner has many Notes
  @HasMany(() => Note)
  notes: Note[];
}
