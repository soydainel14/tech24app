const knex = require('knex');
const knexfile = require('./knexfile');

/*
 * Create a Knex instance using the environment configuration. By default
 * NODE_ENV is "development" in local usage; production will be set by
 * Railway. This file centralizes the connection logic so that it can
 * be imported throughout the application.
 */
const environment = process.env.NODE_ENV || 'development';

const connection = knex(knexfile[environment]);

module.exports = connection;