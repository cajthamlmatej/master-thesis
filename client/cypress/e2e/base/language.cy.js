describe('Language', () => {
    beforeEach(() => {
        cy.visit('/');

        cy.acceptCookies();
    });

    it('page should be in English by default', () => {
        cy.url().should('contain', '/en');
    });

    it('translate button should be visible', () => {
        cy.get('[data-cy=translate-button]').should('be.visible');
    });

    it('translate button should open modal', () => {
        cy.wait(500);
        cy.get('[data-cy=translate-button]').click();
        cy.get('[data-cy=translate-modal]').should('be.visible');

        const languages = cy.get('[data-cy=translate-modal] [data-cy=language]');

        languages.should('have.length', 2); // English and Czech

        // English should be selected by default

        const english = languages.contains('English');
        english.should('have.class', 'list-item--active');
    })

    it('changing language should change the page', () => {
        cy.wait(500);
        cy.get('[data-cy=translate-button]').click();

        cy.get('[data-cy=translate-modal] [data-cy=language]').contains('Česky').click();

        cy.url().should('contain', '/cs');
    });

    it('changing language several times should work', () => {
        cy.wait(500);
        cy.get('[data-cy=translate-button]').click();

        cy.get('[data-cy=translate-modal] [data-cy=language]').contains('Česky').click();

        cy.url().should('contain', '/cs');

        cy.get('[data-cy=translate-button]').click();

        cy.get('[data-cy=translate-modal] [data-cy=language]').contains('English').click();

        cy.url().should('contain', '/en');
    })


});
