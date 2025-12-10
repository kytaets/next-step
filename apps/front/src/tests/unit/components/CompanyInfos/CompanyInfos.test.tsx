import React from 'react';
import { render, screen } from '@testing-library/react';
import CompanyInfos from '@/components/CompanyInfos/CompanyInfos';

jest.mock('@/components/CompanyInfos/CompanyInfos.module.css', () => ({
  'companies-container': 'companies-container',
}));

jest.mock('@/components/CompanyInfos/CompanyInfoBox', () => {
  return function MockCompanyInfoBox() {
    return <div data-testid="company-info-box">Mock Box</div>;
  };
});

describe('CompanyInfos', () => {
  test('renders exactly 8 CompanyInfoBox elements', () => {
    render(<CompanyInfos />);

    const boxes = screen.getAllByTestId('company-info-box');
    expect(boxes).toHaveLength(8);
  });

  test('renders a UL wrapper with correct class', () => {
    const { container } = render(<CompanyInfos />);

    const ul = container.querySelector('ul');
    expect(ul).toBeInTheDocument();
    expect(ul?.className).toContain('companies-container');
  });

  test('each CompanyInfoBox is inside LI element', () => {
    const { container } = render(<CompanyInfos />);

    const lis = container.querySelectorAll('li');
    expect(lis.length).toBe(8);

    lis.forEach((li) => {
      expect(li.querySelector('[data-testid="company-info-box"]')).toBeTruthy();
    });
  });
});
