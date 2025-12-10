import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactsModal from '@/components/ProfileItems/ContactsModal';
import { useModalStore } from '@/store/modalSlice';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserContacts } from '@/services/jobseekerService';
import {
  removeEmpty,
  replaceNulls,
  validateContacts,
} from '@/utils/profileValidation';

jest.mock('@/store/modalSlice', () => ({
  useModalStore: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('framer-motion', () => ({
  __esModule: true,
  motion: {
    div: ({ children }: any) => <div>{children}</div>,
  },
}));

jest.mock('@/components/HoveredItem/HoveredItem', () => ({
  __esModule: true,
  default: ({ children }: any) => <span>{children}</span>,
}));

jest.mock('@/components/ProfileItems/LabeledField', () => ({
  __esModule: true,
  default: ({ label, name }: any) => (
    <input placeholder={label} name={name} data-testid={name} />
  ),
}));

jest.mock('@/components/RequestErrors/RequestErrors', () => ({
  __esModule: true,
  default: ({ error }: any) => <div data-testid="request-error">{error}</div>,
}));

jest.mock('@/services/jobseekerService', () => ({
  updateUserContacts: jest.fn(),
}));

jest.mock('@/utils/profileValidation', () => ({
  removeEmpty: jest.fn((v) => v),
  replaceNulls: jest.fn((v) => v),
  validateContacts: jest.fn(() => ({})),
}));

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('ContactsModal', () => {
  const closeModalMock = jest.fn();
  const invalidateMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useModalStore as jest.Mock).mockReturnValue(closeModalMock);

    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: invalidateMock,
    });

    (useMutation as jest.Mock).mockImplementation(
      ({ mutationFn, onSuccess }) => ({
        mutate: async (values: any) => {
          const result = await mutationFn(values);
          onSuccess(result);
        },
        isPending: false,
        isError: false,
      })
    );

    (updateUserContacts as jest.Mock).mockResolvedValue({
      status: 'success',
    });
  });

  const mockData = {
    githubUrl: 'git',
    linkedinUrl: 'ln',
    telegramUrl: 'tg',
    publicEmail: 'me@mail.com',
    phoneNumber: '123',
  };

  test('renders all form fields', () => {
    render(<ContactsModal data={mockData} />);

    expect(screen.getByPlaceholderText('Github URL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('LinkedIn URL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Telegram URL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Public Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Phone Number')).toBeInTheDocument();
  });

  test('submits cleaned values and closes modal on success', async () => {
    (removeEmpty as jest.Mock).mockReturnValue(mockData);

    render(<ContactsModal data={mockData} />);

    fireEvent.click(screen.getByText('Save changes'));

    await waitFor(() => {
      expect(updateUserContacts).toHaveBeenCalledWith(mockData);
      expect(invalidateMock).toHaveBeenCalledWith({ queryKey: ['profile'] });
      expect(closeModalMock).toHaveBeenCalled();
    });
  });

  test('shows server error when mutation returns status=error', async () => {
    (updateUserContacts as jest.Mock).mockResolvedValueOnce({
      status: 'error',
      error: 'Server failed',
    });

    render(<ContactsModal data={mockData} />);

    fireEvent.click(screen.getByText('Save changes'));

    expect(await screen.findByTestId('request-error')).toHaveTextContent(
      'Server failed'
    );
  });

  test('Go Back button closes modal', () => {
    render(<ContactsModal data={mockData} />);

    fireEvent.click(screen.getByText('Go Back'));

    expect(closeModalMock).toHaveBeenCalled();
  });

  test('Save button is disabled when mutation is pending', () => {
    (useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
    });

    render(<ContactsModal data={mockData} />);

    const btn = screen.getByRole('button', { name: /Save changes/i });
    expect(btn).toBeDisabled();
  });
});
