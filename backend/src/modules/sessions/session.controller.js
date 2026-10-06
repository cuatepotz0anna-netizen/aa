const StudioSession = require('./session.model');
const Customer = require('../customers/customer.model');

const listSessions = async (req, res, next) => {
  try {
    const sessions = await StudioSession.find({
      createdBy: req.user._id,
      isActive: true,
    }).sort({ date: 1, time: 1 });

    return res.status(200).json({
      success: true,
      data: {
        sessions,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getSession = async (req, res, next) => {
  try {
    const session = await StudioSession.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        session,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createSession = async (req, res, next) => {
  try {
    const {
      customer,
      date,
      time,
      type,
      responsible,
      location,
      status = 'Pendiente',
      notes = '',
    } = req.body || {};

    if (!customer || !date || !time || !type || !responsible || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required session fields',
      });
    }

    const session = await StudioSession.create({
      customer: String(customer).trim(),
      date: String(date).trim(),
      time: String(time).trim(),
      type: String(type).trim(),
      responsible: String(responsible).trim(),
      location: String(location).trim(),
      status,
      notes: String(notes || '').trim(),
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: {
        session,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateSession = async (req, res, next) => {
  try {
    const session = await StudioSession.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    const {
      customer,
      date,
      time,
      type,
      responsible,
      location,
      status,
      notes,
    } = req.body || {};

    if (customer !== undefined) session.customer = String(customer).trim();
    if (date !== undefined) session.date = String(date).trim();
    if (time !== undefined) session.time = String(time).trim();
    if (type !== undefined) session.type = String(type).trim();
    if (responsible !== undefined) session.responsible = String(responsible).trim();
    if (location !== undefined) session.location = String(location).trim();
    if (status !== undefined) session.status = status;
    if (notes !== undefined) session.notes = String(notes || '').trim();

    await session.save();

    return res.status(200).json({
      success: true,
      message: 'Session updated successfully',
      data: {
        session,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteSession = async (req, res, next) => {
  try {
    const session = await StudioSession.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    session.isActive = false;
    await session.save();

    return res.status(200).json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const seedDemoSessions = async (req, res, next) => {
  try {
    const existingCount = await StudioSession.countDocuments({
      createdBy: req.user._id,
      isActive: true,
    });

    const missingCount = Math.max(0, 150 - existingCount);

    if (missingCount === 0) {
      return res.status(200).json({
        success: true,
        message: 'Ya existen 150 sesiones o más para este usuario.',
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
        message: 'No hay clientes disponibles para generar sesiones demo.',
      });
    }

    const types = [
      'Retrato individual',
      'Sesión familiar',
      'Infantil',
      'Graduación',
      'Pareja',
      'Cumpleaños',
      'Producto',
      'Identificación',
    ];

    const responsibles = [
      'Ana',
      'Carlos',
      'Mariana',
      'Luis',
    ];

    const locations = [
      'Estudio principal',
      'Área de retrato',
      'Set infantil',
      'Exterior',
      'Domicilio del cliente',
    ];

    const statuses = [
      'Pendiente',
      'Confirmada',
      'En preparación',
      'Realizada',
      'Cancelada',
    ];

    const baseDate = new Date();

    const sessions = Array.from({ length: missingCount }, (_, index) => {
      const customer = customers[index % customers.length];

      const sessionDate = new Date(baseDate);
      sessionDate.setDate(baseDate.getDate() + ((index % 90) - 30));

      const date = [
        sessionDate.getFullYear(),
        String(sessionDate.getMonth() + 1).padStart(2, '0'),
        String(sessionDate.getDate()).padStart(2, '0'),
      ].join('-');

      const hour = 9 + (index % 9);
      const minute = index % 2 === 0 ? '00' : '30';

      return {
        customer: customer.name,
        date,
        time: `${String(hour).padStart(2, '0')}:${minute}`,
        type: types[index % types.length],
        responsible: responsibles[index % responsibles.length],
        location: locations[index % locations.length],
        status: statuses[index % statuses.length],
        notes: `Sesión demo ${existingCount + index + 1} para pruebas de Foto Minerva`,
        createdBy: req.user._id,
        isActive: true,
      };
    });

    const created = await StudioSession.insertMany(sessions);

    return res.status(201).json({
      success: true,
      message: 'Sesiones demo creadas correctamente',
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
  listSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  seedDemoSessions,
};