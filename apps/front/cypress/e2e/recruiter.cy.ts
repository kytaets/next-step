describe('Recruiter Profile Flow (mocked)', () => {
  const existingProfile = {
    id: 'r1',
    firstName: 'John',
    lastName: 'Recruiter',
    role: 'MEMBER',
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    companyId: 'c1',
  };

  const updatedProfile = {
    ...existingProfile,
    firstName: 'Johnny',
    lastName: 'Boss',
    role: 'ADMIN',
  };

  it('opens modal when recruiter profile is missing and creates new profile', () => {
    const createdProfile = {
      id: 'r2',
      firstName: 'Alice',
      lastName: 'Brown',
      role: 'MEMBER',
      avatarUrl: null,
      createdAt: new Date().toISOString(),
      companyId: null,
    };

    let firstCall = true;

    cy.intercept('GET', '**/api/recruiters/me', (req) => {
      if (firstCall) {
        firstCall = false;
        req.reply({
          statusCode: 404,
          body: { status: 'error', message: 'Profile not found' },
        });
      } else {
        req.reply({
          statusCode: 200,
          body: createdProfile,
        });
      }
    }).as('dynamic');

    cy.intercept('POST', '**/api/recruiters', {
      statusCode: 201,
      body: { status: 'ok' },
    }).as('createRecruiter');

    cy.visit('/my-profile/recruiter', { failOnStatusCode: false });

    cy.wait('@dynamic');

    cy.get('#profile-modal').should('exist');

    cy.get('input[name="firstName"]').type('Alice');
    cy.get('input[name="lastName"]').type('Brown');

    cy.contains(/Create Profile/i).click();

    cy.wait('@createRecruiter');

    cy.wait('@dynamic');

    cy.get('#profile-modal').should('not.exist');

    cy.contains('Alice').should('exist');
    cy.contains('Brown').should('exist');
  });

  beforeEach(() => {
    cy.intercept('GET', '**/api/recruiters/me', existingProfile).as('initial');
    cy.visit('/my-profile/recruiter');
    cy.wait('@initial');
  });

  it('allows editing recruiter personal info', () => {
    cy.intercept('PATCH', '**/api/recruiters/me', {
      statusCode: 200,
      body: { status: 'ok' },
    }).as('updateRecruiter');

    cy.intercept('GET', '**/api/recruiters/me', updatedProfile).as('refetch');

    cy.get('#edit-recruiter-personal-info').click();

    cy.get('input[name="firstName"]').clear().type('Johnny');
    cy.get('input[name="lastName"]').clear().type('Boss');

    cy.get('#save-recruiter-personal-info').click();

    cy.wait('@updateRecruiter');
    cy.wait('@refetch');

    cy.contains('Johnny').should('exist');
    cy.contains('Boss').should('exist');
  });

  it('shows "Your Company" if company exists and navigates to company page', () => {
    cy.contains('button', 'Your Company').should('exist').click();

    cy.url().should('include', '/my-profile/recruiter/company');
  });

  it('shows "Create a Company" if company does not exist', () => {
    cy.intercept('GET', '**/api/recruiters/me', {
      ...existingProfile,
      companyId: null,
    }).as('noCompany');

    cy.visit('/my-profile/recruiter');
    cy.wait('@noCompany');

    cy.contains('button', 'Create a Company').should('exist');
  });
});
