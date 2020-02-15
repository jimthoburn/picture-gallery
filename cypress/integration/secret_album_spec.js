
describe("Secret albums", function() {

  it(`ask search engines not to index them`, function() {
    cy.visit(Cypress.config("testSecretAlbumURL"));

    // cy.get(`meta[name="robots"]`).have.attr("content", "noindex");

    cy.get(`meta[name="robots"]`).should(($el) => {
      expect($el).to.have.attr("content", "noindex");
    });
  });

  it(`are not listed on the home page`, function() {
    cy.visit("/");

    cy.get(`a[href*="${Cypress.config("testSecretAlbumURL")}"]`).should('not.exist');
  });
  
});
