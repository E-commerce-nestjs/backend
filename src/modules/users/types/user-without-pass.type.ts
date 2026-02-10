import { User } from 'generated/prisma/client';

export type UserWithoutPassword = Omit<User, 'password'>;
