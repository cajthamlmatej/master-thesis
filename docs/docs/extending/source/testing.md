# Testing

This document explains how to test the application and write new tests for both the client and server parts.

---

## Client Testing

The client uses [Cypress](https://www.cypress.io/) for end-to-end testing. Cypress tests are located in the `client\cypress\e2e` directory.

Testing client needs the client and server to be running using the development docker-compose setup.

### Running Tests

Running:
```bash
npx cypress open
```

This will open the Cypress Test Runner, where you can select and run tests.

To run tests in headless mode:
```bash
npx cypress run
```

### Writing New Tests

1. Create a new test file in the appropriate directory under `e2e`. For example:
   ```
   client\cypress\e2e\new-feature\test.cy.js
   ```

2. Use existing commands or add custom commands in `cypress/support/commands.ts` to simplify test logic.

3. Example test structure:
   ```js
   describe('Feature Name', () => {
       beforeEach(() => {
           cy.login();
           cy.visit('/');
           cy.acceptCookies();
       });

       it('should perform some action', () => {
           cy.get('[data-cy=some-element]').click();
           cy.url().should('include', '/expected-path');
       });
   });
   ```

4. Use `cy.clearMaterials()` or other utility commands as needed to clean up test data.

---

## Server Testing

The server uses [Jest](https://jestjs.io/) and [NestJS Testing Utilities](https://docs.nestjs.com/fundamentals/testing) for unit and integration testing. Tests are located in the `e:\projekty\masterthesis\server\test` directory.

### Running Tests

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run all tests:
   ```bash
   npm test
   ```

3. Run tests with coverage:
   ```bash
   npm run test:cov
   ```

4. Run specific tests:
   ```bash
   npm test -- <test-file-name>
   ```

### Writing New Tests

1. Create a new test file in the `test` directory. For example:
   ```
   \server\test\new-feature.spec.ts
   ```

2. Use the `TestingModule` from NestJS to set up the application context.

3. Example test structure:
   ```typescript
   import { Test, TestingModule } from '@nestjs/testing';
   import { AppService } from '../src/app.service';

   describe('AppService', () => {
       let service: AppService;

       beforeEach(async () => {
           const module: TestingModule = await Test.createTestingModule({
               providers: [AppService],
           }).compile();

           service = module.get<AppService>(AppService);
       });

       it('should return expected result', () => {
           expect(service.someMethod()).toEqual('expected result');
       });
   });
   ```

4. Use mocks and spies to isolate units of code and test specific behaviors.

---

## Best Practices

- Write clear and descriptive test cases.
- Use meaningful `describe` and `it` blocks to organize tests.
- Clean up test data after each test to ensure isolation.
- Use environment variables or mock data for sensitive information.
- Run tests frequently to catch issues early.

For more details, refer to the official documentation for [Cypress](https://docs.cypress.io/) and [Jest](https://jestjs.io/docs/getting-started).

