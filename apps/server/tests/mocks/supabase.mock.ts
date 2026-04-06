import { vi, type Mock } from 'vitest';

type MockFn = Mock<(...args: unknown[]) => unknown>;

export interface MockSupabaseAuth {
  signUp: MockFn;
  signInWithPassword: MockFn;
  resetPasswordForEmail: MockFn;
  updateUser: MockFn;
  signOut: MockFn;
  getUser: MockFn;
  refreshSession: MockFn;
}

export interface MockSupabaseClient {
  auth: MockSupabaseAuth;
}

/**
 * Shared Supabase mock factory.
 * Returns an object matching the shape of `supabase.auth.*` methods
 * used by AuthRepository.
 */
export function createMockSupabaseAuth(): MockSupabaseAuth {
  return {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    refreshSession: vi.fn(),
  };
}

export function createMockSupabaseClient(): MockSupabaseClient {
  return {
    auth: createMockSupabaseAuth(),
  };
}
