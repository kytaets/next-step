import { render, screen } from '@testing-library/react';
import EmploymentTypesInput from '@/components/SearchItems/Fields/EmploymentTypes';
import '@testing-library/jest-dom';

// ===============================
// MOCK vacancy-data
// ===============================
jest.mock('@/lib/vacancy-data', () => ({
  employmentTypeOptions: ['full-time', 'part-time', 'contract'],
}));

// ===============================
// MOCK MultiSelect
// ===============================
jest.mock('@/components/MultiSelect/MultiSelect', () => ({
  __esModule: true,
  default: ({ options, placeholder }: any) => (
    <div data-testid="multiselect">
      MultiSelect
      <div data-testid="options">{options.join(',')}</div>
      <div data-testid="placeholder">{placeholder}</div>
    </div>
  ),
}));

// ===============================
// MOCK Formik Field + ErrorMessage
// ===============================
jest.mock('formik', () => ({
  Field: ({ component: Component, ...props }: any) => (
    <Component data-testid="field" {...props} />
  ),
  ErrorMessage: ({ name }: any) => (
    <div data-testid="error">Error for {name}</div>
  ),
}));

describe('EmploymentTypesInput', () => {
  test('renders label', () => {
    render(<EmploymentTypesInput />);
    expect(screen.getByText('Employment Type')).toBeInTheDocument();
  });

  test('renders MultiSelect through Formik Field', () => {
    render(<EmploymentTypesInput />);

    // Field rendered MultiSelect
    expect(screen.getByTestId('multiselect')).toBeInTheDocument();
  });

  test('passes options into MultiSelect', () => {
    render(<EmploymentTypesInput />);

    const options = screen.getByTestId('options');
    expect(options.textContent).toBe('full-time,part-time,contract');
  });

  test('passes placeholder into MultiSelect', () => {
    render(<EmploymentTypesInput />);

    const placeholder = screen.getByTestId('placeholder');
    expect(placeholder.textContent).toBe('Select employment');
  });

  test('renders ErrorMessage for workFormat', () => {
    render(<EmploymentTypesInput />);
    expect(screen.getByTestId('error')).toHaveTextContent('workFormat');
  });
});
