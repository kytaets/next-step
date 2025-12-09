describe('Vacancy Application Submission (mocked)', () => {
  //
  // ---------- MOCK VACANCY DATA (FULL STRUCTURE) ----------
  //
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

  //
  // ---------- BEFORE EACH ----------
  //
  beforeEach(() => {
    cy.setCookie('role', 'JOB_SEEKER'); // must be job seeker → ApplyBtn visible

    cy.intercept('GET', '**/api/vacancies/*', {
      statusCode: 200,
      body: vacancy,
    }).as('fetchVacancy');

    cy.visit('/vacancies/' + vacancy.id);
    cy.wait('@fetchVacancy');
  });

  //
  // -----------------------------------------------------
  // 1) SUCCESSFUL APPLICATION SUBMISSION
  // -----------------------------------------------------
  //
  it('submits a job application successfully', () => {
    cy.intercept('POST', '**/api/applications', {
      statusCode: 201,
      body: { status: 'ok' },
    }).as('submitApplication');

    // Open modal
    cy.get('#apply-btn').click({ force: true });

    cy.contains('Send invitation').should('exist');

    // Fill cover letter
    cy.get('textarea[name="coverLetter"]').type(
      'Hello recruiter, I am highly interested in this role.'
    );

    // Submit form
    cy.contains('button', 'Send invitation').click();

    // Verify request body
    cy.wait('@submitApplication').then((interception) => {
      expect(interception.request.body).to.have.property('vacancyId', 'v1');
      expect(interception.request.body.coverLetter).to.equal(
        'Hello recruiter, I am highly interested in this role.'
      );
    });

    // Success message displayed
    cy.contains('Application sent successfully!').should('exist');
  });

  //
  // -----------------------------------------------------
  // 2) APPLICATION SUBMISSION FAILURE (API ERROR)
  // -----------------------------------------------------
  //
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
