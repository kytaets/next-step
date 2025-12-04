import { render, screen } from '@testing-library/react';
import LabeledField from '@/components/ProfileItems/LabeledField';
import { useField } from 'formik';

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useField: jest.fn(),
  Field: (props: any) => <input data-testid="field" {...props} />,
}));

describe('LabeledField component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders label and input field', () => {
    (useField as jest.Mock).mockReturnValue([
      { name: 'email', value: '', onChange: jest.fn(), onBlur: jest.fn() },
      { touched: false, error: '' },
    ]);

    render(<LabeledField name="email" label="Email Address" />);

    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByTestId('field')).toBeInTheDocument();
    expect(screen.getByTestId('field').getAttribute('name')).toBe('email');
  });

  test('uses custom type when provided', () => {
    (useField as jest.Mock).mockReturnValue([
      { name: 'password', value: '', onChange: jest.fn(), onBlur: jest.fn() },
      { touched: false, error: '' },
    ]);

    render(<LabeledField name="password" label="Password" type="password" />);

    expect(screen.getByTestId('field').getAttribute('type')).toBe('password');
  });

  test('does NOT show error when not touched', () => {
    (useField as jest.Mock).mockReturnValue([
      { name: 'email', value: '', onChange: jest.fn(), onBlur: jest.fn() },
      { touched: false, error: 'Required' },
    ]);

    render(<LabeledField name="email" label="Email" />);

    expect(screen.queryByText('Required')).not.toBeInTheDocument();
  });

  test('shows error when touched AND error exists', () => {
    (useField as jest.Mock).mockReturnValue([
      { name: 'email', value: '', onChange: jest.fn(), onBlur: jest.fn() },
      { touched: true, error: 'Invalid email' },
    ]);

    render(<LabeledField name="email" label="Email" />);

    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });
});
