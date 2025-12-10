import React from 'react';
import { render, screen } from '@testing-library/react';
import VacancyItem from '@/components/CompanyInfos/VacancyItem';

jest.mock('@/components/CompanyInfos/CompanyInfos.module.css', () => ({
  'vacancy-item': 'vacancy-item',
  'posted-time': 'posted-time',
}));

describe('VacancyItem', () => {
  test('renders vacancy name and posted time', () => {
    render(<VacancyItem />);

    expect(screen.getByText('Vacancy Name')).toBeInTheDocument();
    expect(screen.getByText('posted about millennium ago')).toBeInTheDocument();
  });

  test('applies correct CSS classes', () => {
    const { container } = render(<VacancyItem />);

    const root = container.querySelector('.vacancy-item');
    expect(root).toBeInTheDocument();

    const time = container.querySelector('.posted-time');
    expect(time).toBeInTheDocument();
  });
});
