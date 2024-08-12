#! /usr/bin/env node

require("dotenv").config();
const { argv } = require("node:process");
const { Pool } = require("pg");

const genresTab = `  
CREATE TABLE IF NOT EXISTS genres (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(20) NOT NULL, 
    url TEXT GENERATED ALWAYS AS ('/catalog/genre/' || id) STORED
);`;

const publishersTab = `
CREATE TABLE IF NOT EXISTS publishers (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(40) NOT NULL, 
    headquarters VARCHAR(40),
    url TEXT GENERATED ALWAYS AS ('/catalog/publisher/' || id) STORED
);`;

const authorsTab = `
CREATE TABLE IF NOT EXISTS authors (
    id SERIAL PRIMARY KEY, 
    first_name VARCHAR(40) NOT NULL, 
    last_name VARCHAR(40) NOT NULL, 
    name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    url TEXT GENERATED ALWAYS AS ('/catalog/author/' || id) STORED
);`;

const comicsTab = `
CREATE TABLE IF NOT EXISTS comics (
    id SERIAL PRIMARY KEY, 
    title VARCHAR(100) NOT NULL, 
    summary VARCHAR(200) NOT NULL, 
    release_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    author_id INTEGER REFERENCES authors (id) ON DELETE RESTRICT,
    publisher_id INTEGER REFERENCES publishers (id) ON DELETE RESTRICT,
    url TEXT GENERATED ALWAYS AS ('/catalog/comic/' || id) STORED
);`;

const volumesTab = `
CREATE TABLE IF NOT EXISTS volumes (
    id SERIAL PRIMARY KEY, 
    comic_id INTEGER REFERENCES comics (id) ON DELETE RESTRICT,
    volume_number INTEGER NOT NULL CHECK (volume_number >= 0),
    title VARCHAR(100) NOT NULL, 
    description VARCHAR(200) NOT NULL, 
    release_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    url TEXT GENERATED ALWAYS AS ('/catalog/volume/' || id) STORED
);
`;

const comicsGenresTab = `
CREATE TABLE IF NOT EXISTS comics_genres (
    comic_id INTEGER REFERENCES comics (id) ON DELETE CASCADE,
    genre_id INTEGER REFERENCES genres (id) ON DELETE CASCADE,
    PRIMARY KEY (comic_id, genre_id)
);
`;

const insertGenres = `
INSERT INTO genres (name) VALUES
    ('Action'),
    ('Adventure'),
    ('Comedy'),
    ('Drama'),
    ('Fantasy'),
    ('Horror'),
    ('Mystery'),
    ('Romance'),
    ('Sci-Fi'),
    ('Slice of Life'),
    ('Sports'),
    ('Supernatural'),
    ('Thriller');
`;

const insertPublishers = `
    INSERT INTO publishers (name, headquarters) VALUES
    ('Shueisha', 'Tokyo, Japan'),
    ('Kodansha', 'Tokyo, Japan'),
    ('Shogakukan', 'Tokyo, Japan'),
    ('Hakusensha', 'Tokyo, Japan'),
    ('Kadokawa Shoten', 'Tokyo, Japan'),
    ('Square Enix', 'Tokyo, Japan'),
    ('Akita Shoten', 'Tokyo, Japan'),
    ('Futabasha', 'Tokyo, Japan'),
    ('Shonen Gahosha', 'Tokyo, Japan'),
    ('Tokuma Shoten', 'Tokyo, Japan'),
    ('ASCII Media Works', 'Tokyo, Japan'),
    ('Houbunsha', 'Tokyo, Japan'),
    ('Media Factory', 'Tokyo, Japan');
`;
const insertAuthors = `
INSERT INTO authors (first_name, last_name) VALUES
    ('Eiichiro', 'Oda'),
    ('Masashi', 'Kishimoto'),
    ('Hajime', 'Isayama'),
    ('Akira', 'Toriyama'),
    ('Yoshihiro', 'Togashi'),
    ('Takehiko', 'Inoue'),
    ('Naoko', 'Takeuchi'),
    ('Tite', 'Kubo'),
    ('Kentaro', 'Miura'),
    ('Rumiko', 'Takahashi'),
    ('Hiromu', 'Arakawa'),
    ('Clamp', 'Clamp'),
    ('Osamu', 'Tezuka');
`;

const insertComics = `
INSERT INTO comics (title, summary, release_date, author_id, publisher_id) VALUES 
    ('One Piece', 'A story of a young pirate’s quest to become the Pirate King.', '1997-12-24', 1, 1),
    ('Naruto', 'The journey of a young ninja seeking recognition and belonging.', '1999-09-21', 2, 2),
    ('Attack on Titan', 'Humanity’s fight against giant creatures known as Titans.', '2009-03-17', 3, 3),
    ('Dragon Ball', 'A boy’s quest for powerful orbs and his battles to protect the Earth.', '1984-09-10', 4, 4),
    ('Yu Yu Hakusho', 'A delinquent’s afterlife adventures as a Spirit Detective.', '1990-12-10', 5, 5),
    ('Slam Dunk', 'A high school delinquent joins the basketball team and discovers his love for the sport.', '1990-10-01', 6, 6),
    ('Sailor Moon', 'A teenage girl transforms into a magical warrior to protect the Earth.', '1992-07-06', 7, 7),
    ('Bleach', 'A teenager gains the powers of a Soul Reaper and battles evil spirits.', '2001-08-07', 8, 8),
    ('Berserk', 'The dark journey of a mercenary seeking revenge and battling evil forces.', '1990-11-26', 9, 9),
    ('Inuyasha', 'A modern-day girl is transported to the Sengoku period and teams up with a half-demon.', '1996-11-18', 10, 10);
`;

