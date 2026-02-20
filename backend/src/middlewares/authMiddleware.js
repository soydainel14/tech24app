const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate a JWT token. The token is expected in
 * the Authorization header as a Bearer token. If valid, the user
 * payload is attached to req.user; otherwise an error is returned.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Middleware to require specific roles. Pass an array of role names; if
 * the authenticated user does not have one of the roles, respond
 * with 403.
 */
function authorize(roles = []) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

module.exports = {
  authenticate,
  authorize,
};