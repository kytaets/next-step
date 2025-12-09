describe('Vacancies Search Page (mocked)', () => {
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

    cy.visit('/vacancies'); // твій route може бути інший
    cy.wait('@searchVacancies');

    // UI shows vacancies
    cy.contains('Frontend Developer').should('exist');
    cy.contains('Backend Developer').should('exist');

    // Pagination
    cy.get('#pages-counter').should('exist');
  });

  it('updates results when URL query params change', () => {
    // FIRST SEARCH (initial load)
    cy.intercept('POST', '**/api/vacancies/search', {
      statusCode: 200,
      body: vacanciesResponse,
    }).as('firstSearch');

    cy.visit('/vacancies');
    cy.wait('@firstSearch');

    // FILTERED SEARCH
    cy.intercept('POST', '**/api/vacancies/search', {
      statusCode: 200,
      body: singleVacancyFiltered,
    }).as('filteredSearch');

    // change URL (simulates search form submit)
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
    cy.intercept('POST', '**/api/vacancies/search', {
      statusCode: 200,
      body: filteredResponse,
    }).as('searchVacancies');

    cy.visit('/vacancies');
    cy.wait('@searchVacancies'); // initial load
  });

  it('applies filters and updates search results', () => {
    cy.get('input[name="experienceRequired"]').clear().type('1');

    cy.get('#search-btn').click({ force: true });

    cy.wait('@searchVacancies').then((interception) => {
      expect(interception.request.body.experienceRequired).to.equal(1);
    });

    cy.contains('Senior React Developer').should('exist');
  });

  it('toggles More filters visibility', () => {
    cy.contains('More filters...').click();
    cy.contains('Languages').should('exist');
    cy.contains('Skills').should('exist');

    cy.contains('Less filters').click();
    cy.contains('Languages').should('not.exist');
    cy.contains('Skills').should('not.exist');
  });
});
