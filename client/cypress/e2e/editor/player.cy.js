describe('Player page', () => {
    Cypress.on('uncaught:exception', () => {
        return false
    })
    beforeEach(() => {
        cy.login();

        cy.visit('/');

        cy.acceptCookies();
    });

    it('create new empty material and save the id', () => {
        cy.get('[data-cy=new-material]').click();
        cy.get('[data-cy=new-empty-material]').click();
        cy.get('[data-cy=new-material-modal]').should('not.exist');
        cy.url().should('include', '/editor');

        // Await a bit for the editor to load
        cy.wait(500);

        cy.url().should('not.include', '/editor/new');
        cy.get('[data-cy=editor]').should('be.visible');

        cy.url().then((url) => {
            const id = url.toString().split('/').pop();
            cy.writeFile("id.txt", id);
        })
    });

    it('should include menu', () => {
        cy.readFile('id.txt').then((id) => {
            cy.visit(`/en/editor/${id}`);

            cy.get('[data-cy=preview-button]').should('be.visible');
        })
    });

    it('open the player page', () => {
        cy.readFile('id.txt').then((id) => {
            cy.visit(`/en/editor/${id}`);

            cy.get('[data-cy=preview-button]').click();

            cy.url().should('include', '/player');

            cy.get('[data-cy=player]').should('be.visible');
        })
    });

    after(() => {
        cy.clearMaterials();
    })

});
