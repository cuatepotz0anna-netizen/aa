const Customer = require('./customer.model');

const listCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find({
      createdBy: req.user._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        customers,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        customer,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const { name, phone = '', email = '', notes = '' } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required',
      });
    }

    const customer = await Customer.create({
      name: name.trim(),
      phone: String(phone || '').trim(),
      email: String(email || '').trim().toLowerCase(),
      notes: String(notes || '').trim(),
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: {
        customer,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    const { name, phone, email, notes } = req.body || {};

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({
          success: false,
          message: 'Customer name cannot be empty',
        });
      }

      customer.name = String(name).trim();
    }

    if (phone !== undefined) {
      customer.phone = String(phone || '').trim();
    }

    if (email !== undefined) {
      customer.email = String(email || '').trim().toLowerCase();
    }

    if (notes !== undefined) {
      customer.notes = String(notes || '').trim();
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: {
        customer,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    customer.isActive = false;
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
const seedDemoCustomers = async (req, res, next) => {
  try {
    const existingCount = await Customer.countDocuments({
      createdBy: req.user._id,
      isActive: true,
    });

    const missingCount = Math.max(0, 250 - existingCount);

    if (missingCount === 0) {
        return res.status(200).json({
            success: true,
            message: 'Ya existen 250 clientes o más para este usuario.',
            data: {
                count: 0,
                total: existingCount,
            },
        });
    }

    const firstNames = [
      'Ana', 'Luis', 'María', 'Carlos', 'Sofía',
      'Jorge', 'Fernanda', 'Miguel', 'Daniela', 'Ricardo',
      'Valeria', 'Andrés', 'Paola', 'Diego', 'Camila',
      'Raúl', 'Lucía', 'Héctor', 'Elena', 'Arturo',
    ];

    const lastNames = [
      'García', 'Hernández', 'Martínez', 'López', 'González',
      'Pérez', 'Rodríguez', 'Sánchez', 'Ramírez', 'Torres',
      'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz',
      'Morales', 'Ortiz', 'Reyes', 'Castillo', 'Vargas',
    ];

    const customers = Array.from({ length: missingCount }, (_, index) => {
      const firstName = firstNames[index % firstNames.length];
      const lastName = lastNames[index % lastNames.length];

      return {
        name: `${firstName} ${lastName} ${index + 1}`,
        phone: `246${String(1000000 + index).slice(-7)}`,
        email: `cliente${index + 1}@fotominerva.test`,
        notes: `Cliente demo ${index + 1} para pruebas de Foto Minerva`,
        createdBy: req.user._id,
        isActive: true,
      };
    });

    const created = await Customer.insertMany(customers);

    return res.status(201).json({
      success: true,
      message: 'Clientes demo creados correctamente',
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
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  seedDemoCustomers,
};