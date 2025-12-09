import { VacancyData } from '@/types/vacancies';

describe('Vacancy Application Submission (mocked)', () => {
  const vacancy: VacancyData = {
    id: 'v1',
    title: 'Senior React Developer',
    description: 'Great opportunity',
    salaryMin: 2000,
    salaryMax: 4500,
    officeLocation: 'New York',
    experienceRequired: 3,
    isActive: true,
    workFormat: ['REMOTE'],
    employmentType: ['FULL_TIME'],
    seniorityLevel: 'SENIOR',
    requiredSkills: [
      { skill: { id: '1', name: 'React' } },
      { skill: { id: '2', name: 'TypeScript' } },
    ],
    requiredLanguages: [
      {
        level: 'ADVANCED',
        language: { id: 'en', name: 'English' },
      },
    ],
    company: {
      id: 'c1',
      name: 'Tech Corp',
      description: 'We build things',
      url: 'https://techcorp.com',
      logoUrl: '/logo.png',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    cy.setCookie('role', 'JOB_SEEKER');

    cy.intercept('GET', '**/api/vacancies/*', {
      statusCode: 200,
      body: vacancy,
    }).as('fetchVacancy');

    cy.visit('/vacancies/' + vacancy.id);
    cy.wait('@fetchVacancy');
  });

  it('submits a job application successfully', () => {
    cy.intercept('POST', '**/api/applications', {
      statusCode: 201,
      body: { status: 'ok' },
    }).as('submitApplication');

    cy.get('#apply-btn').click({ force: true });

    cy.contains('Send invitation').should('exist');

    cy.get('textarea[name="coverLetter"]').type(
      'Hello recruiter, I am highly interested in this role.'
    );

    cy.contains('button', 'Send invitation').click();

    cy.wait('@submitApplication').then((interception) => {
      expect(interception.request.body).to.have.property('vacancyId', 'v1');
      expect(interception.request.body.coverLetter).to.equal(
        'Hello recruiter, I am highly interested in this role.'
      );
    });

    cy.contains('Application sent successfully!').should('exist');
  });

  it('shows an error message when submission fails', () => {
    cy.intercept('POST', '**/api/applications', {
      statusCode: 400,
      body: { message: 'Cover letter too short' },
    }).as('submitFail');

    cy.get('#apply-btn').click({ force: true });

    cy.get('textarea[name="coverLetter"]').type('Hi');

    cy.contains('button', 'Send invitation').click();

    cy.wait('@submitFail');

    cy.contains('Cover letter too short').should('exist');
  });
});
