const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require("body-parser");
const path = require("path");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const ejs = require("ejs");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(methodOverride("_method"));

const users = [
  {
    id: 1,
    username: "user",
    password: "password",
  },
];

passport.use(
  new LocalStrategy((username, password, done) => {
    const user = users.find((u) => u.username === username);
    if (!user) {
      return done(null, false, { message: "Incorrect username." });
    }
    if (user.password !== password) {
      return done(null, false, { message: "Incorrect password." });
    }
    return done(null, user);
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find((u) => u.id === id);
  done(null, user);
});

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/signup", (req, res) => {
  const { email, password } = req.body;
  const userExists = users.some((u) => u.username === email);
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }
  const newUser = {
    id: users.length + 1,
    username: email,
    password: password,
  };
  users.push(newUser);
  res.json({ message: "Sign-up successful" });
});

app.use((req, res, next) => {
  res.status(404).render("404");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("500");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
