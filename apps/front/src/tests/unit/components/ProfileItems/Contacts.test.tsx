import { render, screen, fireEvent } from '@testing-library/react';
import Contacts from '@/components/ProfileItems/Contacts';
import { useModalStore } from '@/store/modalSlice';

jest.mock('@/store/modalSlice', () => ({
  useModalStore: jest.fn(),
}));

jest.mock('@/components/ProfileItems/ContactLink', () => ({
  __esModule: true,
  default: ({ type, url }: any) => (
    <div data-testid="contact-link">
      {type}:{url}
    </div>
  ),
}));

jest.mock('@/components/ProfileItems/ContactsModal', () => {
  const MockedModal = ({ data }: any) => (
    <div data-testid="contacts-modal">Modal {JSON.stringify(data)}</div>
  );
  MockedModal.displayName = 'ContactsModal';
  return { __esModule: true, default: MockedModal };
});

jest.mock('framer-motion', () => ({
  __esModule: true,
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/components/HoveredItem/HoveredItem', () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));

describe('Contacts component', () => {
  const openModalMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useModalStore as jest.Mock).mockReturnValue(openModalMock);
  });

  const mockData = {
    linkedinUrl: 'http://linkedin.com/me',
    githubUrl: 'http://github.com/me',
    telegramUrl: '',
    publicEmail: 'me@example.com',
  };

  test('renders only non-empty contact entries', () => {
    render(<Contacts isEditable={false} data={mockData} />);

    const links = screen.getAllByTestId('contact-link');
    expect(links.length).toBe(3); // telegram is empty → skipped

    expect(
      screen.getByText('linkedinUrl:http://linkedin.com/me')
    ).toBeInTheDocument();
    expect(
      screen.getByText('githubUrl:http://github.com/me')
    ).toBeInTheDocument();
    expect(screen.getByText('publicEmail:me@example.com')).toBeInTheDocument();
  });

  test('renders no contacts if data=null', () => {
    render(<Contacts isEditable={false} data={null} />);
    expect(screen.queryByTestId('contact-link')).toBeNull();
  });

  test('renders edit button only when isEditable=true', () => {
    const { rerender } = render(<Contacts isEditable={true} data={mockData} />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Contacts isEditable={false} data={mockData} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  test('clicking edit button opens modal and passes ContactsModal', () => {
    render(<Contacts isEditable={true} data={mockData} />);

    fireEvent.click(screen.getByRole('button'));

    expect(openModalMock).toHaveBeenCalledTimes(1);

    const modalArg = openModalMock.mock.calls[0][0];

    const child = Array.isArray(modalArg.props.children)
      ? modalArg.props.children[0]
      : modalArg.props.children;

    expect(child.type.displayName).toBe('ContactsModal');
  });
});
