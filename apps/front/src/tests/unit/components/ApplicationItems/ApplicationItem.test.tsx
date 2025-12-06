import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ApplicationItem from '@/components/ApplicationItems/ApplicationItem';

jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

jest.mock('../VacanciesItems/VacanciesItems.module.css', () => ({
  'vacancy-item-container': 'vacancy-item-container',
  'vacancy-item': 'vacancy-item',
  'short-info': 'short-info',
}));

jest.mock('next/link', () => {
  return function LinkMock(props) {
    return <a href={props.href}>{props.children}</a>;
  };
});

jest.mock('@/utils/validation', () => ({
  validateImageUrl: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/utils/convertData', () => ({
  isoToDate: () => 'Converted Date',
}));

import { getVacancyById } from '@/services/vacanciesService';

jest.mock('@/services/vacanciesService', () => ({
  getVacancyById: jest.fn(),
}));

const vacancyResponse = {
  title: 'Test Vacancy',
  company: { logoUrl: '/company-logo.png' },
};

(getVacancyById as jest.Mock).mockResolvedValue(vacancyResponse);

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }) => <div {...rest}>{children}</div>,
  },
}));

function renderWithQuery(ui) {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

const mockApplication = {
  id: '321',
  vacancyId: '111',
  jobSeekerId: '999',
  createdAt: '2022-01-01',
  updatedAt: '2022-01-02',
  status: 'Pending',
  coverLetter: 'Test cover letter',
};

describe('ApplicationItem', () => {
  test('renders vacancy title and status', async () => {
    renderWithQuery(<ApplicationItem data={mockApplication} />);

    expect(
      await screen.findByText('Test Vacancy - Pending')
    ).toBeInTheDocument();
  });

  test('renders formatted date', async () => {
    renderWithQuery(<ApplicationItem data={mockApplication} />);

    expect(
      await screen.findByText('Applied: Converted Date')
    ).toBeInTheDocument();
  });

  test('renders company logo', async () => {
    renderWithQuery(<ApplicationItem data={mockApplication} />);

    const img = await screen.findByAltText('company-logo');

    await waitFor(() => {
      expect(img.getAttribute('src')).toBe('/company-logo.png');
    });
  });

  test('links to correct page', async () => {
    renderWithQuery(<ApplicationItem data={mockApplication} />);

    const link = await screen.findByRole('link');
    expect(link).toHaveAttribute('href', '/applications/321');
  });
});
