import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secret = process.env.JWT_SECRET || 'katiani-styles-secret-key';
const key = crypto.scryptSync(secret, 'salt', 32);
const iv = Buffer.alloc(16, 0); 

export const encrypt = (text) => {
  if (!text) return '';
  try {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  } catch (err) {
    console.error('Encryption error:', err.message);
    return text;
  }
};

export const decrypt = (text) => {
  if (!text) return '';
  try {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return text;
  }
};
