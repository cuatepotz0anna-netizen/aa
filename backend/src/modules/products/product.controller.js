const Product = require('./product.model');

const listProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      createdBy: req.user._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      category,
      description = '',
      price = 0,
      stock = 0,
      availability = 'Disponible',
    } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required',
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Product category is required',
      });
    }

    const product = await Product.create({
      name: String(name).trim(),
      category,
      description: String(description || '').trim(),
      price: Number(price || 0),
      stock: Number(stock || 0),
      availability,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const {
      name,
      category,
      description,
      price,
      stock,
      availability,
    } = req.body || {};

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({
          success: false,
          message: 'Product name cannot be empty',
        });
      }

      product.name = String(name).trim();
    }

    if (category !== undefined) {
      product.category = category;
    }

    if (description !== undefined) {
      product.description = String(description || '').trim();
    }

    if (price !== undefined) {
      product.price = Number(price || 0);
    }

    if (stock !== undefined) {
      product.stock = Number(stock || 0);
    }

    if (availability !== undefined) {
      product.availability = availability;
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    product.isActive = false;
    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const seedDemoProducts = async (req, res, next) => {
  try {
    const existingCount = await Product.countDocuments({
      createdBy: req.user._id,
      isActive: true,
    });

    const missingCount = Math.max(0, 100 - existingCount);

    if (missingCount === 0) {
      return res.status(200).json({
        success: true,
        message: 'Ya existen 100 productos o más para este usuario.',
        data: {
          count: 0,
          total: existingCount,
        },
      });
    }

    const categories = [
      'Álbumes',
      'Marcos',
      'Artículos fotográficos',
      'Impresiones',
      'Otros',
    ];

    const products = Array.from({ length: missingCount }, (_, index) => {
      const number = existingCount + index + 1;
      const category = categories[index % categories.length];

      return {
        name: `Producto Foto Minerva ${number}`,
        category,
        description: `Producto demo ${number} para pruebas de Foto Minerva`,
        price: 50 + ((index % 20) * 25),
        stock: 1 + (index % 30),
        availability: index % 8 === 0 ? 'No disponible' : 'Disponible',
        createdBy: req.user._id,
        isActive: true,
      };
    });

    const created = await Product.insertMany(products);

    return res.status(201).json({
      success: true,
      message: 'Productos demo creados correctamente',
      data: {
        count: created.length,
        total: existingCount + created.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  seedDemoProducts,
};