/* globals cy */

describe("Test App", () => {
  it("launches", () => {
    cy.visit("/");
  });

  it("opens with home request CTA", () => {
    cy.visit("/");
    cy.get("[data-cy=request-cta]").should("contain", "Need help at home?");
  });
});
