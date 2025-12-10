import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import VacancyApplicationItem from '@/components/ApplicationItems/VacancyApplicationItem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/utils/convertData', () => ({
  isoToDate: () => 'Converted Date',
}));

jest.mock('@/utils/validation', () => ({
  validateImageUrl: jest.fn((url) => {
    if (!url) return Promise.resolve(false);
    return Promise.resolve(true);
  }),
}));

jest.mock('next/navigation', () => ({
  useParams: () => ({
    vacancyApplicationSlug: 'vac123',
  }),
}));

jest.mock('@/services/jobseekerService', () => ({
  getProfileById: jest.fn(() =>
    Promise.resolve({
      firstName: 'John',
      lastName: 'Doe',
      avatarUrl: '/avatar-test.png',
    })
  ),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: any) => <div data-testid="motion-div">{children}</div>,
  },
}));

jest.mock('next/link', () => {
  return ({ href, children }: any) => <a href={href}>{children}</a>;
});

const renderWithQuery = (ui: React.ReactNode) => {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
};

describe('VacancyApplicationItem', () => {
  const mockData = {
    id: 'app777',
    createdAt: '2023-10-10',
    status: 'Pending',
    jobSeeker: {
      id: 'js123',
    },
  } as any;

  test('renders name + status', async () => {
    renderWithQuery(<VacancyApplicationItem data={mockData} />);

    await waitFor(() =>
      expect(screen.getByText('John Doe - Pending')).toBeInTheDocument()
    );
  });

  test('renders formatted date', async () => {
    renderWithQuery(<VacancyApplicationItem data={mockData} />);
    expect(
      await screen.findByText('Applied: Converted Date')
    ).toBeInTheDocument();
  });

  test('renders validated avatar', async () => {
    renderWithQuery(<VacancyApplicationItem data={mockData} />);

    const img = await screen.findByAltText('no-avatar');

    await waitFor(() => {
      expect(img.getAttribute('src')).toBe('/avatar-test.png');
    });
  });

  test('links to correct URL', async () => {
    renderWithQuery(<VacancyApplicationItem data={mockData} />);

    const link = await screen.findByRole('link');

    expect(link).toHaveAttribute(
      'href',
      '/my-profile/recruiter/company/applications/vac123/app777'
    );
  });
});
