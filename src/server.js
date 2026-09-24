require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');
const { seedRoles } = require('./modules/roles/role.seed');
const { seedPermissions } = require('./modules/permissions/permission.seed');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/erp_demo';

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected successfully');
    await seedRoles();
    await seedPermissions();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
