
describe("Picture pages", function() {

  it("successfully load", function() {
    cy.visit(Cypress.config("testPictureURL"));
  });
  
});
