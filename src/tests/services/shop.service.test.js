const chai = require("chai");
const sinon = require("sinon");
const expect = chai.expect;
const mongoose = require("mongoose");
const produitService = require("../../services/shop.service")();
const Produit = require("../../models/product.model");
const ValidationError = require("../../errors/ValidationError");

describe("ProduitService", function () {
  // Test de la méthode "findAll"
  describe("findAll", function () {
    it("devrait trouver tous les produits en fonction des critères, de la pagination et du tri", async function () {
      const criteria = { category: "criteria" };
      const options = {
        page: 1,
        itemsPerPage: 10,
        order: { createdAt: "desc" },
      };
      const produits = [
        { _id: "1", name: "kit étoile"},
        { _id: "2", name: "kit galaxie"},
      ];

      // Stub pour simuler l'appel à la méthode "find" du modèle Produit
      const findStub = sinon.stub(Produit, "find");
      findStub.returns({
        limit: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        sort: sinon.stub().returns(produits),
      });

      // Appel de la méthode à tester
      const result = await produitService.findAll(criteria, options);

      // Vérification des résultats
      expect(result).to.deep.eql(produits);

      // Restauration du stub pour le test suivant
      findStub.restore();
    });
  });

  // Test de la méthode "create"
  describe("create", function () {
    it("devrait créer un nouveau produit", async function () {
      const data = { name: "kit galaxie"};
      const createdProduit = { _id: "1", ...data };

      // Mock pour simuler l'appel à la méthode "create" du modèle Produit
      const ProduitMock = sinon.mock(Produit);
      ProduitMock.expects("create").withArgs(data).resolves(createdProduit);

      // Appel de la méthode à tester
      const result = await produitService.create(data);

      // Vérification des résultats
      expect(result).to.deep.eql(createdProduit);

      // Vérification des appels de méthode simulés
      ProduitMock.verify();
    });
  });

  // Test de la méthode "findOne"
  describe("findOne", function () {
    it("devrait trouver un produit en fonction des critères", async function () {
      const criteria = { category: "electronics" };
      const produit = { _id: "1", name: "kit étoile"};

      // Mock pour simuler l'appel à la méthode "findOne" du modèle Produit
      const ProduitMock = sinon.mock(Produit);
      ProduitMock.expects("findOne").withArgs(criteria).resolves(produit);

      // Appel de la méthode à tester
      const result = await produitService.findOne(criteria);

      // Vérification des résultats
      expect(result).to.deep.eql(produit);

      // Vérification des appels de méthode simulés
      ProduitMock.verify();
    });
  });

  // Test de la méthode "findOneById"
  describe("findOneById", function () {
    it("devrait trouver un produit en fonction de son ID", async function () {
      const id = "1";
      const produit = { _id: id, name: "kit étoile"};

      // Mock pour simuler l'appel à la méthode "findById" du modèle Produit
      const ProduitMock = sinon.mock(Produit);
      ProduitMock.expects("findById").withArgs(id).resolves(produit);

      // Appel de la méthode à tester
      const result = await produitService.findOneById(id);

      // Vérification des résultats
      expect(result).to.deep.eql(produit);

      // Vérification des appels de méthode simulés
      ProduitMock.verify();
    });
  });

  // Test de la méthode "findOneByName"
  describe("findOneByName", function () {
    it("devrait trouver un produit en fonction de son nom", async function () {
      const name = "kit étoile";
      const produit = { _id: "1", name: name};

      // Mock pour simuler l'appel à la méthode "findOne" du modèle Produit
      const ProduitMock = sinon.mock(Produit);
      ProduitMock.expects("findOne").withArgs({ name: name }).resolves(produit);

      // Appel de la méthode à tester
      const result = await produitService.findOneByName({ name: name });

      // Vérification des résultats
      expect(result).to.deep.eql(produit);

      // Vérification des appels de méthode simulés
      ProduitMock.verify();
    });
  });

  // Test de la méthode "deleteOne"
  describe("deleteOne", function () {
    it("devrait supprimer un produit en fonction de son ID", async function () {
      const id = "1";

      // Stub pour simuler l'appel à la méthode "deleteOne" du modèle Produit
      const deleteStub = sinon.stub(Produit, "deleteOne");
      deleteStub.withArgs({ _id: id }).resolves(true);

      // Appel de la méthode à tester
      const result = await produitService.deleteOne(id);

      // Vérification des résultats
      expect(result).to.be.true;

      // Restauration du stub pour le test suivant
      deleteStub.restore();
    });
  });
});
