const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const pool = require('../config/database');
const logger = require('../utils/logger');

router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const { status, reporter, uid, limit = 100 } = req.query;
    let query = 'SELECT * FROM report_logs';
    let conditions = [];
    let values = [];

    if (status) {
      conditions.push(`resolved = $${values.length + 1}`);
      values.push(status === 'resolved' ? true : false);
    }
    if (reporter) {
      conditions.push(`reporter_username ILIKE $${values.length + 1}`);
      values.push(`%${reporter}%`);
    }
    if (uid) {
      conditions.push(`uid = $${values.length + 1}`);
      values.push(uid);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY timestamp DESC LIMIT $' + (values.length + 1);
    values.push(limit);

    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (error) {
    logger.error('Error fetching report logs:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

module.exports = router;