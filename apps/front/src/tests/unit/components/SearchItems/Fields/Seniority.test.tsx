import { render, screen } from '@testing-library/react';
import SeniorityInput from '@/components/SearchItems/Fields/Seniority';
import '@testing-library/jest-dom';

jest.mock('@/lib/vacancy-data', () => ({
  seniorityOptions: ['junior', 'middle', 'senior'],
}));

jest.mock('@/utils/convertData', () => ({
  capitalize: (str: string) => str.toUpperCase(),
}));

jest.mock('formik', () => ({
  Field: ({ children, ...props }: any) => (
    <select data-testid="field" {...props}>
      {children}
    </select>
  ),
}));

describe('SeniorityInput Component', () => {
  test('renders label "Seniority"', () => {
    render(<SeniorityInput />);
    expect(screen.getByText('Seniority')).toBeInTheDocument();
  });

  test('renders Field as select with correct name', () => {
    render(<SeniorityInput />);
    const select = screen.getByTestId('field');

    expect(select).toBeInTheDocument();
    expect(select.tagName.toLowerCase()).toBe('select');
    expect(select).toHaveAttribute('name', 'seniorityLevel');
  });

  test('renders default option', () => {
    render(<SeniorityInput />);
    expect(
      screen.getByRole('option', { name: /select seniority/i })
    ).toBeInTheDocument();
  });

  test('renders all options from seniorityOptions with capitalization', () => {
    render(<SeniorityInput />);

    expect(screen.getByRole('option', { name: 'JUNIOR' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'MIDDLE' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'SENIOR' })).toBeInTheDocument();
  });
});
