/**
 * Migration to create all necessary tables for the Tech24.do platform. The
 * tables reflect the entities required by the business rules, including
 * users, products, orders, payments, shipments, returns, finances, and
 * analytics. Each table includes sensible default fields and indices.
 */

exports.up = async function (knex) {
  // Users table
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.string('role').notNullable().defaultTo('customer');
    table.timestamps(true, true);
  });

  // Admin users (optional separate table)
  await knex.schema.createTable('admin_users', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  // Roles and permissions
  await knex.schema.createTable('roles', (table) => {
    table.increments('id').primary();
    table.string('name').unique().notNullable();
    table.timestamps(true, true);
  });
  await knex.schema.createTable('permissions', (table) => {
    table.increments('id').primary();
    table.string('name').unique().notNullable();
    table.timestamps(true, true);
  });
  await knex.schema.createTable('role_permissions', (table) => {
    table.increments('id').primary();
    table.integer('role_id').unsigned().notNullable().references('id').inTable('roles').onDelete('CASCADE');
    table.integer('permission_id').unsigned().notNullable().references('id').inTable('permissions').onDelete('CASCADE');
  });

  // Products
  await knex.schema.createTable('products', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('sku').notNullable().unique();
    table.text('description');
    table.decimal('cost', 10, 2).notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.integer('stock').notNullable().defaultTo(0);
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.timestamps(true, true);
  });

  // Product images
  await knex.schema.createTable('product_images', (table) => {
    table.increments('id').primary();
    table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE');
    table.string('url').notNullable();
    table.string('alt_text');
    table.integer('position').defaultTo(0);
    table.timestamps(true, true);
  });

  // Inventory movements
  await knex.schema.createTable('inventory_movements', (table) => {
    table.increments('id').primary();
    table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE');
    table.enum('type', ['in', 'out', 'adjust']).notNullable();
    table.integer('quantity').notNullable();
    table.string('reason');
    table.timestamps(true, true);
  });

 // Addresses
  await knex.schema.createTable('addresses', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('line1').notNullable();
    table.string('line2');
    table.string('city').notNullable();
    table.string('state');
    table.string('postal_code');
    table.string('country').notNullable();
    table.string('phone');
    table.enum('type', ['shipping', 'billing']).defaultTo('shipping');
    table.timestamps(true, true);
  });

  // Orders
  await knex.schema.createTable('orders', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
    table.string('order_number').notNullable().unique();
    table.string('purchase_code').notNullable().unique();
    table.enum('order_status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).defaultTo('pending');
    table.enum('payment_status', ['pending', 'confirmed', 'failed', 'refunded']).defaultTo('pending');
    table.string('payment_method');
    table.decimal('total_amount', 10, 2).notNullable();
    table.integer('shipping_address_id').unsigned().references('id').inTable('addresses');
    table.timestamps(true, true);
  });

  // Order items
  await knex.schema.createTable('order_items', (table) => {
    table.increments('id').primary();
    table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE');
    table.integer('product_id').unsigned().references('id').inTable('products');
    table.integer('quantity').notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.decimal('cost', 10, 2).notNullable();
    table.decimal('subtotal', 10, 2).notNullable();
    table.timestamps(true, true);
  });

  // Payments
  await knex.schema.createTable('payments', (table) => {
    table.increments('id').primary();
    table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE');
    table.string('method').notNullable();
    table.enum('status', ['pending', 'confirmed', 'failed', 'refunded']).defaultTo('pending');
    table.decimal('amount', 10, 2).notNullable();
    table.string('transaction_code');
    table.timestamps(true, true);
  });

  // Shipments
  await knex.schema.createTable('shipments', (table) => {
    table.increments('id').primary();
    table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE');
    table.string('carrier');
    table.string('tracking_number');
    table.enum('status', ['pending', 'shipped', 'in_transit', 'delivered', 'returned']).defaultTo('pending');
    table.decimal('shipping_fee', 10, 2);
    table.timestamp('shipped_at');
    table.timestamp('delivered_at');
    table.timestamps(true, true);
  });

  // Shipment events
  await knex.schema.createTable('shipment_events', (table) => {
    table.increments('id').primary();
    table.integer('shipment_id').unsigned().references('id').inTable('shipments').onDelete('CASCADE');
    table.enum('status', ['pending', 'shipped', 'in_transit', 'delivered', 'returned', 'cancelled']).notNullable();
    table.timestamp('timestamp').defaultTo(knex.fn.now());
    table.string('notes');
  });

  // Return requests (RMA)
  await knex.schema.createTable('return_requests', (table) => {
    table.increments('id').primary();
    table.string('rma_number').notNullable().unique();
    table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE');
    table.integer('order_item_id').unsigned().references('id').inTable('order_items');
    table.integer('user_id').unsigned().references('id').inTable('users');
    table.enum('status', ['pending', 'approved', 'rejected', 'completed']).defaultTo('pending');
    table.string('reason');
    table.timestamps(true, true);
  });

  // Return evidences (photos/docs)
  await knex.schema.createTable('return_evidences', (table) => {
    table.increments('id').primary();
    table.integer('return_request_id').unsigned().references('id').inTable('return_requests').onDelete('CASCADE');
    table.string('url').notNullable();
    table.string('description');
    table.timestamps(true, true);
  });

  // Return events (RMA timeline)
  await knex.schema.createTable('return_events', (table) => {
    table.increments('id').primary();
    table.integer('return_request_id').unsigned().references('id').inTable('return_requests').onDelete('CASCADE');
    table.enum('status', ['pending', 'approved', 'rejected', 'received', 'replaced', 'refunded']).notNullable();
    table.timestamp('timestamp').defaultTo(knex.fn.now());
    table.string('notes');
  });

  // Refunds
  await knex.schema.createTable('refunds', (table) => {
    table.increments('id').primary();
    table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE');
    table.decimal('amount', 10, 2).notNullable();
    table.enum('status', ['pending', 'processed']).defaultTo('pending');
    table.timestamp('processed_at');
    table.timestamps(true, true);
  });

  // Audit logs
  await knex.schema.createTable('audit_logs', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users');
    table.string('action').notNullable();
    table.string('table_name');
    table.integer('record_id');
    table.json('old_data');
    table.json('new_data');
    table.timestamps(true, true);
  });

  // Analytics events
  await knex.schema.createTable('analytics_events', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users');
    table.string('session_id');
    table.string('event_type').notNullable();
    table.json('metadata');
    table.timestamps(true, true);
  });

  // Accounts
  await knex.schema.createTable('accounts', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.enum('type', ['cash', 'bank']).notNullable();
    table.decimal('balance', 12, 2).defaultTo(0);
    table.timestamps(true, true);
  });

