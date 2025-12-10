import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Education from '@/components/ProfileItems/Education';
import { handleEducationSubmit } from '@/utils/profileValidation';

jest.mock('@/utils/profileValidation', () => ({
  handleEducationSubmit: jest.fn(),
}));

jest.mock('@/components/ProfileItems/InfoBox', () => ({
  __esModule: true,
  default: ({ children, isEditable, onEdit }: any) => (
    <div>
      {isEditable && <button onClick={onEdit}>Edit</button>}
      {children}
    </div>
  ),
}));

jest.mock('@/components/ProfileItems/InfoItem', () => ({
  __esModule: true,
  default: ({ children, title, date }: any) => (
    <div data-testid="info-item">
      <h4>{title}</h4>
      <span>{date}</span>
      {children}
    </div>
  ),
}));

jest.mock('@/components/HoveredItem/HoveredItem', () => ({
  __esModule: true,
  default: ({ children }: any) => <span>{children}</span>,
}));

const sampleData = [
  {
    universityName: 'MIT',
    startDate: '2020-01-01',
    endDate: '2024-01-01',
    field: 'Computer Science',
    degree: 'Bachelor',
    details: 'Some details',
  },
];

describe('Education component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders education items in view mode', () => {
    render(<Education data={sampleData} isEditable={false} />);

    expect(screen.getByText('MIT')).toBeInTheDocument();
    expect(screen.getByText('2020-01-01 - 2024-01-01')).toBeInTheDocument();
    expect(screen.getByText('Computer Science')).toBeInTheDocument();
    expect(screen.getByText('Bachelor')).toBeInTheDocument();
  });

  test('Edit button toggles to edit mode', () => {
    render(<Education data={sampleData} isEditable={true} />);
    fireEvent.click(screen.getByText('Edit'));

    expect(screen.getByPlaceholderText('University Name')).toBeInTheDocument();
  });

  test('adds a new education row', () => {
    render(<Education data={sampleData} isEditable={true} />);
    fireEvent.click(screen.getByText('Edit'));

    fireEvent.click(screen.getByText('Add +'));

    const inputs = screen.getAllByPlaceholderText('University Name');
    expect(inputs.length).toBe(2);
  });

  test('removes an education row', () => {
    render(<Education data={sampleData} isEditable={true} />);
    fireEvent.click(screen.getByText('Edit'));

    fireEvent.click(screen.getByText('Delete'));

    expect(screen.queryByPlaceholderText('University Name')).toBeNull();
  });

  test('submits form and updates education list', async () => {
    const mockSubmit = jest.fn((values, helpers, cb) =>
      cb([{ ...sampleData[0], field: 'Updated Field' }])
    );

    (handleEducationSubmit as jest.Mock).mockImplementation(mockSubmit);

    render(<Education data={sampleData} isEditable={true} />);
    fireEvent.click(screen.getByText('Edit'));

    fireEvent.change(screen.getByPlaceholderText('Field of Study'), {
      target: { value: 'Updated Field' },
    });

    fireEvent.click(screen.getByText('Save changes'));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });

    expect(screen.getByText('Updated Field')).toBeInTheDocument();
  });

  test('shows validation error', async () => {
    (handleEducationSubmit as jest.Mock).mockImplementation(
      (values, helpers) => {
        helpers.setErrors({ education: 'Validation failed' });
      }
    );

    render(<Education data={sampleData} isEditable={true} />);
    fireEvent.click(screen.getByText('Edit'));

    fireEvent.click(screen.getByText('Save changes'));

    await waitFor(() => {
      expect(screen.getByText('Validation failed')).toBeInTheDocument();
    });
  });

  test('Go Back exits edit mode', () => {
    render(<Education data={sampleData} isEditable={true} />);

    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Go Back'));

    expect(screen.getByText('MIT')).toBeInTheDocument();
  });
});
