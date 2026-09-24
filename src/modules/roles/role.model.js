const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ['ADMIN', 'GERENTE', 'VENTAS', 'COMPRAS', 'ALMACEN', 'FINANZAS', 'RRHH', 'EMPLEADO'],
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);
