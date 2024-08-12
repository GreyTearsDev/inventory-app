const pg = require("pg");
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const query = (queryText, params, callback) => {
  return pool.query(queryText, params, callback);
};

mosule.exports = {
  query,
};
