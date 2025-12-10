import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Certificates from '@/components/ProfileItems/Certificates';
import { handleCertificatesSubmit } from '@/utils/profileValidation';

jest.mock('@/utils/profileValidation', () => ({
  handleCertificatesSubmit: jest.fn(),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

jest.mock('@/components/HoveredItem/HoveredItem', () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ProfileItems/InfoBox', () => ({
  __esModule: true,
  default: ({ children, onEdit }: any) => (
    <div>
      <button onClick={onEdit}>Edit</button>
      {children}
    </div>
  ),
}));

jest.mock('@/components/ProfileItems/InfoItem', () => ({
  __esModule: true,
  default: ({ title, date, children }: any) => (
    <div>
      <h4>{title}</h4>
      <span>{date}</span>
      {children}
    </div>
  ),
}));

describe('Certificates', () => {
  const mockData = [
    { name: 'Cert A', date: '2023-01-01', url: 'http://certA.com' },
    { name: 'Cert B', date: '2022-01-01', url: 'http://certB.com' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders certificates in view mode', () => {
    render(<Certificates isEditable={true} data={mockData} />);
    expect(screen.getByText('Cert A')).toBeInTheDocument();
    expect(screen.getByText('Cert B')).toBeInTheDocument();
  });

  test('switches to edit mode when clicking Edit', async () => {
    render(<Certificates isEditable={true} data={mockData} />);

    fireEvent.click(screen.getByText('Edit'));

    await waitFor(() =>
      expect(screen.getAllByPlaceholderText('Certificate Name').length).toBe(2)
    );
  });

  test('adds new certificate row', () => {
    render(<Certificates isEditable={true} data={mockData} />);

    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Add +'));

    expect(screen.getAllByPlaceholderText('Certificate Name').length).toBe(3);
  });

  test('removes certificate row', () => {
    render(<Certificates isEditable={true} data={mockData} />);

    fireEvent.click(screen.getByText('Edit'));

    const removeBtns = screen.getAllByRole('button', { name: '' });
    fireEvent.click(removeBtns[0]);

    expect(screen.getAllByPlaceholderText('Certificate Name').length).toBe(1);
  });

  test('calls handleCertificatesSubmit on Save', async () => {
    (handleCertificatesSubmit as jest.Mock).mockImplementation(
      (values, helpers, cb) => cb(values.certs)
    );

    render(<Certificates isEditable={true} data={mockData} />);

    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Save changes'));

    await waitFor(() => expect(handleCertificatesSubmit).toHaveBeenCalled());
  });

  test('Go Back exits edit mode', () => {
    render(<Certificates isEditable={true} data={mockData} />);

    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Go Back'));

    expect(
      screen.queryByPlaceholderText('Certificate Name')
    ).not.toBeInTheDocument();

    expect(screen.getByText('Cert A')).toBeInTheDocument();
  });

  test('shows validation error', async () => {
    render(<Certificates isEditable={true} data={mockData} />);

    fireEvent.click(screen.getByText('Edit'));

    (handleCertificatesSubmit as jest.Mock).mockImplementation(
      (_v, helpers) => {
        helpers.setErrors({ certs: 'Validation failed' });
      }
    );

    fireEvent.click(screen.getByText('Save changes'));

    expect(await screen.findByText('Validation failed')).toBeInTheDocument();
  });
});
