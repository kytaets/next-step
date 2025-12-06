import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Bio from '@/components/ProfileItems/Description';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePersonalData } from '@/services/jobseekerService';
import { updateCompanyProfile } from '@/services/companyProfileService';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('@/services/jobseekerService', () => ({
  updatePersonalData: jest.fn(),
}));

jest.mock('@/services/companyProfileService', () => ({
  updateCompanyProfile: jest.fn(),
}));

jest.mock('@/components/ProfileItems/InfoBox', () => ({
  __esModule: true,
  default: ({ children, onEdit, isEditable }: any) => (
    <div>
      {isEditable && <button onClick={onEdit}>Edit</button>}
      {children}
    </div>
  ),
}));

jest.mock('@/components/MessageBox/MessageBox', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="error">{children}</div>,
}));

jest.mock('@/components/HoveredItem/HoveredItem', () => ({
  __esModule: true,
  default: ({ children }: any) => <span>{children}</span>,
}));

describe('Bio component', () => {
  const invalidateMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: invalidateMock,
    });

    (useMutation as jest.Mock).mockImplementation(
      ({ mutationFn, onSuccess, onError }) => ({
        mutate: async (values: any) => {
          try {
            const result = await mutationFn(values);
            if (result?.status === 'error') {
              return onSuccess?.(result);
            }
            onSuccess?.(result);
          } catch (err) {
            onError?.(err);
          }
        },
        isPending: false,
      })
    );

    (updatePersonalData as jest.Mock).mockResolvedValue({ status: 'success' });
    (updateCompanyProfile as jest.Mock).mockResolvedValue({
      status: 'success',
    });
  });

  test('renders text in view mode', () => {
    render(<Bio data="Hello world" isEditable={false} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  test('renders fallback when no data', () => {
    render(<Bio data="" isEditable={false} />);
    expect(screen.getByText('No data there yet')).toBeInTheDocument();
  });

  test('Edit button toggles to edit mode', () => {
    render(<Bio data="Test" isEditable={true} />);
    fireEvent.click(screen.getByText('Edit'));

    expect(
      screen.getByPlaceholderText('Tell us about yourself')
    ).toBeInTheDocument();
  });

  test('submits bio update (type=bio)', async () => {
    render(<Bio data="Old bio" isEditable={true} type="bio" />);

    fireEvent.click(screen.getByText('Edit'));

    const textarea = screen.getByPlaceholderText('Tell us about yourself');
    fireEvent.change(textarea, { target: { value: 'New bio text' } });

    fireEvent.click(screen.getByText('Save changes'));

    await waitFor(() =>
      expect(updatePersonalData).toHaveBeenCalledWith({
        bio: 'New bio text',
      })
    );

    expect(invalidateMock).toHaveBeenCalledWith({ queryKey: ['profile'] });
  });

  test('submits description update (type=description)', async () => {
    render(<Bio data="Old desc" isEditable={true} type="description" />);

    fireEvent.click(screen.getByText('Edit'));

    const textarea = screen.getByPlaceholderText('Tell us about yourself');
    fireEvent.change(textarea, { target: { value: 'New desc' } });

    fireEvent.click(screen.getByText('Save changes'));

    await waitFor(() =>
      expect(updateCompanyProfile).toHaveBeenCalledWith({
        description: 'New desc',
      })
    );

    expect(invalidateMock).toHaveBeenCalledWith({
      queryKey: ['company-profile'],
    });
  });

  test("shows server error when updatePersonalData returns {status:'error'}", async () => {
    (updatePersonalData as jest.Mock).mockResolvedValue({
      status: 'error',
      error: 'Bio update failed',
    });

    render(<Bio data="x" isEditable={true} type="bio" />);

    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Save changes'));

    expect(await screen.findByTestId('error')).toHaveTextContent(
      'Bio update failed'
    );
  });

  test('shows error when updateCompanyProfile throws', async () => {
    (updateCompanyProfile as jest.Mock).mockRejectedValue(
      new Error('Company error')
    );

    render(<Bio data="x" isEditable={true} type="description" />);

    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Save changes'));

    expect(await screen.findByTestId('error')).toHaveTextContent(
      'Company error'
    );
  });

  test('Go Back returns to view mode', () => {
    render(<Bio data="Hello" isEditable={true} />);

    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Go Back'));

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  test('submit button disabled when isPending=true', () => {
    (useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
    });

    render(<Bio data="x" isEditable={true} />);

    fireEvent.click(screen.getByText('Edit'));

    // Кнопка тепер містить текст "Saving changes..."
    const btn = screen.getByRole('button', { name: /Saving/i });

    expect(btn).toBeDisabled();
  });
});
