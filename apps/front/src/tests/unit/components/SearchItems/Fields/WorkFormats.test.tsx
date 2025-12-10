import { render, screen } from '@testing-library/react';
import WorkFormatsInput from '@/components/SearchItems/Fields/WorkFormats';
import '@testing-library/jest-dom';

jest.mock('@/lib/vacancy-data', () => ({
  workFormatOptions: ['remote', 'office', 'hybrid'],
}));

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

jest.mock('formik', () => ({
  Field: ({ component: Component, ...props }: any) => (
    <Component data-testid="field" {...props} />
  ),
  ErrorMessage: ({ name }: any) => (
    <div data-testid="error-msg">Error for {name}</div>
  ),
}));

describe('WorkFormatsInput Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders label', () => {
    render(<WorkFormatsInput />);
    expect(screen.getByText('Work Format')).toBeInTheDocument();
  });

  test('renders MultiSelect through Field', () => {
    render(<WorkFormatsInput />);
    expect(screen.getByTestId('multiselect')).toBeInTheDocument();
  });

  test('passes correct options to MultiSelect', () => {
    render(<WorkFormatsInput />);
    expect(screen.getByTestId('options').textContent).toBe(
      'remote,office,hybrid'
    );
  });

  test('passes correct placeholder to MultiSelect', () => {
    render(<WorkFormatsInput />);
    expect(screen.getByTestId('placeholder').textContent).toBe('Select format');
  });

  test('renders ErrorMessage for workFormat', () => {
    render(<WorkFormatsInput />);
    expect(screen.getByTestId('error-msg')).toHaveTextContent('workFormat');
  });
});
