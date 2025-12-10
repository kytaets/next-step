import { ProfileData } from '@/types/profile';

describe('Create Job Seeker Profile Flow ', () => {
  it('opens modal when profile is missing and creates a new job seeker profile', () => {
    const testProfile = {
      id: 'p1',
      userId: 'u1',
      firstName: 'John',
      lastName: 'Doe',
      avatarUrl: null,
      bio: null,
      contacts: null,
      dateOfBirth: '1990-01-01',
      expectedSalary: null,
      isOpenToWork: true,
      seniorityLevel: null,
      location: null,
      languages: [],
      skills: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let firstCall = true;

    cy.intercept('GET', '**/api/job-seekers/me', (req) => {
      if (firstCall) {
        firstCall = false;
        req.reply({
          statusCode: 404,
          body: { status: 'error', message: 'Profile not found' },
        });
      } else {
        req.reply({
          statusCode: 200,
          body: testProfile,
        });
      }
    }).as('dynamicProfile');

    cy.intercept('POST', '**/api/job-seekers', (req) => {
      const body = req.body;

      expect(body.firstName).to.be.a('string');
      expect(body.lastName).to.be.a('string');

      req.reply({
        statusCode: 201,
        body: { status: 'ok', error: null },
      });
    }).as('createProfile');

    cy.visit('/my-profile/job-seeker', { failOnStatusCode: false });

    cy.wait('@dynamicProfile');

    cy.get('#profile-modal', { timeout: 6000 }).should('exist');

    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');
    cy.get('input[name="dateOfBirth"]').type('1990-01-01');

    cy.contains(/Create Profile/i).click();

    cy.wait('@createProfile');

    cy.wait('@dynamicProfile');

    cy.get('#profile-modal').should('not.exist');

    cy.contains('Your Next Level Profile').should('exist');
    cy.contains('John').should('exist');
    cy.contains('Doe').should('exist');
  });
});

describe('Edit Job Seeker Profile Flow', () => {
  let dynamicProfile: ProfileData;

  const existingProfile = {
    id: 'p1',
    userId: 'u1',
    firstName: 'John',
    lastName: 'Doe',
    avatarUrl: null,
    bio: 'Old bio',
    contacts: null,
    dateOfBirth: '1990-01-01',
    expectedSalary: null,
    isOpenToWork: false,
    seniorityLevel: null,
    location: null,
    languages: [],
    skills: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockFullEnvironment = () => {
    dynamicProfile = { ...existingProfile };

    cy.intercept('GET', '**/api/job-seekers/me', (req) => {
      req.reply({
        statusCode: 200,
        body: dynamicProfile,
      });
    }).as('profileDynamic');

    cy.intercept('PATCH', '**/api/job-seekers/me', (req) => {
      dynamicProfile = {
        ...dynamicProfile,
        ...req.body,
        updatedAt: new Date().toISOString(),
      };

      req.reply({
        statusCode: 200,
        body: { status: 'ok' },
      });
    }).as('updateMainData');

    // Skills list
    cy.intercept('GET', '**/api/skills', {
      statusCode: 200,
      body: [
        { id: '1', name: 'JavaScript' },
        { id: '2', name: 'React' },
      ],
    }).as('skillsList');

    cy.intercept('PUT', '**/api/job-seekers/me/skills', (req) => {
      dynamicProfile = {
        ...dynamicProfile,
        skills: req.body,
      };

      req.reply({ status: 200, body: { status: 'ok' } });
    }).as('updateSkills');

    cy.intercept('GET', '**/api/languages', {
      statusCode: 200,
      body: [
        { id: '1', name: 'English' },
        { id: '2', name: 'Ukrainian' },
      ],
    }).as('languagesList');

    cy.intercept('PUT', '**/api/job-seekers/me/languages', (req) => {
      dynamicProfile = {
        ...dynamicProfile,
        languages: req.body,
      };

      req.reply({ status: 200, body: { status: 'ok' } });
    }).as('updateLanguages');
  };

  beforeEach(() => {
    mockFullEnvironment();
    cy.visit('/my-profile/job-seeker', { failOnStatusCode: false });
    cy.wait('@profileDynamic');
  });

  it('allows editing main job seeker info', () => {
    cy.intercept('GET', '**/api/job-seekers/me', {
      statusCode: 200,
      body: { ...existingProfile, firstName: 'Johnny' },
    }).as('afterUpdate');

    cy.get('#edit-jobseeker-main-info').click();
    cy.get('input[name="firstName"]').clear().type('Johnny');
    cy.get('#save-jobseeker-main-info').click();

    cy.wait('@updateMainData');
    cy.wait('@afterUpdate');

    cy.contains('Johnny').should('exist');
  });

  it('allows editing job seeker bio', () => {
    cy.intercept('PATCH', '**/api/job-seekers/me', {
      statusCode: 200,
      body: { status: 'ok' },
    }).as('updateBio');

    cy.intercept('GET', '**/api/job-seekers/me', {
      statusCode: 200,
      body: {
        ...existingProfile,
        bio: 'Updated bio text',
      },
    }).as('refetchProfileAfterBio');

    cy.get('#description-edit-btn').click();
    cy.get('textarea[name="bio"]').clear().type('Updated bio text');
    cy.get('#description-save-btn').click();

    cy.wait('@updateBio');
    cy.wait('@refetchProfileAfterBio');
    cy.contains('Updated bio text').should('exist');
  });

  it('allows editing job seeker contacts', () => {
    cy.intercept(
      { method: 'PUT', url: /\/api\/job-seekers\/me\/contacts/ },
      {
        statusCode: 200,
        body: { status: 'ok' },
      }
    ).as('updateContacts');

    cy.intercept('GET', '**/api/job-seekers/me', {
      statusCode: 200,
      body: {
        ...existingProfile,
        contacts: { githubUrl: 'https://github.com/example1' },
      },
    }).as('afterUpdateContacts');

    cy.get('#jobseeker-contacts-edit-btn').click();
    cy.get('input[name="githubUrl"]')
      .clear()
      .type('https://github.com/example1');
    cy.get('#jobseeker-contacts-save-btn').click();

    cy.wait('@updateContacts');
    cy.wait('@afterUpdateContacts');

    cy.get('#jobseeker-contacts-edit-btn').click();
    cy.get('input[name="githubUrl"]').should(
      'have.value',
      'https://github.com/example1'
    );
  });

  it('allows toggling open-to-work status', () => {
    cy.intercept('GET', '**/api/job-seekers/me', {
      statusCode: 200,
      body: {
        ...existingProfile,
        isOpenToWork: true,
      },
    }).as('afterToggleOTW');

    cy.get('#open-to-work-btn').click();

    cy.wait('@updateMainData');
    cy.wait('@afterToggleOTW');

    cy.get('#open-to-work-btn').should('contain.text', 'Open to Work');
  });

  it('allows editing job seeker skills', () => {
    cy.get('#skills-edit-btn').click();
    cy.wait('@skillsList');

    cy.get('input[name="newSkill"]').type('jav');
    cy.contains('li', 'JavaScript').click({ force: true });

    cy.get('#skills-save-btn').should('be.visible').click({ force: true });
    cy.wait('@updateSkills');

    cy.contains('JavaScript').should('exist');
  });

  it('allows editing job seeker languages', () => {
    cy.get('#jobseeker-languages-edit-btn').click();
    cy.wait('@languagesList');

    cy.contains('Add +', { timeout: 5000 })
      .should('be.visible')
      .click({ force: true });

    cy.get('select[name="languages[0].language.id"]').select('English');
    cy.get('select[name="languages[0].level"]').select('INTERMEDIATE');

    cy.get('#languages-save-btn').should('be.visible').click({ force: true });
    cy.wait('@updateLanguages');

    cy.contains('English').should('exist');
    cy.contains('B2').should('exist');
  });
});
