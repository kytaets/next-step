import { render, screen, waitFor } from '@testing-library/react';
import SideBox from '@/components/VacanciesItems/VacancyPage/SideBox';
import '@testing-library/jest-dom';
import React from 'react';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }) => <div {...rest}>{children}</div>,
  },
}));

jest.mock('@/components/HoveredItem/HoveredItem', () => ({
  __esModule: true,
  default: ({ children }) => <span data-testid="hovered-item">{children}</span>,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }) => (
    <a href={href} data-testid="mock-link">
      {children}
    </a>
  ),
}));

const ApplyBtnMock = jest.fn();
jest.mock('@/components/ApplicationItems/ApplyBtn', () => ({
  __esModule: true,
  default: (props) => ApplyBtnMock(props),
}));

ApplyBtnMock.mockImplementation(({ vacancyId }) => (
  <button data-testid="apply-btn">Apply {vacancyId}</button>
));

jest.mock('js-cookie', () => ({
  get: jest.fn(),
}));

const validateImageUrlMock = jest.fn();
jest.mock('@/utils/validation', () => ({
  validateImageUrl: (...args) => validateImageUrlMock(...args),
}));

const vacancyMock = {
  id: 'VAC123',
  company: {
    id: 'COMP1',
    name: 'Tech Corp',
    logoUrl: '/logo.png',
    url: 'https://techcorp.com',
  },
  employmentType: ['FULL_TIME', 'PART_TIME'],
  workFormat: ['REMOTE'],
  officeLocation: 'Kyiv',
  salaryMin: 1000,
  salaryMax: 2000,
  isActive: true,
};

describe('SideBox Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders ApplyBtn when no company-id cookie exists', async () => {
    require('js-cookie').get.mockReturnValue(undefined);
    validateImageUrlMock.mockResolvedValue(true);

    render(<SideBox data={vacancyMock} />);

    expect(screen.getByTestId('apply-btn')).toBeInTheDocument();

    expect(ApplyBtnMock).toHaveBeenCalledWith({ vacancyId: 'VAC123' });
  });

  test('renders recruiter section when companyId matches', async () => {
    require('js-cookie').get.mockReturnValue('COMP1');
    validateImageUrlMock.mockResolvedValue(true);

    render(<SideBox data={vacancyMock} />);

    expect(screen.getByText('Is Active')).toBeInTheDocument();
    expect(screen.getByText('Edit vacancy')).toBeInTheDocument();

    const editLink = screen.getByText('Edit vacancy').closest('a');

    expect(editLink).toHaveAttribute(
      'href',
      '/my-profile/recruiter/company/vacancies/edit-vacancy/VAC123'
    );
  });
});
