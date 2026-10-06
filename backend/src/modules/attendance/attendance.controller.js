const Attendance = require('./attendance.model');

const listAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.find({
      createdBy: req.user._id,
      isActive: true,
    }).sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        attendance,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        attendance,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createAttendance = async (req, res, next) => {
  try {
    const {
      employee,
      date,
      checkIn = '',
      checkOut = '',
      status = 'Presente',
    } = req.body || {};

    if (!employee || !date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required attendance fields',
      });
    }

    const attendance = await Attendance.create({
      employee: String(employee).trim(),
      date: String(date).trim(),
      checkIn: String(checkIn || '').trim(),
      checkOut: String(checkOut || '').trim(),
      status,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Attendance created successfully',
      data: {
        attendance,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    const {
      employee,
      date,
      checkIn,
      checkOut,
      status,
    } = req.body || {};

    if (employee !== undefined) {
      attendance.employee = String(employee).trim();
    }

    if (date !== undefined) {
      attendance.date = String(date).trim();
    }

    if (checkIn !== undefined) {
      attendance.checkIn = String(checkIn || '').trim();
    }

    if (checkOut !== undefined) {
      attendance.checkOut = String(checkOut || '').trim();
    }

    if (status !== undefined) {
      attendance.status = status;
    }

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      data: {
        attendance,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isActive: true,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    attendance.isActive = false;
    await attendance.save();

    return res.status(200).json({
      success: true,
      message: 'Attendance deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const seedDemoAttendance = async (req, res, next) => {
  try {
    const existingCount = await Attendance.countDocuments({
      createdBy: req.user._id,
      isActive: true,
    });

    const missingCount = Math.max(0, 100 - existingCount);

    if (missingCount === 0) {
      return res.status(200).json({
        success: true,
        message: 'Ya existen 100 registros de asistencia o más para este usuario.',
        data: {
          count: 0,
          total: existingCount,
        },
      });
    }

    const employees = [
      'Ana',
      'Carlos',
      'Mariana',
      'Luis',
      'Fernanda',
      'Jorge',
      'Paola',
      'Ricardo',
    ];

    const statuses = [
      'Presente',
      'Pendiente de salida',
      'Jornada completada',
      'Ausencia',
    ];

    const baseDate = new Date();

    const attendance = Array.from({ length: missingCount }, (_, index) => {
      const attendanceDate = new Date(baseDate);
      attendanceDate.setDate(baseDate.getDate() - (index % 45));

      const date = [
        attendanceDate.getFullYear(),
        String(attendanceDate.getMonth() + 1).padStart(2, '0'),
        String(attendanceDate.getDate()).padStart(2, '0'),
      ].join('-');

      const status = statuses[index % statuses.length];

      let checkIn = '';
      let checkOut = '';

      if (status !== 'Ausencia') {
        const inHour = 8 + (index % 2);
        checkIn = `${String(inHour).padStart(2, '0')}:00`;
      }

      if (status === 'Jornada completada') {
        const outHour = 17 + (index % 2);
        checkOut = `${String(outHour).padStart(2, '0')}:00`;
      }

      return {
        employee: employees[index % employees.length],
        date,
        checkIn,
        checkOut,
        status,
        createdBy: req.user._id,
        isActive: true,
      };
    });

    const created = await Attendance.insertMany(attendance);

    return res.status(201).json({
      success: true,
      message: 'Registros demo de asistencia creados correctamente',
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
  listAttendance,
  getAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  seedDemoAttendance,
};