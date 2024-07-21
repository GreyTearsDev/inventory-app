#! /usr/bin/env node
require("dotenv").config();

// Get arguments passed on command line
const userArgs = process.argv.slice(2);
const uri = process.env.MONGODB_URI || userArgs[0];

const Comic = require("./models/comic");
const Author = require("./models/author");
const Publisher = require("./models/publisher");
const Genre = require("./models/genre");
const Volume = require("./models/volume");

let comicList = [];
let authorList = [];
let genreList = [];
let publisherList = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  try {
    await mongoose.connect(uri);
    console.log("Debug: Should be connected?");
    await createGenres();
    await createAuthors();
    await createPublishers();
    await createComics();
  } catch (err) {
    console.error("Error in main:", err);
  } finally {
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }
}

// We pass the index to the ...Create functions so that, for example,
// genre[0] will always be the Fantasy genre, regardless of the order
// in which the elements of promise.all's argument complete.
async function genreCreate(index, name) {
  const genre = new Genre({ name: name });
  await genre.save();
  genreList[index] = genre._id;
  console.log(`Added genre: ${name}`);
}

async function authorCreate(index, firstName, lastName, biography) {
  const authorDetails = { first_name: firstName, last_name: lastName };

  if (biography) {
    authorDetails.biography = biography;
  }

  const author = new Author(authorDetails);
  await author.save();
  authorList[index] = author._id;
  console.log(`Added author: ${firstName} ${lastName}`);
}

async function comicCreate(
  index,
  title,
  summary,
  author,
  genres,
  relDate,
  publisher,
) {
  const comicDetails = {
    title: title,
    author: author,
    summary: summary,
    release_date: relDate,
    publisher: publisher,
    volumes: [],
  };

  if (genres) {
    comicDetails.genres = genres;
  }

  const comic = new Comic(comicDetails);

  // Create two volumes for each comic
  const vol1 = {
    volume_number: 1,
    title: `${title}`,
    description: `This is the description for ${title}, Volume 1`,
    release_date: new Date(),
  };

  const vol2 = {
    volume_number: 2,
    title: `${title}`,
    description: `This is the description for ${title}, Volume 2`,
    release_date: new Date(),
  };

  const volume1 = new Volume(vol1);
  await volume1.save();
  comic.volumes.push(volume1);

  const volume2 = new Volume(vol2);
  await volume2.save();
  comic.volumes.push(volume2);

  await comic.save();
  comicList[index] = comic._id;
  console.log(`Added comic: ${title}`);
}

async function publisherCreate(index, name, headquarters) {
  const publisherDetails = {
    name: name,
  };

  if (headquarters) {
    publisherDetails.headquarters = headquarters;
  }

  const publisher = new Publisher(publisherDetails);
  await publisher.save();
  publisherList[index] = publisher._id;
  console.log(`Added publisher: ${name}`);
}

async function createGenres() {
  console.log("Adding genres");
  await Promise.all([
    genreCreate(0, "Science Fiction"),
    genreCreate(1, "Super Hero"),
    genreCreate(2, "Graphic Novel"),
    genreCreate(3, "Shounen"),
    genreCreate(4, "Shoujo"),
    genreCreate(5, "Mystery"),
    genreCreate(6, "Isekai"),
    genreCreate(7, "Romance"),
    genreCreate(8, "Mecha"),
    genreCreate(9, "Adventure"),
    genreCreate(10, "Comedy"),
    genreCreate(11, "Slice of Life"),
    genreCreate(12, "Horror"),
  ]);
}

