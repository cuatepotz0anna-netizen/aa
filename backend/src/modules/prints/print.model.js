const mongoose = require('mongoose');

const printSchema = new mongoose.Schema(
  {
    customer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    order: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    format: {
      type: String,
      required: true,
      enum: [
        'Infantil',
        'Óvalo',
        'Mignon',
        'Otro tamaño',
      ],
    },
    size: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    finish: {
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
    status: {
      type: String,
      enum: [
        'Pendiente',
        'En producción',
        'Revisión',
        'Lista',
        'Entregada',
      ],
      default: 'Pendiente',
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

printSchema.index({ createdBy: 1, customer: 1 });
printSchema.index({ createdBy: 1, order: 1 });
printSchema.index({ createdBy: 1, status: 1 });
printSchema.index({ createdBy: 1, date: 1 });

module.exports = mongoose.model('Print', printSchema);