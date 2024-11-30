function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.roles && req.user.roles.includes(process.env.DISCORD_ADMIN_ROLE_ID)) {
    return next();
  }
  res.status(403).json({ error: 'Admin access required' });
}

module.exports = {
  ensureAuthenticated,
  ensureAdmin
};