import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { AppError } from '../utils/errors.util';

export const registerUser = async (data: RegisterInput) => {
  // Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
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

  return user;
};

export const loginUser = async (data: LoginInput) => {
  // Buscar usuario
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  // Verificar contraseña
  const isPasswordValid = await comparePassword(data.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid email or password');
  }

  // Generar token
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
};

