const Order = require('./order.model');
const Customer = require('../customers/customer.model');
const StudioSession = require('../sessions/session.model');

const listOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      createdBy: req.user._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        orders,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const {
      number,
      date,
      customer,
      items,
      productCount = 0,
      total = 0,
      prints = '',
      session = '',
      status = 'En revisión',
    } = req.body || {};

    if (!date || !customer || !items) {
      return res.status(400).json({
        success: false,
        message: 'Missing required order fields',
      });
    }

    const orderNumber =
      number && String(number).trim()
        ? String(number).trim()
        : `FM-${String(Date.now()).slice(-6)}`;

    const order = await Order.create({
      number: orderNumber,
      date: String(date).trim(),
      customer: String(customer).trim(),
      items: String(items).trim(),
      productCount: Number(productCount || 0),
      total: Number(total || 0),
      prints: String(prints || '').trim(),
      session: String(session || '').trim(),
      status,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const {
      number,
      date,
      customer,
      items,
      productCount,
      total,
      prints,
      session,
      status,
    } = req.body || {};

    if (number !== undefined) order.number = String(number).trim();
    if (date !== undefined) order.date = String(date).trim();
    if (customer !== undefined) order.customer = String(customer).trim();
    if (items !== undefined) order.items = String(items).trim();
    if (productCount !== undefined) order.productCount = Number(productCount || 0);
    if (total !== undefined) order.total = Number(total || 0);
    if (prints !== undefined) order.prints = String(prints || '').trim();
    if (session !== undefined) order.session = String(session || '').trim();
    if (status !== undefined) order.status = status;

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.isActive = false;
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const seedDemoOrders = async (req, res, next) => {
  try {
    const existingCount = await Order.countDocuments({
      createdBy: req.user._id,
      isActive: true,
    });

    const missingCount = Math.max(0, 300 - existingCount);

    if (missingCount === 0) {
      return res.status(200).json({
        success: true,
        message: 'Ya existen 300 pedidos o más para este usuario.',
        data: {
          count: 0,
          total: existingCount,
        },
      });
    }

    const customers = await Customer.find({
      createdBy: req.user._id,
      isActive: true,
    })
      .select('name')
      .lean();

    if (!customers.length) {
      return res.status(400).json({
        success: false,
        message: 'No hay clientes disponibles para generar pedidos demo.',
      });
    }

    const sessions = await StudioSession.find({
      createdBy: req.user._id,
      isActive: true,
    })
      .select('customer date time type')
      .lean();

    const itemSets = [
      'Paquete de retratos 8x10 y 5x7',
      'Álbum fotográfico con impresiones',
      'Marco decorativo y fotografía impresa',
      'Paquete infantil con ampliaciones',
      'Fotografías para graduación',
      'Impresiones tamaño infantil y mignon',
      'Sesión familiar con paquete impreso',
      'Retrato individual con marco',
      'Paquete de identificación',
      'Impresiones fotográficas surtidas',
    ];

    const statuses = [
      'En revisión',
      'En impresión',
      'Listo para entrega',
      'Entregado',
    ];

    const baseDate = new Date();

    const orders = Array.from({ length: missingCount }, (_, index) => {
      const customer = customers[index % customers.length];
      const relatedSession = sessions.find(
        (item) => item.customer === customer.name
      );

      const orderDate = new Date(baseDate);
      orderDate.setDate(baseDate.getDate() - (index % 120));

      const date = [
        orderDate.getFullYear(),
        String(orderDate.getMonth() + 1).padStart(2, '0'),
        String(orderDate.getDate()).padStart(2, '0'),
      ].join('-');

      const productCount = 1 + (index % 6);
      const unitValue = 120 + ((index % 10) * 45);
      const total = productCount * unitValue;

      return {
        number: `FM-${String(existingCount + index + 1).padStart(5, '0')}`,
        date,
        customer: customer.name,
        items: itemSets[index % itemSets.length],
        productCount,
        total,
        prints: index % 3 === 0
          ? 'Impresiones asociadas pendientes'
          : '',
        session: relatedSession
          ? `${relatedSession.type} - ${relatedSession.date} ${relatedSession.time}`
          : '',
        status: statuses[index % statuses.length],
        createdBy: req.user._id,
        isActive: true,
      };
    });

    const created = await Order.insertMany(orders);

    return res.status(201).json({
      success: true,
      message: 'Pedidos demo creados correctamente',
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
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  seedDemoOrders,
};