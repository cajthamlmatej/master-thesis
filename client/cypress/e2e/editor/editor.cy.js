describe('Editor page', () => {
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

            cy.get('[data-cy=slides-button]').should('be.visible');
            cy.get('[data-cy=blocks-button]').should('be.visible');
            cy.get('[data-cy=media-button]').should('be.visible');
            cy.get('[data-cy=content-button]').should('be.visible');
            cy.get('[data-cy=plugins-button]').should('be.visible');
            cy.get('[data-cy=preview-button]').should('be.visible');
        })
    });

    after(() => {
        cy.clearMaterials();
    })

});

describe('Editor / slides', () => {

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


    it("should open the slides tab", () => {
        cy.readFile('id.txt').then((id) => {
            cy.visit(`/en/editor/${id}`);

            cy.get('[data-cy=slides-button]').click();
            cy.get('[data-cy=slides-container]').should('be.visible');
            cy.get('[data-cy=slides-add-button]').should('be.visible');

            cy.get('[data-cy=slides-container]').children().should('have.length', 1);
        })
    })

    it("should add a slide", () => {
        cy.readFile('id.txt').then((id) => {
            cy.visit(`/en/editor/${id}`);

            cy.get('[data-cy=slides-button]').click();
            cy.get('[data-cy=slides-container]').should('be.visible');
            cy.get('[data-cy=slides-container]').children().should('have.length', 1);

            cy.get('[data-cy=slides-add-button]').click();
            cy.get('[data-cy=slides-container]').children().should('have.length', 2);
        })
    })

    it("should change a slide", () => {
        cy.readFile('id.txt').then((id) => {
            cy.visit(`/en/editor/${id}`);

            cy.get('[data-cy=slides-button]').click();
            cy.get('[data-cy=slides-container]').should('be.visible');
            cy.get('[data-cy=slides-container]').children().should('have.length', 2);

            cy.get('[data-cy=slides-container]').children().eq(0).click();

            cy.get('[data-cy=slides-container]').children().eq(0).should('have.class', 'slide--active');

            cy.get('[data-cy=slides-container]').children().eq(1).click();

            cy.get('[data-cy=slides-container]').children().eq(0).should('not.have.class', 'slide--active');
            cy.get('[data-cy=slides-container]').children().eq(1).should('have.class', 'slide--active');

            cy.get('[data-cy=slides-container]').children().eq(0).click();

            cy.get('[data-cy=slides-container]').children().eq(0).should('have.class', 'slide--active');

        })
    })

    it("should remove slide", () => {
        cy.readFile('id.txt').then((id) => {
            cy.visit(`/en/editor/${id}`);

            cy.get('[data-cy=slides-button]').click();
            cy.get('[data-cy=slides-container]').should('be.visible');
            cy.get('[data-cy=slides-container]').children().should('have.length', 2);
            cy.get('[data-cy=slides-add-button]').click();
            cy.get('[data-cy=slides-add-button]').click();
            cy.get('[data-cy=slides-container]').children().should('have.length', 4);

            cy.get('[data-cy=slides-container]').children().eq(0).within(() => {
                cy.get('[data-cy=delete-slide]').click();
            })
            cy.get('[data-cy=slides-container]').children().should('have.length', 3);
            cy.get('[data-cy=slides-container]').children().eq(0).within(() => {
                cy.get('[data-cy=delete-slide]').click();
            })
            cy.get('[data-cy=slides-container]').children().should('have.length', 2);
        })
    })

    after(() => {
        cy.clearMaterials();
    })
});

describe('Editor / blocks', () => {
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


    it("should open the blocks tab", () => {
        cy.readFile('id.txt').then((id) => {
            cy.visit(`/en/editor/${id}`);

            cy.get('[data-cy=blocks-button]').click();
            cy.get('[data-cy=blocks-container]').should('be.visible');
        })
    })

    it("should add a block", () => {
        cy.readFile('id.txt').then((id) => {
            cy.visit(`/en/editor/${id}`);

            cy.get('[data-cy=blocks-button]').click();
            cy.get('[data-cy=blocks-container]').should('be.visible');

            cy.get('[data-cy=editor] .editor-content').should('exist').should('be.visible');

            cy.get('[data-cy=editor] .editor-content').children().should('have.length', 0);

            cy.get("[data-cy=blocks-text-button]").click();

            cy.get('[data-cy=editor] .editor-content').children().should('have.length', 1);
        })
    })

    after(() => {
        cy.clearMaterials();
    })
});

describe('Editor / property', () => {
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

        cy.get('[data-cy=blocks-button]').click();
        cy.get('[data-cy=blocks-container]').should('be.visible');

        cy.get('[data-cy=editor] .editor-content').should('exist').should('be.visible');

        cy.get('[data-cy=editor] .editor-content').children().should('have.length', 0);

        cy.get("[data-cy=blocks-text-button]").click();

        cy.get('[data-cy=editor] .editor-content').children().should('have.length', 1);
        cy.get('[data-cy=editor-property]').should('be.visible');
    })

    it("should open the property tab", () => {
        cy.readFile('id.txt').then((id) => {
            cy.visit(`/en/editor/${id}`);

            cy.get('[data-cy=editor] .editor-content').children().should('have.length', 1);
            cy.get('[data-cy=editor] .editor-content').children().eq(0).click();
            cy.get('[data-cy=editor-property]').should('be.visible');
        })
    })

    it("should modify the block", () => {
        cy.readFile('id.txt').then((id) => {
            cy.visit(`/en/editor/${id}`);

            cy.get('[data-cy=editor] .editor-content').children().should('have.length', 1);
            cy.get('[data-cy=editor] .editor-content').children().eq(0).click();

            cy.get('[data-cy=editor] .editor-content').children().eq(0).invoke('css', 'left').then((left) => {
                cy.get('[data-cy=editor-property] [name=base-position-x]').clear().type('100');

                cy.get('[data-cy=editor] .editor-content').children().eq(0).invoke('css', 'left').should('not.equal', left);
            });
        })
    })

    after(() => {
        cy.clearMaterials();
    })
});
