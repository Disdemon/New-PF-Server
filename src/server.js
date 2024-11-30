const express = require('express');
const http = require('http');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./config/database');
const env = require('./config/env');

// Load configurations
require('./config/passport');
const logger = require('./utils/logger');
const apiLimiter = require('./middleware/rateLimiter');
const { ensureAuthenticated } = require('./middleware/auth');
const { setupWebSocket } = require('./websocket');
const errorHandler = require('./middleware/errorHandler');
const securityMiddleware = require('./middleware/security');

// Create Express app
const app = express();
const server = http.createServer(app);

// Set up WebSocket
setupWebSocket(server);

// Trust proxy configuration for Railway.app
app.set('trust proxy', env.TRUST_PROXY);

// Security headers
app.use(securityMiddleware);

// Middleware Setup
app.use(cors({
  origin: env.RAILWAY_PUBLIC_DOMAIN || env.RAILWAY_STATIC_URL || '*',
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use('/api/', apiLimiter);

// Session configuration with PostgreSQL store
app.use(session({
  store: new pgSession({
    pool,
    tableName: 'session'
  }),
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000
  },
  proxy: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/players', require('./routes/players'));
app.use('/api/report-logs', require('./routes/reports'));

// Main route
app.get('/', ensureAuthenticated, require('./views/main'));
app.get('/login', require('./views/login'));

// Error handling
app.use(errorHandler);

// Start the server
const PORT = env.PORT;
server.listen(PORT, '0.0.0.0', () => {
  logger.info('Server is running on port', PORT);
});