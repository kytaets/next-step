describe('User Sign-Up and Resend Confirmation Flow', () => {
  it('registers user, shows confirm step, and resends confirmation email', () => {
    const uniqueEmail = `user_${Date.now()}@test.com`;

    cy.intercept('POST', 'http://localhost:8020/api/auth/register', {
      statusCode: 200,
      body: { status: 'ok', error: null },
    }).as('mockRegister');

    cy.intercept('POST', 'http://localhost:8020/api/auth/verify/resend', {
      statusCode: 200,
      body: { status: 'ok', error: null },
    }).as('mockResend');

    cy.visit('/sign-up?step=account');

    cy.get('input[name="email"]').type(uniqueEmail);
    cy.get('input[name="password"]').type('StrongPass123!');
    cy.get('input[name="confirm"]').type('StrongPass123!');

    cy.get('button[type="submit"]').click();

    cy.wait('@mockRegister');

    cy.url({ timeout: 5000 }).should('include', 'step=confirm');

    cy.contains('Step 2: Confirmation', { timeout: 5000 }).should('exist');

    cy.contains('Resend Email').click();

    cy.wait('@mockResend');

    cy.contains('We have sent you another confirmation letter', {
      timeout: 5000,
    }).should('exist');
  });
});

describe('User Sign-In Flow', () => {
  it('logs in successfully (mock)', () => {
    cy.fixture('user').then((user) => {
      cy.intercept('POST', 'http://localhost:8020/api/auth/login', {
        statusCode: 200,
        body: { status: 'ok', error: null },
      }).as('mockLogin');

      cy.intercept('GET', '/my-profile*').as('profile');

      cy.visit('/sign-in');

      cy.get('input[name="email"]').type(user.email);
      cy.get('input[name="password"]').type(user.password);

      cy.get('form').find('button[type="submit"]').click();

      cy.wait('@mockLogin').then(() => {
        cy.setCookie('sid', 'fake-session-id-123');
      });

      cy.wait('@profile');

      cy.url({ timeout: 5000 }).should('include', '/my-profile');
    });
  });
});

describe('Logout Flow', () => {
  beforeEach(() => {
    cy.fixture('user').then((user) => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          status: 'ok',
          user: { id: 1, email: user.email },
        },
      }).as('mockLogin');

      cy.intercept('GET', '/my-profile*').as('profile');

      cy.visit('/sign-in');

      cy.get('input[name="email"]').type(user.email);
      cy.get('input[name="password"]').type(user.password);

      cy.get('form').find('button[type="submit"]').click();

      cy.wait('@mockLogin').then(() => {
        cy.setCookie('sid', 'fake-session-id-123');
      });

      cy.wait('@profile');

      cy.url({ timeout: 5000 }).should('include', '/my-profile');
    });
  });

  it('logs the user out correctly', () => {
    cy.intercept('POST', 'http://localhost:8020/api/auth/logout', {
      statusCode: 200,
      body: { status: 'ok' },
    }).as('mockLogout');

    cy.on('window:confirm', () => true);

    cy.contains('Log Out').should('exist');

    cy.contains('Log Out').click({ force: true });

    cy.wait('@mockLogout');

    cy.url({ timeout: 5000 }).should('include', '/sign-in');

    cy.getCookie('sid').should('not.exist');
    cy.getCookie('company-id').should('not.exist');

    cy.contains('Sign In').should('exist');
    cy.contains('Profile').should('not.exist');
  });
});

describe('Forgot Password Flow', () => {
  it('sends reset password email successfully', () => {
    cy.fixture('user').then((user) => {
      cy.intercept('POST', 'http://localhost:8020/api/auth/forgot-password', {
        statusCode: 200,
        body: { status: 'ok', error: null },
      }).as('mockForgot');

      cy.visit('/sign-in');

      cy.get('input[name="email"]').type(user.email);

      cy.contains('I have forgot my password').click();

      cy.wait('@mockForgot');

      cy.get('#check-text', { timeout: 5000 }).should(
        'contain.text',
        'Check your email to reset the password'
      );
    });
  });
});
