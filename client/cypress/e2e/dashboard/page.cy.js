describe('Dashboard page', () => {
    Cypress.on('uncaught:exception', () => {
        return false
    })
    beforeEach(() => {
        cy.login();

        cy.visit('/');

        cy.acceptCookies();
    });

    it('should be visible and include search and create button', () => {
        cy.get("[data-cy=dashboard]").should('be.visible');
        cy.get('[data-cy=new-material]').should('be.visible');
        cy.get('[data-cy=search-materials]').should('be.visible');
    });

    it('should not include any materials', () => {
        cy.get('[data-cy=materials]').children().should('have.length', 0);
    });

    it('create button should open a modal with options', () => {
        cy.get('[data-cy=new-material]').click();
        cy.get('[data-cy=new-material-modal]').should('be.visible');
        cy.get('[data-cy=new-empty-material]').should('be.visible');
        cy.get('[data-cy=import-material]').should('be.visible');
    });

    it('create new empty material', () => {
        cy.get('[data-cy=new-material]').click();
        cy.get('[data-cy=new-empty-material]').click();
        cy.get('[data-cy=new-material-modal]').should('not.exist');
        cy.url().should('include', '/editor');

        // Await a bit for the editor to load
        cy.wait(500);

        cy.url().should('not.include', '/editor/new');
        cy.get('[data-cy=editor]').should('be.visible');
    });

    it('have created material in the list', () => {
        cy.get('[data-cy=new-material]').click();
        cy.get('[data-cy=new-empty-material]').click();
        cy.get('[data-cy=new-material-modal]').should('not.exist');
        cy.wait(500);
        cy.visit('/');
        cy.get('[data-cy=materials]').children().eq(1).should('be.visible');
    });

    after(() => {
        cy.clearMaterials();
    })

});
