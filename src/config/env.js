const { cleanEnv, str, port, bool } = require('envalid');

const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
  PORT: port({ default: 8080 }),
  DATABASE_URL: str(),
  SESSION_SECRET: str(),
  DISCORD_CLIENT_ID: str(),
  DISCORD_CLIENT_SECRET: str(),
  DISCORD_BOT_TOKEN: str(),
  DISCORD_GUILD_ID: str(),
  DISCORD_ROLE_ID: str(),
  DISCORD_ADMIN_ROLE_ID: str(),
  API_KEY: str(),
  RAILWAY_PUBLIC_DOMAIN: str({ default: undefined }),
  RAILWAY_STATIC_URL: str({ default: undefined }),
  TRUST_PROXY: bool({ default: true })
});

module.exports = env;