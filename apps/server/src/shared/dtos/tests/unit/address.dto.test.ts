import { describe, it, expect } from 'vitest';
import { AddressBodySchema, AddressUpdateBodySchema, AddressIdParamsSchema } from '../../address.dto.js';

describe('AddressBodySchema', () => {
  const valid = { city: 'Cairo', street: 'Nile St', latitude: 30.04, longitude: 31.24 };

  it('accepts valid address with required fields', () => {
    expect(AddressBodySchema.safeParse(valid).success).toBe(true);
  });

  it('accepts with optional building_no and apartment_no', () => {
    expect(AddressBodySchema.safeParse({ ...valid, building_no: '5', apartment_no: '2A' }).success).toBe(true);
  });

  it('rejects missing city', () => {
    const { city: _, ...rest } = valid;
    expect(AddressBodySchema.safeParse(rest).success).toBe(false);
  });

  it('rejects missing street', () => {
    const { street: _, ...rest } = valid;
    expect(AddressBodySchema.safeParse(rest).success).toBe(false);
  });

  it('rejects non-numeric latitude', () => {
    expect(AddressBodySchema.safeParse({ ...valid, latitude: 'bad' }).success).toBe(false);
  });

  it('rejects missing latitude', () => {
    const { latitude: _, ...rest } = valid;
    expect(AddressBodySchema.safeParse(rest).success).toBe(false);
  });
});

describe('AddressUpdateBodySchema (partial)', () => {
  it('accepts partial update with only city', () => {
    expect(AddressUpdateBodySchema.safeParse({ city: 'Alexandria' }).success).toBe(true);
  });

  it('accepts empty object (all optional)', () => {
    expect(AddressUpdateBodySchema.safeParse({}).success).toBe(true);
  });

  it('still rejects non-numeric latitude even on partial', () => {
    expect(AddressUpdateBodySchema.safeParse({ latitude: 'bad' }).success).toBe(false);
  });
});

describe('AddressIdParamsSchema', () => {
  it('accepts valid UUID', () => {
    expect(AddressIdParamsSchema.safeParse({ id: '550e8400-e29b-41d4-a716-446655440000' }).success).toBe(true);
  });

  it('rejects non-UUID string', () => {
    const result = AddressIdParamsSchema.safeParse({ id: 'not-a-uuid' });
    expect(result.success).toBe(false);
    expect(result.error!.issues[0].message).toContain('UUID');
  });
});