// Financial transactions
  await knex.schema.createTable('financial_transactions', (table) => {
    table.increments('id').primary();
    table.integer('account_id').unsigned().references('id').inTable('accounts');
    table.enum('type', ['debit', 'credit']).notNullable();
    table.decimal('amount', 12, 2).notNullable();
    table.string('description');
    table.integer('related_order_id').unsigned().references('id').inTable('orders');
    table.timestamps(true, true);
  });

  // Tasks and alerts
  await knex.schema.createTable('tasks_alerts', (table) => {
    table.increments('id').primary();
    table.string('type').notNullable();
    table.string('message').notNullable();
    table.enum('status', ['open', 'in_progress', 'closed']).defaultTo('open');
    table.enum('priority', ['low', 'medium', 'high']).defaultTo('medium');
    table.timestamps(true, true);
  });

  // Expense categories
  await knex.schema.createTable('expense_categories', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable().unique();
    table.decimal('budget_limit', 12, 2);
    table.timestamps(true, true);
  });

  // KPI targets
  await knex.schema.createTable('kpi_targets', (table) => {
    table.increments('id').primary();
    table.string('metric').notNullable();
    table.decimal('target_value', 12, 2).notNullable();
    table.date('period_start').notNullable();
    table.date('period_end').notNullable();
    table.timestamps(true, true);
  });

  // Campaigns
  await knex.schema.createTable('campaigns', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.date('start_date');
    table.date('end_date');
    table.timestamps(true, true);
  });

  // Campaign spend
  await knex.schema.createTable('campaign_spend', (table) => {
    table.increments('id').primary();
    table.integer('campaign_id').unsigned().references('id').inTable('campaigns').onDelete('CASCADE');
    table.decimal('amount', 12, 2).notNullable();
    table.date('date').notNullable();
    table.timestamps(true, true);
  });

  // Sessions
  await knex.schema.createTable('sessions', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users');
    table.string('session_token').notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamps(true, true);
  });

  // Order attribution (marketing tracking)
  await knex.schema.createTable('order_attribution', (table) => {
    table.increments('id').primary();
    table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE');
    table.integer('campaign_id').unsigned().references('id').inTable('campaigns');
    table.string('utm_source');
    table.string('utm_medium');
    table.string('utm_campaign');
    table.timestamps(true, true);
  });

  // Inventory forecasts
  await knex.schema.createTable('inventory_forecasts', (table) => {
    table.increments('id').primary();
    table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE');
    table.decimal('avg_daily_sales_30', 12, 2);
    table.decimal('avg_daily_sales_60', 12, 2);
    table.decimal('avg_daily_sales_90', 12, 2);
    table.decimal('days_of_cover', 12, 2);
    table.date('stockout_date');
    table.integer('reorder_point');
    table.integer('reorder_qty');
    table.timestamps(true, true);
  });

  // Purchase plans
  await knex.schema.createTable('purchase_plans', (table) => {
    table.increments('id').primary();
    table.date('plan_date').notNullable();
    table.integer('created_by').unsigned().references('id').inTable('users');
    table.enum('status', ['draft', 'approved', 'ordered', 'received', 'cancelled']).defaultTo('draft');
    table.timestamps(true, true);
  });

  // Purchase plan items
  await knex.schema.createTable('purchase_plan_items', (table) => {
    table.increments('id').primary();
    table.integer('purchase_plan_id').unsigned().references('id').inTable('purchase_plans').onDelete('CASCADE');
    table.integer('product_id').unsigned().references('id').inTable('products');
    table.integer('quantity').notNullable();
    table.decimal('cost', 10, 2).notNullable();
    table.enum('status', ['pending', 'ordered', 'received', 'cancelled']).defaultTo('pending');
    table.timestamps(true, true);
  });

  // Price history
  await knex.schema.createTable('price_history', (table) => {
    table.increments('id').primary();
    table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE');
    table.decimal('old_price', 10, 2).notNullable();
    table.decimal('new_price', 10, 2).notNullable();
    table.integer('changed_by').unsigned().references('id').inTable('users');
    table.string('reason');
    table.timestamps(true, true);
  });
};

