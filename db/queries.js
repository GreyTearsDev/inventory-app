const pool = require("./index");

// SELECT query for getting ALL entries in a table
exports.getAllGenres = async () => {
  try {
    const { rows } = await pool.query(`SELECT * FROM genres ORDER BY name`);
    return rows;
  } catch (e) {
    console.log(e);
  }
};

exports.getAllPublishers = async () => {
  try {
    const { rows } = await pool.query(`SELECT * FROM publishers ORDER BY name`);
    return rows;
  } catch (e) {
    console.log(e);
  }
};

exports.getAllAuthors = async () => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM authors ORDER BY first_name`,
    );
    return rows;
  } catch (e) {
    console.log(e);
  }
};

exports.getAllComics = async () => {
  try {
    const { rows } = await pool.query(`SELECT * FROM comics ORDER BY title`);
    return rows;
  } catch (e) {
    console.log(e);
  }
};

exports.getAllVolumes = async () => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM volumes ORDER BY volume_number`,
    );
    return rows;
  } catch (e) {
    console.log(e);
  }
};

// SELECT query for getting data about a specific entry in a table
// gets gerne detais via genre id
exports.getGenreDetails = async (genreId) => {
  const text = "SELECT * FROM genres WHERE id = $1";
  try {
    const { rows } = await pool.query(text, [genreId]);
    return rows;
  } catch (e) {
    console.log(e);
  }
};

exports.findGenreByName = async (name) => {
  const text = `SELECT * FROM genres WHERE name ILIKE $1`;
  try {
    const { rows } = await pool.query(text, [name]);
    return rows;
  } catch (e) {
    console.log(e);
  }
};

// SELECT query for getting data about comics of a certain genre
exports.getComicsOfGenre = async (genreId) => {
  const text = `SELECT 
                  comics.id, 
                  comics.title,
                  comics.summary,
                  comics.release_date,
                  comics.author_id,
                  comics.publisher_id,
                  comics.url
                FROM comics LEFT JOIN comics_genres AS cg 
                            ON comics.id = cg.comic_id 
                   WHERE cg.genre_id = $1`;
  try {
    const { rows } = await pool.query(text, [genreId]);
    return rows;
  } catch (e) {
    console.log(e);
  }
};

// INSERT INTO queries to add new entries to tables
exports.saveGenre = async ({ name }) => {
  const text = `
    INSERT INTO genres(name) VALUES($1);
  `;
  try {
    await pool.query(text, [name]);
  } catch (e) {
    console.log(e);
  }
};
