import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { AppError } from '../utils/errors.util';
import logger from '../utils/logger';

export const registerUser = async (data: RegisterInput) => {
  try {
    logger.debug('Attempting to register user', { email: data.email });
    
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      logger.warn('Registration failed: email already exists', { email: data.email });
      throw new AppError(409, 'User with this email already exists');
    }

    // Hashear contraseña
    const passwordHash = await hashPassword(data.password);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    logger.info('User registered successfully', { userId: user.id, email: user.email });
    return user;
  } catch (error) {
    logger.error('Error registering user', { error, email: data.email });
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Failed to register user', false, error as Error);
  }
};

export const loginUser = async (data: LoginInput) => {
  try {
    logger.debug('Attempting to login user', { email: data.email });
    
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      logger.warn('Login failed: user not found', { email: data.email });
      throw new AppError(401, 'Invalid email or password');
    }

    // Verificar contraseña
    const isPasswordValid = await comparePassword(data.password, user.passwordHash);

    if (!isPasswordValid) {
      logger.warn('Login failed: invalid password', { email: data.email });
      throw new AppError(401, 'Invalid email or password');
    }

    // Generar token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    logger.info('User logged in successfully', { userId: user.id, email: user.email });
    
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  } catch (error) {
    logger.error('Error logging in user', { error, email: data.email });
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Failed to login user', false, error as Error);
  }
};

