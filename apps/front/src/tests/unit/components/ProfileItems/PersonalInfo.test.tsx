import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PersonalInfo from '@/components/ProfileItems/PersonalInfo';
import { useMutation, useQueryClient } from '@tanstack/react-query';

jest.mock('@tanstack/react-query');

const mockMutate = jest.fn();
const invalidateMock = jest.fn();

(useQueryClient as jest.Mock).mockReturnValue({
  invalidateQueries: invalidateMock,
});

(useMutation as jest.Mock).mockReturnValue({
  mutate: mockMutate,
  isPending: false,
});

const mockData = {
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-01',
  location: 'Berlin',
};

describe('PersonalInfo Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders personal info in view mode', () => {
    render(<PersonalInfo isEditable={true} data={mockData} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('01.01.1990')).toBeInTheDocument(); // fixed date format
    expect(screen.getByText('Berlin')).toBeInTheDocument();
  });

  test('switches to edit mode on Edit click', () => {
    render(<PersonalInfo isEditable={true} data={mockData} />);

    fireEvent.click(screen.getByRole('button')); // Edit

    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Address')).toBeInTheDocument();
  });

  test('shows validation errors', async () => {
    render(<PersonalInfo isEditable={true} data={mockData} />);

    fireEvent.click(screen.getByRole('button')); // Edit mode

    fireEvent.change(screen.getByPlaceholderText('First Name'), {
      target: { value: '' },
    });

    const submitBtn = screen.getAllByRole('button')[1]; // submit icon
    fireEvent.click(submitBtn);

    await waitFor(() =>
      expect(screen.getByText(/first name/i)).toBeInTheDocument()
    );
  });

  test('submits data successfully', async () => {
    mockMutate.mockImplementation((values) => {
      expect(values).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        location: 'Berlin',
      });
    });

    render(<PersonalInfo isEditable={true} data={mockData} />);

    fireEvent.click(screen.getByRole('button')); // Edit

    const submitBtn = screen.getAllByRole('button')[1]; // submit
    fireEvent.click(submitBtn);

    await waitFor(() => expect(mockMutate).toHaveBeenCalled());
  });

  test('shows server error', async () => {
    (useMutation as jest.Mock).mockReturnValue({
      mutate: () => {
        const cfg = (useMutation as jest.Mock).mock.calls[0][0];
        cfg.onSuccess({ status: 'error', error: 'Server crashed' });
      },
      isPending: false,
    });

    render(<PersonalInfo isEditable={true} data={mockData} />);

    fireEvent.click(screen.getByRole('button')); // Edit

    const submitBtn = screen.getAllByRole('button')[1];
    fireEvent.click(submitBtn);

    await waitFor(() =>
      expect(screen.getByText('Server crashed')).toBeInTheDocument()
    );
  });

  test('Cancel button exits edit mode', () => {
    render(<PersonalInfo isEditable={true} data={mockData} />);

    fireEvent.click(screen.getByRole('button')); // Edit mode

    const cancelBtn = screen.getAllByRole('button')[0]; // first button is cancel (X)
    fireEvent.click(cancelBtn);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('01.01.1990')).toBeInTheDocument();
  });

  test('submit button disabled when isPending=true', () => {
    (useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    });

    render(<PersonalInfo isEditable={true} data={mockData} />);

    fireEvent.click(screen.getByRole('button')); // Edit mode

    const submitBtn = screen.getAllByRole('button')[1];
    expect(submitBtn).toBeDisabled();
  });
});
