// auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from '@eams/common';
import { UserRole } from '@eams/database';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const dto: RegisterDto = {
        name: 'John Doe',
        email: 'john@example.com',
        role: UserRole.EMPLOYEE,
      };

      const expected = { id: '123', ...dto };
      authService.register.mockResolvedValue(expected);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });

    it('should rethrow error if register fails', async () => {
      const dto: RegisterDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: UserRole.EMPLOYEE,
      };

      const error = new Error('Registration failed');
      authService.register.mockRejectedValue(error);

      await expect(controller.register(dto)).rejects.toThrow(
        'Registration failed'
      );
      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const dto: LoginDto = { email: 'john@example.com' };

      const expected = { access_token: 'jwt-token' };
      authService.login.mockResolvedValue(expected);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });

    it('should rethrow error if login fails', async () => {
      const dto: LoginDto = { email: 'jane@example.com' };
      const error = new Error('Invalid credentials');
      authService.login.mockRejectedValue(error);

      await expect(controller.login(dto)).rejects.toThrow(
        'Invalid credentials'
      );
      expect(authService.login).toHaveBeenCalledWith(dto);
    });
  });
});
