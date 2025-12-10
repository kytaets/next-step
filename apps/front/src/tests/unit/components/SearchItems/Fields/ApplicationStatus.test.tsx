import { render, screen } from '@testing-library/react';
import ApplicationStatus from '@/components/SearchItems/Fields/ApplicationStatus';
import '@testing-library/jest-dom';

jest.mock('@/lib/application-data', () => ({
  statusOptions: ['pending', 'accepted', 'rejected'],
}));

jest.mock('@/utils/convertData', () => ({
  capitalize: (str: string) => str.toUpperCase(),
}));

jest.mock('formik', () => ({
  Field: ({ children, ...props }: any) => (
    <select data-testid="mock-field" {...props}>
      {children}
    </select>
  ),
}));

describe('ApplicationStatus Component', () => {
  test('renders label and select field', () => {
    render(<ApplicationStatus />);

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByTestId('mock-field')).toBeInTheDocument();
  });

  test('renders default option', () => {
    render(<ApplicationStatus />);

    expect(
      screen.getByRole('option', { name: /select status/i })
    ).toBeInTheDocument();
  });

  test('renders all statusOptions options', () => {
    render(<ApplicationStatus />);

    expect(screen.getByRole('option', { name: 'PENDING' })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'ACCEPTED' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'REJECTED' })
    ).toBeInTheDocument();
  });

  test('Field has correct name attribute', () => {
    render(<ApplicationStatus />);

    const field = screen.getByTestId('mock-field');
    expect(field).toHaveAttribute('name', 'status');
  });
});
