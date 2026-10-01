const User = require('./user.model');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true }).select('-password').lean();
    return res.status(200).json({
      success: true,
      data: users,
      message: 'Users retrieved successfully',
    });
  } catch (error) {
    return next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, isActive: true }).select('-password').lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, companyId, branchId } = req.body;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isAdmin && role && role !== 'EMPLEADO') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can assign privileged roles',
      });
    }

    if (!isAdmin && (companyId || branchId)) {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can assign organizational scope',
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: isAdmin ? (role || 'EMPLEADO') : 'EMPLEADO',
      ...(isAdmin ? { companyId, branchId } : {}),
      isActive: true,
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: safeUser,
    });
  } catch (error) {
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const allowedFields = isAdmin
      ? ['name', 'email', 'role', 'companyId', 'branchId', 'isActive']
      : ['name', 'email'];
    const forbiddenFields = Object.keys(req.body).filter((field) => !allowedFields.includes(field));

    if (forbiddenFields.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update these fields',
      });
    }

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([field]) => allowedFields.includes(field))
    );

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
};
