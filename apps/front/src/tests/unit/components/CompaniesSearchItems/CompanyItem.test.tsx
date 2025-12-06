import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CompanyItem from '@/components/CompaniesSearchItems/CompanyItem';

// Моки CSS
jest.mock('../VacanciesItems/VacanciesItems.module.css', () => ({
  'vacancy-item-container': 'vacancy-item-container',
  'vacancy-item': 'vacancy-item',
  'short-info': 'short-info',
}));

// Мок next/link
jest.mock('next/link', () => {
  return function LinkMock({ href, children }) {
    return <a href={href}>{children}</a>;
  };
});

// Моки утиліт
jest.mock('@/utils/validation', () => ({
  validateImageUrl: jest.fn(),
}));

jest.mock('@/utils/convertData', () => ({
  isoToDate: () => 'Converted Date',
}));

// Мок motion.div
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children }) => <div>{children}</div>,
  },
}));

import { validateImageUrl } from '@/utils/validation';

const mockCompany = {
  id: 'c123',
  name: 'Test Company',
  url: 'https://company.com',
  logoUrl: '/logo.png',
  createdAt: '2023-01-01',
};

describe('CompanyItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders company name and url', async () => {
    (validateImageUrl as jest.Mock).mockResolvedValue(true);

    render(<CompanyItem data={mockCompany} />);

    expect(await screen.findByText('Test Company')).toBeInTheDocument();
    expect(screen.getByText('https://company.com')).toBeInTheDocument();
  });

  test('renders formatted createdAt date', async () => {
    (validateImageUrl as jest.Mock).mockResolvedValue(true);

    render(<CompanyItem data={mockCompany} />);

    expect(
      await screen.findByText('Joined: Converted Date')
    ).toBeInTheDocument();
  });

  test('uses validated company logo', async () => {
    (validateImageUrl as jest.Mock).mockResolvedValue(true);

    render(<CompanyItem data={mockCompany} />);

    const img = await screen.findByAltText('company-logo');
    await waitFor(() => {
      expect(img.getAttribute('src')).toBe('/logo.png');
    });
  });

  test('falls back to /images/company-no-logo.png when logo invalid', async () => {
    (validateImageUrl as jest.Mock).mockResolvedValue(false);

    render(<CompanyItem data={mockCompany} />);

    const img = await screen.findByAltText('company-logo');
    await waitFor(() => {
      expect(img.getAttribute('src')).toBe('/images/company-no-logo.png');
    });
  });

  test('links to correct company page', async () => {
    (validateImageUrl as jest.Mock).mockResolvedValue(true);

    render(<CompanyItem data={mockCompany} />);

    const link = await screen.findByRole('link');
    expect(link).toHaveAttribute('href', '/company/c123');
  });

  test('shows "No url" when url is empty', async () => {
    (validateImageUrl as jest.Mock).mockResolvedValue(true);

    const mockData = { ...mockCompany, url: '' };

    render(<CompanyItem data={mockData} />);

    expect(await screen.findByText('No url')).toBeInTheDocument();
  });
});
