// Notes API Service
import ky from 'ky';

// Use local SvelteKit server API routes (they proxy to backend)
const API_BASE_URL = '';  // Empty string for same-origin requests
const API_PREFIX = '/api';

export interface CreateNoteDto {
  content: string;
  encryptedKeyForAdmin?: string;
  password?: string;
  expiresInDays?: number;
  notifyOnRead?: boolean;
  telegramUsername?: string;
}

// Backend response structure
export interface CreateNoteResponseDto {
  uniqueLink: string;
  message: string;
}

export interface ReadNoteDto {
  password?: string;
}

// Backend response structure
export interface ReadNoteResponseDto {
  content: string;
}

export interface NoteStatusResponseDto {
  exists: boolean;
  isRead: boolean;
  hasPassword: boolean;
}

const notesApi = {
  /**
   * Create a new note
   * POST /api/notes (proxies to backend /api/v1/notes)
   */
  async createNote(data: CreateNoteDto): Promise<CreateNoteResponseDto> {
    try {
      const response = await ky.post(`${API_BASE_URL}${API_PREFIX}/notes`, {
        json: data,
        timeout: 30000,
      }).json<CreateNoteResponseDto>();
      
      return response;
    } catch (error) {
      console.error('Failed to create note:', error);
      throw error;
    }
  },

  /**
   * Read a note (marks it as read)
   * POST /api/notes/:uniqueLink/read (proxies to backend /api/v1/notes/:uniqueLink/read)
   */
  async readNote(uniqueLink: string, data?: ReadNoteDto): Promise<ReadNoteResponseDto> {
    try {
      const response = await ky.post(`${API_BASE_URL}${API_PREFIX}/notes/${uniqueLink}/read`, {
        json: data || {},
        timeout: 30000,
      }).json<ReadNoteResponseDto>();
      
      return response;
    } catch (error) {
      console.error('Failed to read note:', error);
      throw error;
    }
  },

  /**
   * Check note status without reading it
   * GET /api/notes/:uniqueLink/status (proxies to backend /api/v1/notes/:uniqueLink/status)
   */
  async checkNoteStatus(uniqueLink: string): Promise<NoteStatusResponseDto> {
    try {
      const url = `${API_BASE_URL}${API_PREFIX}/notes/${uniqueLink}/status`;
      const response = await ky.get(url, {
        timeout: 30000,
      }).json<NoteStatusResponseDto>();
      
      return response;
    } catch (error) {
      console.error('Failed to check note status:', error);
      throw error;
    }
  },

  /**
   * Destroy note immediately by owner
   * DELETE /api/notes/:uniqueLink (proxies to backend /api/v1/notes/:uniqueLink)
   */
  async destroyNote(uniqueLink: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await ky.delete(`${API_BASE_URL}${API_PREFIX}/notes/${uniqueLink}`, {
        timeout: 30000,
      }).json<{ success: boolean; message: string }>();
      
      return response;
    } catch (error) {
      console.error('Failed to destroy note:', error);
      throw error;
    }
  },
};

export { notesApi };
export default notesApi;

