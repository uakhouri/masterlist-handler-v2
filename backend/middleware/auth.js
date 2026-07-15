const jwt = require('jsonwebtoken');

/**
 * Protects routes with a Bearer JWT. Attaches the decoded user payload to req.user.
 */
module.exports = function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};
