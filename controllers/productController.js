const { Product, ProductInfo } = require("../models/models");
const ApiError = require("../error/ApiError");
const uuid = require("uuid");
const path = require("path");

class ProductController {
  async create(req, res, next) {
    try {
      let { name, price, brandId, typeId, info } = req.body;
      const { img } = req.files;
      let fileName = uuid.v4() + ".jpg";
      img.mv(path.resolve(__dirname, "..", "static", fileName));
      const newProduct = await Product.create({
        name,
        price,
        brandId,
        typeId,
        img: fileName,
      });

      if (info) {
        info = JSON.parse(info);
        info.forEach((el) =>
          ProductInfo.create({
            title: el.title,
            description: el.description,
            productId: newProduct.id,
          })
        );
      }

      return res.json(newProduct);
    } catch (e) {
      next(ApiError(e.message));
    }
  }

  async getAll(req, res) {
    let { brandId, typeId, limit, page } = req.query;
    let products;
    page = page || 1;
    limit = limit || 9;
    let offset = page * limit - limit;

    if (!brandId && !typeId) {
      products = await Product.findAndCountAll({ limit, offset });
    }

    if (brandId && !typeId) {
      products = await Product.findAndCountAll({
        where: { brandId },
        limit,
        offset,
      });
    }

    if (!brandId && typeId) {
      products = await Product.findAndCountAll({
        where: { typeId },
        limit,
        offset,
      });
    }

    if (brandId && typeId) {
      products = await Product.findAndCountAll({
        where: { typeId, brandId },
        limit,
        offset,
      });
    }

    return res.json(products);
  }

  async getOne(req, res) {
    const { id } = req.params;
    const product = await Product.findOne({
      where: { id },
      include: [{ model: ProductInfo, as: "info" }],
    });

    return res.json(product);
  }

  async delete(req, res) {
    const { id } = req.params;
    const product = await Product.destroy({ where: { id } });

    return res.json(`Product #-${id} deleted`);
  }

  async update(req, res) {
    const { name, price, type, brand } = req.body;
    const { id } = req.params;
    const product = await Product.update(
      {
        name: name,
      },
      { where: { id: id } }
    );

    return res.json("Данные успешно обновлены");
  }
}

module.exports = new ProductController();
