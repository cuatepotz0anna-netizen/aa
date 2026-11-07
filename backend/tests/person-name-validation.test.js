const crypto = require('crypto');
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
}

const {
  isValidPersonName,
  PERSON_NAME_ERROR,
} = require('../src/utils/personNameValidation');
const {
  createCustomer,
} = require('../src/modules/customers/customer.controller');
const {
  createOrder,
} = require('../src/modules/orders/order.controller');
const {
  createPrint,
} = require('../src/modules/prints/print.controller');
const {
  createSession,
} = require('../src/modules/sessions/session.controller');
const {
  createAttendance,
} = require('../src/modules/attendance/attendance.controller');
const {
  register,
} = require('../src/modules/auth/auth.controller');
const Customer = require('../src/modules/customers/customer.model');
const Order = require('../src/modules/orders/order.model');
const Print = require('../src/modules/prints/print.model');
const StudioSession = require('../src/modules/sessions/session.model');
const Attendance = require('../src/modules/attendance/attendance.model');
const User = require('../src/modules/users/user.model');
const isValidTime = require('../src/utils/timeValidation');
const {
  isValidPassword,
  PASSWORD_ERROR,
} = require('../src/utils/passwordValidation');
const {
  isValidPhone,
  PHONE_ERROR,
} = require('../src/utils/phoneValidation');

const invokeController = async (controller, body) => {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  await controller(
    { body, user: { _id: '507f1f77bcf86cd799439011', role: 'ADMIN' } },
    response,
    jest.fn()
  );
  return response;
};

describe('Validación de nombres de personas', () => {
  test.each([
    ['@#$%', false],
    ['###frref', false],
    ['12345', false],
    ['Ana123', false],
    ['José@', false],
    ['María José Hernández', true],
    ['Iñaki Peña', true],
    ['Víctor Adrián Rodríguez González', true],
  ])('valida %s correctamente', (name, expected) => {
    expect(isValidPersonName(name)).toBe(expected);
  });

  test.each([
    ['cliente', createCustomer, Customer, { name: '@#$%' }],
    ['cliente', createCustomer, Customer, { name: '###frref' }],
    ['pedido', createOrder, Order, {
      date: '2026-01-01',
      customer: 'Ana123',
      items: 'Impresiones',
    }],
    ['impresión', createPrint, Print, {
      customer: '12345',
      order: 'FM-1',
      format: 'Infantil',
      size: '5x7',
      quantity: 1,
      finish: 'Mate',
      date: '2026-01-01',
    }],
    ['sesión', createSession, StudioSession, {
      customer: 'José@',
      date: '2026-01-01',
      time: '10:00',
      type: 'Retrato',
      responsible: 'Ana',
      location: 'Estudio',
    }],
    ['asistencia', createAttendance, Attendance, {
      employee: '@#$%',
      date: '2026-01-01',
    }],
    ['registro', register, User, {
      name: '12345',
      email: 'name@example.com',
      password: 'Password123',
    }],
  ])('rechaza el nombre inválido al crear %s sin guardar', async (_label, controller, model, body) => {
    const saveSpy = jest.spyOn(model, 'create');
    const response = await invokeController(controller, body);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: PERSON_NAME_ERROR,
    });
    expect(saveSpy).not.toHaveBeenCalled();
    saveSpy.mockRestore();
  });

  test.each(['María José Hernández', 'Iñaki Peña'])(
    'acepta y guarda el nombre válido %s',
    async (name) => {
      const saveSpy = jest.spyOn(Customer, 'create').mockResolvedValue({ name });
      const response = await invokeController(createCustomer, { name });

      expect(response.status).toHaveBeenCalledWith(201);
      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ name }));
      saveSpy.mockRestore();
    }
  );

  test.each(['#####', '246@123', 'telefono', '55-12#34'])(
    'rechaza teléfono inválido %s y no guarda',
    async (phone) => {
      const saveSpy = jest.spyOn(Customer, 'create');
      const response = await invokeController(createCustomer, {
        name: 'María José Hernández',
        phone,
      });

      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({
        success: false,
        message: PHONE_ERROR,
      });
      expect(saveSpy).not.toHaveBeenCalled();
      saveSpy.mockRestore();
    }
  );

  test('rechaza teléfono inválido al actualizar y no consulta ni guarda', async () => {
    const findSpy = jest.spyOn(Customer, 'findOne');
    const response = await invokeController(
      require('../src/modules/customers/customer.controller').updateCustomer,
      { phone: '246@123' }
    );

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: PHONE_ERROR,
    });
    expect(findSpy).not.toHaveBeenCalled();
    findSpy.mockRestore();
  });

  test('acepta teléfono compuesto solo por dígitos', async () => {
    const saveSpy = jest.spyOn(Customer, 'create').mockResolvedValue({
      name: 'María José Hernández',
      phone: '2461234567',
    });
    const response = await invokeController(createCustomer, {
      name: 'María José Hernández',
      phone: '2461234567',
    });

    expect(response.status).toHaveBeenCalledWith(201);
    expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
      phone: '2461234567',
    }));
    saveSpy.mockRestore();
  });

  test.each([
    ['#####', false],
    ['246@123', false],
    ['telefono', false],
    ['2461234567', true],
  ])('valida teléfono %s', (phone, expected) => {
    expect(isValidPhone(phone)).toBe(expected);
  });

  test.each([
    ['10:30', true],
    ['00:00', true],
    ['23:59', true],
    ['24:00', false],
    ['12:60', false],
    ['9:30', false],
    ['hora', false],
  ])('valida la hora %s', (time, expected) => {
    expect(isValidTime(time)).toBe(expected);
  });

  test.each([
    ['sesión', createSession, StudioSession, {
      customer: 'Ana',
      date: '2026-01-01',
      time: '24:00',
      type: 'Retrato',
      responsible: 'Luis',
      location: 'Estudio',
    }],
    ['asistencia', createAttendance, Attendance, {
      employee: 'Ana',
      date: '2026-01-01',
      checkIn: '8:00',
    }],
  ])('rechaza horas inválidas en %s sin guardar', async (_label, controller, model, body) => {
    const saveSpy = jest.spyOn(model, 'create');
    const response = await invokeController(controller, body);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: 'Ingresa una hora válida en formato HH:MM.',
    });
    expect(saveSpy).not.toHaveBeenCalled();
    saveSpy.mockRestore();
  });

  test.each([
    ['short', false],
    ['12345678', true],
    ['a'.repeat(128), true],
    ['a'.repeat(129), false],
  ])('valida una contraseña con el contenido indicado', (password, expected) => {
    expect(isValidPassword(password)).toBe(expected);
  });

  test('el helper de contraseña conserva el mensaje en español', () => {
    expect(PASSWORD_ERROR).toBe('La contraseña debe tener entre 8 y 128 caracteres.');
  });
});
