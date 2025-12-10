import { render, screen, fireEvent } from '@testing-library/react';
import LanguagesInput from '@/components/SearchItems/Fields/Languages';
import '@testing-library/jest-dom';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@/components/FormItems/LanguageRow', () => ({
  __esModule: true,
  default: ({ index }: any) => (
    <div data-testid={`language-row-${index}`}>LanguageRow {index}</div>
  ),
}));

jest.mock('@/components/HoveredItem/HoveredItem', () => ({
  __esModule: true,
  default: ({ children }: any) => <span>{children}</span>,
}));

jest.mock('formik', () => ({
  FieldArray: ({ name, children }: any) => {
    const mockForm = {
      values: {
        [name]: [{ language: { id: '1' }, level: 'A2' }],
      },
    };

    return children({
      push: jest.fn(),
      remove: jest.fn(),
      form: mockForm,
    });
  },
  ErrorMessage: ({ name }: any) => (
    <div data-testid="error-msg">ErrorMessage for {name}</div>
  ),
}));

const mockUseQuery = require('@tanstack/react-query').useQuery;

describe('LanguagesInput Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Languages label', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      error: null,
    });

    render(<LanguagesInput type="vacancies" />);

    expect(screen.getByText('Languages')).toBeInTheDocument();
  });

  test('uses correct name for FieldArray when type="vacancies"', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      error: null,
    });

    render(<LanguagesInput type="vacancies" />);

    expect(screen.getByTestId('error-msg')).toHaveTextContent(
      'requiredLanguages'
    );
  });

  test('uses correct name for FieldArray when type="jobSeekers"', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      error: null,
    });

    render(<LanguagesInput type="jobSeekers" />);

    expect(screen.getByTestId('error-msg')).toHaveTextContent('languages');
  });

  test('renders LanguageRow items from FieldArray', () => {
    mockUseQuery.mockReturnValue({
      data: [{ id: 1, name: 'English' }],
      error: null,
    });

    render(<LanguagesInput type="vacancies" />);

    expect(screen.getByTestId('language-row-0')).toBeInTheDocument();
  });

  test('Add + button triggers push function', () => {
    const pushMock = jest.fn();

    mockUseQuery.mockReturnValue({
      data: [],
      error: null,
    });

    jest
      .spyOn(require('formik'), 'FieldArray')
      .mockImplementation(({ name, children }: any) => {
        return children({
          push: pushMock,
          remove: jest.fn(),
          form: {
            values: { [name]: [] },
          },
        });
      });

    render(<LanguagesInput type="vacancies" />);

    fireEvent.click(screen.getByRole('button', { name: /add \+/i }));

    expect(pushMock).toHaveBeenCalledWith({
      language: { id: '' },
      level: '',
    });
  });

  test('renders fetch error when useQuery returns error', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      error: { message: 'Fetch failed' },
    });

    render(<LanguagesInput type="vacancies" />);

    expect(screen.getByText('Fetch failed')).toBeInTheDocument();
  });
});
