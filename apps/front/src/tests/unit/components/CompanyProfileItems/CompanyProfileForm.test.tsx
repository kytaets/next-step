import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CompanyProfileForm from '@/components/CompanyProfileItems/CompanyProfileForm';
import { useMutation } from '@tanstack/react-query';

jest.mock('@/components/ProfileItems/Profile.module.css', () => ({
  'profile-form': 'profile-form',
  'form-input': 'form-input',
  'error-container': 'error-container',
  link: 'link',
  'profile-form-btn': 'profile-form-btn',
}));

jest.mock('@/components/HoveredItem/HoveredItem', () => (props: any) => (
  <span data-testid="hovered">{props.children}</span>
));

jest.mock('@/components/MessageBox/MessageBox', () => (props: any) => (
  <div data-testid="message-box">{props.children}</div>
));

const mockCloseModal = jest.fn();
jest.mock('@/store/modalSlice', () => ({
  useModalStore: (selector: any) =>
    selector({
      closeModal: mockCloseModal,
    }),
}));

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

jest.mock('js-cookie', () => ({
  set: jest.fn(),
}));

jest.mock('@/utils/companyProfileValidation', () => ({
  validateCompanyInfoData: jest.fn(() => ({})),
  removeEmpty: jest.fn((values) => values),
}));

jest.mock('@/services/companyProfileService', () => ({
  createCompanyProfile: jest.fn(),
}));

const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>;

describe('CompanyProfileForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('submits cleaned values to mutation', async () => {
    const mutate = jest.fn();
    mockUseMutation.mockReturnValue({ mutate, isPending: false } as any);

    render(<CompanyProfileForm />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Cool Company'), {
        target: { value: ' My Company ' },
      });
      fireEvent.change(
        screen.getByPlaceholderText('https://cool-company.url'),
        {
          target: { value: ' https://example.com ' },
        }
      );
      fireEvent.submit(screen.getByText('Create Profile').closest('form')!);
    });

    expect(mutate).toHaveBeenCalledWith({
      id: '',
      name: ' My Company ',
      url: ' https://example.com ',
    });
  });

  test('shows validation errors', async () => {
    const mutate = jest.fn();
    mockUseMutation.mockReturnValue({ mutate, isPending: false } as any);

    const validateMock = require('@/utils/companyProfileValidation')
      .validateCompanyInfoData as jest.Mock;
    validateMock.mockReturnValueOnce({ name: 'Name is required' });

    render(<CompanyProfileForm />);

    await act(async () => {
      fireEvent.submit(screen.getByText('Create Profile').closest('form')!);
    });

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  test('disables submit button while pending', () => {
    const mutate = jest.fn();
    mockUseMutation.mockReturnValue({ mutate, isPending: true } as any);

    render(<CompanyProfileForm />);

    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Creating.../i })).toBeDisabled();
  });
});
