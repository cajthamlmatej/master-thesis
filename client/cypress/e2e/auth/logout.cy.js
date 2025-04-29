describe('Logout button', () => {
    beforeEach(() => {
        cy.login();

        cy.visit('/');

        cy.acceptCookies();
    });

    it('should be visible', () => {
        cy.get("[data-cy=logout]").should('be.visible');
    });

    it('should work', () => {
        // Get only visible elements
        cy.get("[data-cy=logout]").click().then(() => {
            cy.get("[data-cy=logout]").should('not.exist');

            cy.url().should('contain', '/authentication');
        });
    });
});
