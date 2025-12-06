import { render, screen, fireEvent } from '@testing-library/react';
import SkillsInput from '@/components/SearchItems/Fields/Skills';
import '@testing-library/jest-dom';

// ======================================================
// MOCK useFormikContext
// ======================================================
jest.mock('formik', () => ({
  useFormikContext: jest.fn(),
  FieldArray: ({ name, children }: any) => {
    const remove = jest.fn();
    const push = jest.fn();

    return <div data-testid="field-array">{children({ remove, push })}</div>;
  },
}));

const mockUseFormikContext = require('formik').useFormikContext as jest.Mock;

// ======================================================
// MOCK useQuery (skills list)
// ======================================================
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

const mockUseQuery = require('@tanstack/react-query').useQuery as jest.Mock;

// ======================================================
// MOCK AnimatedIcon
// ======================================================
jest.mock('@/components/HoveredItem/HoveredItem', () => ({
  __esModule: true,
  default: ({ children }: any) => <span>{children}</span>,
}));

// ======================================================
// MOCK RequestErrors
// ======================================================
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

  // ======================================================
  // BASE RENDER
  // ======================================================
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

  // ======================================================
  // NAME FIELD LOGIC
  // ======================================================
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

    // from mockValues.skillIds
    expect(screen.getByText('Node')).toBeInTheDocument();
  });

  // ======================================================
  // REMOVE BUTTON
  // ======================================================
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

  // ======================================================
  // AUTOCOMPLETE LIST
  // ======================================================
  test('clicking autocomplete item triggers push()', () => {
    const pushMock = jest.fn();

    require('formik').FieldArray = ({ children }: any) =>
      children({ push: pushMock, remove: jest.fn() });

    mockUseFormikContext.mockReturnValue({
      values: {
        requiredSkillIds: [], // важливо: React не повинен бути тут!
        skillIds: [],
        newSkill: 're', // тригер показу автокомпліта
      },
      handleChange: jest.fn(),
      setFieldValue: jest.fn(),
    });

    mockUseQuery.mockReturnValue({
      data: [{ id: 1, name: 'React' }], // skillsList → містить "React"
      error: null,
    });

    render(<SkillsInput type="vacancies" />);

    const option = screen.getByText('React');
    fireEvent.click(option);

    expect(pushMock).toHaveBeenCalledWith({
      skill: { id: 1, name: 'React' },
    });
  });

  // ======================================================
  // ERROR FROM API
  // ======================================================
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
