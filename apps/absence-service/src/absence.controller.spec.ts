import { Test, TestingModule } from '@nestjs/testing';
import { AbsenceController } from './absence.controller';
import { AbsenceService } from './absence.service';
import { AuthenticatedUser, CreateAbsenceDto } from '@eams/common';
import { AbsenceRequest, AbsenceStatus, UserRole } from '@eams/database';
// import { AbsenceStatus, UserRole } from '@eams/common';

describe('AbsenceController', () => {
  let controller: AbsenceController;
  let service: jest.Mocked<AbsenceService>;

  const mockAbsenceService = {
    list: jest.fn(),
    create: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
  };

  const mockEmployee: AuthenticatedUser = {
    sub: 'user-123',
    email: 'employee@example.com',
    role: UserRole.EMPLOYEE,
  };

  const mockAdmin: AuthenticatedUser = {
    sub: 'admin-1',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AbsenceController],
      providers: [
        {
          provide: AbsenceService,
          useValue: mockAbsenceService,
        },
      ],
    }).compile();

    controller = module.get<AbsenceController>(AbsenceController);
    service = module.get(AbsenceService);
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should call absenceService.list with correct params', async () => {
      const result = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      };
      service.list.mockResolvedValue(result);

      const response = await controller.list({
        user: mockEmployee,
        page: 1,
        limit: 10,
      });

      expect(service.list).toHaveBeenCalledWith(mockEmployee, 1, 10);
      expect(response).toEqual(result);
    });
  });

  describe('create', () => {
    it('should call absenceService.create with correct params', async () => {
      const dto: CreateAbsenceDto = {
        startDate: '2025-09-01',
        endDate: '2025-09-05',
        reason: 'Vacation',
      };
      const absence: AbsenceRequest = {
        id: 'absence-1',
        reason: dto.reason,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: AbsenceStatus.PENDING,
        employee: { id: mockEmployee.sub } as any,
        createdAt: new Date(),
        setStatus: jest.fn(),
        getStatus: jest.fn().mockReturnValue(AbsenceStatus.PENDING),
        isPending: jest.fn().mockReturnValue(true),
        isApproved: jest.fn().mockReturnValue(false),
        isRejected: jest.fn().mockReturnValue(false),
      };
      service.create.mockResolvedValue(absence);

      const response = await controller.create({ dto, user: mockEmployee });

      expect(service.create).toHaveBeenCalledWith(dto, mockEmployee);
      expect(response).toEqual(absence);
    });
  });

  describe('approve', () => {
    it('should call absenceService.approve with correct params', async () => {
      const absence: Partial<AbsenceRequest> = {
        id: 'absence-1',
        status: AbsenceStatus.APPROVED,
      };
      service.approve.mockResolvedValue(absence as AbsenceRequest);

      const response = await controller.approve({
        id: 'absence-1',
        user: mockAdmin,
      });

      expect(service.approve).toHaveBeenCalledWith('absence-1', mockAdmin);
      expect(response).toEqual(absence);
    });
  });

  describe('reject', () => {
    it('should call absenceService.reject with correct params', async () => {
      const absence: Partial<AbsenceRequest> = {
        id: 'absence-2',
        status: AbsenceStatus.REJECTED,
      };
      service.reject.mockResolvedValue(absence as AbsenceRequest);

      const response = await controller.reject({
        id: 'absence-2',
        user: mockAdmin,
      });

      expect(service.reject).toHaveBeenCalledWith('absence-2', mockAdmin);
      expect(response).toEqual(absence);
    });
  });
});
