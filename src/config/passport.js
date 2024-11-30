const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const axios = require('axios');
const logger = require('../utils/logger');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/api/auth/discord/callback`,
    scope: ['identify', 'guilds', 'guilds.members.read']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      profile.accessToken = accessToken;
      
      const guildId = process.env.DISCORD_GUILD_ID;
      const viewerRoleId = process.env.DISCORD_ROLE_ID;
      const adminRoleId = process.env.DISCORD_ADMIN_ROLE_ID;
      
      logger.info('Auth attempt:', {
        profileId: profile.id,
        guildId: guildId
      });

      if (!process.env.DISCORD_BOT_TOKEN) {
        logger.error('Missing Discord bot token');
        return done(new Error('Discord bot token not configured'), null);
      }

      const response = await axios.get(
        `https://discord.com/api/v10/guilds/${guildId}/members/${profile.id}`,
        {
          headers: {
            Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const member = response.data;
      logger.info('Member data received:', {
        id: profile.id,
        roles: member.roles
      });

      if (member.roles.includes(viewerRoleId) || member.roles.includes(adminRoleId)) {
        profile.roles = member.roles;
        logger.info('Authentication successful:', {
          userId: profile.id,
          username: profile.username,
          roles: profile.roles
        });
        return done(null, profile);
      } else {
        logger.info('Authentication failed - insufficient permissions:', {
          userId: profile.id,
          username: profile.username
        });
        return done(null, false, { message: 'Insufficient permissions' });
      }
    } catch (error) {
      logger.error('Discord authentication error:', error);
      return done(error, null);
    }
  }
));