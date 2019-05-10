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

  //cookie options
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
      urlsUser[key] = urlDatabase[key]
    }
  }
  return urlsUser;
}

// GET Routes

// A GET route where when a user is logged in "/" will redirect to "/urls", else it will redirect to "/login"
app.get("/", (req, res) => {
  let user_id = req.session["user_id"];

  if (user_id) {
    res.redirect("/urls")
  } else {
    res.redirect("/login")
  }
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
  let user_id = req.session.user_id;
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
    res.status(401).send("401 Unauthorized: Please login to see your URL list")
  }
});

app.get("/urls/new", (req, res) => {
  let user_id = req.session['user_id'];
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

// added /url/:shortURL route
app.get("/urls/:shortURL", (req, res) => {
  let sURL = req.params.shortURL;
  let user_id = req.session['user_id'];
  let currentUser = userDatabase[user_id];

  let templateVars = {
    shortURL: sURL,
    longURL: urlDatabase[sURL][sURL],
    user_id,
    currentUser
  };
  res.render("urls_show", templateVars);
});

//added a GET route to show the form from urls_new.ejs

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL
  let longURL = urlDatabase[shortURL][shortURL];

  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let user_id = req.session['user_id'];
  let currentUser = userDatabase[user_id];
  let templateVars = {
    user_id,
    currentUser
  };
  res.render("register", templateVars);
})

app.get("/login", (req, res) => {
  let user_id = req.session['user_id'];
  let currentUser = userDatabase[user_id];
  let templateVars = {
    user_id,
    currentUser
  };
  res.render("login", templateVars)
})

// POST routes

//added a POST route to receive form submission
app.post("/urls", (req, res) => {
  // const getShortURL = String(generateRandomString());
  // urlDatabase[getShortURL] = req.body['longURL'];
  // res.redirect(`/urls/${getShortURL}`);

  let shortURL = String(generateRandomString());
  let currentUser = req.session["user_id"];
  let longURL = req.body["longURL"];

  let newURL = {
    id: currentUser,
    [shortURL]: longURL
  };

  urlDatabase[shortURL] = newURL
  res.status(201).redirect('/urls');

});

// added a POST route to detele an URL from the list
app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id;
  let currentUser = req.session["user_id"];
  if (currentUser === urlDatabase[shortURL].id) {
    delete urlDatabase[shortURL];
    res.status(200).redirect('/urls');
  } else {
    res.status(401).send('401 Forbidden: Deletion requires owner of URLs')
  }
});

// added a POST route to add an update submit button
app.post("/urls/:shortURL", (req, res) => {
  let currentUser = req.session["user_id"];
  let shortURL = req.params.shortURL;
  let editURL = req.body["newURL"];

  if (currentUser === urlDatabase[shortURL].id) {
    urlDatabase[shortURL][shortURL] = editURL;
    res.status(200).redirect('/urls');
  } else {
    res.status(401).send("401 Forbidden: Edit requires owner of URLs")
  }
});

// added a POST  route for a login using cookies
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
    // res.cookie('user_id', userID);
    req.session.user_id = userID;
    res.redirect('/urls');
  } else {
    res.status(403).send('403: Forbidden');
  }
});

//added a POST route for a logout using clearCookies
app.post("/logout", (req, res) => {
  // res.clearCookie("user_id");
  req.session = null
  res.status(200).redirect("/urls");
});

//added a POST route for /register where email is added to databse + handled registration error
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
    // res.cookie('user_id', user_id);
    req.session["user_id"] = user_id
    res.redirect('/urls');
  }
  console.log(userDatabase); // used to check if userdatabase updated
})

// LISTEN route

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
