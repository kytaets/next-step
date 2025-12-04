import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ApplyFormModal from '@/components/ApplicationItems/ApplyFormModal';

// mock CSS
jest.mock('@/components/CompanyProfileItems/CompanyProfile.module.css', () => ({
  'invitation-modal': 'invitation-modal',
  'invitation-form': 'invitation-form',
  'invitation-form-container': 'invitation-form-container',
  'form-input': 'form-input',
  'form-details': 'form-details',
  'validation-error': 'validation-error',
  'info-form-btn-container': 'info-form-btn-container',
  'info-form-btn': 'info-form-btn',
}));

// mock HoveredItem
jest.mock('@/components/HoveredItem/HoveredItem', () => {
  return function MockHoveredItem({ children }) {
    return <div data-testid="hovered-item">{children}</div>;
  };
});

// mock MessageBox
jest.mock('@/components/MessageBox/MessageBox', () => {
  return function MockMessageBox({ children, type }) {
    return <div data-testid={`msg-${type}`}>{children}</div>;
  };
});

// mock sendApplication
const mockSendApplication = jest.fn();

jest.mock('@/services/application', () => ({
  sendApplication: (...args) => mockSendApplication(...args),
}));

// mock useMutation
jest.mock('@tanstack/react-query', () => ({
  useMutation: ({ mutationFn, onSuccess, onError }) => ({
    mutate: (data) => {
      try {
        mutationFn(data);
        onSuccess();
      } catch (e) {
        onError(e);
      }
    },
    isError: false,
    isSuccess: false,
    isPending: false,
  }),
}));

describe('ApplyFormModal', () => {
  beforeEach(() => {
    mockSendApplication.mockReset();
  });

  test('renders form elements', () => {
    render(<ApplyFormModal vacancyId="123" />);

    // унікальний heading
    expect(
      screen.getByRole('heading', { name: /send invitation/i })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/write a few words/i)
    ).toBeInTheDocument();
  });

  test('submits form with correct data', async () => {
    render(<ApplyFormModal vacancyId="123" />);

    fireEvent.change(screen.getByPlaceholderText(/write a few words/i), {
      target: { value: '  Hello world  ' },
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(mockSendApplication).toHaveBeenCalledTimes(1));

    expect(mockSendApplication).toHaveBeenCalledWith({
      coverLetter: 'Hello world',
      vacancyId: '123',
    });
  });

  test('passes null if empty coverLetter', async () => {
    render(<ApplyFormModal vacancyId="555" />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(mockSendApplication).toHaveBeenCalledTimes(1));

    expect(mockSendApplication).toHaveBeenCalledWith({
      coverLetter: null,
      vacancyId: '555',
    });
  });
});
