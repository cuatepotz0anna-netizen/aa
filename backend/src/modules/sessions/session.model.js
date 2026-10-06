const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    customer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    responsible: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    status: {
      type: String,
      enum: [
        'Pendiente',
        'Confirmada',
        'En preparación',
        'Realizada',
        'Cancelada',
      ],
      default: 'Pendiente',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1200,
      default: '',
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

sessionSchema.index({ createdBy: 1, date: 1 });
sessionSchema.index({ createdBy: 1, customer: 1 });
sessionSchema.index({ createdBy: 1, status: 1 });

module.exports = mongoose.model('StudioSession', sessionSchema);