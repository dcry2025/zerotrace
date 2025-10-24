// Telegram API
import ky from 'ky';

// Use local SvelteKit server API routes (they proxy to backend)
const BASE_URL = '/api';

const api = ky.create({
  prefixUrl: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface TelegramBotInfo {
  username: string | null;
  link: string | null;
  ready: boolean;
}

/**
 * Get Telegram bot information with optional deep link parameter
 * @param username - Telegram username to include in deep link
 */
async function getBotInfo(username?: string): Promise<TelegramBotInfo> {
  const searchParams = username ? { username } : undefined;
  return await api.get('telegram/bot-info', { searchParams }).json<TelegramBotInfo>();
}

export default {
  getBotInfo,
};

