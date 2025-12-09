describe('Create Vacancy Flow', () => {
  const companyId = 'c1';

  const mockSkills = [
    { id: '1', name: 'JavaScript' },
    { id: '2', name: 'React' },
  ];

  const mockLanguages = [
    { id: '1', name: 'English' },
    { id: '2', name: 'Ukrainian' },
  ];

  const createdVacancy = {
    id: 'v100',
    title: 'Frontend Developer',
    company: {
      id: companyId,
      name: 'Test Company',
      logoUrl: null,
    },
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    cy.setCookie('company-id', companyId);

    cy.intercept('GET', '**/api/skills', mockSkills).as('skillsList');
    cy.intercept('GET', '**/api/languages', mockLanguages).as('languagesList');

    cy.visit('/my-profile/recruiter/company/vacancies/new-vacancy');
  });

  it('fills ALL fields, creates vacancy, redirects, and shows new vacancy', () => {
    cy.intercept('POST', '**/api/vacancies', (req) => {
      expect(req.body.title).to.equal('Frontend Developer');

      req.reply({
        statusCode: 201,
        body: {
          status: 'ok',
          error: null,
          data: { id: 'v100' },
        },
      });
    }).as('createVacancy');

    cy.intercept('POST', '**/api/vacancies/search', {
      statusCode: 200,
      body: {
        data: [createdVacancy],
        meta: { total: 1, page: 1, totalPages: 1 },
      },
    }).as('vacanciesList');

    cy.get('input[name="title"]').type('Frontend Developer');
    cy.get('textarea[name="description"]').type(
      'Super vacancy description. Super vacancy description. Super vacancy description'
    );

    cy.get('input[name="salaryMin"]').clear().type('1000');
    cy.get('input[name="salaryMax"]').clear().type('4000');

    cy.get('input[name="officeLocation"]').type('Kyiv Office');

    cy.get('input[name="experienceRequired"]').clear().type('3');
    cy.get('select[name="seniorityLevel"]').select('MIDDLE');

    cy.get('#workFormat-select').click();
    cy.get('#workFormat-REMOTE').click();
    cy.get('body').click(0, 0);

    cy.get('#employmentType-select').click();
    cy.get('#employmentType-FULL_TIME').click();
    cy.get('body').click(0, 0);

    cy.wait('@skillsList');
    cy.get('input[name="newSkill"]').type('jav');
    cy.contains('li', 'JavaScript').click({ force: true });

    cy.wait('@languagesList');
    cy.contains('Add +').click();

    cy.get('select[name="languages[0].language.id"]')
      .select('English')
      .should('have.value', '1');

    cy.get('select[name="languages[0].level"]')
      .select('INTERMEDIATE')
      .should('have.value', 'INTERMEDIATE');

    cy.get('button[type="submit"]').should('not.be.disabled').click();

    cy.wait('@createVacancy');

    cy.url().should(
      'include',
      `/my-profile/recruiter/company/vacancies?companyId=${companyId}`
    );

    cy.wait('@vacanciesList');

    cy.contains('Frontend Developer').should('exist');
  });
});
