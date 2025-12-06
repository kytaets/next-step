jest.mock('@/lib/profile-data', () => ({
  __esModule: true,
  languageLevels: ['A1', 'A2', 'B1', 'B2', 'C1'],
  clientLanguageLevels: [
    'Beginner',
    'Elementary',
    'Intermediate',
    'Upper Intermediate',
    'Advanced',
  ],
}));

import {
  isoToDate,
  isoToSimpleDate,
  toClientLangLevel,
  capitalize,
  toKebabCase,
} from '@/utils/convertData'; // ← поправ шлях, якщо інший

describe('isoToDate', () => {
  it('formats ISO date to dd.mm.yyyy', () => {
    const result = isoToDate('2023-12-05T10:00:00.000Z');
    expect(result).toBe('05.12.2023');
  });
});

describe('isoToSimpleDate', () => {
  it('returns yyyy-mm-dd', () => {
    const result = isoToSimpleDate('2023-05-15T12:00:00.000Z');
    expect(result).toBe('2023-05-15');
  });
});

describe('toClientLangLevel', () => {
  it('maps profiles levels to client-friendly values', () => {
    expect(toClientLangLevel('B1')).toBe('Intermediate');
    expect(toClientLangLevel('C1')).toBe('Advanced');
  });

  it('returns undefined for unknown levels', () => {
    expect(toClientLangLevel('Z9')).toBeUndefined();
  });
});

describe('capitalize', () => {
  it('capitalizes first letter and lowercases the rest', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('hELLo')).toBe('Hello');
  });
});

describe('toKebabCase', () => {
  it('converts spaces to hyphens and trims input', () => {
    expect(toKebabCase('Hello World')).toBe('Hello-World');
  });

  it('handles multiple spaces', () => {
    expect(toKebabCase('  senior    frontend   developer ')).toBe(
      'senior-frontend-developer'
    );
  });
});
