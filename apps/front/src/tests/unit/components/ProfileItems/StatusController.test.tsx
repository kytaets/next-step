import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OpenToWork from '@/components/ProfileItems/StatusController';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePersonalData } from '@/services/jobseekerService';

jest.mock('@tanstack/react-query');
jest.mock('@/services/jobseekerService');

describe('OpenToWork component', () => {
  const invalidateQueries = jest.fn();
  const mutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries,
    });

    (useMutation as jest.Mock).mockReturnValue({
      mutate,
      isPending: false,
    });
  });

  test('renders correct variant when isTrue = true', () => {
    render(<OpenToWork isEditable isTrue={true} />);

    expect(screen.getByText('Open to Work')).toBeInTheDocument();
  });

  test('renders correct variant when isTrue = false', () => {
    render(<OpenToWork isEditable isTrue={false} />);

    expect(screen.getByText('Do not disturb')).toBeInTheDocument();
  });

  test('calls update function when button is clicked and editable', async () => {
    const user = userEvent.setup();

    render(<OpenToWork isEditable isTrue={true} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mutate).toHaveBeenCalledWith({ isOpenToWork: false });
  });

  test('does NOT call update when not editable', async () => {
    const user = userEvent.setup();

    render(<OpenToWork isEditable={false} isTrue={true} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mutate).not.toHaveBeenCalled();
  });

  test('does NOT call update when type = isVerified', async () => {
    const user = userEvent.setup();

    render(<OpenToWork isEditable isTrue={true} type="isVerified" />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mutate).not.toHaveBeenCalled();
  });

  test('shows error message when request returns error', async () => {
    const user = userEvent.setup();

    (useMutation as jest.Mock).mockImplementation(({ onSuccess }) => ({
      mutate: () =>
        onSuccess({ status: 'error', error: 'Some error occurred' }),
      isPending: false,
    }));

    render(<OpenToWork isEditable isTrue={true} />);

    const button = screen.getByRole('button');

    // trigger mutate()
    await user.click(button);

    expect(await screen.findByText(/Some error occurred/i)).toBeInTheDocument();
  });
});
