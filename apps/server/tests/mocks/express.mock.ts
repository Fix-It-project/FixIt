import type { Request, Response } from 'express';
import { vi, type Mock } from 'vitest';

export type MockRequest = Request;

export type MockResponse = Response & {
  statusCode: number;
  body: unknown;
  status: Mock<(code: number) => MockResponse>;
  json: Mock<(data: unknown) => MockResponse>;
};

/**
 * Creates a mock Express Request with sensible defaults.
 * Pass overrides for body, headers, or any other Request properties.
 */
export function createMockReq(overrides: Partial<Request> = {}): MockRequest {
  return {
    body: {},
    headers: {},
    params: {},
    ...overrides,
  } as Request;
}

/**
 * Creates a chainable mock Express Response.
 * After calling controller methods, assert against `res.statusCode` and `res.body`.
 */
export function createMockRes(): MockResponse {
  const res = {} as unknown as MockResponse;

  res.statusCode = 200;
  res.body = null;
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn((data: unknown) => {
    res.body = data;
    return res;
  });

  return res;
}
