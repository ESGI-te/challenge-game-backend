// Importation des bibliothèques nécessaires pour les tests
const chai = require("chai");
const sinon = require("sinon");
const expect = chai.expect;
const mongoose = require("mongoose");

// Importation du service d'inventaire à tester
const inventoryService = require("../../services/inventory.service")();

// Importation du modèle "Inventory" pour simuler les opérations de base de données
const Inventory = require("../../models/inventory.model");

// Importation de l'erreur de validation personnalisée
const ValidationError = require("../../errors/ValidationError");

// Suite de tests pour le service d'inventaire
describe("InventoryService", function () {
  
  // Tests pour la méthode "findAll"
  describe("findAll", function () {
    it("devrait trouver tous les items en fonction des critères de recherche, de la pagination et du tri", async function () {
      // Critères de recherche, pagination et tri simulés
      const criteria = { category: "electronics" };
      const options = {
        page: 1,
        itemsPerPage: 10,
        order: { createdAt: "desc" },
      };
      
      // Liste d'items simulée
      const items = [
        { _id: "1", name: "kit etoile"},
        { _id: "2", name: "kit galaxie"},
      ];

      // Simulation de la méthode "find" du modèle "Inventory" pour renvoyer les items
      const findStub = sinon.stub(Inventory, "find");
      findStub.returns({
        limit: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        sort: sinon.stub().returns(items),
      });

      // Appel de la méthode "findAll" du service d'inventaire avec les critères simulés
      const result = await inventoryService.findAll(criteria, options);

      // Vérification que le résultat correspond aux items simulés
      expect(result).to.deep.eql(items);
      
      // Restauration du stub pour ne pas affecter d'autres tests
      findStub.restore();
    });
  });

  // Tests pour la méthode "create"
  describe("create", function () {
    it("devrait créer un nouvel inventaire", async function () {
      // Données simulées pour la création d'un nouvel item
      const data = { name: "kit galaxie"};
      const createdItem = { _id: "1", ...data };

      // Simulation de la méthode "create" du modèle "Inventory" pour renvoyer l'item créé
      const InventoryMock = sinon.mock(Inventory);
      InventoryMock.expects("create").withArgs(data).resolves(createdItem);

      // Appel de la méthode "create" du service d'inventaire avec les données simulées
      const result = await inventoryService.create(data);

      // Vérification que le résultat correspond à l'item créé par la simulation
      expect(result).to.deep.eql(createdItem);
      
      // Vérification que les attentes du mock sont satisfaites
      InventoryMock.verify();
    });
  });

  // Tests pour la méthode "findOne"
  describe("findOne", function () {
    it("devrait trouver un inventaire en fonction des critères", async function () {
      // Critères de recherche simulés
      const criteria = { category: "electronics" };
      
      // Item simulé trouvé par la recherche
      const inventory = { _id: "1", name: "kit etoile"};

      // Simulation de la méthode "findById" du modèle "Inventory" pour renvoyer l'item trouvé
      const InventoryMock = sinon.mock(Inventory);
      InventoryMock.expects("findById").withArgs(criteria).resolves(inventory);

      // Appel de la méthode "findOne" du service d'inventaire avec les critères simulés
      const result = await inventoryService.findOne(criteria);

      // Vérification que le résultat correspond à l'item trouvé par la simulation
      expect(result).to.deep.eql(inventory);
      
      // Vérification que les attentes du mock sont satisfaites
      InventoryMock.verify();
    });
  });

  // Tests pour la méthode "findOneByUser"
  describe("findOneByUser", function () {
    it("devrait trouver un inventaire en fonction de l'ID de l'utilisateur", async function () {
      // ID de l'utilisateur simulé
      const userId = "12345";
      
      // Item simulé trouvé par la recherche avec l'ID de l'utilisateur
      const inventory = { _id: "1", name: "kit etoile"};

      // Simulation de la méthode "findOne" du modèle "Inventory" pour renvoyer l'item trouvé
      const InventoryMock = sinon.mock(Inventory);
      InventoryMock.expects("findOne").withArgs({ userId: userId }).resolves(inventory);

      // Appel de la méthode "findOneByUser" du service d'inventaire avec l'ID de l'utilisateur simulé
      const result = await inventoryService.findOneByUser({ userId: userId });

      // Vérification que le résultat correspond à l'item trouvé par la simulation
      expect(result).to.deep.eql(inventory);
      
      // Vérification que les attentes du mock sont satisfaites
      InventoryMock.verify();
    });
  });

  // Tests pour la méthode "deleteOne"
  describe("deleteOne", function () {
    it("devrait supprimer un inventaire en fonction de son ID", async function () {
      // ID de l'item à supprimer simulé
      const id = "1";

      // Simulation de la méthode "findByIdAndDelete" du modèle "Inventory" pour renvoyer "true" après la suppression
      const deleteStub = sinon.stub(Inventory, "findByIdAndDelete");
      deleteStub.withArgs(id).resolves(true);

      // Appel de la méthode "deleteOne" du service d'inventaire avec l'ID simulé
      const result = await inventoryService.deleteOne(id);

      // Vérification que le résultat est "true", indiquant que l'item a été correctement supprimé
      expect(result).to.be.true;
      
      // Restauration du stub pour ne pas affecter d'autres tests
      deleteStub.restore();
    });
  });
});
