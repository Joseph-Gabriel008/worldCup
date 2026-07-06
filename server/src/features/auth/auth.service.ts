/**
 * StadiumPulse AI - Auth Service
 *
 * Handles user registration, login, JWT token generation,
 * and refresh token rotation.
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database';
import { env } from '../../config/env';
import { UnauthorizedError, ValidationError } from '../../utils/errors';
import { JwtPayload } from '../../middleware/auth';

const SALT_ROUNDS = 12;

/**
 * Registers a new user. Hashes password with bcrypt.
 */
export async function registerUser(data: {
  email: string;
  name: string;
  password: string;
  role?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new ValidationError('Email already registered');
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash,
      role: data.role || 'FAN',
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  const tokens = await generateTokens(user);
  return { user, ...tokens };
}

/**
 * Authenticates a user by email + password. Returns JWT tokens.
 */
export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const userPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };

  const tokens = await generateTokens(userPayload);
  return { user: userPayload, ...tokens };
}

/**
 * Refreshes access token using a valid refresh token.
 * Implements token rotation: old refresh token is invalidated,
 * new one is issued.
 */
export async function refreshAccessToken(refreshToken: string) {
  // Verify the refresh token
  let payload: JwtPayload;
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  // Check if session exists (for rotation tracking)
  const session = await prisma.session.findUnique({ where: { refreshToken } });
  if (!session || session.expiresAt < new Date()) {
    // If token was already used (rotation), invalidate all sessions for this user
    if (!session) {
      await prisma.session.deleteMany({ where: { userId: payload.userId } });
    }
    throw new UnauthorizedError('Refresh token has been revoked');
  }

  // Delete old session (rotation)
  await prisma.session.delete({ where: { id: session.id } });

  // Issue new tokens
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) {
    throw new UnauthorizedError('User no longer exists');
  }

  return generateTokens(user);
}

/**
 * Generates access + refresh token pair.
 * Access token: short-lived (15m), contains user role for RBAC.
 * Refresh token: longer-lived (7d), stored in DB for rotation.
 */
async function generateTokens(user: { id: string; email: string; role: string }) {
  const accessPayload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(accessPayload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as any,
  });

  const refreshToken = jwt.sign(
    { userId: user.id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRY as any },
  );

  // Store refresh token session for rotation tracking
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
}

/**
 * Logs out by deleting the refresh token session.
 */
export async function logoutUser(refreshToken: string) {
  await prisma.session.deleteMany({ where: { refreshToken } });
}
