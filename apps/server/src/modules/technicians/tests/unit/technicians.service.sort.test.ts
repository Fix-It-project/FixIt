import { beforeEach, describe, expect, it, vi } from 'vitest';

// ── Mock objects ─────────────────────────────────────────────────────────────
// TechniciansService receives its dependencies via constructor DI, so we pass
// plain mock objects — no vi.mock module-hoisting needed.

const makeRepo = () => ({
  getTechniciansByCategory: vi.fn(),
  searchTechniciansByCategory: vi.fn(),
  getTechnicianProfile: vi.fn(),
  getReviewAggregatesByTechnicianIds: vi.fn(),
  getGlobalReviewMean: vi.fn(),
  getTechnicianSelf: vi.fn(),
  updateTechnicianSelf: vi.fn(),
  updateProfileImage: vi.fn(),
}) as any;

const makeCategoriesRepo = () => ({
  getCategoryById: vi.fn(),
  getAllCategories: vi.fn(),
  createCategory: vi.fn(),
  deleteCategory: vi.fn(),
}) as any;

const makeStorageRepo = () => ({
  uploadFile: vi.fn(),
}) as any;

// ── Shared fixtures ───────────────────────────────────────────────────────────
const categoryId = 'cat-1';

// Global mean is still stubbed because the repository interface exposes it, but
// list "Top Rated" uses the visible average rating directly.
const GLOBAL_MEAN = 4.6;

// Minimal TechnicianWithAddressRow-compatible rows
const baseRow = (id: string, firstName: string) => ({
  id,
  first_name: firstName,
  last_name: id.toUpperCase(),
  email: `${id}@test.com`,
  phone: null,
  is_available: true,
  category_id: categoryId,
  addresses: [],
});

const rowA = { ...baseRow('tech-A', 'Ahmed'), avg_rating: 5.0,  review_count: 1,   sum_ratings: 5   };
const rowB = { ...baseRow('tech-B', 'Bilal'), avg_rating: 4.7,  review_count: 200, sum_ratings: 940 };
const rowC = { ...baseRow('tech-C', 'Carol'), avg_rating: null, review_count: 0,   sum_ratings: 0   };

// ── Test suite ────────────────────────────────────────────────────────────────
describe('TechniciansService.getTechniciansByCategory', () => {
  let repo: ReturnType<typeof makeRepo>;
  let categoriesRepo: ReturnType<typeof makeCategoriesRepo>;
  let storageRepo: ReturnType<typeof makeStorageRepo>;
  let service: import('../../technicians.service.js').TechniciansService;

  beforeEach(async () => {
    vi.clearAllMocks();

    repo = makeRepo();
    categoriesRepo = makeCategoriesRepo();
    storageRepo = makeStorageRepo();

    categoriesRepo.getCategoryById.mockResolvedValue({ id: categoryId, name: 'plumbing' });
    // Default stub — all three technicians in the repo's natural alphabetical order (A, B, C)
    repo.getTechniciansByCategory.mockResolvedValue([rowA, rowB, rowC]);
    repo.getGlobalReviewMean.mockResolvedValue(GLOBAL_MEAN);

    const { TechniciansService } = await import('../../technicians.service.js');
    service = new TechniciansService(repo as any, categoriesRepo as any, storageRepo as any);
  });

  describe('sort=top_rated', () => {
    it('orders by average rating descending: A > B > C', async () => {
      const result = await service.getTechniciansByCategory(categoryId, { sort: 'top_rated' });
      const ids = result.map((t) => t.id);
      expect(ids).toEqual(['tech-A', 'tech-B', 'tech-C']);
    });

    it('does NOT push a zero-review technician above a positively-reviewed one', async () => {
      const result = await service.getTechniciansByCategory(categoryId, { sort: 'top_rated' });
      const cIdx = result.findIndex((t) => t.id === 'tech-C');
      const aIdx = result.findIndex((t) => t.id === 'tech-A');
      const bIdx = result.findIndex((t) => t.id === 'tech-B');
      expect(cIdx).toBeGreaterThan(aIdx);
      expect(cIdx).toBeGreaterThan(bIdx);
    });

    it('orders equal ratings by review count desc, then name', async () => {
      const rowD = { ...baseRow('tech-D', 'Dina'), avg_rating: 5.0, review_count: 3, sum_ratings: 15 };
      repo.getTechniciansByCategory.mockResolvedValue([rowA, rowB, rowC, rowD]);

      const result = await service.getTechniciansByCategory(categoryId, { sort: 'top_rated' });

      expect(result.map((t) => t.id)).toEqual(['tech-D', 'tech-A', 'tech-B', 'tech-C']);
    });

    it('does NOT call getGlobalReviewMean for top_rated', async () => {
      await service.getTechniciansByCategory(categoryId, { sort: 'top_rated' });
      expect(repo.getGlobalReviewMean).not.toHaveBeenCalled();
    });

    it('hydrates avg_rating and review_count on every returned DTO', async () => {
      const result = await service.getTechniciansByCategory(categoryId, { sort: 'top_rated' });
      for (const dto of result) {
        expect(dto).toHaveProperty('avg_rating');
        expect(dto).toHaveProperty('review_count');
      }
      const c = result.find((t) => t.id === 'tech-C')!;
      expect(c.avg_rating).toBeNull();
      expect(c.review_count).toBe(0);
    });
  });

  describe('default sort (no sort param)', () => {
    it('preserves the repository ordering (A, B, C) unchanged', async () => {
      const result = await service.getTechniciansByCategory(categoryId);
      const ids = result.map((t) => t.id);
      expect(ids).toEqual(['tech-A', 'tech-B', 'tech-C']);
    });

    it('does NOT call getGlobalReviewMean on the default path', async () => {
      await service.getTechniciansByCategory(categoryId);
      expect(repo.getGlobalReviewMean).not.toHaveBeenCalled();
    });
  });

  describe('sort=most_reviews', () => {
    it('orders by review_count desc, then avg_rating desc, then name', async () => {
      const rowD = { ...baseRow('tech-D', 'Dina'), avg_rating: 4.9, review_count: 1, sum_ratings: 4.9 };
      repo.getTechniciansByCategory.mockResolvedValue([rowA, rowB, rowC, rowD]);

      const result = await service.getTechniciansByCategory(categoryId, { sort: 'most_reviews' });

      expect(result.map((t) => t.id)).toEqual(['tech-B', 'tech-A', 'tech-D', 'tech-C']);
    });

    it('does NOT call getGlobalReviewMean for most_reviews', async () => {
      await service.getTechniciansByCategory(categoryId, { sort: 'most_reviews' });

      expect(repo.getGlobalReviewMean).not.toHaveBeenCalled();
    });
  });

  describe('nearest sort via coordinates', () => {
    it('orders by distance when lat/lng are provided without a rating sort', async () => {
      repo.getTechniciansByCategory.mockResolvedValue([
        {
          ...rowA,
          addresses: [{ city: 'Far', street: 'A', latitude: 30.1, longitude: 31.1, is_active: true }],
        },
        {
          ...rowB,
          addresses: [{ city: 'Near', street: 'B', latitude: 30.01, longitude: 31.01, is_active: true }],
        },
        {
          ...rowC,
          addresses: [],
        },
      ]);

      const result = await service.getTechniciansByCategory(categoryId, { lat: 30, lng: 31 });

      expect(result.map((t) => t.id)).toEqual(['tech-B', 'tech-A', 'tech-C']);
      const [near, , missingDistance] = result;
      expect(near?.distance_km).not.toBeNull();
      expect(missingDistance?.distance_km).toBeNull();
    });
  });
});
