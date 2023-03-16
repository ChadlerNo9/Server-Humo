const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('./users.db');
const app = express();
const port = 8080;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

var names = [];
var pwords = [];

db.serialize(()=>{
    db.all("SELECT * FROM users", [], (err, row) => {
        if(err)
          console.log(err);
        row.forEach(data =>{
          names.push(data.aname);
          pwords.push(data.pword);
        })
    });
});

app.get('/', (req, res) => {
  if(req.session.loggedIn)
    res.sendFile(__dirname + '/dashboard.html');
  res.sendFile(__dirname + '/index.html');

});


app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (names.indexOf(username.toLowerCase()) != -1 && pwords.indexOf(password.toLowerCase()) != -1) {
    req.session.loggedIn = true;
    res.redirect('/dashboard');
  } else {
    res.send('Invalid username or password');
  }
});

app.post('/register', (req, res)=> {

  db.run("INSERT INTO users VALUES(?, ? , ?)", req.body.username, req.body.password, req.body.email);
  res.redirect('/');
});

app.post('/create', (req,res) =>{

  res.sendFile(__dirname + '/register.html');
});

app.get('/dashboard', (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(__dirname + '/dashboard.html');
  } else {
 res.redirect('/');   res.redirect('/');
  }
});


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});