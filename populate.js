#! /usr/bin/env node
require("dotenv").config();

// Get arguments passed on command line
const userArgs = process.argv.slice(2);
const uri = process.env.MONGODB_URI;

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

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(uri);
  console.log("Debug: Should be connected?");
  await createGenres();
  await createAuthor();
  // comicList = await Comic.find().exec();
  // authorList = await Author.find().exec();
  // genreList = await Genre.find().exec();
  // publisherList = await Publisher.find(); 
  await createPublisher();
  await createComics();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
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

async function volumeCreate(volNum, comic, title, description, relDate) {
  const volDetails = {
    volume_number: volNum,
    comic: comic,
    title: title,
    description: description,
    release_date: relDate,
  };

  const volume = new Volume(volDetails);
  await volume.save();
  console.log(`----Added volume: ${volNum}`);
}

async function authorCreate(index, firstName, lastName) {
  const authorDetails = { first_name: firstName, last_name: lastName };
  const author = new Author(authorDetails);

  await author.save();
  authorList[index] = author._id;
  console.log(`Added author: ${firstName} ${lastName}`);
}

async function comicCreate( index, title, summary, author, genres, relDate, publisher, ) {
  const comicDetails = {
    title: title,
    author: author,
    summary: summary,
    release_date: relDate,
    publisher: publisher,
  };

  if (genres) {
    comicDetails.genres = genres;
  }

  const comic = new Comic(comicDetails);
  await comic.save();
  comicList[index] = comic._id;

  // Create two volumes for each comic
  await volumeCreate(
    1,
    comic,
    `Volume 1 - ${title} `,
    `This is the description for ${title}, Volume 1`,
    new Date(),
  );
  await volumeCreate(
    2,
    comic,
    `Volume 2 - ${title}`,
    `This is the description for ${title}, Volume 2`,
    new Date(),
  );
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
    genreCreate(1, "Science Fiction"),
    genreCreate(2, "Super Hero"),
    genreCreate(3, "Graphic Novel"),
    genreCreate(4, "Shounen"),
    genreCreate(5, "Shoujo"),
    genreCreate(6, "Mystery"),
    genreCreate(7, "Isekai"),
    genreCreate(8, "Romance"),
    genreCreate(9, "Mecha"),
    genreCreate(10, "Adventure"),
    genreCreate(11, "Comedy"),
    genreCreate(12, "Slice of Life"),
    genreCreate(13, "Horror"),
  ]);
}

