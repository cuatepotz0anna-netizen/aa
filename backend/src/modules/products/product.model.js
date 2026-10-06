const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Álbumes',
        'Marcos',
        'Artículos fotográficos',
        'Impresiones',
        'Otros',
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1200,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    availability: {
      type: String,
      enum: ['Disponible', 'No disponible'],
      default: 'Disponible',
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

productSchema.index({ createdBy: 1, name: 1 });
productSchema.index({ createdBy: 1, category: 1 });
productSchema.index({ createdBy: 1, availability: 1 });

module.exports = mongoose.model('Product', productSchema);