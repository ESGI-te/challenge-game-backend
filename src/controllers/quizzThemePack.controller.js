module.exports = (Service, options = {}) => {
    return {
      async getAll(req, res) {
        const {
          _page = 1,
          _itemsPerPage = 30,
          // _sort[id]=ASC&_sort[name]=DESC
          _sort = {},
          ...criteria
        } = req.query;
  
        const themePacks = await Service.findAll(criteria, {
          itemsPerPage: _itemsPerPage,
          page: _page,
          order: _sort,
        });
        res.json(themePacks);
      },
      async create(req, res, next) {
        try {
          const themePack = await Service.create(req.body);
          res.status(201).json(themePack);
        } catch (error) {
          next(error);
        }
      },
      async getOne(req, res) {
        const themePack = await Service.findOneById(req.params.id);
        if (!themePack) {
          res.sendStatus(404);
        } else {
          res.json(themePack);
        }
      },
      async update(req, res, next) {
        try {
          const themePack = await Service.updateOne(req.params.id, req.body);
          if (!themePack) {
            res.sendStatus(404);
          } else res.json(themePack);
        } catch (error) {
          next(error);
        }
      },
      async delete(req, res) {
        const deleted = await Service.deleteOne(req.params.id);
        if (!deleted) {
          res.sendStatus(404);
        } else res.sendStatus(204);
      },
    };
  };
  