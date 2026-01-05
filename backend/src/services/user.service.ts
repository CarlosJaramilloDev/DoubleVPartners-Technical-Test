import prisma from '../config/database';

export const getAllUsers = async (excludeUserId?: string) => {
  const users = await prisma.user.findMany({
    where: excludeUserId
      ? {
          id: {
            not: excludeUserId,
          },
        }
      : undefined,
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return users;
};

