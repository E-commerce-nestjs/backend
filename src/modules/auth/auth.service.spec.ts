import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "./auth.service";
import { Test, TestingModule } from "@nestjs/testing";
import { ConflictException } from "@nestjs/common";

// auth.service.spec.ts
describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        // Mock other dependencies
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('register', () => {
    it('should throw ConflictException if user exists', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({} as any);

      await expect(service.register({
        email: 'test@example.com',
        password: 'Password@123',
        confirmPassword: 'Password@123',
      })).rejects.toThrow(ConflictException);
    });
  });
});