const Role = require('./role.model');

const defaultRoles = [
  { name: 'ADMIN', description: 'Administrador general' },
  { name: 'GERENTE', description: 'Gerencia de operación' },
  { name: 'VENTAS', description: 'Equipo de ventas' },
  { name: 'COMPRAS', description: 'Equipo de compras' },
  { name: 'ALMACEN', description: 'Gestión de inventario' },
  { name: 'FINANZAS', description: 'Finanzas y pagos' },
  { name: 'RRHH', description: 'Recursos humanos' },
  { name: 'EMPLEADO', description: 'Empleado base' },
];

const seedRoles = async () => {
  for (const role of defaultRoles) {
    await Role.findOneAndUpdate(
      { name: role.name },
      { $set: role },
      { upsert: true, new: true }
    );
  }
};

module.exports = { seedRoles, defaultRoles };
