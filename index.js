let express = require('express');
let app = express();
require('colors');
require('dotenv').config();

let DbService = require('./services/db.service');

let Observable = require('rxjs/Observable').Observable;
require('rxjs/add/operator/map');
require('rxjs/add/observable/fromPromise');

let dbService = new DbService();

const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin' , '*');
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  next();
});

app.get('/api/users', function (req, res) {
  dbService
  .query('Select id, login from USERS')
  .subscribe((query) => {
    res.send(query);
  });
});

app.post('/api/users', function (req, res) {

  let { login, password } = req.body;

  let params = {
    pLogin: login,
    pPassword: password
  }

  dbService
  .execute('createUser', params)
  .subscribe((query) => {
    res.send(query);
  });
});

app.listen(PORT, () => {
  dbService
  .init()
  .subscribe(() => {
    console.log('successful connecting to database...'.magenta);
  })
});