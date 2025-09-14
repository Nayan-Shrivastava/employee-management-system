import {
  Controller,
  Post,
  Body,
  Inject,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LoginDto, RegisterDto } from '@eams/common';
import { lastValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy
  ) {}

  /**
   * Register a new user.
   *
   * @param dto - DTO containing registration details
   * @returns The created user or authentication token
   * @throws HttpException if registration fails
   */
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      this.logger.log(`Attempting user registration with email: ${dto.email}`);

      const response$ = this.authClient.send({ cmd: 'auth.register' }, dto);
      const result = await lastValueFrom(response$);

      this.logger.log(`User registered successfully: ${dto.email}`);
      return result;
    } catch (err: any) {
      this.logger.error(
        `Registration failed for email: ${dto?.email}. Error: ${err?.message}`,
        err?.stack
      );
      throw new HttpException(
        err?.message ?? 'Registration failed',
        err?.error?.statusCode ?? HttpStatus.BAD_GATEWAY
      );
    }
  }

  /**
   * Authenticate a user (login).
   *
   * @param dto - DTO containing login credentials
   * @returns Authentication token or session details
   * @throws HttpException if login fails
   */
  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      this.logger.log(`User login attempt with email: ${dto.email}`);

      const response$ = this.authClient.send({ cmd: 'auth.login' }, dto);
      const result = await lastValueFrom(response$);

      this.logger.log(`User login successful: ${dto.email}`);
      return result;
    } catch (err: any) {
      this.logger.error(
        `Login failed for email: ${dto?.email}. Error: ${err?.message}`,
        err?.stack
      );
      throw new HttpException(
        err?.message ?? 'Login failed',
        err?.error?.statusCode ?? HttpStatus.BAD_GATEWAY
      );
    }
  }
}
