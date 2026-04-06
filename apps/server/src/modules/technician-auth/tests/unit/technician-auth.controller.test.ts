import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request } from 'express';
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

const { TechnicianAuthController } = await import('../../technician-auth.controller.js');

describe('TechnicianAuthController', () => {
  let controller: InstanceType<typeof TechnicianAuthController>;

  type UploadedFiles = {
    [fieldname: string]: Express.Multer.File[];
  };
  type RequiredUploadedFiles = {
    criminal_record: [Express.Multer.File];
    birth_certificate: [Express.Multer.File];
    national_id: [Express.Multer.File];
  };

  beforeEach(() => {
    controller = new TechnicianAuthController();
  });

  function createReqWithFiles(overrides: Partial<Request>, files?: UploadedFiles) {
    const req = createMockReq(overrides);
    return files ? Object.assign(req, { files }) : req;
  }

  function expectValidationFailure(
    res: ReturnType<typeof createMockRes>,
    expectedStatus: number,
    expectedBody: unknown,
    mockedMethod: ReturnType<typeof vi.fn>,
  ) {
    expect(res.statusCode).toBe(expectedStatus);
    expect(res.body).toEqual(expectedBody);
    expect(mockedMethod).not.toHaveBeenCalled();
  }

  describe('checkEmail', () => {
    it('should return 200 with exists flag', async () => {
      mockService.checkEmailExists.mockResolvedValue(true);

      const req = createMockReq({ body: { email: 'tech@example.com' } });
      const res = createMockRes();

      await controller.checkEmail(req, res);

      expect(mockService.checkEmailExists).toHaveBeenCalledWith('tech@example.com');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ exists: true });
    });

    it('should return 400 when email is missing', async () => {
      const req = createMockReq({ body: {} });
      const res = createMockRes();

      await controller.checkEmail(req, res);

      expectValidationFailure(res, 400, { error: 'Email is required' }, mockService.checkEmailExists);
    });

    it('should return 500 on service error', async () => {
      mockService.checkEmailExists.mockRejectedValue(new Error('DB error'));

      const req = createMockReq({ body: { email: 'tech@example.com' } });
      const res = createMockRes();

      await controller.checkEmail(req, res);

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'DB error' });
    });
  });

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
    const uploadedFiles: RequiredUploadedFiles = {
      criminal_record: [{ originalname: 'criminal.pdf' } as Express.Multer.File],
      birth_certificate: [{ originalname: 'birth.pdf' } as Express.Multer.File],
      national_id: [{ originalname: 'id.pdf' } as Express.Multer.File],
    };
    const expectedFiles: DocumentFiles = {
      criminal_record: uploadedFiles.criminal_record[0],
      birth_certificate: uploadedFiles.birth_certificate[0],
      national_id: uploadedFiles.national_id[0],
    };

    it('should return 201 on successful signup', async () => {
      const result = {
        technician: { id: 'tech-1', email: 'tech@example.com' },
        message: 'Technician registered successfully. Please sign in to continue.',
      };
      mockService.signUp.mockResolvedValue(result);

      const req = createReqWithFiles({ body: validBody }, uploadedFiles);
      const res = createMockRes();

      await controller.signUp(req, res);

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
      );
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(result);
    });

    it('should still call service with undefined files when req.files is missing', async () => {
      mockService.signUp.mockResolvedValue({ technician: { id: 'tech-1' } });

      const req = createMockReq({ body: validBody });
      const res = createMockRes();

      await controller.signUp(req, res);

      expect(mockService.signUp).toHaveBeenCalledWith(
        expect.any(Object),
        {
          criminal_record: undefined,
          birth_certificate: undefined,
          national_id: undefined,
        },
        expect.any(Object),
      );
      expect(res.statusCode).toBe(201);
    });

    it('should return 400 when email is missing', async () => {
      const req = createMockReq({ body: { ...validBody, email: undefined } });
      const res = createMockRes();

      await controller.signUp(req, res);

      expectValidationFailure(
        res,
        400,
        { error: 'email, password, first_name, last_name, and category_id are required' },
        mockService.signUp,
      );
    });

    it('should return 400 when password is missing', async () => {
      const req = createMockReq({ body: { ...validBody, password: undefined } });
      const res = createMockRes();

      await controller.signUp(req, res);

      expectValidationFailure(
        res,
        400,
        { error: 'email, password, first_name, last_name, and category_id are required' },
        mockService.signUp,
      );
    });

    it('should return 400 when first_name is missing', async () => {
      const req = createMockReq({ body: { ...validBody, first_name: undefined } });
      const res = createMockRes();

      await controller.signUp(req, res);

      expectValidationFailure(
        res,
        400,
        { error: 'email, password, first_name, last_name, and category_id are required' },
        mockService.signUp,
      );
    });

    it('should return 400 when last_name is missing', async () => {
      const req = createMockReq({ body: { ...validBody, last_name: undefined } });
      const res = createMockRes();

      await controller.signUp(req, res);

      expectValidationFailure(
        res,
        400,
        { error: 'email, password, first_name, last_name, and category_id are required' },
        mockService.signUp,
      );
    });

    it('should return 400 when category_id is missing', async () => {
      const req = createMockReq({ body: { ...validBody, category_id: undefined } });
      const res = createMockRes();

      await controller.signUp(req, res);

      expectValidationFailure(
        res,
        400,
        { error: 'email, password, first_name, last_name, and category_id are required' },
        mockService.signUp,
      );
    });

    it('should return 409 when service throws already exists error', async () => {
      mockService.signUp.mockRejectedValue(new Error('A technician with this email already exists'));

      const req = createReqWithFiles({ body: validBody }, uploadedFiles);
      const res = createMockRes();

      await controller.signUp(req, res);

      expect(res.statusCode).toBe(409);
      expect(res.body).toEqual({ error: 'A technician with this email already exists' });
    });

    it('should return 400 on other service errors', async () => {
      mockService.signUp.mockRejectedValue(new Error('Upload failed'));

      const req = createReqWithFiles({ body: validBody }, uploadedFiles);
      const res = createMockRes();

      await controller.signUp(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'Upload failed' });
    });
  });

  describe('signIn', () => {
    it('should return 200 on successful sign-in', async () => {
      const result = { technician: { id: 'tech-1' }, session: { accessToken: 'at' } };
      mockService.signIn.mockResolvedValue(result);

      const req = createMockReq({ body: { email: 'tech@example.com', password: 'pass123' } });
      const res = createMockRes();

      await controller.signIn(req, res);

      expect(mockService.signIn).toHaveBeenCalledWith('tech@example.com', 'pass123');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(result);
    });

    it('should return 400 when credentials are missing', async () => {
      const req = createMockReq({ body: {} });
      const res = createMockRes();

      await controller.signIn(req, res);

      expectValidationFailure(res, 400, { error: 'Email and password are required' }, mockService.signIn);
    });

    it('should return 401 on service error', async () => {
      mockService.signIn.mockRejectedValue(new Error('Invalid credentials'));

      const req = createMockReq({ body: { email: 'tech@example.com', password: 'wrong' } });
      const res = createMockRes();

      await controller.signIn(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid credentials' });
    });
  });

  describe('signOut', () => {
    it('should strip Bearer prefix from token', async () => {
      mockService.signOut.mockResolvedValue({ success: true, message: 'Logged out successfully' });

      const req = createMockReq({ headers: { authorization: 'Bearer abc123' } });
      const res = createMockRes();

      await controller.signOut(req, res);

      expect(mockService.signOut).toHaveBeenCalledWith('abc123');
      expect(res.statusCode).toBe(200);
    });

    it('should pass through raw token without Bearer prefix', async () => {
      mockService.signOut.mockResolvedValue({ success: true });

      const req = createMockReq({ headers: { authorization: 'raw-token' } });
      const res = createMockRes();

      await controller.signOut(req, res);

      expect(mockService.signOut).toHaveBeenCalledWith('raw-token');
    });

    it('should return 401 when no token is provided', async () => {
      const req = createMockReq({ headers: {} });
      const res = createMockRes();

      await controller.signOut(req, res);

      expectValidationFailure(res, 401, { error: 'No token provided' }, mockService.signOut);
    });

    it('should return 400 on service error', async () => {
      mockService.signOut.mockRejectedValue(new Error('Session not found'));

      const req = createMockReq({ headers: { authorization: 'Bearer tok' } });
      const res = createMockRes();

      await controller.signOut(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'Session not found' });
    });
  });

  describe('getCurrentTechnician', () => {
    it('should return 200 with technician data', async () => {
      const technician = { id: 'tech-1', email: 'tech@example.com' };
      mockService.getCurrentTechnician.mockResolvedValue(technician);

      const req = createMockReq({ headers: { authorization: 'Bearer tok' } });
      const res = createMockRes();

      await controller.getCurrentTechnician(req, res);

      expect(mockService.getCurrentTechnician).toHaveBeenCalledWith('tok');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ technician });
    });

    it('should return 401 when no token is provided', async () => {
      const req = createMockReq({ headers: {} });
      const res = createMockRes();

      await controller.getCurrentTechnician(req, res);

      expectValidationFailure(
        res,
        401,
        { error: 'No token provided' },
        mockService.getCurrentTechnician,
      );
    });

    it('should return 401 on service error', async () => {
      mockService.getCurrentTechnician.mockRejectedValue(new Error('Token expired'));

      const req = createMockReq({ headers: { authorization: 'Bearer tok' } });
      const res = createMockRes();

      await controller.getCurrentTechnician(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Token expired' });
    });
  });

  describe('refreshToken', () => {
    it('should return 200 on successful refresh', async () => {
      const result = { technician: { id: 'tech-1' }, session: { accessToken: 'new-at' } };
      mockService.refreshSession.mockResolvedValue(result);

      const req = createMockReq({ body: { refreshToken: 'old-rt' } });
      const res = createMockRes();

      await controller.refreshToken(req, res);

      expect(mockService.refreshSession).toHaveBeenCalledWith('old-rt');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(result);
    });

    it('should return 400 when refreshToken is missing', async () => {
      const req = createMockReq({ body: {} });
      const res = createMockRes();

      await controller.refreshToken(req, res);

      expectValidationFailure(
        res,
        400,
        { error: 'Refresh token is required' },
        mockService.refreshSession,
      );
    });

    it('should return 401 on service error', async () => {
      mockService.refreshSession.mockRejectedValue(new Error('Invalid refresh token'));

      const req = createMockReq({ body: { refreshToken: 'bad-rt' } });
      const res = createMockRes();

      await controller.refreshToken(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid refresh token' });
    });
  });
});
