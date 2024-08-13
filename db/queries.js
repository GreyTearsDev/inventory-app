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
exports.getGenre = async (genreId) => {
  const text = "SELECT * FROM genres WHERE id = $1";
  try {
    const { rows } = await pool.query(text, [genreId]);
    return rows[0];
  } catch (e) {
    console.log(e);
  }
};

exports.getPublisher = async (publisherId) => {
  const text = "SELECT * FROM publishers WHERE id = $1";
  try {
    const { rows } = await pool.query(text, [publisherId]);
    return rows[0];
  } catch (e) {
    console.log(e);
  }
};

exports.getAuthor = async (authorId) => {
  const text = "SELECT * FROM authors WHERE id = $1";
  try {
    const { rows } = await pool.query(text, [authorId]);
    return rows[0];
  } catch (e) {
    console.log(e);
  }
};

exports.getGenreByName = async (genreName) => {
  const text = `SELECT * FROM genres WHERE name ILIKE $1`;
  try {
    const { rows } = await pool.query(text, [genreName]);
    return rows[0];
  } catch (e) {
    console.log(e);
  }
};

exports.getPublisherByName = async (publisherName) => {
  const text = `SELECT * FROM publishers WHERE name ILIKE $1`;
  try {
    const { rows } = await pool.query(text, [publisherName]);
    return rows[0];
  } catch (e) {
    console.log(e);
  }
};

exports.getAuthorByName = async (f_name, l_name) => {
  const text = `SELECT * FROM authors 
                WHERE first_name = $1
                  AND last_name = $2`;
  try {
    const { rows } = await pool.query(text, [f_name, l_name]);
    return rows[0];
  } catch (e) {
    console.log(e);
  }
};

exports.updateGenre = async (genreId, { name }) => {
  const text = `UPDATE genres
                SET name = $2
                WHERE id = $1`;
  try {
    await pool.query(text, [genreId, name]);
  } catch (e) {
    console.log(e);
  }
};

exports.updatePublisher = async (publisherId, { name, headquarters }) => {
  const text = `UPDATE publishers
                SET name = $2, headquarters = $3
                WHERE id = $1`;
  try {
    await pool.query(text, [publisherId, name, headquarters]);
  } catch (e) {
    console.log(e);
  }
};

exports.updateAuthor = async (authorId, { first_name, last_name }) => {
  const text = `UPDATE authors
                SET first_name = $2, last_name = $3
                WHERE id = $1`;
  try {
    await pool.query(text, [authorId, first_name, last_name]);
  } catch (e) {
    console.log(e);
  }
};

exports.updateComic = async (
  comicId,
  { title, summary, author, publisher, genres, release_date },
) => {
  const text = `UPDATE comics 
                SET title = $2, 
                    summary = $3, 
                    author_id = $4,
                    publisher_id = $5,
                    release_date = $6
                WHERE id = $1`;
  try {
    await pool.query(text, [
      comicId,
      title,
      summary,
      author,
      publisher,
      release_date,
    ]);
    await updateComicGenres(comicId, genres);
  } catch (e) {
    console.log(e);
  }
};

exports.deleteGenre = async (genreId) => {
  const text = `DELETE FROM genres
                WHERE id = $1`;
  try {
    await pool.query(text, [genreId]);
  } catch (e) {
    console.log(e);
  }
};

exports.deletePublisher = async (publisherId) => {
  const text = `DELETE FROM publishers
                WHERE id = $1`;
  try {
    await pool.query(text, [publisherId]);
  } catch (e) {
    console.log(e);
  }
};

exports.deleteAuthor = async (authorId) => {
  const text = `DELETE FROM authors
                WHERE id = $1`;
  try {
    await pool.query(text, [authorId]);
  } catch (e) {
    console.log(e);
  }
};

exports.getComic = async (comicId) => {
  const text = "SELECT * FROM comics WHERE id = $1";
  try {
    const { rows } = await pool.query(text, [comicId]);
    return rows[0];
  } catch (e) {
    console.log(e);
  }
};

exports.getComicByTitleAndAuthor = async ({ title, author }) => {
  const text = `SELECT * FROM comics 
                WHERE title = $1
                  AND author_id = $2`;
  try {
    const { rows } = await pool.query(text, [title, author]);
    return rows[0];
  } catch (e) {
    console.log(e);
  }
};

