describe('My Profile – Choose Role Flow', () => {
  beforeEach(() => {
    cy.visit('/my-profile');
  });

  it('allows user to choose Job Seeker role', () => {
    cy.get('input[type="radio"][value="JOB_SEEKER"]').click({ force: true });
    
    cy.getCookie('role').should('have.property', 'value', 'JOB_SEEKER');
    
    cy.url().should('include', '/my-profile/job-seeker');
  });

  it('allows user to choose Recruiter role', () => {
    cy.get('input[type="radio"][value="RECRUITER"]').click({ force: true });

    cy.getCookie('role').should('have.property', 'value', 'RECRUITER');

    cy.url().should('include', '/my-profile/recruiter');
  });
});
