const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// A secure key for JWT signing (falls back to a secure key if env is not defined)
const JWT_SECRET = process.env.JWT_SECRET || 'green_system_secure_secret_key_2026';

// Hashing speed/rounds
const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt
 */
async function hashPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a plain text password against a hash
 */
async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

/**
 * Calculate upcoming 5:00 AM timestamp
 */
function getNext5AM() {
    const now = new Date();
    const expiry = new Date();
    expiry.setHours(5, 0, 0, 0);
    // If it is already past 5:00 AM today, the next 5:00 AM is tomorrow
    if (now.getHours() >= 5) {
        expiry.setDate(expiry.getDate() + 1);
    }
    return expiry;
}

/**
 * Generate a JWT token based on user details and role
 */
function generateToken(user) {
    const payload = {
        name: user.name,
        email: user.email,
        role: user.role,
        businessType: user.businessType || null
    };

    // Rule: managers, drivers, and staff sessions expire at the upcoming 5:00 AM.
    // Passengers (guests) sessions never expire (infinite lifetime, e.g. 10 years).
    const options = {};
    if (user.role === 'manager' || user.role === 'driver' || user.role === 'staff') {
        const next5AM = getNext5AM();
        // jwt sign expects exp in seconds
        payload.exp = Math.floor(next5AM.getTime() / 1000);
    } else {
        // Passengers: 10 years expiration
        options.expiresIn = '3650d';
    }

    return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Verify a JWT token
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}

/**
 * Express Middleware to protect HTTP API routes
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authorization token required.' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(403).json({ error: 'FORBIDDEN', message: 'Token invalid or expired.' });
    }

    req.user = decoded;
    next();
}

module.exports = {
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken,
    authenticateToken
};
