import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkExperience from '@/components/ProfileItems/WorkExperience';
import { handleExperienceSubmit } from '@/utils/profileValidation';

jest.mock('@/utils/profileValidation');

// ---- Моки InfoBox та InfoItem, щоб не ламали DOM структуру ----
jest.mock(
  '@/components/ProfileItems/InfoBox',
  () =>
    ({ title, isEditable, onEdit, children }: any) => (
      <div>
        <h2>{title}</h2>
        {isEditable && <button onClick={onEdit}>Edit</button>}
        {children}
      </div>
    )
);

jest.mock(
  '@/components/ProfileItems/InfoItem',
  () =>
    ({ title, date, children }: any) => (
      <div>
        <h3>{title}</h3>
        <span>{date}</span>
        {children}
      </div>
    )
);

describe('WorkExperience', () => {
  const mockData = [
    {
      companyName: 'Google',
      startDate: '2020-01-01',
      endDate: '2021-01-01',
      details: 'Frontend Developer',
      isCurrent: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders work experience in view mode', () => {
    render(<WorkExperience isEditable data={mockData} />);

    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('2020-01-01 - 2021-01-01')).toBeInTheDocument();
  });

  test('switches to edit mode when edit button clicked', async () => {
    const user = userEvent.setup();
    render(<WorkExperience isEditable data={mockData} />);

    const editButton = screen.getByRole('button');
    await user.click(editButton);

    expect(screen.getByPlaceholderText('Company Name')).toBeInTheDocument();
  });

  test('adds new experience entry', async () => {
    const user = userEvent.setup();
    render(<WorkExperience isEditable data={mockData} />);

    await user.click(screen.getByRole('button'));

    const addButton = screen.getByText('Add +');
    await user.click(addButton);

    const companyInputs = screen.getAllByPlaceholderText('Company Name');
    expect(companyInputs).toHaveLength(2);
  });

  test('removes experience entry', async () => {
    const user = userEvent.setup();
    render(<WorkExperience isEditable data={mockData} />);

    await user.click(screen.getByRole('button')); // edit mode

    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);

    expect(
      screen.queryByPlaceholderText('Company Name')
    ).not.toBeInTheDocument();
  });

  // ---- ВАЛІДАЦІЯ ----

  test('shows error when fields are empty', async () => {
    const user = userEvent.setup();

    (handleExperienceSubmit as jest.Mock).mockImplementation(
      (values, helpers) => {
        helpers.setErrors({ experience: 'All fields must be filled.' });
      }
    );

    render(<WorkExperience isEditable data={mockData} />);

    await user.click(screen.getByRole('button')); // edit mode

    await user.clear(screen.getByPlaceholderText('Company Name'));
    await user.click(screen.getByText('Save changes'));

    expect(
      await screen.findByText('All fields must be filled.')
    ).toBeInTheDocument();
  });

  test('shows error when endDate missing for non-current job', async () => {
    const user = userEvent.setup();

    (handleExperienceSubmit as jest.Mock).mockImplementation(
      (values, helpers) => {
        helpers.setErrors({
          experience: 'End Date is required if the job is not current.',
        });
      }
    );

    render(<WorkExperience isEditable data={mockData} />);

    await user.click(screen.getByRole('button'));

    await user.clear(screen.getByPlaceholderText('End Date'));
    await user.click(screen.getByText('Save changes'));

    expect(
      await screen.findByText('End Date is required if the job is not current.')
    ).toBeInTheDocument();
  });

  test('shows error when start date > end date', async () => {
    const user = userEvent.setup();

    (handleExperienceSubmit as jest.Mock).mockImplementation(
      (values, helpers) => {
        helpers.setErrors({
          experience: 'Start Date must be earlier than End Date.',
        });
      }
    );

    render(<WorkExperience isEditable data={mockData} />);

    await user.click(screen.getByRole('button'));

    await user.clear(screen.getByPlaceholderText('Start Date'));
    await user.type(screen.getByPlaceholderText('Start Date'), '2022-01-01');

    await user.click(screen.getByText('Save changes'));

    expect(
      await screen.findByText('Start Date must be earlier than End Date.')
    ).toBeInTheDocument();
  });

  test('successful submit updates experience and closes edit mode', async () => {
    const user = userEvent.setup();

    (handleExperienceSubmit as jest.Mock).mockImplementation(
      (values, helpers, onSuccess) => {
        onSuccess(values.experience);
      }
    );

    render(<WorkExperience isEditable data={mockData} />);

    await user.click(screen.getByRole('button')); // edit mode

    // change company name
    const companyInput = screen.getByPlaceholderText('Company Name');
    await user.clear(companyInput);
    await user.type(companyInput, 'Amazon');

    await user.click(screen.getByText('Save changes'));

    expect(screen.getByText('Amazon')).toBeInTheDocument();
  });
});
