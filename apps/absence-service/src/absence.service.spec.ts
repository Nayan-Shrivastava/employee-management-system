import { Test, TestingModule } from '@nestjs/testing';
import { AbsenceService } from './absence.service';
import { AbsenceRequest, AbsenceStatus, User, UserRole } from '@eams/database';
import { AuthenticatedUser, CreateAbsenceDto } from '@eams/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('AbsenceService', () => {
  let service: AbsenceService;
  let repo: jest.Mocked<Repository<AbsenceRequest>>;

  const mockEmployee: AuthenticatedUser = {
    sub: 'user-123',
    email: 'emp@example.com',
    role: UserRole.EMPLOYEE,
  };

  const mockAdmin: AuthenticatedUser = {
    sub: 'admin-1',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  };

  const absenceEntity: AbsenceRequest = {
    id: 'abs-1',
    reason: 'Vacation',
    startDate: new Date('2025-09-01'),
    endDate: new Date('2025-09-05'),
    status: AbsenceStatus.PENDING,
    employee: { id: mockEmployee.sub } as User,
    createdAt: new Date(),
    setStatus: jest.fn(),
    getStatus: jest.fn(),
    isPending: jest.fn(),
    isApproved: jest.fn(),
    isRejected: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AbsenceService,
        {
          provide: getRepositoryToken(AbsenceRequest),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AbsenceService>(AbsenceService);
    repo = module.get(getRepositoryToken(AbsenceRequest));
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return employee’s own absences', async () => {
      const qb: any = {
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[absenceEntity], 1]),
      };
      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.list(mockEmployee, 1, 10);

      expect(qb.where).toHaveBeenCalledWith(
        'absence.employeeId = :employeeId',
        {
          employeeId: mockEmployee.sub,
        }
      );
      expect(result).toEqual({
        data: [absenceEntity],
        total: 1,
        page: 1,
        limit: 10,
      });
    });

    it('should return all absences for admin', async () => {
      const qb: any = {
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[absenceEntity], 1]),
      };
      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.list(mockAdmin, 1, 5);

      expect(qb.where).not.toHaveBeenCalled();
      expect(result).toEqual({
        data: [absenceEntity],
        total: 1,
        page: 1,
        limit: 5,
      });
    });
  });

  describe('create', () => {
    it('should allow employee to create absence', async () => {
      const dto: CreateAbsenceDto = {
        reason: 'Sick leave',
        startDate: '2025-09-10',
        endDate: '2025-09-12',
      };
      repo.create.mockReturnValue(absenceEntity);
      repo.save.mockResolvedValue({
        ...absenceEntity,
        id: 'new-id',
        status: AbsenceStatus.PENDING,
        setStatus: jest.fn(),
        getStatus: jest.fn().mockReturnValue(AbsenceStatus.PENDING),
        isPending: jest.fn().mockReturnValue(true),
        isApproved: jest.fn().mockReturnValue(false),
        isRejected: jest.fn().mockReturnValue(false),
      });

      const result = await service.create(dto, mockEmployee);

      expect(repo.create).toHaveBeenCalledWith({
        employee: { id: mockEmployee.sub },
        startDate: dto.startDate,
        endDate: dto.endDate,
        reason: dto.reason,
        status: AbsenceStatus.PENDING,
      });
      expect(result.id).toBe('new-id');
    });

    it('should forbid non-employee from creating', async () => {
      const dto: CreateAbsenceDto = {
        reason: 'Invalid attempt',
        startDate: '2025-09-01',
        endDate: '2025-09-02',
      };
      await expect(service.create(dto, mockAdmin)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('approve', () => {
    it('should approve absence if admin', async () => {
      repo.findOne.mockResolvedValue(absenceEntity);
      repo.save.mockResolvedValue({
        ...absenceEntity,
        status: AbsenceStatus.APPROVED,
        setStatus: jest.fn(),
        getStatus: jest.fn().mockReturnValue(AbsenceStatus.APPROVED),
        isPending: jest.fn().mockReturnValue(false),
        isApproved: jest.fn().mockReturnValue(true),
        isRejected: jest.fn().mockReturnValue(false),
      });

      const result = await service.approve('abs-1', mockAdmin);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'abs-1' } });
      expect(result.status).toBe(AbsenceStatus.APPROVED);
    });

    it('should throw NotFoundException if absence not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.approve('invalid-id', mockAdmin)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should forbid non-admin from approving', async () => {
      await expect(service.approve('abs-1', mockEmployee)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('reject', () => {
    it('should reject absence if admin', async () => {
      repo.findOne.mockResolvedValue(absenceEntity);
      repo.save.mockResolvedValue({
        ...absenceEntity,
        setStatus: jest.fn(),
        status: AbsenceStatus.REJECTED,
        getStatus: jest.fn().mockReturnValue(AbsenceStatus.REJECTED),
        isPending: jest.fn().mockReturnValue(false),
        isApproved: jest.fn().mockReturnValue(false),
        isRejected: jest.fn().mockReturnValue(true),
      });

      const result = await service.reject('abs-1', mockAdmin);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'abs-1' } });
      expect(result.status).toBe(AbsenceStatus.REJECTED);
    });

    it('should throw NotFoundException if absence not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.reject('invalid-id', mockAdmin)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should forbid non-admin from rejecting', async () => {
      await expect(service.reject('abs-1', mockEmployee)).rejects.toThrow(
        ForbiddenException
      );
    });
  });
});
