/* globals Cypress, cy */

const EMULATOR_PROJECT = "demo-servicecall";
const FIRESTORE_EMULATOR = "http://127.0.0.1:8080";

Cypress.Commands.add("resetFirestoreEmulator", () => {
  cy.request({
    method: "DELETE",
    url: `${FIRESTORE_EMULATOR}/emulator/v1/projects/${EMULATOR_PROJECT}/databases/(default)/documents`,
    failOnStatusCode: false,
  });
});
