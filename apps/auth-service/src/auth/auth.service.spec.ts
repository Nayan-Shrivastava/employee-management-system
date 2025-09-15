// auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@eams/database';
import { RegisterDto, LoginDto } from '@eams/common';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const dto: RegisterDto = {
        name: 'John Doe',
        email: 'john@example.com',
        role: UserRole.EMPLOYEE,
      };

      userRepo.findOne.mockResolvedValue(null); // no existing user
      const createdUser = { id: '123', ...dto } as User;
      userRepo.create.mockReturnValue(createdUser);
      userRepo.save.mockResolvedValue(createdUser);

      const result = await service.register(dto);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(userRepo.create).toHaveBeenCalledWith(dto);
      expect(userRepo.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });

    it('should throw UnauthorizedException if email already exists', async () => {
      const dto: RegisterDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: UserRole.ADMIN,
      };

      userRepo.findOne.mockResolvedValue({ id: '999', ...dto } as User);

      await expect(service.register(dto)).rejects.toThrow(
        UnauthorizedException
      );
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
    });
  });

  describe('login', () => {
    it('should login and return access token', async () => {
      const dto: LoginDto = { email: 'john@example.com' };
      const user = {
        id: '123',
        email: dto.email,
        role: UserRole.EMPLOYEE,
      } as User;

      userRepo.findOne.mockResolvedValue(user);
      jwtService.signAsync.mockResolvedValue('mock-jwt-token');

      const result = await service.login(dto);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        role: user.role,
      });
      expect(result).toEqual({ access_token: 'mock-jwt-token' });
    });

    it('should throw UnauthorizedException if email is invalid', async () => {
      const dto: LoginDto = { email: 'unknown@example.com' };

      userRepo.findOne.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
    });
  });
});
