const pg = require("pg");
const { Pool } = pg;

module.exports = new Pool({
  connectionString: process.env.DATABASE_URL,
});
