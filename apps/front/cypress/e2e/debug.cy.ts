describe('Debug', () => {
  it('debug: check submit executes', () => {
    cy.visit('/sign-in');

    cy.get('input[name="email"]').type('invalid');
    cy.get('input[name="password"]').type('1');

    cy.contains('Sign In').click();

    cy.contains('Enter correct email').should('exist');
  });
});
