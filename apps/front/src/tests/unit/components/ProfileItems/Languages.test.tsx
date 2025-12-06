/**
 * Languages.test.tsx — ПРАЦЮЮЧИЙ ТЕСТ БЕЗ ЗМІН У КОМПОНЕНТІ
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Languages from '@/components/ProfileItems/Languages';
import { useQuery, useMutation } from '@tanstack/react-query';

jest.mock('@tanstack/react-query');

// --------------------------------------------------
// MOCKS
// --------------------------------------------------

const mockUpdate = jest.fn();
const mockInvalidate = jest.fn();
const mockGetLanguages = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  (useQuery as jest.Mock).mockReturnValue({
    data: [
      { id: '1', name: 'English' },
      { id: '2', name: 'German' },
    ],
    error: null,
  });

  (useMutation as jest.Mock).mockReturnValue({
    mutate: mockUpdate,
    isPending: false,
    error: null,
  });
});

// --------------------------------------------------

const mockUserData = [
  { language: { id: '1', name: 'English' }, level: 'PRE_INTERMEDIATE' }, // B1
  { language: { id: '2', name: 'German' }, level: 'ELEMENTARY' }, // A2
];

// --------------------------------------------------
// TESTS
// --------------------------------------------------

describe('Languages Component', () => {
  test('renders list in view mode', () => {
    render(<Languages isEditable={true} data={mockUserData} />);

    expect(screen.getByText('Languages')).toBeInTheDocument();

    // Titles
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('German')).toBeInTheDocument();

    // Levels: component uses toClientLangLevel
    // PRE_INTERMEDIATE => "B1 (Pre-Intermediate)"
    // ELEMENTARY       => "A2 (Elementary)"
    expect(screen.getByText(/B1/i)).toBeInTheDocument();
    expect(screen.getByText(/A2/i)).toBeInTheDocument();
  });

  // --------------------------------------------------

  test('enters edit mode when clicking Edit', () => {
    render(<Languages isEditable={true} data={mockUserData} />);

    fireEvent.click(screen.getByRole('button')); // Edit button

    // Now selects should appear
    const selects = document.querySelectorAll('select');
    expect(selects.length).toBeGreaterThan(0);
  });

  // --------------------------------------------------

  test('adds a new language row', () => {
    render(<Languages isEditable={true} data={mockUserData} />);

    fireEvent.click(screen.getByRole('button')); // Edit

    // Count initial rows
    let rows = document.querySelectorAll('.language-row');
    expect(rows.length).toBe(2);

    // Click Add +
    fireEvent.click(screen.getByText(/Add \+/i));

    rows = document.querySelectorAll('.language-row');
    expect(rows.length).toBe(3);
  });

  // --------------------------------------------------

  test('removes a language row', () => {
    render(<Languages isEditable={true} data={mockUserData} />);

    fireEvent.click(screen.getByRole('button')); // Edit

    let rows = document.querySelectorAll('.language-row');
    expect(rows.length).toBe(2);

    // Remove first
    const removeBtns = document.querySelectorAll('.form-del-btn');
    fireEvent.click(removeBtns[0]);

    rows = document.querySelectorAll('.language-row');
    expect(rows.length).toBe(1);
  });

  // --------------------------------------------------

  test('submits correct payload', async () => {
    render(<Languages isEditable={true} data={mockUserData} />);

    fireEvent.click(screen.getByRole('button')); // Edit

    const selects = document.querySelectorAll('select');

    // Change level of first language
    fireEvent.change(selects[1], { target: { value: 'INTERMEDIATE' } }); // B2

    // Change second language level
    fireEvent.change(selects[3], { target: { value: 'ELEMENTARY' } }); // A2

    // Submit
    fireEvent.click(screen.getByText('Save changes'));

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith([
        { languageId: '1', level: 'INTERMEDIATE' },
        { languageId: '2', level: 'ELEMENTARY' },
      ])
    );
  });

  // --------------------------------------------------

  test('Go Back exits edit mode', () => {
    render(<Languages isEditable={true} data={mockUserData} />);

    fireEvent.click(screen.getByRole('button')); // Edit

    const selects = document.querySelectorAll('select');
    expect(selects.length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText(/Go Back/i));

    // Edit mode should close → no selects
    expect(document.querySelectorAll('select').length).toBe(0);
  });
});
