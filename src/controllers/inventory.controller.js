module.exports = (Service, options = {}) => {
  return {
      // Méthode pour récupérer tous les items en fonction des critères de recherche, de pagination, etc.
      async getAll(req, res) {
        const {
          _page = 1,
          _itemsPerPage = 30,
          _sort = {}, // Tri des résultats (_sort[id]=ASC&_sort[name]=DESC)
          ...criteria
        } = req.query;
  
        const items = await Service.findAll(criteria, {
          itemsPerPage: _itemsPerPage,
          page: _page,
          order: _sort,
        });
  
        res.json(items);
      },
  
      // Méthode pour créer un nouveau produit
      async create(req, res, next) {
        const { item, userId } = req.body;
        if (!item || !userId) {
          return res.status(400).json({ error: 'Veuillez fournir un name et un price pour le produit.' });
        }
        try {
          const inventory = await Service.create({item, userId});
          res.status(201).json(inventory);
        } catch (error) {
          next(error);
        }
      },
  
      // Méthode pour récupérer un produit par son ID
      async getOne(req, res) {
        const items = await Service.findOne(req.params.id);
        if (!items) {
          res.sendStatus(404);
        } else {
          res.json(items);
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
        if(!deleted){
          res.sendStatus(404);
        } else {
          res.sendStatus(204)
        }
      },
    };
  };
  