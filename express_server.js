const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// const cookieParser = require('cookie-parser');
// app.use(cookieParser());

const cookieSession = require('cookie-session');
app.use(cookieSession( {
  name: "session",
  keys: ["AbC321"],
  maxAge: 24 * 60 * 60 * 1000
}))

const bcrypt = require('bcrypt');

// Declared objects used in the routes

const urlDatabase = {
  "b2xVn2": {
    "id": "userRandomID",
    "b2xVn2": "http://www.lighthouselabs.ca",
  },
  "9sm5xK": {
    "id": "user2RandomID",
    "9sm5xK": "http://www.google.com"
  }
};

const userDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    hashedPassword: bcrypt.hashSync("dino", 12)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: bcrypt.hashSync("funk", 12)
  }
}

// Functions used in routes => used to generate a ramdom string of 6 characters as the shortURL
const generateRandomString = () => {
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let string = "";
  const stringLength = 6;

  for (let i = 0; i < stringLength; i++) {
    let random = Math.floor(Math.random() * Math.floor(char.length));
    string += char.substring(random, random + 1);
  }
  return string;
}

const emailCheck = (email) => {
  for (let user_id in userDatabase) {
    if (userDatabase[user_id].email === email) {
      return  true;
    }
  }
  return false;
}

const urlsForUser = (id) => {
  let urlsUser = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].id === id) {
      urlsUser[key] = urlDatabase[key];
    }
  }
  return urlsUser;
}

// GET Routes

// A GET route where when a user is logged in "/" will redirect to "/urls", else it will redirect to "/login"
app.get("/", (req, res) => {
  let user_id = req.session["user_id"];

  if (user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// A GET route where when a user is logged in it renders "urls_index", else return an error
app.get("/urls", (req, res) => {
  let user_id = req.session["user_id"];
  let currentUser = userDatabase[user_id];
  let userURLs = urlsForUser(user_id)

  let templateVars = {
    user_id,
    currentUser,
    urls: urlDatabase,
    userURLs,
    users: userDatabase
  };

  if (user_id) {
    res.render("urls_index", templateVars);
  } else {
    res.status(401).send("401 Unauthorized: Please login to see your URL list");
  }
});

// A GET route for /urls/new where if the user is logged in it renders "urls_new", else returns error
app.get("/urls/new", (req, res) => {
  let user_id = req.session["user_id"];
  let currentUser = userDatabase[user_id];

  let templateVars = {
    user_id,
    currentUser
  };

  if(user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.status(403).redirect("/login");
  }
});

// A GET route to /urls/:id where if the user_id matches the id of the URLdatabase render "urls_show", else error.
app.get("/urls/:id", (req, res) => {
  let user_id = req.session["user_id"];
  let currentUser = userDatabase[user_id];
  let shortURL = req.params.id;
  let longURL = urlDatabase[shortURL][shortURL]

  let templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    user_id,
    currentUser
  };

  if (user_id === urlDatabase[shortURL].id) {
    res.render("urls_show", templateVars);
  } else if (!longURL) {
    res.status(404).send("404 Not Found: This URL does not exist");
  }  else {
    res.status(401).send("401 Unauthorized: Unable to access this page");
  }
});

// A GET route that when accessed redirects to the longURL, if the longURL does not exist it will return a 404 error
app.get("/u/:id", (req, res) => {
  let shortURL = req.params.id
  let longURL = urlDatabase[shortURL][shortURL];

  if (longURL) {
    res.status(302).redirect(longURL);
  } else {
    res.status(404).send("404 Not Found: This URL does not exist!");
  }
});

// A GET route that redirects the user if logged in, else a login from is displayed
app.get("/login", (req, res) => {
  let user_id = req.session["user_id"];
  let currentUser = userDatabase[user_id];
  let templateVars = {
    user_id,
    currentUser
  };

  if (user_id) {
    res.status(300).redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
})

// A GET route that redirects the user if logged in, else a register from is displayed
app.get("/register", (req, res) => {
  let user_id = req.session["user_id"];
  let currentUser = userDatabase[user_id];
  let templateVars = {
    user_id,
    currentUser
  };

  if (user_id) {
    res.status(300).redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
})


// POST routes

// A POST route to receive form submission from /urls/new and adds the URL to the list of URLS
app.post("/urls", (req, res) => {
  let user_id = req.session["user_id"];
  let shortURL = String(generateRandomString());
  let longURL = req.body["longURL"];

  let addURL = {
    id: user_id,
    [shortURL]: longURL
  };

  urlDatabase[shortURL] = addURL;

  if (user_id) {
    res.status(201).redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send("401 Unauthorized: Please login to add a new URL.")
  }
});

// A POST route to accept the update submission from the urls/:id page
app.post("/urls/:id", (req, res) => {
  let user_id = req.session["user_id"];
  let shortURL = req.params.id;
  let editURL = req.body["newURL"];

  if (user_id === urlDatabase[shortURL].id) {
    urlDatabase[shortURL][shortURL] = editURL;
    res.status(200).redirect('/urls');
  } else {
    res.status(401).send("401 Forbidden: Edit requires owner of URLs")
  }
});

// A POST route to detele an URL from the list, if the user is the not the owner of the URL it will return an error.
app.post("/urls/:id/delete", (req, res) => {
  let user_id = req.session["user_id"];
  let shortURL = req.params.id;

  if (user_id === urlDatabase[shortURL].id) {
    delete urlDatabase[shortURL];
    res.status(200).redirect('/urls');
  } else {
    res.status(401).send('401 Forbidden: Deletion requires owner of URLs')
  }
});

// A POST route for a login using encrypted cookies and hashed passwords
// The if statement checks if the email is already registered or if the entered email/password match or not
app.post("/login", (req, res) => {
   let match = false;
   let userID = '';

   for (let user in userDatabase) {
    const emailInput = req.body.email;
    const passwordInput = req.body.password;
    const userPassword = userDatabase[user].hashedPassword;
     if ((userDatabase[user].email === emailInput) && (bcrypt.compareSync(passwordInput, userPassword))) {
      match = true;
      userID = userDatabase[user].id;
      }
    }

   if (!emailCheck(req.body.email)) {
    res.status(403).send('403: Email is not registered');
  } else if (match) {
    req.session.user_id = userID;
    res.redirect('/urls');
  } else {
    res.status(403).send('403: Forbidden');
  }
});

//A POST route for a logout using clear cookiesession
app.post("/logout", (req, res) => {
  req.session = null;
  res.status(200).redirect("/urls");
});

// A POST route for /register where email is added to database + encrypt cookies + hashing password
// If statement is used to handle any errors where
app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  const emailInput = req.body.email;
  const passwordInput = req.body.password;
  const hashPassword = bcrypt.hashSync(passwordInput, 12);

  let userList = {id: user_id, email: emailInput, hashedPassword: hashPassword};

  if (!userList.email || !userList.hashedPassword) {
    res.status(400).send('400 Bad Request: Please enter email and password');
  } else if (emailCheck(req.body.email)) {
    res.status(400).send('400 Bad Request: E-mail already registered, please use another e-mail');
  } else {
    userDatabase[user_id] = userList;
    req.session["user_id"] = user_id;
    res.redirect('/urls');
  }
})

// LISTEN route

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
