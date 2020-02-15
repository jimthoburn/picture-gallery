
describe("Albums", function() {

  it("have image descriptions available in an “alt” attribute", function() {

    cy.visit(Cypress.config("testAlbumURL"));

    cy.get(`img:not([src*="data:image"])`).should(($el) => {
      expect($el).to.have.attr("alt").match(/[a-z0-9]+/);
    });

  });
  
});
