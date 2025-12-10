import { render, screen, fireEvent } from '@testing-library/react';
import PagesCounter from '@/components/VacanciesItems/PagesCounter';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    toString: () => 'page=2',
  }),
}));

jest.mock('@/components/PagesCounter/PagesCounter.module.css', () => ({
  'pages-counter': 'pages-counter',
  'nav-btn': 'nav-btn',
  'pages-container': 'pages-container',
  'page-btn': 'page-btn',
  active: 'active',
}));

jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="icon" />,
}));

describe('PagesCounter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('does not render when totalPages <= 1', () => {
    const { container } = render(
      <PagesCounter currentPage={1} totalPages={1} />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders page numbers correctly', () => {
    render(<PagesCounter currentPage={3} totalPages={7} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  test('previous button triggers router.push with correct page', () => {
    render(<PagesCounter currentPage={3} totalPages={10} />);

    const prevButton = screen.getByLabelText('Previous page');
    fireEvent.click(prevButton);

    expect(mockPush).toHaveBeenCalledWith('?page=2');
  });

  test('next button triggers router.push with correct page', () => {
    render(<PagesCounter currentPage={3} totalPages={10} />);

    const nextButton = screen.getByLabelText('Next page');
    fireEvent.click(nextButton);

    expect(mockPush).toHaveBeenCalledWith('?page=4');
  });

  test('clicking a page number triggers router.push', () => {
    render(<PagesCounter currentPage={3} totalPages={10} />);

    const page5 = screen.getByText('5');
    fireEvent.click(page5);

    expect(mockPush).toHaveBeenCalledWith('?page=5');
  });

  test('current page button is disabled and active', () => {
    render(<PagesCounter currentPage={3} totalPages={10} />);

    const current = screen.getByText('3');

    expect(current).toBeDisabled();
    expect(current.className).toContain('active');
  });

  test('ellipsis buttons are disabled', () => {
    render(<PagesCounter currentPage={5} totalPages={20} />);

    const dots = screen.getAllByText('...');
    dots.forEach((dot) => {
      expect(dot).toBeDisabled();
    });
  });
});
