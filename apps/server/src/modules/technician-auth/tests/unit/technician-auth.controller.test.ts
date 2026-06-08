import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DocumentFiles } from '../../../../shared/storage/storage.repository.js';
import { createMockReq, createMockRes } from '../../../../../tests/mocks/express.mock.js';

const { mockService } = vi.hoisted(() => ({
  mockService: {
    checkEmailExists: vi.fn(),
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    getCurrentTechnician: vi.fn(),
    refreshSession: vi.fn(),
  },
}));

vi.mock('../../technician-auth.service.js', () => ({
  technicianAuthService: mockService,
}));

const { technicianAuthController: controller } = await import('../../technician-auth.controller.js');
const { AppError } = await import('../../../../shared/errors/app-error.js');

async function runHandler(
  handler: (req: any, res: any, next: any) => void,
  req: any,
  res: any,
): Promise<{ next: ReturnType<typeof vi.fn> }> {
  const next = vi.fn();
  handler(req, res, next);
  await new Promise((resolve) => setImmediate(resolve));
  return { next };
}

function mockReq(overrides: Record<string, unknown> = {}) {
  const req = createMockReq(overrides as never) as any;
  req.log = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
  return req;
}

describe('technician-auth controller', () => {
  beforeEach(() => {
    for (const m of Object.values(mockService)) {
      m.mockReset();
    }
  });

  // ── checkEmail ────────────────────────────────────────────────────────────
  describe('checkEmail', () => {
    it('returns 200 with the exists flag', async () => {
      mockService.checkEmailExists.mockResolvedValue(true);

      const req = mockReq({ body: { email: 'tech@example.com' } });
      const res = createMockRes();
      const { next } = await runHandler(controller.checkEmail, req, res);

      expect(mockService.checkEmailExists).toHaveBeenCalledWith('tech@example.com');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ exists: true });
      expect(next).not.toHaveBeenCalled();
    });

    it('forwards service errors via next()', async () => {
      mockService.checkEmailExists.mockRejectedValue(new Error('DB error'));

      const req = mockReq({ body: { email: 'tech@example.com' } });
      const res = createMockRes();
      const { next } = await runHandler(controller.checkEmail, req, res);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  // ── signUp ────────────────────────────────────────────────────────────────
  describe('signUp', () => {
    const validBody = {
      email: 'tech@example.com',
      password: 'pass123',
      first_name: 'Jane',
      last_name: 'Doe',
      phone: '555-0100',
      category_id: 'cat-1',
      city: 'Amman',
      street: 'Main St',
      building_no: '10',
      apartment_no: '3A',
      latitude: 31.95,
      longitude: 35.93,
    };
    const uploadedFiles = {
      criminal_record: [{ originalname: 'criminal.pdf' } as Express.Multer.File],
      birth_certificate: [{ originalname: 'birth.pdf' } as Express.Multer.File],
      national_id: [{ originalname: 'id.pdf' } as Express.Multer.File],
    };
    const expectedFiles: DocumentFiles = {
      criminal_record: uploadedFiles.criminal_record[0],
      birth_certificate: uploadedFiles.birth_certificate[0],
      national_id: uploadedFiles.national_id[0],
    };

    it('returns 201 on successful signup and forwards body + files + address', async () => {
      const payload = {
        technician: { id: 'tech-1', email: 'tech@example.com' },
        message: 'Technician registered successfully. Please sign in to continue.',
      };
      mockService.signUp.mockResolvedValue(payload);

      const req = mockReq({ body: validBody });
      req.files = uploadedFiles;
      const res = createMockRes();
      await runHandler(controller.signUp, req, res);

      expect(mockService.signUp).toHaveBeenCalledWith(
        {
          email: 'tech@example.com',
          password: 'pass123',
          first_name: 'Jane',
          last_name: 'Doe',
          phone: '555-0100',
          category_id: 'cat-1',
        },
        expectedFiles,
        {
          city: 'Amman',
          street: 'Main St',
          building_no: '10',
          apartment_no: '3A',
          latitude: 31.95,
          longitude: 35.93,
        },
        undefined,
      );
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(payload);
    });

    it('forwards the expo_push_token when present in the body', async () => {
      mockService.signUp.mockResolvedValue({ technician: { id: 'tech-1' } });

      const req = mockReq({ body: { ...validBody, expo_push_token: 'ExponentPushToken[abc]' } });
      req.files = uploadedFiles;
      const res = createMockRes();
      await runHandler(controller.signUp, req, res);

      expect(mockService.signUp).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        expect.any(Object),
        'ExponentPushToken[abc]',
      );
      expect(res.statusCode).toBe(201);
    });

    it('still calls service with undefined files when req.files is missing', async () => {
      mockService.signUp.mockResolvedValue({ technician: { id: 'tech-1' } });

      const req = mockReq({ body: validBody });
      const res = createMockRes();
      await runHandler(controller.signUp, req, res);

      expect(mockService.signUp).toHaveBeenCalledWith(
        expect.any(Object),
        {
          criminal_record: undefined,
          birth_certificate: undefined,
          national_id: undefined,
        },
        expect.any(Object),
        undefined,
      );
      expect(res.statusCode).toBe(201);
    });

    it('forwards service errors via next()', async () => {
      mockService.signUp.mockRejectedValue(new Error('A technician with this email already exists'));

      const req = mockReq({ body: validBody });
      req.files = uploadedFiles;
      const res = createMockRes();
      const { next } = await runHandler(controller.signUp, req, res);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  // ── signIn ────────────────────────────────────────────────────────────────
  describe('signIn', () => {
    it('returns 200 with the session on success', async () => {
      const payload = { technician: { id: 'tech-1' }, session: { accessToken: 'at' } };
      mockService.signIn.mockResolvedValue(payload);

      const req = mockReq({ body: { email: 'tech@example.com', password: 'pass123' } });
      const res = createMockRes();
      await runHandler(controller.signIn, req, res);

      expect(mockService.signIn).toHaveBeenCalledWith('tech@example.com', 'pass123');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(payload);
    });

    it('forwards service errors via next()', async () => {
      mockService.signIn.mockRejectedValue(new Error('Invalid credentials'));

      const req = mockReq({ body: { email: 'tech@example.com', password: 'wrong' } });
      const res = createMockRes();
      const { next } = await runHandler(controller.signIn, req, res);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  // ── signOut ───────────────────────────────────────────────────────────────
  describe('signOut', () => {
    it('strips Bearer prefix and forwards the bare token', async () => {
      mockService.signOut.mockResolvedValue({ success: true });

      const req = mockReq({ headers: { authorization: 'Bearer abc123' } });
      const res = createMockRes();
      await runHandler(controller.signOut, req, res);

      expect(mockService.signOut).toHaveBeenCalledWith('abc123');
      expect(res.statusCode).toBe(200);
    });

    it('passes through a token without Bearer prefix unchanged', async () => {
      mockService.signOut.mockResolvedValue({ success: true });

      const req = mockReq({ headers: { authorization: 'raw-token' } });
      const res = createMockRes();
      await runHandler(controller.signOut, req, res);

      expect(mockService.signOut).toHaveBeenCalledWith('raw-token');
    });

    it('calls next(AppError.unauthorized) when no Authorization header is present', async () => {
      const req = mockReq({ headers: {} });
      const res = createMockRes();
      const { next } = await runHandler(controller.signOut, req, res);

      expect(next).toHaveBeenCalledTimes(1);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const err = next.mock.calls[0]![0] as InstanceType<typeof AppError>;
      expect(err).toBeInstanceOf(AppError);
      expect(err.code).toBe('UNAUTHENTICATED');
      expect(err.status).toBe(401);
      expect(err.opts.token).toBe('no_token');
      expect(mockService.signOut).not.toHaveBeenCalled();
    });
  });

  // ── getCurrentTechnician ──────────────────────────────────────────────────
  describe('getCurrentTechnician', () => {
    it('returns 200 with the technician on success', async () => {
      const technician = { id: 'tech-1', email: 'tech@example.com' };
      mockService.getCurrentTechnician.mockResolvedValue(technician);

      const req = mockReq({ headers: { authorization: 'Bearer tok' } });
      const res = createMockRes();
      await runHandler(controller.getCurrentTechnician, req, res);

      expect(mockService.getCurrentTechnician).toHaveBeenCalledWith('tok');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ technician });
    });

    it('calls next(AppError.unauthorized) when no Authorization header is present', async () => {
      const req = mockReq({ headers: {} });
      const res = createMockRes();
      const { next } = await runHandler(controller.getCurrentTechnician, req, res);

      expect(next).toHaveBeenCalledTimes(1);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const err = next.mock.calls[0]![0] as InstanceType<typeof AppError>;
      expect(err).toBeInstanceOf(AppError);
      expect(err.code).toBe('UNAUTHENTICATED');
      expect(err.status).toBe(401);
      expect(mockService.getCurrentTechnician).not.toHaveBeenCalled();
    });
  });

  // ── refreshToken ──────────────────────────────────────────────────────────
  describe('refreshToken', () => {
    it('returns 200 with the new session on success', async () => {
      const payload = { technician: { id: 'tech-1' }, session: { accessToken: 'new-at' } };
      mockService.refreshSession.mockResolvedValue(payload);

      const req = mockReq({ body: { refreshToken: 'old-rt' } });
      const res = createMockRes();
      await runHandler(controller.refreshToken, req, res);

      expect(mockService.refreshSession).toHaveBeenCalledWith('old-rt');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(payload);
    });

    it('forwards service errors via next()', async () => {
      mockService.refreshSession.mockRejectedValue(new Error('Invalid refresh token'));

      const req = mockReq({ body: { refreshToken: 'bad-rt' } });
      const res = createMockRes();
      const { next } = await runHandler(controller.refreshToken, req, res);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
