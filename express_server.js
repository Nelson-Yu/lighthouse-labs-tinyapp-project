const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Declared objects used in the routes

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Functions used in routes => used to generate a ramdom string of 6 characters as the shortURL
const generateRandomString = () => {
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let string = '';
  const stringLength = 6;

  for (let i = 0; i < stringLength; i++) {
    let random = Math.floor(Math.random() * Math.floor(char.length));
    string += char.substring(random, random + 1);
  }
  return string;
}

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

// GET Routes

// Home page that says 'Hello!'
app.get("/", (req, res) => {
  res.send("Hello!");
});

// /hello page that satys 'Hello **World**'
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// /urls.json page taht displays the urls in urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// added /url/:shortURL route
app.get("/urls/:shortURL", (req, res) => {
  let sURL = req.params.shortURL;
  let templateVars = { shortURL: sURL, longURL: urlDatabase[sURL], username: req.cookies["username"]};
  res.render("urls_show", templateVars);

});
// /urls route that uses res.render() to pass url data to our template
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

//added a GET route to show the form from urls_new.ejs
app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("register", templateVars);
})

// POST routes

//added a POST route to receive form submission
app.post("/urls", (req, res) => {
  const getShortURL = String(generateRandomString());
  urlDatabase[getShortURL] = req.body['longURL'];
  res.redirect(`/urls/${getShortURL}`);
});

// added a POST route to detele an URL from the list
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.params.shortURL;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// added a POST route to add an update submit button
app.post("/urls/:shortURL", (req, res) => {
  const updateURL = req.params.shortURL;
  urlDatabase[updateURL] = req.body.newURL;
  res.redirect("/urls");
});

// added a POST  route for a login using cookies
app.post("/login", (req, res) => {
  res.cookie("username", req.body["username"]);
  res.redirect("/urls");
});

//added a POST route for a logout using clearCookies
app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body["username"]);
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  users[user_id] = { "id": user_id, "email": req.body.email, "password": req.body.password };
  res.cookie("user_id", user_id);
  res.redirect("/urls");
})

// LISTEN route

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
