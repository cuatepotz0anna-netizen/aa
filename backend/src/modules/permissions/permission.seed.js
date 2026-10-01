const Permission = require('./permission.model');

const defaultPermissions = [
  { key: 'users.read', module: 'users', description: 'Ver usuarios' },
  { key: 'users.write', module: 'users', description: 'Crear y editar usuarios' },
  { key: 'users.delete', module: 'users', description: 'Desactivar usuarios' },
  { key: 'auth.login', module: 'auth', description: 'Iniciar sesión' },
  { key: 'dashboard.read', module: 'dashboard', description: 'Ver dashboard' },
];

const seedPermissions = async () => {
  for (const permission of defaultPermissions) {
    await Permission.findOneAndUpdate(
      { key: permission.key },
      { $set: permission },
      { upsert: true, new: true }
    );
  }
};

module.exports = { seedPermissions, defaultPermissions };
