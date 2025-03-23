describe('Auth page', () => {
    beforeEach(() => {
        cy.visit('/');
        cy.acceptCookies();
    });
    it('Tabs and auth options should be visible', () => {
        cy.get(".tabs").should('be.visible');
        cy.get(".tabs .tab[data-value=EMAIL_PASSWORD]").should('be.visible');
        cy.get(".tabs .tab[data-value=EMAIL]").should('be.visible');
    });
    it('Switching tabs should work',  () => {
        cy.get(".tabs").should('be.visible');

        const emailPassword = cy.get(".tabs .tab[data-value=EMAIL_PASSWORD]");

        const email = cy.get(".tabs .tab[data-value=EMAIL]");

        emailPassword.click().then(()=>{
            email.should('not.have.class', 'tab--active');
            emailPassword.should('have.class', 'tab--active');
        });

        email.click().then(()=>{
            emailPassword.should('not.have.class', 'tab--active');
            email.should('have.class', 'tab--active');
        });

        emailPassword.click().then(()=>{
            email.should('not.have.class', 'tab--active');
            emailPassword.should('have.class', 'tab--active');
        });
    });

    it('Email password form should be visible',  () => {
        cy.get(".tabs .tab[data-value=EMAIL_PASSWORD]").click();
        cy.get("[data-cy=email-password-form]").should('be.visible');
    });

    it('Email form should be visible',  () => {
        cy.get(".tabs .tab[data-value=EMAIL]").click();
        cy.get("[data-cy=email-form]").should('be.visible');
    });

    it('Register button should be visible',  () => {
        cy.get("[data-cy=create-account]").should('be.visible');
    });
})
