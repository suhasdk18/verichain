const crypto = require('crypto');
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits

const encrypt = (buffer, key) => {
  // Ensure key is exactly 32 bytes
  const keyBuffer = Buffer.from(key, 'hex').slice(0, KEY_LENGTH);
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  
  // Prepend IV to encrypted data
  return Buffer.concat([iv, encrypted]);
};

const decrypt = (encrypted, key) => {
  // Ensure key is exactly 32 bytes
  const keyBuffer = Buffer.from(key, 'hex').slice(0, KEY_LENGTH);
  
  // Extract IV from the beginning
  const iv = encrypted.slice(0, IV_LENGTH);
  const encryptedData = encrypted.slice(IV_LENGTH);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
  return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
};

const generateEncryptionKey = () => {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
};

module.exports = { encrypt, decrypt, generateEncryptionKey };