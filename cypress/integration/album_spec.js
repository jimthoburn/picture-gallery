
describe("Album", function() {

  it("successfully loads", function() {

    cy.visit(Cypress.config("testAlbumURL"));

    cy.get(".picture-list ol li:nth-child(1) a").click();
    cy.url().should("include", Cypress.config("testPictureURL"));
  });
  
});
