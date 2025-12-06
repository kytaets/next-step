import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import JobSeekerItem from '@/components/JobSeekersSearchItems/JobSeekerItem';

// ----------------------
// 🟦 MOCK next/link
// ----------------------
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// ----------------------
// 🟦 MOCK framer-motion
// Important: DO NOT spread props (to remove whileHover warnings)
// ----------------------
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: any) => <div>{children}</div>,
  },
}));

// ----------------------
// 🟦 MOCK validateImageUrl
// ----------------------
jest.mock('@/utils/validation', () => ({
  validateImageUrl: jest.fn(),
}));

// ----------------------
// 🟦 MOCK isoToDate
// ----------------------
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

  // --------------------------------------------
  // 🧪 Render & basic UI tests
  // --------------------------------------------

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

  // --------------------------------------------
  // 🧪 validateImageUrl behavior
  // --------------------------------------------

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

  // --------------------------------------------
  // 🧪 check link
  // --------------------------------------------

  test('navigates to user profile', async () => {
    (validateImageUrl as jest.Mock).mockResolvedValue(true);

    render(<JobSeekerItem data={mockData} />);

    const link = screen.getByRole('link');

    expect(link).toHaveAttribute('href', '/profile/123');
  });

  // --------------------------------------------
  // 🧪 image opacity transition
  // --------------------------------------------

  test('updates image opacity after loading is complete', async () => {
    (validateImageUrl as jest.Mock).mockResolvedValue(true);

    render(<JobSeekerItem data={mockData} />);

    const img = screen.getByAltText('company-logo');

    // initially not loaded
    expect(img).toHaveStyle({ opacity: 0 });

    // wait for effect to finish
    await waitFor(() => {
      expect(img).toHaveStyle({ opacity: 1 });
    });
  });
});
