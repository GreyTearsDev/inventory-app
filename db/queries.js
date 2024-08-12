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

exports.selectAllPublishers = async () => {
  try {
    const { rows } = await pool.query(`SELECT * FROM publishers ORDER BY name`);
    return rows;
  } catch (e) {
    console.log(e);
  }
};

exports.selectAllAuthors = async () => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM authors ORDER BY first_name`,
    );
    return rows;
  } catch (e) {
    console.log(e);
  }
};

exports.selectAllComics = async () => {
  try {
    const { rows } = await pool.query(`SELECT * FROM comics ORDER BY title`);
    return rows;
  } catch (e) {
    console.log(e);
  }
};

exports.selectAllVolumes = async () => {
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
exports.selectGenreDetails = async (genreId) => {
  const text = "SELECT * FROM genres WHERE id = $1";
  try {
    const { rows } = await pool.query(text, [genreId]);
    return rows;
  } catch (e) {
    console.log(e);
  }
};

// SELECT query for getting data about comics of a certain genre
exports.selectComicsOfGenre = async (genreId) => {
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
                            AND cg.genre_id = $1`;
  try {
    const { rows } = await pool.query(text, [genreId]);
    return rows;
  } catch (e) {
    console.log(e);
  }
};
