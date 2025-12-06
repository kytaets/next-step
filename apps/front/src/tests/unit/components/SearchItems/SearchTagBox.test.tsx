import { render, screen, fireEvent } from '@testing-library/react';
import SearchTagBox from '@/components/SearchItems/SearchTagBox';
import '@testing-library/jest-dom';

// =========================
// MOCK CHILD COMPONENTS
// =========================
jest.mock('@/components/SearchItems/Fields/SalarySlider', () => ({
  __esModule: true,
  default: () => <div data-testid="salary-slider">SalarySlider</div>,
}));

jest.mock('@/components/SearchItems/Fields/Experience', () => ({
  __esModule: true,
  default: () => <div data-testid="experience-input">ExperienceInput</div>,
}));

jest.mock('@/components/SearchItems/Fields/Seniority', () => ({
  __esModule: true,
  default: () => <div data-testid="seniority-input">SeniorityInput</div>,
}));

jest.mock('@/components/SearchItems/Fields/WorkFormats', () => ({
  __esModule: true,
  default: () => <div data-testid="work-formats">WorkFormats</div>,
}));

jest.mock('@/components/SearchItems/Fields/EmploymentTypes', () => ({
  __esModule: true,
  default: () => <div data-testid="employment-types">EmploymentTypes</div>,
}));

jest.mock('@/components/SearchItems/Fields/Languages', () => ({
  __esModule: true,
  default: () => <div data-testid="languages-input">LanguagesInput</div>,
}));

jest.mock('@/components/SearchItems/Fields/Skills', () => ({
  __esModule: true,
  default: () => <div data-testid="skills-input">SkillsInput</div>,
}));

jest.mock('@/components/SearchItems/Fields/SortingFields', () => ({
  __esModule: true,
  default: () => <div data-testid="sorting-fields">SortingFields</div>,
}));

jest.mock('@/components/SearchItems/Fields/ApplicationStatus', () => ({
  __esModule: true,
  default: () => <div data-testid="application-status">ApplicationStatus</div>,
}));

describe('SearchTagBox Component', () => {
  // ============================================================
  // VACANCIES
  // ============================================================
  test('renders correct filters for vacancies', () => {
    render(<SearchTagBox type="vacancies" />);

    expect(screen.getByText('Add filters:')).toBeInTheDocument();
    expect(screen.getByTestId('salary-slider')).toBeInTheDocument();
    expect(screen.getByTestId('experience-input')).toBeInTheDocument();
    expect(screen.getByTestId('seniority-input')).toBeInTheDocument();
    expect(screen.getByTestId('work-formats')).toBeInTheDocument();
    expect(screen.getByTestId('employment-types')).toBeInTheDocument();

    // More Filters button exists
    expect(
      screen.getByRole('button', { name: /more filters/i })
    ).toBeInTheDocument();

    // No Search button for vacancies
    expect(screen.queryByRole('button', { name: /search/i })).toBeNull();
  });

  test('toggles more/less filters when clicking the button (vacancies)', () => {
    render(<SearchTagBox type="vacancies" />);

    const btn = screen.getByRole('button', { name: /more filters/i });

    // Initially hidden
    expect(screen.queryByTestId('languages-input')).toBeNull();
    expect(screen.queryByTestId('skills-input')).toBeNull();
    expect(screen.queryByTestId('sorting-fields')).toBeNull();

    fireEvent.click(btn);

    // After clicking - visible
    expect(screen.getByTestId('languages-input')).toBeInTheDocument();
    expect(screen.getByTestId('skills-input')).toBeInTheDocument();
    expect(screen.getByTestId('sorting-fields')).toBeInTheDocument();

    // Button changes text
    expect(btn.textContent?.toLowerCase()).toContain('less filters');

    fireEvent.click(btn);

    // Hidden again
    expect(screen.queryByTestId('languages-input')).toBeNull();
    expect(screen.queryByTestId('skills-input')).toBeNull();
    expect(screen.queryByTestId('sorting-fields')).toBeNull();
  });

  // ============================================================
  // JOB SEEKERS
  // ============================================================
  test('jobSeekers: moreFilters is always enabled, no main filters', () => {
    render(<SearchTagBox type="jobSeekers" />);

    // Should NOT render vacancy-only fields
    expect(screen.queryByTestId('salary-slider')).toBeNull();
    expect(screen.queryByTestId('experience-input')).toBeNull();
    expect(screen.queryByTestId('seniority-input')).toBeNull();

    // Should show secondary filters immediately
    expect(screen.getByTestId('languages-input')).toBeInTheDocument();
    expect(screen.getByTestId('skills-input')).toBeInTheDocument();
    expect(screen.getByTestId('sorting-fields')).toBeInTheDocument();

    // Should show Search button
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  // ============================================================
  // APPLICATIONS
  // ============================================================
  test('applications: renders ApplicationStatus and Search button', () => {
    render(<SearchTagBox type="applications" />);

    expect(screen.getByTestId('application-status')).toBeInTheDocument();

    // Search button should exist
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();

    // Should NOT show More filters button
    expect(screen.queryByRole('button', { name: /more filters/i })).toBeNull();
  });
});
