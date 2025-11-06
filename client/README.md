# zerotrace Client - Self-Destructing Notes

A secure, private note-sharing application built with Svelte 5 that allows you to send messages that self-destruct after being read once.

## Features

- 🔒 **Read Once**: Notes are permanently destroyed after the first read
- 🔐 **Password Protection**: Optional password protection for extra security
- ⏰ **Time Limits**: Set expiration times for unread notes
- 🔑 **AES-256 Encryption**: All notes are encrypted server-side
- 🎨 **Modern UI**: Clean, intuitive interface built with Tailwind CSS
- 📱 **Responsive**: Works perfectly on desktop and mobile devices

## Tech Stack

- **Svelte 5** with runes ($state, $derived, $effect)
- **SvelteKit** for routing and SSR
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **ky** for HTTP requests
- **@zerodevx/svelte-toast** for notifications

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Running backend server (see `../server/README.md`)

### Installation

1. Install dependencies:

```bash
npm install
# or
bun install
```

2. Create a `.env` file:

```bash
cp env.example .env
```

3. Update the `.env` file with your configuration:

```env
VITE_API_HOST=http://localhost:3001
```

### Development

Run the development server:

```bash
npm run dev
# or
bun run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
npm run preview
```

## Usage

### Creating a Note

1. Go to the homepage
2. Enter your private message
3. (Optional) Click "Advanced Options" to:
   - Add password protection
   - Set an expiration time
4. Click "Create Private Link"
5. Copy and share the generated link

### Reading a Note

1. Open the shared link
2. Read the warning (note will be destroyed after reading)
3. Enter password if required
4. Click "Show Note"
5. The note is displayed and immediately destroyed

## API Integration

The client communicates with the backend API:

- `POST /notes` - Create a new note
- `POST /notes/:uniqueLink/read` - Read and destroy a note
- `GET /notes/:uniqueLink/status` - Check if a note exists (without reading)

## Project Structure

```
client/
├── src/
│   ├── lib/
│   │   ├── api/
│   │   │   └── notesApi.ts          # API service for notes
│   │   ├── components/              # Reusable components
│   │   ├── config/                  # Configuration files
│   │   ├── store/                   # Svelte stores
│   │   └── style/                   # Global styles
│   └── routes/
│       ├── +page.svelte             # Homepage (create note)
│       ├── created/
│       │   └── +page.svelte         # Success page with link
│       └── note/
│           └── [uniqueLink]/
│               └── +page.svelte     # Note reading page
```

## Environment Variables

| Variable        | Description     | Default                 |
| --------------- | --------------- | ----------------------- |
| `VITE_API_HOST` | Backend API URL | `http://localhost:3001` |

## Security Features

1. **Client-Side Security**:

   - HTTPS only in production
   - No note content stored in browser
   - Secure password transmission

2. **Server-Side Security** (handled by backend):
   - AES-256 encryption
   - Password hashing with SHA-256
   - No logs of note content
   - Automatic expiration

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

© 2025 zerotrace. All rights reserved.

## Support

For issues or questions, please open an issue on the repository.
