import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StatusUpdateForm from '@/components/ApplicationItems/StatusUpdateForm';
import { useMutation } from '@tanstack/react-query';

jest.mock('@tanstack/react-query');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockUpdate = jest.fn();

(useMutation as jest.Mock).mockReturnValue({
  mutate: mockUpdate,
  isPending: false,
  error: null,
});

describe('StatusUpdateForm', () => {
  test('renders correctly with initial status', () => {
    render(
      <StatusUpdateForm
        applicationId="123"
        currentStatus="SUBMITTED"
        onClose={() => {}}
      />
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByDisplayValue('SUBMITTED')).toBeInTheDocument();
  });

  test('form submit triggers update', async () => {
    render(
      <StatusUpdateForm
        applicationId="777"
        currentStatus="SUBMITTED"
        onClose={jest.fn()}
      />
    );

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'REJECTED' },
    });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'REJECTED' });
    });
  });
});
