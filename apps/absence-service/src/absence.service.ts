import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbsenceRequest, AbsenceStatus, User } from '@eams/database';
import { AuthenticatedUser, CreateAbsenceDto } from '@eams/common';

@Injectable()
export class AbsenceService {
  private readonly logger = new Logger(AbsenceService.name);

  constructor(
    @InjectRepository(AbsenceRequest)
    private readonly repo: Repository<AbsenceRequest>
  ) {}

  /**
   * List absence requests.
   * - Employees: only see their own requests.
   * - Admins: can see all requests.
   *
   * @param user - Current authenticated user
   * @param page - Page number for pagination
   * @param limit - Number of results per page
   * @returns Paginated list of absence requests
   */
  async list(user: AuthenticatedUser, page: number, limit: number) {
    this.logger.log(
      `Fetching absence list | userId=${user.sub}, role=${user.role}, page=${page}, limit=${limit}`
    );

    const qb = this.repo
      .createQueryBuilder('absence')
      .orderBy('absence.createdAt', 'DESC');

    if (user.role === 'EMPLOYEE') {
      qb.where('absence.employeeId = :employeeId', { employeeId: user.sub });
    }

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    this.logger.log(
      `Absences fetched | count=${items.length}, total=${total}, userId=${user.sub}`
    );

    return { data: items, total, page, limit };
  }

  /**
   * Create a new absence request.
   * - Only EMPLOYEE role can create requests.
   *
   * @param dto - Absence creation DTO
   * @param user - Current authenticated user
   * @returns The created absence record
   * @throws ForbiddenException if the user is not an employee
   */
  async create(dto: CreateAbsenceDto, user: AuthenticatedUser) {
    if (user.role !== 'EMPLOYEE') {
      this.logger.warn(
        `Unauthorized absence creation attempt | userId=${user.sub}, role=${user.role}`
      );
      throw new ForbiddenException('Only employees can create absences');
    }

    this.logger.log(
      `Creating absence request | userId=${user.sub}, startDate=${dto.startDate}, endDate=${dto.endDate}`
    );

    const absence = this.repo.create({
      employee: { id: user.sub } as User,
      startDate: dto.startDate,
      endDate: dto.endDate,
      reason: dto.reason,
      status: AbsenceStatus.PENDING,
    });

    const saved = await this.repo.save(absence);
    this.logger.log(
      `Absence created | absenceId=${saved.id}, userId=${user.sub}`
    );
    return saved;
  }

  /**
   * Approve an absence request.
   * - Only ADMIN role can approve requests.
   *
   * @param id - Absence ID
   * @param user - Current authenticated user
   * @returns The updated absence record
   * @throws ForbiddenException if the user is not an admin
   * @throws NotFoundException if the absence does not exist
   */
  async approve(id: string, user: AuthenticatedUser) {
    if (user.role !== 'ADMIN') {
      this.logger.warn(
        `Unauthorized approve attempt | userId=${user.sub}, role=${user.role}, absenceId=${id}`
      );
      throw new ForbiddenException('Only admins can approve');
    }

    this.logger.log(`Approving absence | absenceId=${id}, adminId=${user.sub}`);
    const absence = await this.repo.findOne({ where: { id } });
    if (!absence) {
      this.logger.warn(`Absence not found for approval | absenceId=${id}`);
      throw new NotFoundException('Absence not found');
    }

    absence.status = AbsenceStatus.APPROVED;
    const saved = await this.repo.save(absence);
    this.logger.log(`Absence approved | absenceId=${id}, adminId=${user.sub}`);
    return saved;
  }

  /**
   * Reject an absence request.
   * - Only ADMIN role can reject requests.
   *
   * @param id - Absence ID
   * @param user - Current authenticated user
   * @returns The updated absence record
   * @throws ForbiddenException if the user is not an admin
   * @throws NotFoundException if the absence does not exist
   */
  async reject(id: string, user: AuthenticatedUser) {
    if (user.role !== 'ADMIN') {
      this.logger.warn(
        `Unauthorized reject attempt | userId=${user.sub}, role=${user.role}, absenceId=${id}`
      );
      throw new ForbiddenException('Only admins can reject');
    }

    this.logger.log(`Rejecting absence | absenceId=${id}, adminId=${user.sub}`);
    const absence = await this.repo.findOne({ where: { id } });
    if (!absence) {
      this.logger.warn(`Absence not found for rejection | absenceId=${id}`);
      throw new NotFoundException('Absence not found');
    }

    absence.status = AbsenceStatus.REJECTED;
    const saved = await this.repo.save(absence);
    this.logger.log(`Absence rejected | absenceId=${id}, adminId=${user.sub}`);
    return saved;
  }
}
