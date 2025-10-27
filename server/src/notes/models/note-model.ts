// src/notes/models/note-model.ts

// Sequelize
import {
  Table,
  Column,
  Model,
  DataType,
  DeletedAt,
  BeforeCreate,
  BeforeUpdate,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import * as argon2 from 'argon2';
import { Owner } from '../../owner/models/owner-model';

@Table({
  tableName: 'notes',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class Note extends Model<Note> {
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: 'Note content (plain text - not encrypted)',
  })
  content: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'metadata_hash',
    comment: 'Additional metadata hash for note integrity verification',
  })
  metadataHash: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
    unique: true,
    field: 'unique_link',
    comment: 'Unique link identifier for accessing the note',
  })
  uniqueLink: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
    unique: true,
    field: 'delete_link',
    comment: 'Unique delete link identifier for destroying the note',
  })
  deleteLink: string;

  @Column({
    type: DataType.STRING(128),
    allowNull: true,
    field: 'password_hash',
    comment: 'Hashed password for protected notes (argon2)',
  })
  passwordHash: string;

  // Virtual field for plaintext password (not saved to DB, only for setting)
  @Column({
    type: DataType.VIRTUAL,
    allowNull: true,
  })
  password?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'expires_at',
    comment: 'Expiration timestamp for the note',
  })
  expiresAt: Date;

  @Column({
    type: DataType.STRING(45),
    allowNull: true,
    field: 'ip_address',
    comment: 'IP address of note creator (IPv4: 15 chars, IPv6: 45 chars)',
  })
  ipAddress: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'notify_on_read',
    comment: 'Whether to notify when note is read',
  })
  notifyOnRead: boolean;

  @ForeignKey(() => Owner)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: true,
    field: 'owner_id',
    comment: 'Reference to owner (for Telegram notifications)',
  })
  ownerId: number;

  // Relation: Note belongs to Owner
  @BelongsTo(() => Owner)
  owner: Owner;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'read_at',
    comment: 'Timestamp when note was read',
  })
  readAt: Date;

  /**
   * Computed property: true if note has been read (readAt is not null)
   */
  get isRead(): boolean {
    return this.readAt !== null && this.readAt !== undefined;
  }

  @DeletedAt
  @Column({
    field: 'deleted_at',
  })
  deletedAt: Date;

  /**
   * Hash password before creating or updating note
   * Uses Argon2id algorithm for secure password hashing
   */
  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: Note) {
    if (instance.password) {
      // Use Argon2id with recommended settings
      instance.passwordHash = await argon2.hash(instance.password, {
        type: argon2.argon2id,
        memoryCost: 65536, // 64 MB
        timeCost: 3,
        parallelism: 4,
      });
      // Clear plaintext password
      instance.password = undefined;
    }
  }

  /**
   * Verify password against stored hash
   * @param password - Plaintext password to verify
   * @returns Promise<boolean> - True if password matches
   */
  async verifyPassword(password: string): Promise<boolean> {
    if (!this.passwordHash) {
      return false;
    }
    try {
      return await argon2.verify(this.passwordHash, password);
    } catch (error) {
      return false;
    }
  }
}