const insertVolumes = `
INSERT INTO volumes (comic_id, volume_number, title, description, release_date) VALUES
    (1, 1, 'One Piece Vol. 1', 'The beginning of Luffy’s journey', '1997-12-24'),
    (1, 2, 'One Piece Vol. 2', 'Luffy continues his adventure.', '1997-12-25'),
    (1, 3, 'One Piece Vol. 3', 'The Straw Hat crew grows.', '1998-03-24'),

    (2, 1, 'Naruto Vol. 1', 'Naruto’s early adventures', '1999-09-21'),
    (2, 2, 'Naruto Vol. 2', 'Naruto’s first mission.', '1999-11-21'),
    (2, 3, 'Naruto Vol. 3', 'The Chunin Exams begin.', '2000-01-21'),

    (3, 1, 'Attack on Titan Vol. 1', 'The story of humanity’s fight against the Titans', '2009-03-17'),
    (3, 2, 'Attack on Titan Vol. 2', 'The battle against the Titans continues.', '2009-06-17'),
    (3, 3, 'Attack on Titan Vol. 3', 'Eren’s Titan powers revealed.', '2009-09-17'),

    (4, 1, 'Dragon Ball Vol. 1', 'Goku’s introduction and early training', '1984-09-10'),
    (4, 2, 'Dragon Ball Vol. 2', 'Goku’s first tournament.', '1984-11-10'),
    (4, 3, 'Dragon Ball Vol. 3', 'The battle against the Red Ribbon Army.', '1985-02-10'),

    (5, 1, 'Yu Yu Hakusho Vol. 1', 'Yusuke’s unexpected death and revival', '1990-12-10'),
    (5, 2, 'Yu Yu Hakusho Vol. 2', 'Yusuke’s first case as Spirit Detective.', '1991-02-10'),
    (5, 3, 'Yu Yu Hakusho Vol. 3', 'The Dark Tournament begins.', '1991-05-10'),

    (6, 1, 'Slam Dunk Vol. 1', 'Hanamichi Sakuragi’s start in basketball', '1990-10-01'),
    (6, 2, 'Slam Dunk Vol. 2', 'Sakuragi’s basketball skills improve.', '1990-12-01'),
    (6, 3, 'Slam Dunk Vol. 3', 'Shohoku’s first match.', '1991-02-01'),

    (7, 1, 'Sailor Moon Vol. 1', 'The awakening of Sailor Moon', '1992-07-06'),
    (7, 2, 'Sailor Moon Vol. 2', 'The awakening of more Sailor Scouts.', '1992-10-06'),
    (7, 3, 'Sailor Moon Vol. 3', 'The battle against the Dark Kingdom.', '1993-01-06'),

    (8, 1, 'Bleach Vol. 1', 'Ichigo becomes a Soul Reaper', '2001-08-07'),
    (8, 2, 'Bleach Vol. 2', 'Ichigo’s first real battle as a Soul Reaper.', '2001-11-07'),
    (8, 3, 'Bleach Vol. 3', 'The Soul Society arc begins.', '2002-02-07'),

    (9, 1, 'Berserk Vol. 1', 'Guts’ dark journey begins', '1990-11-26'),
    (9, 2, 'Berserk Vol. 2', 'Guts joins the Band of the Hawk.', '1991-02-26'),
    (9, 3, 'Berserk Vol. 3', 'The Eclipse event.', '1991-05-26'),

    (10, 1, 'Inuyasha Vol. 1', 'Kagome is transported to the Sengoku period', '1996-11-18'),
    (10, 2, 'Inuyasha Vol. 2', 'Kagome and Inuyasha’s journey begins.', '1997-01-18'),
    (10, 3, 'Inuyasha Vol. 3', 'The Shikon Jewel’s shards are scattered.', '1997-03-18');
   
`;

const insertComicsGenres = `
INSERT INTO comics_genres (comic_id, genre_id) VALUES
    (1, 1), (1, 2), (1, 6), (1, 9),
    (2, 1), (2, 2), (2, 6), (2, 9),
    (3, 6), (3, 9), (3, 12),
    (4, 1), (4, 2), (4, 9), (4, 12),
    (5, 1), (5, 2), (5, 12),
    (6, 1), (6, 9), (6, 12),
    (7, 2), (7, 6), (7, 12),
    (8, 1), (8, 9), (8, 12),
    (9, 1), (9, 12), (9, 13),
    (10, 2), (10, 12), (10, 13); 
   
`;

async function main() {
  console.log("seeding...");
  const pool = new Pool({
    connectionString: argv[2],
  });

  try {
    await pool.connect();
    await pool.query(genresTab);
    console.log("created genres table successfully");
    await pool.query(publishersTab);
    console.log("created publishers table successfully");
    await pool.query(authorsTab);
    console.log("created authors table successfully");
    await pool.query(comicsTab);
    console.log("created comics table successfully");
    await pool.query(volumesTab);
    console.log("created volumes table successfully");
    await pool.query(comicsGenresTab);
    console.log("created comicGenres table successfully");

    await pool.query(insertGenres);
    console.log("Added genres successfully");
    await pool.query(insertPublishers);
    console.log("Added publishers successfully");
    await pool.query(insertAuthors);
    console.log("Added authors successfully");
    await pool.query(insertComics);
    console.log("Added comics successfully");
    await pool.query(insertVolumes);
    console.log("Added volumes successfully");
    await pool.query(insertComicsGenres);
    console.log("Added comics_genres successfully");

    console.log("Done");
  } catch (e) {
    console.error("Error details:", e);
  } finally {
    await pool.end();
  }
}

main();