async function createAuthor() {
  console.log("Adding author");
  await Promise.all([
    authorCreate(0, "Osamu", "Tezuka"),
    authorCreate(1, "Akira", "Toriyama"),
    authorCreate(2, "Naoko", "Takeuchi"),
    authorCreate(3, "Eiichiro", "Oda"),
    authorCreate(4, "Rumiko", "Takahashi"),
    authorCreate(5, "Katsuhiro", "Otomo"),
    authorCreate(6, "Hajime", "Isayama"),
    authorCreate(7, "CLAMP", "a"),
    authorCreate(8, "Kazuo", "Koike"),
    authorCreate(9, "Masashi", "Kishimoto"),
    authorCreate(10, "Stan", "Lee"),
    authorCreate(11, "Jack", "Kirby"),
    authorCreate(12, "Neil", "Gaiman"),
    authorCreate(13, "Frank", "Miller"),
    authorCreate(14, "Alan", "Moore"),
    authorCreate(15, "Jim", "Lee"),
    authorCreate(16, "Joe", "Quesada"),
    authorCreate(17, "Steve", "Ditko"),
    authorCreate(18, "Todd", "McFarlane"),
    authorCreate(19, "Brian", "Bolland"),
    authorCreate(20, "Will", "Eisner"),
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
      [genreList[4]],
      new Date("1952-04-07"),
      publisherList[0],
    ),
    comicCreate(
      1,
      "Dragon Ball",
      "The adventures of Goku and his friends in search of the Dragon Balls.",
      authorList[1],
      [genreList[4], genreList[9]],
      new Date("1984-12-03"),
      publisherList[0],
    ),
    comicCreate(
      2,
      "Sailor Moon",
      "A group of magical girls fighting against the forces of evil.",
      authorList[2],
      [genreList[5], genreList[8]],
      new Date("1991-07-06"),
      publisherList[0],
    ),
    comicCreate(
      3,
      "One Piece",
      "A young pirate's quest to find the ultimate treasure.",
      authorList[3],
      [genreList[4], genreList[10]],
      new Date("1997-07-22"),
      publisherList[0],
    ),
    comicCreate(
      4,
      "Inuyasha",
      "A girl travels back in time to feudal Japan and meets a half-demon.",
      authorList[4],
      [genreList[4], genreList[8], genreList[10]],
      new Date("1996-11-13"),
      publisherList[0],
    ),
    comicCreate(
      5,
      "Akira",
      "A dystopian future where a biker gang member gains psychic powers.",
      authorList[5],
      [genreList[1], genreList[9]],
      new Date("1982-12-20"),
      publisherList[0],
    ),
    comicCreate(
      6,
      "Attack on Titan",
      "Humanity's fight for survival against giant humanoid creatures.",
      authorList[6],
      [genreList[4], genreList[6], genreList[13]],
      new Date("2009-09-09"),
      publisherList[0],
    ),
    comicCreate(
      7,
      "Cardcaptor Sakura",
      "A young girl discovers magical powers and must capture mystical cards.",
      authorList[7],
      [genreList[5], genreList[8]],
      new Date("1996-05-24"),
      publisherList[0],
    ),
    comicCreate(
      8,
      "Lone Wolf and Cub",
      "A samurai assassin and his young son on a quest for revenge.",
      authorList[8],
      [genreList[6], genreList[10]],
      new Date("1970-09-25"),
      publisherList[0],
    ),
    comicCreate(
      9,
      "Naruto",
      "A young ninja's journey to become the strongest ninja and gain respect.",
      authorList[9],
      [genreList[4], genreList[10]],
      new Date("1999-09-21"),
      publisherList[0],
    ),
    comicCreate(
      10,
      "Spider-Man",
      "The adventures of Peter Parker as Spider-Man.",
      authorList[10],
      [genreList[2], genreList[10]],
      new Date("1962-08-01"),
      publisherList[1],
    ),
    comicCreate(
      11,
      "Fantastic Four",
      "A team of superheroes with extraordinary powers.",
      authorList[11],
      [genreList[2], genreList[1]],
      new Date("1961-11-01"),
      publisherList[1],
    ),
    comicCreate(
      12,
      "The Sandman",
      "A story about the adventures of Dream, one of the Endless.",
      authorList[12],
      [genreList[3], genreList[6]],
      new Date("1989-01-01"),
      publisherList[2],
    ),
    comicCreate(
      13,
      "Sin City",
      "A series of crime stories set in a dark and violent city.",
      authorList[13],
      [genreList[3], genreList[13]],
      new Date("1991-04-01"),
      publisherList[2],
    ),
    comicCreate(
      14,
      "Watchmen",
      "A dark and complex story about superheroes in an alternate history.",
      authorList[14],
      [genreList[2], genreList[3]],
      new Date("1986-09-01"),
      publisherList[3],
    ),
    comicCreate(
      15,
      "Batman: Hush",
      "Batman faces a mysterious new villain known as Hush.",
      authorList[15],
      [genreList[2], genreList[6]],
      new Date("2002-01-01"),
      publisherList[1],
    ),
    comicCreate(
      16,
      "Daredevil",
      "The story of a blind lawyer who fights crime as Daredevil.",
      authorList[16],
      [genreList[2], genreList[10]],
      new Date("1964-04-01"),
      publisherList[1],
    ),
    comicCreate(
      17,
      "Doctor Strange",
      "The adventures of the Sorcerer Supreme, Doctor Strange.",
      authorList[17],
      [genreList[2], genreList[0]],
      new Date("1963-07-01"),
      publisherList[1],
    ),
    comicCreate(
      18,
      "Spawn",
      "A former soldier resurrected as a hellspawn.",
      authorList[18],
      [genreList[2], genreList[13]],
      new Date("1992-05-01"),
      publisherList[3],
    ),
    comicCreate(
      19,
      "Batman: The Killing Joke",
      "The origin story of the Joker and his battle with Batman.",
      authorList[19],
      [genreList[2], genreList[13]],
      new Date("1988-03-01"),
      publisherList[1],
    ),
    comicCreate(
      20,
      "The Spirit",
      "The adventures of a masked vigilante in Central City.",
      authorList[20],
      [genreList[2], genreList[6]],
      new Date("1940-06-02"),
      publisherList[4],
    ),
    comicCreate(
      21,
      "Death Note",
      "A high school student discovers a notebook that can kill anyone whose name is written in it.",
      authorList[0],
      [genreList[6], genreList[13]],
      new Date("2003-12-01"),
      publisherList[0],
    ),
    comicCreate(
      22,
      "Fullmetal Alchemist",
      "Two brothers use alchemy in their quest to restore their bodies.",
      authorList[3],
      [genreList[4], genreList[10]],
      new Date("2001-07-12"),
      publisherList[0],
    ),
    comicCreate(
      23,
      "Berserk",
      "A dark fantasy story about a lone mercenary's quest for revenge.",
      authorList[8],
      [genreList[4], genreList[10], genreList[13]],
      new Date("1989-08-25"),
      publisherList[0],
    ),
    comicCreate(
      24,
      "Bleach",
      "A teenager becomes a Soul Reaper to protect the living world from evil spirits.",
      authorList[9],
      [genreList[4], genreList[10]],
      new Date("2001-08-07"),
      publisherList[0],
    ),
    comicCreate(
      25,
      "My Hero Academia",
      "A world where almost everyone has superpowers and a boy's dream to become a hero.",
      authorList[1],
      [genreList[4], genreList[2]],
      new Date("2014-07-07"),
      publisherList[0],
    ),
    comicCreate(
      26,
      "Tokyo Ghoul",
      "A young man transforms into a half-ghoul after a near-fatal accident.",
      authorList[5],
      [genreList[4], genreList[13]],
      new Date("2011-09-08"),
      publisherList[0],
    ),
    comicCreate(
      27,
      "Black Clover",
      "A boy born without magic in a world where everyone else has it.",
      authorList[6],
      [genreList[4], genreList[10]],
      new Date("2015-02-16"),
      publisherList[0],
    ),
    comicCreate(
      28,
      "Fairy Tail",
      "A young mage's adventures in a world of magic and guilds.",
      authorList[4],
      [genreList[4], genreList[10]],
      new Date("2006-08-23"),
      publisherList[0],
    ),
    comicCreate(
      29,
      "JoJo's Bizarre Adventure",
      "The strange and fantastical adventures of the Joestar family.",
      authorList[8],
      [genreList[4], genreList[10], genreList[11]],
      new Date("1987-01-01"),
      publisherList[0],
    ),
    comicCreate(
      30,
      "One Punch Man",
      "A superhero who can defeat any opponent with a single punch.",
      authorList[7],
      [genreList[4], genreList[11]],
      new Date("2009-06-14"),
      publisherList[0],
    ),
    comicCreate(
      31,
      "Vagabond",
      "The life of a legendary samurai warrior.",
      authorList[8],
      [genreList[6], genreList[10]],
      new Date("1998-09-25"),
      publisherList[0],
    ),
    comicCreate(
      32,
      "Rurouni Kenshin",
      "A wandering swordsman in Meiji-era Japan.",
      authorList[9],
      [genreList[4], genreList[10], genreList[12]],
      new Date("1994-04-25"),
      publisherList[0],
    ),
    comicCreate(
      33,
      "Yotsuba&!",
      "The everyday adventures of a quirky young girl.",
      authorList[7],
      [genreList[11], genreList[12]],
      new Date("2003-03-21"),
      publisherList[0],
    ),
    comicCreate(
      34,
      "Monster",
      "A brilliant doctor is drawn into a web of conspiracy and murder.",
      authorList[8],
      [genreList[6], genreList[13]],
      new Date("1994-12-05"),
      publisherList[0],
    ),
    comicCreate(
      35,
      "Gantz",
      "A group of people who have died are forced to participate in a deadly game.",
      authorList[5],
      [genreList[6], genreList[13]],
      new Date("2000-07-13"),
      publisherList[0],
    ),
    comicCreate(
      36,
      "Sword Art Online",
      "Players of a virtual reality MMORPG are trapped and must fight their way to freedom.",
      authorList[3],
      [genreList[4], genreList[7], genreList[10]],
      new Date("2009-04-10"),
      publisherList[0],
    ),
    comicCreate(
      37,
      "Toriko",
      "A gourmet hunter's quest to find the most delicious foods in the world.",
      authorList[1],
      [genreList[4], genreList[10], genreList[11]],
      new Date("2008-05-26"),
      publisherList[0],
    ),
    comicCreate(
      38,
      "Vinland Saga",
      "A young Viking's journey for revenge and discovery.",
      authorList[8],
      [genreList[6], genreList[10], genreList[12]],
      new Date("2005-04-13"),
      publisherList[0],
    ),
    comicCreate(
      39,
      "Claymore",
      "A group of female warriors battle against monstrous beings.",
      authorList[4],
      [genreList[4], genreList[10], genreList[13]],
      new Date("2001-05-08"),
      publisherList[0],
    ),
  ]);
}

async function createPublisher() {
  console.log("Adding publisher");
  await Promise.all([
    publisherCreate(0, "Shueisha", "Japan" ),
    publisherCreate(1, "Kodansha", "Japan" ),
    publisherCreate(2, "Shogakukan", "Japan" ),
    publisherCreate(3, "Viz Media", "United States" ),
    publisherCreate(4, "Dark Horse Publisher", "United States" ),
    publisherCreate(5, "DC Publisher", "United States" ),
    publisherCreate(6, "Marvel Publisher", "United States" ),
    publisherCreate(7, "Image Publisher", "United States" ),
    publisherCreate(8, "Vertical", "Japan" ),
    publisherCreate(9, "Yen Press", "United States" ),
    publisherCreate(10, "Kodansha USA", "United States" ),
    publisherCreate(11, "Seven Seas Entertainment", "United States" ),
    publisherCreate(12, "Tokyopop", "United States" ),
    publisherCreate(13, "Square Enix Manga & Books", "Japan" ),
    publisherCreate(14, "Vertical Publisher", "United States" ),
    publisherCreate(15, "VIZ Signature", "United States" ),
    publisherCreate(16, "Kodansha Publisher", "United States" ),
    publisherCreate(17, "Seven Seas", "United States" ),
  ]);
}
