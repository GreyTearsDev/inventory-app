require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const createError = require("http-errors");
const expressLayouts = require("express-ejs-layouts");

const indexRouter = require("./routes/index");
const catalogRouter = require("./routes/catalog");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/catalog", catalogRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  switch (err) {
    case 404:
      res.render("404", {
        title: "404 ERROR",
        cause: "Oops! The page you're looking for doesn't exist.",
      });
      break;
    default:
      res.render("404", {
        title: "SOMETHING WENT WRONG :(",
        cause: "Unknown reason",
      });
  }
});

module.exports = app;
