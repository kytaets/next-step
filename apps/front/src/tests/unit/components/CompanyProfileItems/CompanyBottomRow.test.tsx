import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CompanyBottomRow from '@/components/CompanyProfileItems/CompanyBottomRow';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';

jest.mock('@/utils/convertData', () => ({
  isoToDate: jest.fn(() => 'Pretty Date'),
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

const mockInvalidateQueries = jest.fn();
const mockRemoveQueries = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
    removeQueries: mockRemoveQueries,
  }),
  useMutation: jest.fn(),
}));

jest.mock('js-cookie', () => ({
  get: jest.fn(),
}));

jest.mock('@/components/HoveredItem/HoveredItem', () => (props: any) => (
  <div data-testid="hovered-item">{props.children}</div>
));

jest.mock('@/services/recruiterProfileService', () => ({
  leaveCompany: jest.fn(),
}));

jest.mock('@/services/companyProfileService', () => ({
  deleteCompany: jest.fn(),
}));

const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>;

describe('CompanyBottomRow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders created date using converter', () => {
    const leaveMutate = jest.fn();
    const deleteMutate = jest.fn();
    mockUseMutation.mockImplementationOnce(() => ({ mutate: leaveMutate }));
    mockUseMutation.mockImplementationOnce(() => ({ mutate: deleteMutate }));
    (Cookies.get as jest.Mock).mockReturnValue('ADMIN');

    render(
      <CompanyBottomRow
        isEditable={false}
        companyId="company-1"
        createdAt="2024-01-01"
      />
    );

    expect(screen.getByText(/Created at/i)).toHaveTextContent(
      'Created at :Pretty Date'
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('admin confirms delete triggers delete mutation', () => {
    const leaveMutate = jest.fn();
    const deleteMutate = jest.fn();
    mockUseMutation.mockImplementationOnce(() => ({ mutate: leaveMutate }));
    mockUseMutation.mockImplementationOnce(() => ({ mutate: deleteMutate }));
    (Cookies.get as jest.Mock).mockReturnValue('ADMIN');
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <CompanyBottomRow
        isEditable={true}
        companyId="company-1"
        createdAt="2024-01-01"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /delete company/i }));

    expect(confirmSpy).toHaveBeenCalledWith(
      expect.stringContaining('delete the company?')
    );
    expect(deleteMutate).toHaveBeenCalledTimes(1);
    expect(leaveMutate).not.toHaveBeenCalled();
  });

  test('member confirms leave triggers leave mutation', () => {
    const leaveMutate = jest.fn();
    const deleteMutate = jest.fn();
    mockUseMutation.mockImplementationOnce(() => ({ mutate: leaveMutate }));
    mockUseMutation.mockImplementationOnce(() => ({ mutate: deleteMutate }));
    (Cookies.get as jest.Mock).mockReturnValue('MEMBER');
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <CompanyBottomRow
        isEditable={true}
        companyId="company-1"
        createdAt="2024-01-01"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /leave company/i }));

    expect(leaveMutate).toHaveBeenCalledTimes(1);
    expect(deleteMutate).not.toHaveBeenCalled();
  });
});
