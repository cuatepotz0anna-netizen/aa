const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    customer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    items: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    productCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    prints: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    session: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'En revisión',
        'En impresión',
        'Listo para entrega',
        'Entregado',
      ],
      default: 'En revisión',
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

orderSchema.index({ createdBy: 1, number: 1 });
orderSchema.index({ createdBy: 1, customer: 1 });
orderSchema.index({ createdBy: 1, status: 1 });
orderSchema.index({ createdBy: 1, date: 1 });

module.exports = mongoose.model('Order', orderSchema);