import { Controller, Logger } from '@nestjs/common';
import { LoginDto, RegisterDto } from '@eams/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * Handle user registration via microservice message.
   *
   * @param dto - DTO containing registration details
   * @returns The created user or authentication token
   */
  @MessagePattern({ cmd: 'auth.register' })
  async register(@Payload() dto: RegisterDto) {
    this.logger.log(`Received register request for email: ${dto.email}`);
    try {
      const result = await this.authService.register(dto);
      this.logger.log(`User registered successfully: ${dto.email}`);
      return result;
    } catch (err: any) {
      this.logger.error(
        `Registration failed for email: ${dto?.email}. Error: ${err?.message}`,
        err?.stack
      );
      throw err; // rethrow so the caller gets proper error
    }
  }

  /**
   * Handle user login via microservice message.
   *
   * @param dto - DTO containing login credentials
   * @returns Authentication token or session details
   */
  @MessagePattern({ cmd: 'auth.login' })
  async login(@Payload() dto: LoginDto) {
    this.logger.log(`Received login request for email: ${dto.email}`);
    try {
      const result = await this.authService.login(dto);
      this.logger.log(`User login successful: ${dto.email}`);
      return result;
    } catch (err: any) {
      this.logger.error(
        `Login failed for email: ${dto?.email}. Error: ${err?.message}`,
        err?.stack
      );
      throw err; // propagate to client
    }
  }
}
