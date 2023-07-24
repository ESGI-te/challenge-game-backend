module.exports = (Products, options = {}) => {
    return {
      // Méthode pour récupérer tous les produits en fonction des critères de recherche, de pagination, etc.
      async getAll(req, res) {
        const {
          _page = 1,
          _itemsPerPage = 30,
          _sort = {}, // Tri des résultats (_sort[id]=ASC&_sort[name]=DESC)
          ...criteria
        } = req.query;
  
        const produits = await Products.findAll(criteria, {
          itemsPerPage: _itemsPerPage,
          page: _page,
          order: _sort,
        });
  
        res.json(produits);
      },
  
      // Méthode pour créer un nouveau produit
      async create(req, res, next) {
        const { name, price } = req.body;
        if (!name || !price) {
          return res.status(400).json({ error: 'Veuillez fournir un nom et un prix pour le produit.' });
        }
        try {
          const produit = await Products.create({ name, price });
          res.status(201).json(produit);
        } catch (error) {
          next(error);
        }
      },
  
      // Méthode pour récupérer un produit par son ID
      async getOne(req, res) {
        const produit = await Products.findOne(req.params.id);
  
        if (!produit) {
          res.sendStatus(404);
        } else {
          res.json(produit);
        }
      },
  
      // Méthode pour remplacer entièrement un produit existant par un nouveau
      async replace(req, res, next) {
        const productId = parseInt(req.params.id);
        const { name, price } = req.body;
        if (!name || !price) {
          return res.status(400).json({ error: 'Veuillez fournir un nom et un prix pour le produit.' });
        }
        const productIndex = products.findIndex(product => product.id === productId);
        if (productIndex === -1) {
          return res.status(404).json({ error: 'Produit non trouvé.' });
        }
        const updatedProduct = { id: productId, name, price };
        products[productIndex] = updatedProduct;
        res.json(updatedProduct);
      },
  
      // Méthode pour mettre à jour un produit existant
      async update(req, res, next) {
        try {
          const produit = await Products.updateOne(req.params.id, req.body);
  
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
        const productId = parseInt(req.params.id);
        const productIndex = products.findIndex(product => product.id === productId);
        if (productIndex === -1) {
          return res.status(404).json({ error: 'Produit non trouvé.' });
        }
      
        products.splice(productIndex, 1);
        res.json({ message: 'Produit supprimé avec succès.' });
        // const deleted = await Products.deleteOne(req.params.id);
  
        // if (!deleted) {
        //   res.sendStatus(404);
        // } else {
        //   res.sendStatus(204);
        // }
      },
    };
  };
  