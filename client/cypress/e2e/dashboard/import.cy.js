describe('Import', () => {
    beforeEach(() => {
        cy.login();

        cy.visit('/');

        cy.acceptCookies();
    });

    it('new material dialog', () => {
        cy.get('[data-cy=new-material]').click();
        cy.get('[data-cy=import-material]').click();

        cy.get('[data-cy=import-material-modal]').should('be.visible');
        cy.get('[data-cy=import-material-file]').should('be.visible');
        cy.get('[data-cy=import-material-process]').should('be.visible');
    });

    it('import wrong file', () => {
        cy.get('[data-cy=new-material]').click();
        cy.get('[data-cy=import-material]').click();

        cy.fixture('example.txt', null).as('textExample')

        cy.get('[data-cy=import-material-file] input')
            .selectFile('@textExample', {force: true});

        cy.get('[data-cy=import-material-process]').click();

        cy.get('[data-cy=import-material-error]').should('be.visible');
    });

    it('import correct markdown file', () => {
        cy.get('[data-cy=new-material]').click();
        cy.get('[data-cy=import-material]').click();

        cy.fixture('example.md', null).as('mdExample')

        cy.get('[data-cy=import-material-file] input')
            .selectFile('@mdExample', {force: true});

        cy.get('[data-cy=import-material-process]').click();

        cy.get('[data-cy=import-material-error]').should('not.exist');

        cy.get('[data-cy=import-material-modal]').should('not.exist');
        cy.url().should('include', '/editor');

        // Await a bit for the editor to load
        cy.wait(500);

        cy.url().should('not.include', '/editor/new');
        cy.get('[data-cy=editor]').should('be.visible');

        // Check if inner text is Test 123
        cy.get('[data-cy=editor-title]').should('have.text', 'Test 123');
    });

    it('import correct json file', () => {
        cy.get('[data-cy=new-material]').click();
        cy.get('[data-cy=import-material]').click();

        cy.fixture('example.json', null).as('jsonExample')

        cy.get('[data-cy=import-material-file] input')
            .selectFile('@jsonExample', {force: true});

        cy.get('[data-cy=import-material-process]').click();

        cy.get('[data-cy=import-material-error]').should('not.exist');

        cy.get('[data-cy=import-material-modal]').should('not.exist');
        cy.url().should('include', '/editor');

        // Await a bit for the editor to load
        cy.wait(500);

        cy.url().should('not.include', '/editor/new');
        cy.get('[data-cy=editor]').should('be.visible');
    });

    it('import invalid json file (format)', () => {
        cy.get('[data-cy=new-material]').click();
        cy.get('[data-cy=import-material]').click();

        cy.fixture('example-invalid-format.json', null).as('jsonExample')

        cy.get('[data-cy=import-material-file] input')
            .selectFile('@jsonExample', {force: true});

        cy.get('[data-cy=import-material-process]').click();

        cy.get('[data-cy=import-material-error]').should('be.visible');

        cy.get('[data-cy=import-material-modal]').should('be.visible');
        cy.url().should('not.include', '/editor');
    });

    it('import invalid json file (data)', () => {
        cy.get('[data-cy=new-material]').click();
        cy.get('[data-cy=import-material]').click();

        cy.fixture('example-missing-data.json', null).as('jsonExample')

        cy.get('[data-cy=import-material-file] input')
            .selectFile('@jsonExample', {force: true});

        cy.get('[data-cy=import-material-process]').click();

        cy.get('[data-cy=import-material-error]').should('be.visible');

        cy.get('[data-cy=import-material-modal]').should('be.visible');
        cy.url().should('not.include', '/editor');
    });

    after(() => {
        cy.clearMaterials();
    })

});
