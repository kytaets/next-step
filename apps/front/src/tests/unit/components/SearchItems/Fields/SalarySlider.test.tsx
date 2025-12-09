import { render, screen, fireEvent } from '@testing-library/react';
import SalarySlider from '@/components/SearchItems/Fields/SalarySlider';
import '@testing-library/jest-dom';

// ===========================================
// MOCK Formik Field
// ===========================================
jest.mock('formik', () => ({
  Field: ({ children, name }: any) => {
    const mockField = {
      name,
      value: 1000,
      onBlur: jest.fn(),
      onChange: jest.fn(),
    };

    const mockForm = {
      setFieldValue: jest.fn(),
    };

    return children({ field: mockField, form: mockForm });
  },
}));

describe('SalarySlider Component', () => {
  test('renders label', () => {
    render(<SalarySlider />);
    expect(screen.getByText('Minimal Salary')).toBeInTheDocument();
  });

  test('renders range input with correct attributes', () => {
    render(<SalarySlider />);

    const input = screen.getByRole('slider');

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'range');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '5000');
    expect(input).toHaveAttribute('step', '100');
  });

  test('displays current salary value with $', () => {
    render(<SalarySlider />);
    expect(screen.getByText('1000 $')).toBeInTheDocument();
  });

  test('onChange calls form.setFieldValue', () => {
    const setFieldValueMock = jest.fn();

    // override mock for this test
    jest
      .spyOn(require('formik'), 'Field')
      .mockImplementation(({ children, name }: any) => {
        const field = { name, value: 1000 };
        const form = { setFieldValue: setFieldValueMock };
        return children({ field, form });
      });

    render(<SalarySlider />);

    const input = screen.getByRole('slider');

    fireEvent.change(input, { target: { value: '2000' } });

    expect(setFieldValueMock).toHaveBeenCalledWith('salaryMin', 2000);
  });
});
