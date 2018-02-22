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

app.get('/', function (req, res) {
  dbService
  .query('Select * from sys.Databases GO')
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