const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const pool = require('../config/database');
const logger = require('../utils/logger');
const axios = require('axios');

router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    logger.info('Fetching players from database...');
    const { rows } = await pool.query('SELECT * FROM reported_players');
    
    const players = rows.map(row => {
      const playerData = typeof row.player_data === 'string' 
        ? JSON.parse(row.player_data) 
        : row.player_data;
      
      return {
        ...playerData,
        uid: row.uid
      };
    });
    
    res.json(players);
  } catch (error) {
    logger.error('Error fetching players:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

router.post('/search', ensureAdmin, async (req, res) => {
  try {
    logger.info('Search request received:', req.body);
    const { search } = req.body;
    
    if (!search) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required',
      });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      logger.error('API_KEY not found in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
      });
    }

    const isUID = /^\d+$/.test(search);
    const apiUrl = isUID
      ? `https://api.mozambiquehe.re/bridge?auth=${apiKey}&uid=${search}&platform=PC`
      : `https://api.mozambiquehe.re/bridge?auth=${apiKey}&player=${encodeURIComponent(search)}&platform=PC`;

    logger.info('Fetching player data from API...');
    const response = await axios.get(apiUrl);
    const playerData = response.data;

    const baseLevel = playerData.global?.level || 0;
    const prestigeLevel = playerData.global?.levelPrestige || 0;
    const trueLevel = prestigeLevel * 500 + baseLevel;

    const uid = isUID ? search : playerData.global?.uid;
    const formattedData = {
      name: playerData.global?.name || 'Unknown',
      level: trueLevel,
      rank: playerData.global?.rank?.rankName || 'Unknown',
      rank_score: playerData.global?.rank?.rankScore || 0,
      reports: 1,
      report_history: [
        {
          reporter_id: 'web_admin',
          server_id: 'website',
          timestamp: new Date().toISOString(),
        },
      ],
      last_seen: new Date().toISOString(),
      reporting_servers: ['website'],
    };

    const existing = await pool.query('SELECT * FROM reported_players WHERE uid = $1', [uid]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Player already exists in the target list',
      });
    }

    await pool.query('INSERT INTO reported_players (uid, player_data) VALUES ($1, $2)', [
      uid,
      formattedData,
    ]);

    res.json({
      success: true,
      message: 'Player added successfully',
    });
  } catch (error) {
    logger.error('Error searching/adding player:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find or add player. Please verify the name/UID is correct.',
    });
  }
});

router.delete('/:uid', ensureAdmin, async (req, res) => {
  try {
    logger.info('Delete request received for player:', req.params.uid);
    const { uid } = req.params;

    await pool.query('DELETE FROM reported_players WHERE uid = $1', [uid]);

    logger.info('Player deleted successfully');
    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    logger.error('Error deleting player:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

module.exports = router;