// SELECT query for getting data about comics of a certain genre
exports.getGenreComics = async (genreId) => {
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

// SELECT query for getting data about comics of a certain author
exports.getAuthorComics = async (authorId) => {
  const text = `SELECT * FROM comics WHERE author_id = $1`;
  try {
    const { rows } = await pool.query(text, [authorId]);
    return rows;
  } catch (e) {
    console.log(e);
  }
};

// SELECT query for getting data about comics from a certain publisher
exports.getPublisherComics = async (publisherId) => {
  const text = `SELECT * FROM comics
                WHERE comics.publisher_id = $1;`;

  try {
    const { rows } = await pool.query(text, [publisherId]);
    return rows;
  } catch (e) {
    console.log(e);
  }
};

exports.getComicPublisher = async (comicId) => {
  const text = `SELECT 
                  publishers.name, 
                  publishers.headquarters 
                FROM publishers 
                LEFT JOIN comics
                  ON comics.publisher_id = publishers.id
                WHERE comics.id = $1`;
  try {
    const { rows } = await pool.query(text, [comicId]);
    return rows[0];
  } catch (e) {
    console.log(e);
  }
};

exports.getComicAuthor = async (comicId) => {
  const text = `SELECT 
                      authors.name
                FROM authors
                LEFT JOIN comics
                  ON comics.author_id = authors.id
                WHERE comics.id = $1`;

  try {
    const { rows } = await pool.query(text, [comicId]);
    return rows[0];
  } catch (e) {
    console.log(e);
  }
};

// SELECT query for getting data about genres of a certain comic
exports.getComicGenres = async (comicId) => {
  const text = `SELECT id, name FROM genres
                LEFT JOIN comics_genres AS cg 
                      ON genres.id = cg.genre_id
                WHERE cg.comic_id = $1;`;

  try {
    const { rows } = await pool.query(text, [comicId]);
    return rows;
  } catch (e) {
    console.log(e);
  }
};

// SELECT query for getting data about volumes from a certain comic
exports.getComicVolumes = async (comicId) => {
  const text = `SELECT * FROM volumes
                WHERE volumes.comic_id = $1;`;

  try {
    const { rows } = await pool.query(text, [comicId]);
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

exports.savePublisher = async ({ name, headquarters }) => {
  const text = `
    INSERT INTO publishers(name, headquarters) VALUES($1, $2);
  `;
  try {
    await pool.query(text, [name, headquarters]);
  } catch (e) {
    console.log(e);
  }
};

exports.saveAuthor = async ({ first_name, last_name }) => {
  const text = `
    INSERT INTO authors(first_name, last_name) VALUES($1, $2);
  `;
  try {
    await pool.query(text, [first_name, last_name]);
  } catch (e) {
    console.log(e);
  }
};

exports.saveComic = async ({
  title,
  summary,
  author,
  publisher,
  genres,
  release_date,
}) => {
  const insertText = `
    INSERT INTO comics(title, summary, release_date, author_id, publisher_id) VALUES($1, $2, $3, $4, $5);
  `;

  const selectComicIdText = `
    SELECT id FROM comics 
    WHERE comics.author_id = $1 
      AND comics.publisher_id = $2
      AND comics.title = $3
      AND comics.summary = $4;
  `;

  try {
    await pool.query(insertText, [
      title,
      summary,
      release_date,
      author,
      publisher,
    ]);
    const result = await pool.query(selectComicIdText, [
      author,
      publisher,
      title,
      summary,
    ]);

    const comicId = result.rows[0].id;
    await insertComicGenres(comicId, genres);
  } catch (e) {
    console.log(e);
  }
};

async function updateComicGenres(comicId, genres) {
  try {
    await deleteComicGenres(comicId);
    await insertComicGenres(comicId, genres);
  } catch (e) {
    console.log(e);
  }
}

async function deleteComicGenres(comicId) {
  const deleteGenresText = `
    DELETE FROM comics_genres 
    WHERE comic_id = $1;
  `;

  try {
    await pool.query(deleteGenresText, [comicId]);
  } catch (e) {
    console.log(e);
  }
}
async function insertComicGenres(comicId, genres) {
  const insertGenresText = `
    INSERT INTO comics_genres(comic_id, genre_id)  VALUES ($1, $2);
  `;

  for (const genreId of genres) {
    try {
      await pool.query(insertGenresText, [comicId, genreId]);
    } catch (e) {
      console.log(e);
    }
  }
}
