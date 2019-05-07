var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // set ejs as view engine

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Home page that says 'Hello!'
app.get("/", (req, res) => {
  res.send("Hello!");
});

// hello mage that satys 'Hello **World**'
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// urls.json page taht displays the urls in urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});