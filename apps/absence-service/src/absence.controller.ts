import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AbsenceService } from './absence.service';
import { AuthenticatedUser, CreateAbsenceDto } from '@eams/common';

@Controller()
export class AbsenceController {
  private readonly logger = new Logger(AbsenceController.name);

  constructor(private readonly absenceService: AbsenceService) {}

  /**
   * Handle request to list absences.
   * - Employees: only their own requests.
   * - Admins: all requests.
   *
   * @param data - Payload containing user, page, and limit
   */
  @MessagePattern({ cmd: 'absence.list' })
  async list(
    @Payload() data: { user: AuthenticatedUser; page: number; limit: number }
  ) {
    const { user, page, limit } = data;
    this.logger.log(
      `Received absence.list request | userId=${user.sub}, role=${user.role}, page=${page}, limit=${limit}`
    );

    return this.absenceService.list(user, page, limit);
  }

  /**
   * Handle request to create a new absence.
   * - Only EMPLOYEE can create.
   *
   * @param data - Payload containing dto and user
   */
  @MessagePattern({ cmd: 'absence.create' })
  async create(
    @Payload() data: { dto: CreateAbsenceDto; user: AuthenticatedUser }
  ) {
    const { dto, user } = data;
    this.logger.log(
      `Received absence.create request | userId=${user.sub}, role=${user.role}, startDate=${dto.startDate}, endDate=${dto.endDate}`
    );

    return this.absenceService.create(dto, user);
  }

  /**
   * Handle request to approve an absence.
   * - Only ADMIN can approve.
   *
   * @param data - Payload containing id and user
   */
  @MessagePattern({ cmd: 'absence.approve' })
  async approve(@Payload() data: { id: string; user: AuthenticatedUser }) {
    const { id, user } = data;
    this.logger.log(
      `Received absence.approve request | absenceId=${id}, userId=${user.sub}, role=${user.role}`
    );

    return this.absenceService.approve(id, user);
  }

  /**
   * Handle request to reject an absence.
   * - Only ADMIN can reject.
   *
   * @param data - Payload containing id and user
   */
  @MessagePattern({ cmd: 'absence.reject' })
  async reject(@Payload() data: { id: string; user: AuthenticatedUser }) {
    const { id, user } = data;
    this.logger.log(
      `Received absence.reject request | absenceId=${id}, userId=${user.sub}, role=${user.role}`
    );

    return this.absenceService.reject(id, user);
  }
}
