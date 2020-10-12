var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var mongoose = require("mongoose");
var router = express.Router();
const session = require("express-session");

var MongoDBStore = require("connect-mongodb-session")(session);
var store = new MongoDBStore({
  uri: "mongodb+srv://Muhammedfahis:2585832000v@cluster0.uk8po.mongodb.net/mydb?retryWrites=true&w=majority/connect_mongodb_session_test",
  collection: "mySessions",
});
store.on("error", function (error) {
  console.log(error);
});

router.use(
  session({
    secret: "ok",
    name: "adminCookie",
    saveUninitialized: false,
    store: store,
    resave: false,

    cookie: {
      path: "/admin",
      maxAge: 60 * 1000 * 60 * 60 * 24 * 30,
    },
  })
);

router.use(
  session({
    secret: "ok",
    name: "userCookie",
    store: store,
    saveUninitialized: false,
    resave: false,

    cookie: {
      path: "/",
      maxAge: 60 * 1000 * 60 * 60 * 24 * 30,
    },
  })
);

var adminRouter = require("./routes/admin");
var usersRouter = require("./routes/users");

var app = express();
app.use(router);

app.set("etag", false);

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

mongoose.connect("mongodb+srv://Muhammedfahis:2585832000v@cluster0.uk8po.mongodb.net/mydb?retryWrites=true&w=majority", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// app.use(logger('dev'));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));
// app.use(bodyParser.urlencoded({ extended: false }))

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRouter);
app.use("/", usersRouter);

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
  res.render("error");
});

module.exports = app;
