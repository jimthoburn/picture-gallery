
describe("Group Album", function() {

  it("successfully loads", function() {

    cy.visit(Cypress.config("testGroupAlbumURL"));

    cy.contains(Cypress.config("testGroupAlbumChildName")).click();

    // Should be on a new URL which includes "/i/"
    cy.url().should("include", Cypress.config("testGroupAlbumChildURL"));

    cy.get(`a[href*="${Cypress.config("testGroupAlbumPictureURL")}"]`).click();
    cy.url().should("include", Cypress.config("testGroupAlbumPictureURL"));
  });
  
});
