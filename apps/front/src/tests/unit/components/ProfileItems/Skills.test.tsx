import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Skills from '@/components/ProfileItems/Skills';

jest.mock('@/components/FormItems/SkillRow', () => ({
  __esModule: true,
  default: () => <div data-testid="skills-row">SkillsRow</div>,
}));

jest.mock('@/components/RequestErrors/RequestErrors', () => ({
  __esModule: true,
  default: ({ error }: { error: string | null }) =>
    error ? <div>{error}</div> : null,
}));

const mockInvalidate = jest.fn();
const mockCreateSkill = jest.fn();
const mockUpdateSkills = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  __esModule: true,

  useQuery: jest.fn().mockReturnValue({
    data: [],
    error: null,
    isLoading: false,
  }),

  useMutation: jest.fn((config) => {
    return {
      mutate: (payload) => {
        mockUpdateSkills(payload);

        const result = { status: 'success' };
        config?.onSuccess?.(result);

        return result;
      },

      mutateAsync: async (value) => {
        mockCreateSkill(value);

        const result = {
          status: 'success',
          data: { id: 99 },
        };

        await config?.onSuccess?.(result);
        return result;
      },

      isPending: false,
    };
  }),

  useQueryClient: () => ({
    invalidateQueries: mockInvalidate,
  }),
}));

const initialSkills = [
  { skill: { id: 1, name: 'React' } },
  { skill: { id: 2, name: 'Node' } },
];

describe('Skills Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('opens edit mode', () => {
    render(<Skills isEditable={true} skills={initialSkills} />);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByTestId('skills-row')).toBeInTheDocument();
  });

  test('submits updated skills', async () => {
    render(<Skills isEditable={true} skills={initialSkills} />);

    fireEvent.click(screen.getByRole('button'));

    const submitBtn = document.querySelector('.skills-check-btn')!;
    fireEvent.click(submitBtn);

    await waitFor(() =>
      expect(mockUpdateSkills).toHaveBeenCalledWith({
        skillIds: [1, 2],
      })
    );

    expect(mockInvalidate).toHaveBeenCalled();
  });

  test('shows request error', async () => {
    const rq = require('@tanstack/react-query');

    rq.useMutation.mockImplementation((config) => {
      return {
        mutate: jest.fn(),

        mutateAsync: async () => {
          const result = { status: 'error', error: 'Failed to create skill' };
          await config?.onSuccess?.(result);
          return result;
        },

        isPending: false,
      };
    });

    render(<Skills isEditable={true} skills={initialSkills} />);

    fireEvent.click(screen.getByRole('button'));

    const submitBtn = document.querySelector('.skills-check-btn')!;
    fireEvent.click(submitBtn);

    await waitFor(() =>
      expect(screen.getByText(/Failed to create skill/i)).toBeInTheDocument()
    );
  });
});