async function createAuthors() {
  console.log("Adding authors");
  await Promise.all([
    authorCreate(
      0,
      "Osamu",
      "Tezuka",
      "Osamu Tezuka is known as the 'God of Manga' and created influential works such as 'Astro Boy' and 'Black Jack'.",
    ),
    authorCreate(
      1,
      "Akira",
      "Toriyama",
      "Akira Toriyama is a renowned manga artist best known for creating the 'Dragon Ball' series.",
    ),
    authorCreate(
      2,
      "Naoko",
      "Takeuchi",
      "Naoko Takeuchi is a manga artist famous for her work on the 'Sailor Moon' series.",
    ),
    authorCreate(
      3,
      "Eiichiro",
      "Oda",
      "Eiichiro Oda is the creator of 'One Piece', one of the best-selling manga series in history.",
    ),
    authorCreate(
      4,
      "Rumiko",
      "Takahashi",
      "Rumiko Takahashi is one of Japan's wealthiest manga artists, known for 'Inuyasha' and 'Ranma ½'.",
    ),
    authorCreate(
      5,
      "Katsuhiro",
      "Otomo",
      "Katsuhiro Otomo is a manga artist and film director, best known for creating 'Akira'.",
    ),
    authorCreate(
      6,
      "Hajime",
      "Isayama",
      "Hajime Isayama is a manga artist known for creating the popular series 'Attack on Titan'.",
    ),
    authorCreate(
      7,
      "CLAMP",
      ".",
      "CLAMP is a team of female manga artists famous for works like 'Cardcaptor Sakura' and 'xxxHolic'.",
    ),
    authorCreate(
      8,
      "Kazuo",
      "Koike",
      "Kazuo Koike was a manga artist and writer best known for 'Lone Wolf and Cub'.",
    ),
    authorCreate(
      9,
      "Masashi",
      "Kishimoto",
      "Masashi Kishimoto is the creator of 'Naruto', one of the most successful manga series globally.",
    ),
    authorCreate(
      10,
      "Stan",
      "Lee",
      "Stan Lee was an American comic book writer, editor, and publisher, famous for co-creating iconic superheroes such as Spider-Man, the X-Men, and Iron Man.",
    ),
    authorCreate(
      11,
      "Jack",
      "Kirby",
      "Jack Kirby was a legendary comic book artist and writer, co-creating many famous characters including Captain America and the Fantastic Four.",
    ),
    authorCreate(
      12,
      "Neil",
      "Gaiman",
      "Neil Gaiman is an English author known for his work on 'The Sandman' comic series and numerous novels.",
    ),
    authorCreate(
      13,
      "Frank",
      "Miller",
      "Frank Miller is a comic book writer and artist, famous for 'The Dark Knight Returns' and 'Sin City'.",
    ),
    authorCreate(
      14,
      "Alan",
      "Moore",
      "Alan Moore is a British writer known for his groundbreaking work on 'Watchmen', 'V for Vendetta', and 'Swamp Thing'.",
    ),
    authorCreate(
      15,
      "Jim",
      "Lee",
      "Jim Lee is a Korean American comic book artist, writer, and publisher known for his work on X-Men and as a co-founder of Image Comics.",
    ),
    authorCreate(
      16,
      "Joe",
      "Quesada",
      "Joe Quesada is an American comic book editor, writer, and artist, known for his work with Marvel Comics.",
    ),
    authorCreate(
      17,
      "Steve",
      "Ditko",
      "Steve Ditko was an American comic book artist and writer, best known for co-creating Spider-Man and Doctor Strange.",
    ),
    authorCreate(
      18,
      "Todd",
      "McFarlane",
      "Todd McFarlane is a comic book artist and writer, known for his work on 'The Amazing Spider-Man' and for creating 'Spawn'.",
    ),
    authorCreate(
      19,
      "Brian",
      "Bolland",
      "Brian Bolland is a British comic artist, known for his work on 'Judge Dredd' and 'Batman: The Killing Joke'.",
    ),
    authorCreate(
      20,
      "Will",
      "Eisner",
      "Will Eisner was a pioneering comic book writer and artist, best known for 'The Spirit' and for popularizing the graphic novel format.",
    ),
  ]);
}

async function createPublishers() {
  console.log("Adding publishers");
  await Promise.all([
    publisherCreate(0, "Shueisha", "Japan"),
    publisherCreate(1, "Marvel Comics", "United States"),
    publisherCreate(2, "DC Comics", "United States"),
    publisherCreate(3, "Image Comics", "United States"),
    publisherCreate(4, "Dark Horse Comics", "United States"),
  ]);
}

