/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

// @ts-ignore
Cypress.Commands.add('login', () => {
    cy.request({
        method: 'POST',
        url: 'http://127.0.0.1:2020/authentication/in',
        form: true,
        body: {
            email: "cypress@cajthaml.eu",
            password: "testtest",
            type: "EMAIL_PASSWORD",
            // username: Cypress.env('username'),
            // password: Cypress.env('password'),
        },
    }).then((response) => {
        window.localStorage.setItem('token', response.body.token);
    });
})

// @ts-ignore
Cypress.Commands.add('acceptCookies', () => {
    cy.get("[data-cy=cookies-accept]").click();
});

// @ts-ignore
Cypress.Commands.add('clearMaterials', () => {
    const headers = {
        "Authorization": `Bearer ${window.localStorage.getItem('token')}`
    };
    const userId = JSON.parse(atob(window.localStorage.getItem('token')?.split('.')[1])).id ?? '';

    cy.request({
        method: 'GET',
        url: `http://127.0.0.1:2020/user/${userId}/material`,
        headers: headers,
    }).then((response) => {
        const materialsIds = response.body.materials.map((m: any) => m.id);

        for (const id of materialsIds) {
            cy.request({
                method: 'DELETE',
                url: `http://127.0.0.1:2020/material/${id}`,
                headers: headers,
            });
        }
    });
})
