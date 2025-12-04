import { render, screen, fireEvent } from '@testing-library/react';
import SortingFields from '@/components/SearchItems/Fields/SortingFields';
import '@testing-library/jest-dom';

// ==================================
// MOCK useFormikContext
// ==================================
jest.mock('formik', () => ({
  useFormikContext: jest.fn(),
}));

const mockUseFormikContext = require('formik').useFormikContext as jest.Mock;

describe('SortingFields Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================================
  // RENDERS
  // ==================================
  test('renders both selects', () => {
    mockUseFormikContext.mockReturnValue({
      values: { orderBy: {} },
      setFieldValue: jest.fn(),
    });

    render(<SortingFields type="vacancies" />);

    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBe(2);
  });

  test('renders correct options for vacancies', () => {
    mockUseFormikContext.mockReturnValue({
      values: { orderBy: {} },
      setFieldValue: jest.fn(),
    });

    render(<SortingFields type="vacancies" />);

    expect(screen.getByText('Salary')).toBeInTheDocument();
    expect(screen.getByText('Created At')).toBeInTheDocument();
    expect(screen.queryByText('Updated At')).toBeNull();
  });

  test('renders correct options for jobSeekers', () => {
    mockUseFormikContext.mockReturnValue({
      values: { orderBy: {} },
      setFieldValue: jest.fn(),
    });

    render(<SortingFields type="jobSeekers" />);

    expect(screen.getByText('Updated At')).toBeInTheDocument();
    expect(screen.queryByText('Salary')).toBeNull();
  });

  // ==================================
  // LOGIC
  // ==================================
  test('changing field sets orderBy with default asc direction', () => {
    const setFieldValueMock = jest.fn();

    mockUseFormikContext.mockReturnValue({
      values: { orderBy: {} },
      setFieldValue: setFieldValueMock,
    });

    render(<SortingFields type="vacancies" />);

    const [fieldSelect] = screen.getAllByRole('combobox');

    fireEvent.change(fieldSelect, { target: { value: 'salaryMin' } });

    expect(setFieldValueMock).toHaveBeenCalledWith('orderBy', {
      salaryMin: 'asc',
    });
  });

  test('changing direction updates orderBy accordingly', () => {
    const setFieldValueMock = jest.fn();

    mockUseFormikContext.mockReturnValue({
      values: { orderBy: { salaryMin: 'asc' } },
      setFieldValue: setFieldValueMock,
    });

    render(<SortingFields type="vacancies" />);

    const [, directionSelect] = screen.getAllByRole('combobox');

    fireEvent.change(directionSelect, { target: { value: 'desc' } });

    expect(setFieldValueMock).toHaveBeenCalledWith('orderBy', {
      salaryMin: 'desc',
    });
  });

  test('direction select is disabled when no field chosen', () => {
    mockUseFormikContext.mockReturnValue({
      values: { orderBy: {} },
      setFieldValue: jest.fn(),
    });

    render(<SortingFields type="vacancies" />);

    const [, directionSelect] = screen.getAllByRole('combobox');

    expect(directionSelect).toBeDisabled();
  });

  test('selecting empty field resets sorting', () => {
    const setFieldValueMock = jest.fn();

    mockUseFormikContext.mockReturnValue({
      values: { orderBy: { salaryMin: 'asc' } },
      setFieldValue: setFieldValueMock,
    });

    render(<SortingFields type="vacancies" />);

    const [fieldSelect] = screen.getAllByRole('combobox');

    fireEvent.change(fieldSelect, { target: { value: '' } });

    expect(setFieldValueMock).toHaveBeenCalledWith('orderBy', {});
  });
});
