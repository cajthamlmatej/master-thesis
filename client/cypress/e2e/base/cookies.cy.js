describe('Base - Cookies', () => {
    beforeEach(() => {
        localStorage.clear();
        cy.visit('/');
    });
    it('Cookies should appear', () => {
        cy.get("[data-cy=cookies]").should('be.visible');
    });
    it('Cookies has to be not confirmed', () => {
        expect(localStorage.getItem("cookies")).to.be.null;
    });
    it('Clicking on accept should set cookies', () => {
        cy.get("[data-cy=cookies-accept]").click().then(()=>{
            expect(localStorage.getItem("cookies")).to.eq("true");
        })
    });
    it('Cookies should disappear', () => {
        cy.get("[data-cy=cookies-accept]").click().then(()=>{
            expect(localStorage.getItem("cookies")).to.eq("true");
            cy.get("[data-cy=cookies]").should('not.exist');
        })
    });
    it('Cookies should not appear after confirmation', () => {
        cy.get("[data-cy=cookies-accept]").click().then(() => {
            expect(localStorage.getItem("cookies")).to.eq("true");

            cy.get("[data-cy=cookies]").should('not.exist');

            cy.visit('/');

            cy.get("[data-cy=cookies]").should('not.exist');
        })
    });
})
