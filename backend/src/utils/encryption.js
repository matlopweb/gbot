import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-this-in-production';

/**
 * Encripta un string
 */
export function encryptToken(token) {
  return CryptoJS.AES.encrypt(token, ENCRYPTION_KEY).toString();
}

/**
 * Desencripta un string
 */
export function decryptToken(encryptedToken) {
  const bytes = CryptoJS.AES.decrypt(encryptedToken, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Hash de un string (para passwords, etc.)
 */
export function hash(data) {
  return CryptoJS.SHA256(data).toString();
}

/**
 * Verifica un hash
 */
export function verifyHash(data, hashedData) {
  return hash(data) === hashedData;
}
