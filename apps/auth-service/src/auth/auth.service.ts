import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '@eams/database';
import { RegisterDto, LoginDto } from '@eams/common';

/**
 * AuthService handles user authentication and registration logic.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Registers a new user.
   * @param dto - Registration data transfer object
   * @returns The created user
   * @throws UnauthorizedException if the email already exists
   */
  async register(dto: RegisterDto): Promise<User> {
    this.logger.log(`Attempting to register user with email: ${dto.email}`);

    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      this.logger.warn(
        `Registration failed: Email already exists -> ${dto.email}`
      );
      throw new UnauthorizedException('Email already exists');
    }

    const user = this.userRepo.create(dto);
    const savedUser = await this.userRepo.save(user);

    this.logger.log(`User registered successfully with id: ${savedUser.id}`);
    return savedUser;
  }

  /**
   * Authenticates a user and returns a JWT access token.
   * @param dto - Login data transfer object
   * @returns An object containing the access token
   * @throws UnauthorizedException if the email is invalid
   */
  async login(dto: LoginDto): Promise<{ access_token: string }> {
    this.logger.log(`Login attempt for email: ${dto.email}`);

    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      this.logger.warn(`Login failed: Invalid email -> ${dto.email}`);
      throw new UnauthorizedException('Invalid email');
    }

    const payload = { sub: user.id, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    this.logger.log(`User logged in successfully: userId=${user.id}`);
    return { access_token: token };
  }
}
