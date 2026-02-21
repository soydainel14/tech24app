/**
 * Seed to populate products for testing.
 */
exports.seed = async function (knex) {
  const products = [
    {
      name: 'iPhone 15 Pro Max',
      sku: 'IPH15PM-256-BLK',
      description: 'The latest iPhone with Titanium design and A17 Pro chip.',
      price: 1199.99,
      stock: 10,
      min_stock: 2,
      is_active: true
    },
    {
      name: 'MacBook Air M2',
      sku: 'MBA-M2-8-256',
      description: 'Thinner, lighter, and faster with the M2 chip.',
      price: 999.00,
      stock: 5,
      min_stock: 1,
      is_active: true
    },
    {
      name: 'AirPods Pro (2nd Gen)',
      sku: 'APP2-WHT',
      description: 'Magical audio with active noise cancellation.',
      price: 249.00,
      stock: 25,
      min_stock: 5,
      is_active: true
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      sku: 'SGS24U-512-GRY',
      description: 'Experience the power of AI with the new S24 Ultra.',
      price: 1299.99,
      stock: 8,
      min_stock: 2,
      is_active: true
    }
  ];

  for (const product of products) {
    const existing = await knex('products').where({ sku: product.sku }).first();
    if (!existing) {
      await knex('products').insert(product);
    }
  }
};