exports.down = async function (knex) {
  // Drop tables in reverse order to satisfy foreign key constraints
  await knex.schema.dropTableIfExists('price_history');
  await knex.schema.dropTableIfExists('purchase_plan_items');
  await knex.schema.dropTableIfExists('purchase_plans');
  await knex.schema.dropTableIfExists('inventory_forecasts');
  await knex.schema.dropTableIfExists('order_attribution');
  await knex.schema.dropTableIfExists('sessions');
  await knex.schema.dropTableIfExists('campaign_spend');
  await knex.schema.dropTableIfExists('campaigns');
  await knex.schema.dropTableIfExists('kpi_targets');
  await knex.schema.dropTableIfExists('expense_categories');
  await knex.schema.dropTableIfExists('tasks_alerts');
  await knex.schema.dropTableIfExists('accounts');
  await knex.schema.dropTableIfExists('financial_transactions');
  await knex.schema.dropTableIfExists('analytics_events');
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('addresses');
  await knex.schema.dropTableIfExists('refunds');
  await knex.schema.dropTableIfExists('return_events');
  await knex.schema.dropTableIfExists('return_evidences');
  await knex.schema.dropTableIfExists('return_requests');
  await knex.schema.dropTableIfExists('shipment_events');
  await knex.schema.dropTableIfExists('shipments');
  await knex.schema.dropTableIfExists('payments');
  await knex.schema.dropTableIfExists('order_items');
  await knex.schema.dropTableIfExists('orders');
  await knex.schema.dropTableIfExists('inventory_movements');
  await knex.schema.dropTableIfExists('product_images');
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('role_permissions');
  await knex.schema.dropTableIfExists('permissions');
  await knex.schema.dropTableIfExists('roles');
  await knex.schema.dropTableIfExists('admin_users');
  await knex.schema.dropTableIfExists('users');
};