import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import RecruiterPersonalInfo from '@/components/RecruiterProfileItems/RecruiterPersonalInfo';

// ---------------------------
// Mock capitalize
// ---------------------------
jest.mock('@/utils/convertData', () => ({
  capitalize: (s: string) => s.charAt(0).toUpperCase() + s.slice(1),
}));

// ---------------------------
// Mock validation
// ---------------------------
jest.mock('@/utils/recruiterValidation', () => ({
  validateCreateRecruiterForm: jest.fn(() => {
    return {};
  }),
}));

// ---------------------------
// Mock API service
// ---------------------------
const updateMock = jest.fn();
jest.mock('@/services/recruiterProfileService', () => ({
  updateRecruiterProfile: (...args: any) => updateMock(...args),
}));

// ---------------------------
// react-query mocks
// ---------------------------
const invalidateMock = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useMutation: (opts: any) => ({
    mutate: (...args: any) =>
      opts
        .mutationFn(...args)
        .then(() => opts.onSuccess?.({}))
        .catch((e: any) => opts.onError?.(e)),
    isPending: false,
  }),
  useQueryClient: () => ({
    invalidateQueries: invalidateMock,
  }),
}));

describe('RecruiterPersonalInfo', () => {
  const mockData = {
    firstName: 'John',
    lastName: 'Doe',
    role: 'recruiter',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders static view initially', () => {
    render(<RecruiterPersonalInfo data={mockData} isEditable={true} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Role: Recruiter')).toBeInTheDocument();
  });

  test('shows edit button when isEditable=true', () => {
    render(<RecruiterPersonalInfo data={mockData} isEditable={true} />);

    const editBtn = screen.getByRole('button');
    expect(editBtn).toBeInTheDocument();
  });

  test('clicking edit button enables edit mode', () => {
    render(<RecruiterPersonalInfo data={mockData} isEditable={true} />);

    const editBtn = screen.getByRole('button');
    fireEvent.click(editBtn);

    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
  });

  test('clicking cancel returns to view mode', () => {
    render(<RecruiterPersonalInfo data={mockData} isEditable={true} />);

    fireEvent.click(screen.getByRole('button')); // enter edit mode

    const cancelBtn = screen.getAllByRole('button')[0]; // cross button
    fireEvent.click(cancelBtn);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('submit triggers updateRecruiterProfile', async () => {
    updateMock.mockResolvedValue({});

    const { container } = render(
      <RecruiterPersonalInfo data={mockData} isEditable={true} />
    );

    // enter edit mode
    fireEvent.click(screen.getByRole('button'));

    // submit button is the one with type="submit"
    const submitBtn = container.querySelector('button[type="submit"]')!;
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    expect(invalidateMock).toHaveBeenCalled();
  });

  test('shows server error on failed update', async () => {
    updateMock.mockRejectedValue(new Error('Server error'));

    const { container } = render(
      <RecruiterPersonalInfo data={mockData} isEditable={true} />
    );

    // enter edit mode
    fireEvent.click(screen.getByRole('button'));

    // submit
    const submitBtn = container.querySelector('button[type="submit"]')!;
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });
});
