
describe("Open graph images, based on “host” specified in “_config.js”", function() {

  it("are available on the home page", function() {
    cy.visit("/");

    cy.get(`meta[property="og:image"]`).should(($el) => {
  
      // og:image must be an absolute URL and start with “http”
      expect($el).to.have.attr("content").match(/^http/);
    });
  });

  it("are available on album pages", function() {
    cy.visit(Cypress.config("testAlbumURL"));

    cy.get(`meta[property="og:image"]`).should(($el) => {
  
      // og:image must be an absolute URL and start with “http”
      expect($el).to.have.attr("content").match(/^http/);
    });
  });
  
});
