import crypto from 'crypto';

const sessionsDb = new Map<string, { userId: string; role: string }>();

export const createSession = (userId: string, role: string) => {
  const token = crypto.randomBytes(32).toString('hex');
  
  sessionsDb.set(token, { userId, role });
  return token;
};

export const validateSession = (token: string) => {
  return sessionsDb.get(token);
};

export const revokeSession = (token: string) => {
  sessionsDb.delete(token);
};