import { createPaginationMeta } from '@common/utils';

describe('createPaginationMeta', () => {
  it('should calculate totalPages exactly when divisible', () => {
    const result = createPaginationMeta(100, 1, 10);

    expect(result).toEqual({
      total: 100,
      page: 1,
      totalPages: 10,
    });
  });

  it('should round up totalPages when not divisible', () => {
    const result = createPaginationMeta(101, 2, 10);

    expect(result).toEqual({
      total: 101,
      page: 2,
      totalPages: 11,
    });
  });

  it('should return 0 totalPages when total is 0', () => {
    const result = createPaginationMeta(0, 1, 10);

    expect(result).toEqual({
      total: 0,
      page: 1,
      totalPages: 0,
    });
  });
});
