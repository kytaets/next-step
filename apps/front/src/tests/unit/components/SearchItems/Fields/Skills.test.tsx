import { render, screen, fireEvent } from '@testing-library/react';
import SkillsInput from '@/components/SearchItems/Fields/Skills';
import '@testing-library/jest-dom';

jest.mock('formik', () => ({
  useFormikContext: jest.fn(),
  FieldArray: ({ name, children }: any) => {
    const remove = jest.fn();
    const push = jest.fn();

    return <div data-testid="field-array">{children({ remove, push })}</div>;
  },
}));

const mockUseFormikContext = require('formik').useFormikContext as jest.Mock;

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

const mockUseQuery = require('@tanstack/react-query').useQuery as jest.Mock;

jest.mock('@/components/HoveredItem/HoveredItem', () => ({
  __esModule: true,
  default: ({ children }: any) => <span>{children}</span>,
}));

jest.mock('@/components/RequestErrors/RequestErrors', () => ({
  __esModule: true,
  default: ({ error }: any) => <div data-testid="request-error">{error}</div>,
}));

describe('SkillsInput Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockValues = {
    requiredSkillIds: [{ skill: { id: 1, name: 'React' } }],
    skillIds: [{ skill: { id: 2, name: 'Node' } }],
    newSkill: '',
  };

  test('renders label "Skills"', () => {
    mockUseFormikContext.mockReturnValue({
      values: mockValues,
      handleChange: jest.fn(),
      setFieldValue: jest.fn(),
    });

    mockUseQuery.mockReturnValue({ data: [], error: null });

    render(<SkillsInput type="vacancies" />);
    expect(screen.getByText('Skills')).toBeInTheDocument();
  });

  test('uses requiredSkillIds for vacancies', () => {
    mockUseFormikContext.mockReturnValue({
      values: mockValues,
      handleChange: jest.fn(),
      setFieldValue: jest.fn(),
    });

    mockUseQuery.mockReturnValue({ data: [], error: null });

    render(<SkillsInput type="vacancies" />);

    expect(screen.getByText('React')).toBeInTheDocument();
  });

  test('uses skillIds for jobSeekers', () => {
    mockUseFormikContext.mockReturnValue({
      values: mockValues,
      handleChange: jest.fn(),
      setFieldValue: jest.fn(),
    });

    mockUseQuery.mockReturnValue({ data: [], error: null });

    render(<SkillsInput type="jobSeekers" />);

    expect(screen.getByText('Node')).toBeInTheDocument();
  });

  test('remove() is called when trash button is clicked', () => {
    const removeMock = jest.fn();
    const pushMock = jest.fn();

    require('formik').FieldArray = ({ children }: any) => (
      <>{children({ remove: removeMock, push: pushMock })}</>
    );

    mockUseFormikContext.mockReturnValue({
      values: {
        requiredSkillIds: [{ skill: { id: 1, name: 'React' } }],
        newSkill: '',
      },
      handleChange: jest.fn(),
      setFieldValue: jest.fn(),
    });

    mockUseQuery.mockReturnValue({ data: [], error: null });

    const { container } = render(<SkillsInput type="vacancies" />);

    const btn = container.querySelector('.del-skill-btn');
    expect(btn).not.toBeNull();

    fireEvent.click(btn!);

    expect(removeMock).toHaveBeenCalled();
  });

  test('clicking autocomplete item triggers push()', () => {
    const pushMock = jest.fn();

    require('formik').FieldArray = ({ children }: any) =>
      children({ push: pushMock, remove: jest.fn() });

    mockUseFormikContext.mockReturnValue({
      values: {
        requiredSkillIds: [],
        skillIds: [],
        newSkill: 're',
      },
      handleChange: jest.fn(),
      setFieldValue: jest.fn(),
    });

    mockUseQuery.mockReturnValue({
      data: [{ id: 1, name: 'React' }],
      error: null,
    });

    render(<SkillsInput type="vacancies" />);

    const option = screen.getByText('React');
    fireEvent.click(option);

    expect(pushMock).toHaveBeenCalledWith({
      skill: { id: 1, name: 'React' },
    });
  });

  test('displays fetch error when useQuery returns error', () => {
    mockUseFormikContext.mockReturnValue({
      values: { ...mockValues, newSkill: 're' },
      handleChange: jest.fn(),
      setFieldValue: jest.fn(),
    });

    mockUseQuery.mockReturnValue({
      data: [],
      error: { message: 'Failed to load' },
    });

    render(<SkillsInput type="vacancies" />);

    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });
});
