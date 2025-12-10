describe('Vacancies Search Page', () => {
  const vacanciesResponse = {
    data: [
      {
        id: 'v1',
        title: 'Frontend Developer',
        company: { name: 'Tech Corp', logoUrl: null },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'v2',
        title: 'Backend Developer',
        company: { name: 'DevHouse', logoUrl: '/img/devhouse.png' },
        createdAt: new Date().toISOString(),
      },
    ],
    meta: {
      page: 1,
      totalPages: 3,
    },
  };

  const singleVacancyFiltered = {
    data: [
      {
        id: 'v1',
        title: 'Frontend Developer',
        company: { name: 'Tech Corp', logoUrl: null },
        createdAt: new Date().toISOString(),
      },
    ],
    meta: { page: 1, totalPages: 1 },
  };

  it('shows vacancies and pagination when search is successful', () => {
    cy.intercept('POST', '**/api/vacancies/search', {
      statusCode: 200,
      body: vacanciesResponse,
    }).as('searchVacancies');

    cy.visit('/vacancies');
    cy.wait('@searchVacancies');

    cy.contains('Frontend Developer').should('exist');
    cy.contains('Backend Developer').should('exist');

    cy.get('#pages-counter').should('exist');
  });

  it('updates results when URL query params change', () => {
    cy.intercept('POST', '**/api/vacancies/search', {
      statusCode: 200,
      body: vacanciesResponse,
    }).as('firstSearch');

    cy.visit('/vacancies');
    cy.wait('@firstSearch');

    cy.intercept('POST', '**/api/vacancies/search', {
      statusCode: 200,
      body: singleVacancyFiltered,
    }).as('filteredSearch');

    cy.visit('/vacancies?title=Frontend');
    cy.wait('@filteredSearch');

    cy.contains('Frontend Developer').should('exist');
    cy.contains('Backend Developer').should('not.exist');
  });

  it('shows error message if search fails', () => {
    cy.intercept('POST', '**/api/vacancies/search', {
      statusCode: 500,
      body: { message: 'Server error' },
    }).as('searchFail');

    cy.visit('/vacancies', { failOnStatusCode: false });
    cy.wait('@searchFail');

    cy.get('#message-box').contains('Error loading vacancies').should('exist');
  });

  it('shows redirect link to companies when user is JOB_SEEKER', () => {
    cy.setCookie('role', 'JOB_SEEKER');

    cy.intercept('POST', '**/api/vacancies/search', {
      statusCode: 200,
      body: vacanciesResponse,
    }).as('load');

    cy.visit('/vacancies');
    cy.wait('@load');

    cy.contains('Search for companies').should('exist');
    cy.contains('Search for job-seekers').should('not.exist');
  });

  it('shows redirect link to job-seekers when user is RECRUITER', () => {
    cy.setCookie('role', 'RECRUITER');

    cy.intercept('POST', '**/api/vacancies/search', {
      statusCode: 200,
      body: vacanciesResponse,
    }).as('load');

    cy.visit('/vacancies');
    cy.wait('@load');

    cy.contains('Search for job-seekers').should('exist');
    cy.contains('Search for companies').should('not.exist');
  });

  it('toggles More filters visibility', () => {
    cy.contains('More filters...').click();
    cy.contains('Languages').should('exist');
    cy.contains('Skills').should('exist');

    cy.contains('Less filters').click();
    cy.contains('Languages').should('not.exist');
    cy.contains('Skills').should('not.exist');
  });

  const filteredResponse = {
    data: [
      {
        id: 'v10',
        title: 'Senior React Developer',
        company: { name: 'HR Corp', logoUrl: null },
        createdAt: new Date().toISOString(),
      },
    ],
    meta: { page: 1, totalPages: 1 },
  };

  beforeEach(() => {
    cy.intercept('GET', '**/api/skills', {
      statusCode: 200,
      body: [
        { id: '1', name: 'JavaScript' },
        { id: '2', name: 'React' },
      ],
    }).as('skillsList');

    cy.intercept('GET', '**/api/languages', {
      statusCode: 200,
      body: [
        { id: '1', name: 'English' },
        { id: '2', name: 'Ukrainian' },
      ],
    }).as('languagesList');

    cy.intercept('POST', '**/api/vacancies/search', {
      statusCode: 200,
      body: filteredResponse,
    }).as('searchVacancies');

    cy.visit('/vacancies');
    cy.wait('@searchVacancies');
  });

  it('applies ALL filters and updates search results', () => {
    cy.intercept('POST', '**/api/vacancies/search', (req) => {
      expect(req.body.experienceRequired).to.equal(2);
      expect(req.body.salaryMin).to.equal(1500);
      expect(req.body.seniorityLevel).to.equal('MIDDLE');
      expect(req.body.workFormats).to.deep.equal(['REMOTE']);
      expect(req.body.employmentTypes).to.deep.equal(['FULL_TIME']);

      expect(req.body.requiredLanguages).to.deep.equal([
        { languageId: '1', level: 'INTERMEDIATE' },
      ]);
      expect(req.body.requiredSkillIds).to.deep.equal(['1']);

      expect(req.body.orderBy).to.deep.equal({
        updatedAt: 'asc',
      });

      req.reply({
        statusCode: 200,
        body: filteredResponse,
      });
    }).as('searchWithFilters');

    cy.get('#salaryMin').then(($el) => {
      const element = $el[0] as HTMLInputElement;

      const descriptor = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      );

      if (!descriptor || typeof descriptor.set !== 'function') {
        throw new Error('Unable to access HTMLInputElement.value setter');
      }

      descriptor.set.call(element, 1500);
      element.dispatchEvent(new Event('change', { bubbles: true }));
    });

    cy.get('input[name="experienceRequired"]').clear().type('2');

    cy.get('select[name="seniorityLevel"]').select('MIDDLE');

    cy.get('#workFormats-select').click({ force: true });
    cy.get('#workFormats-REMOTE').parent().find('input').click({ force: true });
    cy.get('#workFormats-select').click({ force: true });

    cy.get('#employmentTypes-select').click({ force: true });
    cy.get('#employmentTypes-FULL_TIME').click({ force: true });
    cy.get('#employmentTypes-select').click({ force: true });

    cy.contains('More filters...').click();

    cy.wait('@languagesList');
    cy.contains('Add +').click();

    cy.get('#languages-name-select').select('English');
    cy.get('#languages-level-select').select('INTERMEDIATE');

    cy.wait('@skillsList');
    cy.get('input[name="newSkill"]').type('jav');
    cy.contains('li', 'JavaScript').click({ force: true });

    cy.get('#orderByField').select('Updated At');
    cy.get('#orderByDirection').select('Ascending');

    cy.get('#search-btn').click({ force: true });

    cy.wait('@searchWithFilters');
    cy.contains('Senior React Developer').should('exist');
  });
});
