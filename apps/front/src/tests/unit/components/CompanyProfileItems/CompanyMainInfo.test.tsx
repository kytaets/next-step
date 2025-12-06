import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CompanyMainInfo from '@/components/CompanyProfileItems/CompanyMainInfo';
import { useMutation } from '@tanstack/react-query';

jest.mock('@/components/CompanyProfileItems/CompanyProfile.module.css', () => ({
  'main-info-data': 'main-info-data',
  'my-vacancies-btn': 'my-vacancies-btn',
  'edit-main-info-btn': 'edit-main-info-btn',
  'name-input': 'name-input',
  'url-input': 'url-input',
}));

jest.mock('@/components/ProfileItems/Profile.module.css', () => ({
  'info-form': 'info-form',
  'personal-info': 'personal-info',
  'personal-info-btn': 'personal-info-btn',
  'personal-info-btn-cross': 'personal-info-btn-cross',
  'personal-info-btn-container': 'personal-info-btn-container',
  'personal-info-error-container': 'personal-info-error-container',
}));

jest.mock('@/components/HoveredItem/HoveredItem', () => (props: any) => (
  <span data-testid="hovered-item">{props.children}</span>
));

jest.mock('@/components/MessageBox/MessageBox', () => (props: any) => (
  <div data-testid="message-box">{props.children}</div>
));

jest.mock('@/utils/companyProfileValidation', () => ({
  validateCompanyInfoData: jest.fn(() => ({})),
}));

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
}));

jest.mock('next/link', () => (props: any) => (
  <a href={props.href}>{props.children}</a>
));

const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>;

const baseProps = {
  isEditable: true,
  data: {
    id: 'company-1',
    name: 'Test Company',
    url: 'https://example.com',
  },
};

describe('CompanyMainInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders view mode when not editable', () => {
    mockUseMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as any);

    render(<CompanyMainInfo {...baseProps} isEditable={false} />);

    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Company Vacancies/i })
    ).toHaveAttribute('href', 'company-1/vacancies');
  });

  test('switches to edit mode and submits updated values', async () => {
    const mutate = jest.fn();
    mockUseMutation.mockReturnValue({ mutate, isPending: false } as any);

    const { container } = render(<CompanyMainInfo {...baseProps} />);

    fireEvent.click(screen.getByRole('button'));

    fireEvent.change(screen.getByPlaceholderText('Company Name'), {
      target: { value: '  New Name  ' },
    });

    fireEvent.change(screen.getByPlaceholderText('Website url'), {
      target: { value: '  https://new.example.com  ' },
    });

    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({
        name: 'New Name',
        url: 'https://new.example.com',
      });
    });
  });

  test('shows validation errors when provided', async () => {
    const mutate = jest.fn();
    mockUseMutation.mockReturnValue({ mutate, isPending: false } as any);

    // 😈 ВАЖЛИВО: завжди повертати помилку, а не один раз
    const validateMock = require('@/utils/companyProfileValidation')
      .validateCompanyInfoData as jest.Mock;
    validateMock.mockReturnValue({ name: 'Name required' });

    const { container } = render(<CompanyMainInfo {...baseProps} />);

    // відкриваємо режим редагування
    fireEvent.click(screen.getByRole('button'));

    const nameInput = screen.getByPlaceholderText('Company Name');

    // робимо поле пустим
    fireEvent.change(nameInput, { target: { value: '' } });
    // необовʼязково, але додатково позначає поле як "touched"
    fireEvent.blur(nameInput);

    // сабмітимо форму
    fireEvent.submit(container.querySelector('form')!);

    // ЧЕКАЄМО, поки Formik оновить DOM і зʼявиться помилка
    const msg = await screen.findByText('Name required');

    expect(msg).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });
});
