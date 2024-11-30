const { Pool } = require('pg');
const logger = require('../utils/logger');
const env = require('./env');

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test database connection
pool.query('SELECT NOW()', async (err) => {
  if (err) {
    logger.error('Database connection failed:', err);
    logger.error('Database URL format:', env.DATABASE_URL ? 'Present' : 'Missing');
    process.exit(1); // Exit if database connection fails
  } else {
    logger.info('Database connected successfully');
    await initializeTables();
  }
});

async function initializeTables() {
  try {
    // Create session table for connect-pg-simple
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      )
    `);
    logger.info('session table is ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reported_players (
        uid TEXT PRIMARY KEY,
        player_data JSONB,
        update_required BOOLEAN DEFAULT FALSE
      )
    `);
    logger.info('reported_players table is ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS report_logs (
        id SERIAL PRIMARY KEY,
        uid TEXT NOT NULL,
        reason TEXT,
        reporter_id TEXT NOT NULL,
        reporter_username TEXT,
        reporter_discriminator TEXT,
        reporter_avatar TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        resolved BOOLEAN DEFAULT FALSE,
        server_id TEXT
      )
    `);
    logger.info('report_logs table is ready');

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_session_expire ON "session" ("expire");
      CREATE INDEX IF NOT EXISTS idx_report_logs_uid ON report_logs (uid);
      CREATE INDEX IF NOT EXISTS idx_report_logs_timestamp ON report_logs (timestamp DESC);
    `);
    logger.info('Database indexes are ready');
  } catch (error) {
    logger.error('Error setting up database tables:', error);
    process.exit(1);
  }
}

module.exports = pool;