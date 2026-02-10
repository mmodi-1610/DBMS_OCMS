import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt
 * @param {string} plainPassword - The plain text password
 * @returns {Promise<string>} The hashed password
 */
export async function hashPassword(plainPassword) {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Verify a plain text password against a hashed password
 * Supports both hashed passwords (new users) and plain text (legacy users)
 * @param {string} plainPassword - The plain text password to verify
 * @param {string} storedPassword - The stored password (hashed or plain text)
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(plainPassword, storedPassword) {
    // Check if stored password is a bcrypt hash (starts with $2b$ or $2a$)
    if (storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2a$')) {
        // Use bcrypt comparison for hashed passwords
        return bcrypt.compare(plainPassword, storedPassword);
    }

    // Fallback to plain text comparison for legacy users
    // (existing users in database with unhashed passwords)
    return plainPassword === storedPassword;
}
