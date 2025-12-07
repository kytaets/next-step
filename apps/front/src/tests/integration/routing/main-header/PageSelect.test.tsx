import { render, fireEvent } from '@testing-library/react';
import Cookies from 'js-cookie';

import PageSelect from '@/components/MainHeader/PageSelect';

// ---- MOCKS ----
const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.mock('js-cookie', () => ({
  get: jest.fn(),
}));

describe('PageSelect routing behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens dropdown and navigates to selected page', () => {
    (Cookies.get as jest.Mock).mockReturnValue(null); // no role

    const { getByText, queryByText } = render(<PageSelect />);

    // Dropdown closed initially
    expect(queryByText('Search for Vacancies')).toBeNull();

    // Open dropdown
    fireEvent.click(getByText('Make your first step →'));

    // Now options should appear
    expect(getByText('Search for Vacancies')).toBeInTheDocument();

    // Click on option
    fireEvent.click(getByText('Search for Vacancies'));

    expect(pushMock).toHaveBeenCalledWith('/vacancies?page=1');
  });

  it('shows recruiter option "Search for Job Seekers"', () => {
    (Cookies.get as jest.Mock).mockReturnValue('RECRUITER');

    const { getByText } = render(<PageSelect />);

    fireEvent.click(getByText('Make your first step →'));

    expect(getByText('Search for Job Seekers')).toBeInTheDocument();

    fireEvent.click(getByText('Search for Job Seekers'));

    expect(pushMock).toHaveBeenCalledWith('/job-seekers?page=1');
  });
});
