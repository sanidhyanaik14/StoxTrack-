// database
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'stoxtrack_db',
  password: '@Postgresql',
  port: 5432,
});

module.exports = pool;
