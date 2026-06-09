/* globals cy */

describe("Test App", () => {
  it("launches", () => {
    cy.visit("/");
  });

  it("opens with home request CTA", () => {
    cy.visit("/");
    cy.get("[data-cy=request-cta]").should("contain", "Need help at home?");
  });

  it("books a provider and posts a service request", () => {
    cy.resetFirestoreEmulator();
    cy.visit("/provider/prov-1");
    cy.contains("Jane's Electric", { timeout: 10000 }).should("be.visible");
    cy.get("[data-cy=book-provider]", { timeout: 10000 })
      .should("contain", "Book")
      .click();

    cy.url().should("include", "/request");
    cy.get("[data-cy=confirm-helper]", { timeout: 10000 }).click();
    cy.get("[data-cy=request-address]").clear().type("123 Main St, Brooklyn, NY 11201");
    cy.get("[data-cy=review-confirm]").click();
    cy.get("[data-cy=submit-request]").click();
    cy.get("[data-cy=request-success]", { timeout: 10000 }).should(
      "contain",
      "Request Posted!"
    );
  });
});
