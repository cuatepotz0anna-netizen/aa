const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    checkIn: {
      type: String,
      trim: true,
      default: '',
    },
    checkOut: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'Presente',
        'Pendiente de salida',
        'Jornada completada',
        'Ausencia',
      ],
      default: 'Presente',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ createdBy: 1, date: 1 });
attendanceSchema.index({ createdBy: 1, employee: 1 });
attendanceSchema.index({ createdBy: 1, status: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);