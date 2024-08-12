const pool = require("./index");

// SELECT query for getting ALL entries in a table
exports.selectAllGenres = async () => {
  try {
    const { rows } = await pool.query(`SELECT * FROM genres ORDER BY name`);
    return rows;
  } catch (e) {
    console.log(e);
  }
};

async function selectAllPublishers() {
  try {
    const { rows } = await pool.query(`SELECT * FROM publishers ORDER BY name`);
    return rows;
  } catch (e) {
    console.log(e);
  }
}

async function selectAllAuthors() {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM authors ORDER BY first_name`,
    );
    return rows;
  } catch (e) {
    console.log(e);
  }
}

async function selectAllComics() {
  try {
    const { rows } = await pool.query(`SELECT * FROM comics ORDER BY title`);
    return rows;
  } catch (e) {
    console.log(e);
  }
}

async function selectAllVolumes() {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM volumes ORDER BY volume_number`,
    );
    return rows;
  } catch (e) {
    console.log(e);
  }
}
