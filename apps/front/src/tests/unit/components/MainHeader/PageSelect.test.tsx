import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import PageSelect from '@/components/MainHeader/PageSelect';

// ----------------------
// next/navigation mock
// ----------------------
const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

// ----------------------
// Cookies mock
// ----------------------
import Cookies from 'js-cookie';

jest.mock('js-cookie', () => ({
  get: jest.fn(),
}));

describe('PageSelect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('opens dropdown when button clicked', () => {
    (Cookies.get as jest.Mock).mockReturnValue('JOB_SEEKER');

    render(<PageSelect />);

    const button = screen.getByRole('button');

    fireEvent.click(button);

    expect(screen.getByText('Search for Vacancies')).toBeInTheDocument();
    expect(screen.getByText('Search for Companies')).toBeInTheDocument();
  });

  test('pushes correct page on select', () => {
    (Cookies.get as jest.Mock).mockReturnValue('JOB_SEEKER');

    render(<PageSelect />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const item = screen.getByText('Search for Vacancies');
    fireEvent.click(item);

    expect(pushMock).toHaveBeenCalledWith('/vacancies?page=1');
  });

  test('shows recruiter-specific option', () => {
    (Cookies.get as jest.Mock).mockReturnValue('RECRUITER');

    render(<PageSelect />);

    const btn = screen.getByRole('button');
    fireEvent.click(btn);

    expect(screen.getByText('Search for Job Seekers')).toBeInTheDocument();
  });

  test('hides recruiter option for non-recruiter', () => {
    (Cookies.get as jest.Mock).mockReturnValue('JOB_SEEKER');

    render(<PageSelect />);

    const btn = screen.getByRole('button');
    fireEvent.click(btn);

    expect(screen.queryByText('Search for Job Seekers')).toBeNull();
  });
});
