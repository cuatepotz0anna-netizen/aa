const Print = require('./print.model');
const Order = require('../orders/order.model');

const listPrints = async (req, res, next) => {
  try {
    const prints = await Print.find({
      createdBy: req.user._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        prints,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPrint = async (req, res, next) => {
  try {
    const print = await Print.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true,
    });

    if (!print) {
      return res.status(404).json({
        success: false,
        message: 'Print not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        print,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createPrint = async (req, res, next) => {
  try {
    const {
      customer,
      order,
      format,
      size,
      quantity = 1,
      finish,
      date,
      status = 'Pendiente',
    } = req.body || {};

    if (!customer || !order || !format || !size || !finish || !date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required print fields',
      });
    }

    const print = await Print.create({
      customer: String(customer).trim(),
      order: String(order).trim(),
      format,
      size: String(size).trim(),
      quantity: Number(quantity || 1),
      finish: String(finish).trim(),
      date: String(date).trim(),
      status,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Print created successfully',
      data: {
        print,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updatePrint = async (req, res, next) => {
  try {
    const print = await Print.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true,
    });

    if (!print) {
      return res.status(404).json({
        success: false,
        message: 'Print not found',
      });
    }

    const {
      customer,
      order,
      format,
      size,
      quantity,
      finish,
      date,
      status,
    } = req.body || {};

    if (customer !== undefined) print.customer = String(customer).trim();
    if (order !== undefined) print.order = String(order).trim();
    if (format !== undefined) print.format = format;
    if (size !== undefined) print.size = String(size).trim();
    if (quantity !== undefined) print.quantity = Number(quantity || 1);
    if (finish !== undefined) print.finish = String(finish).trim();
    if (date !== undefined) print.date = String(date).trim();
    if (status !== undefined) print.status = status;

    await print.save();

    return res.status(200).json({
      success: true,
      message: 'Print updated successfully',
      data: {
        print,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deletePrint = async (req, res, next) => {
  try {
    const print = await Print.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true,
    });

    if (!print) {
      return res.status(404).json({
        success: false,
        message: 'Print not found',
      });
    }

    print.isActive = false;
    await print.save();

    return res.status(200).json({
      success: true,
      message: 'Print deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const seedDemoPrints = async (req, res, next) => {
  try {
    const existingCount = await Print.countDocuments({
      createdBy: req.user._id,
      isActive: true,
    });

    const missingCount = Math.max(0, 100 - existingCount);

    if (missingCount === 0) {
      return res.status(200).json({
        success: true,
        message: 'Ya existen 100 impresiones o más para este usuario.',
        data: {
          count: 0,
          total: existingCount,
        },
      });
    }

    const orders = await Order.find({
      createdBy: req.user._id,
      isActive: true,
    })
      .select('number customer date')
      .lean();

    if (!orders.length) {
      return res.status(400).json({
        success: false,
        message: 'No hay pedidos disponibles para generar impresiones demo.',
      });
    }

    const formats = [
      'Infantil',
      'Óvalo',
      'Mignon',
      'Otro tamaño',
    ];

    const sizes = [
      '5x7',
      '6x8',
      '8x10',
      '10x12',
      '11x14',
      '13x18',
    ];

    const finishes = [
      'Mate',
      'Brillante',
      'Satinado',
      'Texturizado',
    ];

    const statuses = [
      'Pendiente',
      'En producción',
      'Revisión',
      'Lista',
      'Entregada',
    ];

    const prints = Array.from({ length: missingCount }, (_, index) => {
      const order = orders[index % orders.length];

      return {
        customer: order.customer,
        order: order.number,
        format: formats[index % formats.length],
        size: sizes[index % sizes.length],
        quantity: 1 + (index % 8),
        finish: finishes[index % finishes.length],
        date: order.date,
        status: statuses[index % statuses.length],
        createdBy: req.user._id,
        isActive: true,
      };
    });

    const created = await Print.insertMany(prints);

    return res.status(201).json({
      success: true,
      message: 'Impresiones demo creadas correctamente',
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
  listPrints,
  getPrint,
  createPrint,
  updatePrint,
  deletePrint,
  seedDemoPrints,
};