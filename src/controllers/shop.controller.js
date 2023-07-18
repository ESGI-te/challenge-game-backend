module.exports = (Service, options = {}) => {
    return {
      // Méthode pour récupérer tous les produits en fonction des critères de recherche, de pagination, etc.
      async getAll(req, res) {
        const {
          _page = 1,
          _itemsPerPage = 30,
          _sort = {}, // Tri des résultats (_sort[id]=ASC&_sort[name]=DESC)
          ...criteria
        } = req.query;
  
        const produits = await Service.findAll(criteria, {
          itemsPerPage: _itemsPerPage,
          page: _page,
          order: _sort,
        });
  
        res.json(produits);
      },
  
      // Méthode pour créer un nouveau produit
      async create(req, res, next) {
        try {
          const produit = await Service.create(req.body);
          res.status(201).json(produit);
        } catch (error) {
          next(error);
        }
      },
  
      // Méthode pour récupérer un produit par son ID
      async getOne(req, res) {
        const produit = await Service.findOne(req.params.id);
  
        if (!produit) {
          res.sendStatus(404);
        } else {
          res.json(produit);
        }
      },
  
      // Méthode pour remplacer entièrement un produit existant par un nouveau
      async replace(req, res, next) {
        try {
          const [produit, created] = await Service.replaceOne(req.params.id, req.body);
  
          if (!produit) {
            res.sendStatus(404);
          } else {
            res.status(created ? 201 : 200).json(produit);
          }
        } catch (error) {
          next(error);
        }
      },
  
      // Méthode pour mettre à jour un produit existant
      async update(req, res, next) {
        try {
          const produit = await Service.updateOne(req.params.id, req.body);
  
          if (!produit) {
            res.sendStatus(404);
          } else {
            res.json(produit);
          }
        } catch (error) {
          next(error);
        }
      },
  
      // Méthode pour supprimer un produit par son ID
      async delete(req, res) {
        const deleted = await Service.deleteOne(req.params.id);
  
        if (!deleted) {
          res.sendStatus(404);
        } else {
          res.sendStatus(204);
        }
      },
    };
  };
  