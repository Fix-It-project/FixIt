import { describe, it, expect } from 'vitest';
import { RescheduleRequestBodySchema, RescheduleRejectBodySchema } from '../../reschedule.dto.js';

describe('RescheduleRequestBodySchema', () => {
  it('accepts valid body', () => {
    const r = RescheduleRequestBodySchema.safeParse({
      proposed_scheduled_date: '2026-06-01',
      proposed_scheduled_start_at: '2026-06-01T08:00:00+03:00',
      reason: 'sick',
    });
    expect(r.success).toBe(true);
  });
  it('rejects bad date format', () => {
    const r = RescheduleRequestBodySchema.safeParse({
      proposed_scheduled_date: '2026/06/01',
      proposed_scheduled_start_at: '2026-06-01T08:00:00+03:00',
      reason: 'x',
    });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.path).toEqual(['proposed_scheduled_date']);
  });
  it('rejects missing proposed_scheduled_start_at', () => {
    const r = RescheduleRequestBodySchema.safeParse({ proposed_scheduled_date: '2026-06-01', reason: 'x' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.path).toEqual(['proposed_scheduled_start_at']);
  });
  it('rejects empty reason', () => {
    const r = RescheduleRequestBodySchema.safeParse({
      proposed_scheduled_date: '2026-06-01',
      proposed_scheduled_start_at: '2026-06-01T08:00:00+03:00',
      reason: '',
    });
    expect(r.success).toBe(false);
  });
  it('rejects reason >500 chars', () => {
    const r = RescheduleRequestBodySchema.safeParse({
      proposed_scheduled_date: '2026-06-01',
      proposed_scheduled_start_at: '2026-06-01T08:00:00+03:00',
      reason: 'a'.repeat(501),
    });
    expect(r.success).toBe(false);
  });
});

describe('RescheduleRejectBodySchema', () => {
  it('accepts valid body', () => {
    expect(RescheduleRejectBodySchema.safeParse({ reason: 'no good' }).success).toBe(true);
  });
  it('rejects missing reason', () => {
    expect(RescheduleRejectBodySchema.safeParse({}).success).toBe(false);
  });
  it('rejects empty reason', () => {
    expect(RescheduleRejectBodySchema.safeParse({ reason: '' }).success).toBe(false);
  });
});
