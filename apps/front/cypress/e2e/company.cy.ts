describe('Company Profile Flow', () => {
  const companyInitial = {
    id: 'c1',
    name: 'Tech Corp',
    description: 'We build things',
    url: 'https://techcorp.com',
    logoUrl: '',
    isVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedCompany = {
    ...companyInitial,
    name: 'Tech Corp International',
    description: 'Updated description',
    url: 'https://techcorp.io',
  };

  it('opens company modal when profile missing (403) and creates a new company profile', () => {
    const newCompany = {
      id: 'c999',
      name: 'New Company Name',
      description: '',
      url: 'https://new-company.com',
      logoUrl: '',
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let firstCall = true;

    cy.intercept('GET', '**/api/companies/my', (req) => {
      if (firstCall) {
        firstCall = false;
        req.reply({
          statusCode: 403,
          body: { status: 'error', message: 'Company not found' },
        });
      } else {
        req.reply({
          statusCode: 200,
          body: newCompany,
        });
      }
    }).as('companyDynamic');

    cy.intercept('POST', '**/api/companies', (req) => {
      expect(req.body.name).to.be.a('string');
      expect(req.body.url).to.be.a('string');
      req.reply({ statusCode: 201, body: { status: 'ok' } });
    }).as('createCompany');

    cy.visit('/my-profile/recruiter/company', { failOnStatusCode: false });

    cy.wait('@companyDynamic');

    cy.get('#profile-modal').should('exist');

    cy.get('input[name="name"]').type('New Company Name');
    cy.get('input[name="url"]').type('https://new-company.com');

    cy.contains('button', 'Create Profile').click();

    cy.wait('@createCompany');
    cy.wait('@companyDynamic');

    cy.get('#profile-modal').should('not.exist');

    cy.contains('New Company Name').should('exist');
    cy.contains('https://new-company.com').should('exist');
  });

  beforeEach(() => {
    cy.setCookie('company-id', companyInitial.id);
    cy.setCookie('recruiter-role', 'ADMIN');

    cy.intercept('GET', '**/api/companies/my', {
      statusCode: 200,
      body: companyInitial,
    }).as('initialCompany');

    cy.visit('/my-profile/recruiter/company');
    cy.wait('@initialCompany');
  });

  it('allows editing company main info', () => {
    cy.intercept('PATCH', '**/api/companies/my', {
      statusCode: 200,
      body: { status: 'ok' },
    }).as('updateMain');

    cy.intercept('GET', '**/api/companies/my', updatedCompany).as(
      'refetchMain'
    );

    cy.get('#edit-company-main-info').click();

    cy.get('input[name="name"]').clear().type('Tech Corp International');
    cy.get('input[name="url"]').clear().type('https://techcorp.io');

    cy.get('#save-company-main-info').click();

    cy.wait('@updateMain');
    cy.wait('@refetchMain');

    cy.contains('Tech Corp International').should('exist');
    cy.contains('https://techcorp.io').should('exist');
  });

  it('allows editing company description', () => {
    const updatedDesc = {
      ...companyInitial,
      description: 'Updated description',
    };

    cy.intercept('PATCH', '**/api/companies/my', {
      statusCode: 200,
      body: { status: 'ok' },
    }).as('updateDesc');

    cy.intercept('GET', '**/api/companies/my', updatedDesc).as('refetchDesc');

    cy.get('#description-edit-btn').click();
    cy.get('textarea[name="description"]').clear().type('Updated description');
    cy.get('#description-save-btn').click();

    cy.wait('@updateDesc');
    cy.wait('@refetchDesc');

    cy.contains('Updated description').should('exist');
  });
});
