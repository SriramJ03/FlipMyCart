const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/jwt');
const { pool } = require('../config/mysql');

async function resolveUserFromToken(token) {
  const decoded = verifyToken(token);
  const [rows] = await pool.query(
    'SELECT user_id, name, email, role, is_active FROM users WHERE user_id = ?',
    [decoded.userId]
  );
  const user = rows[0];
  if (!user || !user.is_active) return null;
  return { userId: user.user_id, name: user.name, email: user.email, role: user.role };
}

// Verifies the bearer JWT and attaches req.user = { userId, role, email, name }.
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new ApiError(401, 'Authentication token missing');

    const user = await resolveUserFromToken(token);
    if (!user) throw new ApiError(401, 'Account not found or deactivated');

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Invalid or expired token'));
    }
    next(err);
  }
}

// Like authenticate, but proceeds as an anonymous request (req.user stays undefined)
// instead of failing when no/invalid token is present. Used on public routes that
// personalize behavior (e.g. activity logging) when a user happens to be logged in.
async function optionalAuthenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    const user = await resolveUserFromToken(token);
    if (user) req.user = user;
  } catch {
    // ignore invalid/expired token on optional routes
  }
  next();
}

// Role-gate factory: authorize('admin'), authorize('seller', 'admin'), etc.
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required'));
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, `Role '${req.user.role}' is not permitted to access this resource`));
    }
    next();
  };
}

module.exports = { authenticate, authorize, optionalAuthenticate };
