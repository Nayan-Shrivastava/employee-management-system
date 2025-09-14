import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Param,
  Patch,
  HttpException,
  HttpStatus,
  Query,
  Logger,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

import { Request } from 'express';
import { AuthenticatedUser, Roles } from '@eams/common';
import { CreateAbsenceDto } from '@eams/common';

@Controller('absences')
export class AbsenceController {
  private readonly logger = new Logger(AbsenceController.name);

  constructor(
    @Inject('ABSENCE_SERVICE') private readonly absenceClient: ClientProxy
  ) {}

  /**
   * Get a paginated list of absences.
   * - Employees: can only see their own requests.
   * - Admins: can see all requests.
   *
   * @param req -  request containing the authenticated user
   * @param page - Page number for pagination (default: 1)
   * @param limit - Number of results per page (default: 10)
   * @returns A list of absence records
   * @throws HttpException if the service call fails
   */
  @Get()
  async list(
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '10'
  ) {
    try {
      const user = (req as any).user as AuthenticatedUser;
      this.logger.log(
        `Listing absences for user: ${user?.sub}, role: ${user?.role}`
      );

      const payload = { user, page: Number(page), limit: Number(limit) };
      const res$ = this.absenceClient.send({ cmd: 'absence.list' }, payload);
      return await lastValueFrom(res$);
    } catch (err: any) {
      this.logger.error(`Failed to list absences: ${err?.message}`, err?.stack);
      throw new HttpException(
        err?.message ?? 'Failed to list absences',
        err?.error?.statusCode ?? HttpStatus.BAD_GATEWAY
      );
    }
  }

  /**
   * Create a new absence request.
   * - Only EMPLOYEE role can create requests.
   *
   * @param req -  request containing the authenticated user
   * @param dto - DTO with absence request details
   * @returns The created absence record
   * @throws HttpException if the service call fails
   */
  @Post()
  @Roles('EMPLOYEE')
  async create(@Req() req: Request, @Body() dto: CreateAbsenceDto) {
    try {
      const user = (req as any).user as AuthenticatedUser;
      this.logger.log(`Creating absence for user: ${user?.sub}`);

      const res$ = this.absenceClient.send(
        { cmd: 'absence.create' },
        { dto, user }
      );
      return await lastValueFrom(res$);
    } catch (err: any) {
      this.logger.error(
        `Failed to create absence: ${err?.message}`,
        err?.stack
      );
      throw new HttpException(
        err?.message ?? 'Failed to create absence',
        err?.error?.statusCode ?? HttpStatus.BAD_GATEWAY
      );
    }
  }

  /**
   * Approve an absence request.
   * - Only ADMIN role can approve.
   *
   * @param req -  request containing the authenticated user
   * @param id - Absence ID to approve
   * @returns The updated absence record
   * @throws HttpException if the service call fails
   */
  @Patch(':id/approve')
  @Roles('ADMIN')
  async approve(@Req() req: Request, @Param('id') id: string) {
    try {
      const user = (req as any).user as AuthenticatedUser;
      this.logger.log(`Approving absence ID: ${id} by admin: ${user?.sub}`);

      const res$ = this.absenceClient.send(
        { cmd: 'absence.approve' },
        { id, user }
      );
      return await lastValueFrom(res$);
    } catch (err: any) {
      this.logger.error(
        `Failed to approve absence ${id}: ${err?.message}`,
        err?.stack
      );
      throw new HttpException(
        err?.message ?? 'Failed to approve absence',
        err?.error?.statusCode ?? HttpStatus.BAD_GATEWAY
      );
    }
  }

  /**
   * Reject an absence request.
   * - Only ADMIN role can reject.
   *
   * @param req -  request containing the authenticated user
   * @param id - Absence ID to reject
   * @returns The updated absence record
   * @throws HttpException if the service call fails
   */
  @Patch(':id/reject')
  @Roles('ADMIN')
  async reject(@Req() req: Request, @Param('id') id: string) {
    try {
      const user = (req as any).user as AuthenticatedUser;
      this.logger.log(`Rejecting absence ID: ${id} by admin: ${user?.sub}`);

      const res$ = this.absenceClient.send(
        { cmd: 'absence.reject' },
        { id, user }
      );
      return await lastValueFrom(res$);
    } catch (err: any) {
      this.logger.error(
        `Failed to reject absence ${id}: ${err?.message}`,
        err?.stack
      );
      throw new HttpException(
        err?.message ?? 'Failed to reject absence',
        err?.error?.statusCode ?? HttpStatus.BAD_GATEWAY
      );
    }
  }
}
