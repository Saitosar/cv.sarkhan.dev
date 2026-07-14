import crypto from 'node:crypto';
import { User } from '@prisma/client';

export async function signSessionToken(payload: {
  userId: string;
  telegramId: string;
  role: string;
}): Promise<string> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not defined in environment variables');
  }
  
  // Create a simple token for now since the project doesn't have a full JWT library 
  // implementation yet, but the documentation expects a token.
  // In a real commercial app, we'd use 'jose' or 'jsonwebtoken'.
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const data = Buffer.from(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24h
    iat: Math.floor(Date.now() / 1000),
  })).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${data}`)
    .digest('base64url');
    
  return `${header}.${data}.${signature}`;
}

export async function verifySessionToken(token: string) {
  const [headerB64, dataB64, signature] = token.split('.');
  if (headerB64 === undefined || dataB64 === undefined || signature === undefined) {
    throw new Error('Invalid token format');
  }
  
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not defined in environment variables');
  }
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${headerB64}.${dataB64}`)
    .digest('base64url');
    
  if (signature !== expectedSignature) {
    throw new Error('Invalid token signature');
  }
  
  const data = JSON.parse(Buffer.from(dataB64, 'base64url').toString());
  if (data.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }
  
  return data;
}
