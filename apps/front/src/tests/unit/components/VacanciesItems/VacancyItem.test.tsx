import { render, screen, waitFor } from '@testing-library/react';
import VacancyItem from '@/components/VacanciesItems/VacancyItem';

jest.mock('next/link', () => {
  return ({ href, children }: any) => <a href={href}>{children}</a>;
});

jest.mock('../VacanciesItems/VacanciesItems.module.css', () => ({
  'vacancy-item-container': 'vacancy-item-container',
  'vacancy-item': 'vacancy-item',
  'short-info': 'short-info',
}));

jest.mock('@/utils/validation', () => ({
  validateImageUrl: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/utils/convertData', () => ({
  isoToDate: jest.fn(() => 'Formatted Date'),
}));

const mockData = {
  id: '123',
  title: 'Frontend Dev',
  companyName: 'Tech Corp',
  companyLogo: '/logo.png',
  createdAt: '2023-10-10',
};

describe('VacancyItem', () => {
  test('renders title and company name', async () => {
    render(<VacancyItem data={mockData} />);

    expect(await screen.findByText('Frontend Dev')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
  });

  test('renders formatted date', async () => {
    render(<VacancyItem data={mockData} />);

    expect(
      await screen.findByText('Posted: Formatted Date')
    ).toBeInTheDocument();
  });

  test('renders image with validated URL', async () => {
    render(<VacancyItem data={mockData} />);

    const img = await screen.findByAltText('company-logo');

    await waitFor(() => {
      expect(img).toHaveAttribute('src', '/logo.png');
    });
  });

  test('links to correct vacancy page', async () => {
    render(<VacancyItem data={mockData} />);

    const link = await screen.findByRole('link');
    expect(link).toHaveAttribute('href', '/vacancies/123');
  });
});