async function createComics() {
  console.log("Adding comics");
  await Promise.all([
    comicCreate(
      0,
      "Astro Boy",
      "A story about a robot boy with extraordinary powers.",
      authorList[0],
      [genreList[3]],
      new Date(1952, 3, 3),
      publisherList[0],
    ),
    comicCreate(
      1,
      "Dragon Ball",
      "An adventure following the journey of Goku.",
      authorList[1],
      [genreList[3]],
      new Date(1984, 11, 20),
      publisherList[0],
    ),
    comicCreate(
      2,
      "Sailor Moon",
      "A magical girl story about love and justice.",
      authorList[2],
      [genreList[4]],
      new Date(1991, 11, 28),
      publisherList[0],
    ),
    comicCreate(
      3,
      "One Piece",
      "A story of pirates searching for the ultimate treasure.",
      authorList[3],
      [genreList[9]],
      new Date(1997, 6, 22),
      publisherList[0],
    ),
    comicCreate(
      4,
      "Inuyasha",
      "A time-traveling adventure filled with demons and romance.",
      authorList[4],
      [genreList[7]],
      new Date(1996, 10, 13),
      publisherList[0],
    ),
    comicCreate(
      5,
      "Akira",
      "A dystopian story set in a post-apocalyptic Tokyo.",
      authorList[5],
      [genreList[0]],
      new Date(1982, 12, 6),
      publisherList[0],
    ),
    comicCreate(
      6,
      "Attack on Titan",
      "A world where humanity fights for survival against giant humanoids.",
      authorList[6],
      [genreList[12]],
      new Date(2009, 8, 9),
      publisherList[0],
    ),
    comicCreate(
      7,
      "Cardcaptor Sakura",
      "A young girl must capture magical cards that have escaped.",
      authorList[7],
      [genreList[4]],
      new Date(1996, 5, 11),
      publisherList[0],
    ),
    comicCreate(
      8,
      "Lone Wolf and Cub",
      "A ronin and his infant son travel through Japan seeking revenge.",
      authorList[8],
      [genreList[10]],
      new Date(1970, 9, 25),
      publisherList[0],
    ),
    comicCreate(
      9,
      "Naruto",
      "A young ninja's quest to become the strongest ninja and gain recognition.",
      authorList[9],
      [genreList[3]],
      new Date(1999, 8, 21),
      publisherList[0],
    ),
    comicCreate(
      10,
      "Spider-Man",
      "A young man gains spider-like powers and fights crime.",
      authorList[10],
      [genreList[1]],
      new Date(1962, 7, 15),
      publisherList[1],
    ),
    comicCreate(
      11,
      "X-Men",
      "A team of mutants fighting for a world that fears and hates them.",
      authorList[10],
      [genreList[1]],
      new Date(1963, 8, 10),
      publisherList[1],
    ),
    comicCreate(
      12,
      "The Sandman",
      "A dark fantasy series about the king of dreams.",
      authorList[12],
      [genreList[2]],
      new Date(1989, 10, 15),
      publisherList[2],
    ),
    comicCreate(
      13,
      "The Dark Knight Returns",
      "A retired Batman returns to fight crime in Gotham City.",
      authorList[13],
      [genreList[1]],
      new Date(1986, 2, 1),
      publisherList[2],
    ),
    comicCreate(
      14,
      "Watchmen",
      "A deconstruction of the superhero genre set in an alternate history.",
      authorList[14],
      [genreList[2]],
      new Date(1986, 9, 1),
      publisherList[2],
    ),
    comicCreate(
      15,
      "Spawn",
      "A former soldier becomes a Hellspawn and fights against evil.",
      authorList[18],
      [genreList[12]],
      new Date(1992, 5, 2),
      publisherList[3],
    ),
    comicCreate(
      16,
      "Hellboy",
      "A demon raised by humans works to protect the world from supernatural threats.",
      authorList[20],
      [genreList[12]],
      new Date(1993, 12, 4),
      publisherList[4],
    ),
    comicCreate(
      17,
      "Batman: The Killing Joke",
      "A graphic novel exploring the origins of the Joker and his relationship with Batman.",
      authorList[19],
      [genreList[1]],
      new Date(1988, 3, 29),
      publisherList[2],
    ),
  ]);
}
