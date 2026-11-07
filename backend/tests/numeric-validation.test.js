const {
  createProduct,
} = require('../src/modules/products/product.controller');
const {
  createOrder,
} = require('../src/modules/orders/order.controller');
const {
  createPrint,
} = require('../src/modules/prints/print.controller');

const invokeController = async (controller, body) => {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  await controller(
    { body, user: { _id: '507f1f77bcf86cd799439011' } },
    response,
    jest.fn()
  );

  return response;
};

describe('Numeric input validation', () => {
  test.each([
    ['precio negativo', createProduct, {
      name: 'Producto',
      category: 'Álbumes',
      price: -500,
      stock: 1,
    }, 'El precio'],
    ['existencia negativa', createProduct, {
      name: 'Producto',
      category: 'Álbumes',
      price: 500,
      stock: -10,
    }, 'La existencia'],
    ['cantidad de productos negativa', createOrder, {
      date: '2026-01-01',
      customer: 'Cliente',
      items: 'Impresiones',
      productCount: -5,
    }, 'La cantidad de productos'],
    ['total negativo', createOrder, {
      date: '2026-01-01',
      customer: 'Cliente',
      items: 'Impresiones',
      total: -1,
    }, 'El total'],
    ['cantidad de impresiones negativa', createPrint, {
      customer: 'Cliente',
      order: 'FM-1',
      format: 'Infantil',
      size: '5x7',
      quantity: -1,
      finish: 'Mate',
      date: '2026-01-01',
    }, 'La cantidad'],
  ])('rechaza %s con un error de validación', async (_label, controller, body, fieldLabel) => {
    const response = await invokeController(controller, body);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: expect.stringContaining(fieldLabel),
    });
  });

  test.each([
    ['existencia decimal', createProduct, {
      name: 'Producto',
      category: 'Álbumes',
      price: 500,
      stock: 2.5,
    }, 'número entero'],
    ['precio no numérico', createProduct, {
      name: 'Producto',
      category: 'Álbumes',
      price: 'no es un número',
      stock: 1,
    }, 'número válido'],
    ['cantidad de impresiones en cero', createPrint, {
      customer: 'Cliente',
      order: 'FM-1',
      format: 'Infantil',
      size: '5x7',
      quantity: 0,
      finish: 'Mate',
      date: '2026-01-01',
    }, 'mayor o igual a 1'],
  ])('rechaza %s', async (_label, controller, body, message) => {
    const response = await invokeController(controller, body);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: expect.stringContaining(message),
    });
  });
});
