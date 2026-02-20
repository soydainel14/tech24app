const bcrypt = require('bcryptjs');

/**
 * Initial seed to populate base roles, an admin user, accounts and a
 * couple of baseline settings. Seeding is idempotent and can safely
 * be run multiple times because inserts are guarded by checks.
 */

exports.seed = async function (knex) {
  // Roles
  const roles = [
    { name: 'admin' },
    { name: 'customer' },
  ];
  for (const role of roles) {
    const existing = await knex('roles').where({ name: role.name }).first();
    if (!existing) {
      await knex('roles').insert(role);
    }
  }

  // Admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@tech24.do';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  const existingAdmin = await knex('users').where({ email: adminEmail }).first();
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    const [id] = await knex('users').insert({ name: 'Administrator', email: adminEmail, password: hashed, role: 'admin' });
    await knex('admin_users').insert({ user_id: id });
  }

  // Accounts (cash and bank)
  const accountNames = ['Cash', 'Bank'];
  for (const name of accountNames) {
    const existing = await knex('accounts').where({ name }).first();
    if (!existing) {
      await knex('accounts').insert({ name, type: name.toLowerCase(), balance: 0 });
    }
  }

  // Expense categories
  const expenses = ['Operations', 'Marketing', 'Logistics'];
  for (const name of expenses) {
    const existing = await knex('expense_categories').where({ name }).first();
    if (!existing) {
      await knex('expense_categories').insert({ name, budget_limit: 0 });
    }
  }

  // KPI targets example
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const existingKpi = await knex('kpi_targets').where({ metric: 'revenue' }).first();
  if (!existingKpi) {
    await knex('kpi_targets').insert({
      metric: 'revenue',
      target_value: 10000,
      period_start: today,
      period_end: nextMonth,
    });
  }
};