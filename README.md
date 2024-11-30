# Apex Target List

A Discord-integrated web application for tracking and managing Apex Legends player reports.

## Features

- Discord authentication
- Real-time updates via WebSocket
- Player search and tracking
- Report management
- Admin dashboard
- Rate limiting
- Security headers

## Prerequisites

- Node.js 16+
- PostgreSQL database
- Discord application credentials
- Apex Legends API key

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
NODE_ENV=development
PORT=8080
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
SESSION_SECRET=your-session-secret
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
DISCORD_BOT_TOKEN=your-discord-bot-token
DISCORD_GUILD_ID=your-guild-id
DISCORD_ROLE_ID=your-role-id
DISCORD_ADMIN_ROLE_ID=your-admin-role-id
API_KEY=your-api-key
RAILWAY_PUBLIC_DOMAIN=your-railway-domain
RAILWAY_STATIC_URL=your-railway-static-url
TRUST_PROXY=true
```

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start the development server: `npm run dev`

## Development

```bash
# Start development server
npm run dev

# Run tests
npm test
```

## Deployment

The application is configured for deployment on Railway.app. Follow these steps:

1. Create a new project on Railway
2. Connect your repository
3. Add environment variables
4. Deploy

## License

MIT