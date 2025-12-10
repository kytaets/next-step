import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Avatar from '@/components/ProfileItems/Avatar';
import { useModalStore } from '@/store/modalSlice';
import { validateImageUrl } from '@/utils/validation';

jest.mock('@/store/modalSlice', () => ({
  useModalStore: jest.fn(),
}));

jest.mock('@/utils/validation', () => ({
  validateImageUrl: jest.fn(),
}));

describe('Avatar component', () => {
  const openModalMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useModalStore as jest.Mock).mockImplementation((cb) =>
      cb({ openModal: openModalMock })
    );
  });

  test('renders fallback image when no data provided', async () => {
    render(<Avatar isEditable={false} data={null} type="job-seeker" />);

    const img = screen.getByAltText('avatar-image') as HTMLImageElement;

    expect(img.src).toContain('/images/no-avatar.png');
  });

  test('renders valid image when validateImageUrl resolves true', async () => {
    (validateImageUrl as jest.Mock).mockResolvedValue(true);

    const url = 'https://example.com/avatar.png';
    render(<Avatar isEditable={false} data={url} />);

    await waitFor(() => {
      expect(screen.getByAltText('avatar-image')).toHaveAttribute('src', url);
    });
  });

  test('renders fallback when validateImageUrl resolves false', async () => {
    (validateImageUrl as jest.Mock).mockResolvedValue(false);

    render(<Avatar isEditable={false} data="bad-url" type="company" />);

    await waitFor(() => {
      expect(screen.getByAltText('avatar-image')).toHaveAttribute(
        'src',
        '/images/company-no-logo.png'
      );
    });
  });

  test('button disabled when isEditable=false', () => {
    render(<Avatar isEditable={false} data={null} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  test('click triggers modal when editable', () => {
    render(<Avatar isEditable={true} data="some-url" />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(openModalMock).toHaveBeenCalledTimes(1);
  });

  test('image opacity changes when loaded', async () => {
    (validateImageUrl as jest.Mock).mockResolvedValue(true);
    const url = 'https://example.com/avatar.png';

    render(<Avatar isEditable={false} data={url} />);

    const img = screen.getByAltText('avatar-image');

    await waitFor(() => {
      expect(img).toHaveStyle('opacity: 1');
    });
  });
});
