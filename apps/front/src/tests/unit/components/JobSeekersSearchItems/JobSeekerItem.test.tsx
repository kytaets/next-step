import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import JobSeekerItem from '@/components/JobSeekersSearchItems/JobSeekerItem';

jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: any) => <div>{children}</div>,
  },
}));

jest.mock('@/utils/validation', () => ({
  validateImageUrl: jest.fn(),
}));

jest.mock('@/utils/convertData', () => ({
  isoToDate: jest.fn((date: string) => `converted-${date}`),
}));

import { validateImageUrl } from '@/utils/validation';

describe('JobSeekerItem', () => {
  const mockData = {
    id: '123',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-05-20',
    avatarUrl: 'http://image.com/logo.png',
    createdAt: '2024-01-01',
  };

  test('renders user name and formatted dates', async () => {
    (validateImageUrl as jest.Mock).mockResolvedValue(true);

    render(<JobSeekerItem data={mockData} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('converted-1990-05-20')).toBeInTheDocument();
    expect(
      screen.getByText('Joined: converted-2024-01-01')
    ).toBeInTheDocument();
  });

  test('renders fallback text when dateOfBirth is empty', async () => {
    const data = { ...mockData, dateOfBirth: '' };
    (validateImageUrl as jest.Mock).mockResolvedValue(true);

    render(<JobSeekerItem data={data} />);

    expect(screen.getByText('No birth date')).toBeInTheDocument();
  });

  test('sets correct company logo when image is valid', async () => {
    (validateImageUrl as jest.Mock).mockResolvedValue(true);

    render(<JobSeekerItem data={mockData} />);

    const img = await screen.findByAltText('company-logo');

    expect(img).toHaveAttribute('src', mockData.avatarUrl);
  });

  test('sets fallback logo when image is invalid', async () => {
    (validateImageUrl as jest.Mock).mockResolvedValue(false);

    render(<JobSeekerItem data={mockData} />);

    const img = await screen.findByAltText('company-logo');

    expect(img).toHaveAttribute('src', '/images/company-no-logo.png');
  });

  test('navigates to user profile', async () => {
    (validateImageUrl as jest.Mock).mockResolvedValue(true);

    render(<JobSeekerItem data={mockData} />);

    const link = screen.getByRole('link');

    expect(link).toHaveAttribute('href', '/profile/123');
  });

  test('updates image opacity after loading is complete', async () => {
    (validateImageUrl as jest.Mock).mockResolvedValue(true);

    render(<JobSeekerItem data={mockData} />);

    const img = screen.getByAltText('company-logo');

    expect(img).toHaveStyle({ opacity: 0 });

    await waitFor(() => {
      expect(img).toHaveStyle({ opacity: 1 });
    });
  });
});
