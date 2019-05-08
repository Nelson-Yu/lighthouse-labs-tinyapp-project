const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // set ejs as view engine

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

//added a POST route to receive form submission
app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  const getShortURL = String(generateRandomString());

  urlDatabase[getShortURL] = req.body['longURL'];
  res.redirect(`/urls/${getShortURL}`);
  // console.log (database: urlDatabase); // logs updated urlDatabase
});

const generateRandomString = () => {
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let string = '';
  const stringLength = 6;

  for (let i = 0; i < stringLength; i++) {
    let random = Math.floor(Math.random() * Math.floor(char.length)); //apply Math.random follow MDN
    string += char.substring(random, random + 1); // string together random characters)
  }
  return string;
}

app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.params.shortURL;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const updateURL = req.params.shortURL;
  urlDatabase[updateURL] = req.body.newURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body["username"]);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body["username"]);
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// added /url/:shortURL route
app.get("/urls/:shortURL", (req, res) => {
  let sURL = req.params.shortURL;
  let templateVars = { shortURL: sURL, longURL: urlDatabase[sURL], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
