const sql = require('mssql');
let Observable = require('rxjs/Observable').Observable;
let prettyjson = require('prettyjson');
require('rxjs/add/operator/map');
require('rxjs/add/observable/fromPromise');

class DbService {

  constructor() {
    this.instance = null;
    this.dbUrl = `mssql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
  }

  init() {
    return Observable.fromPromise(
      sql.connect(this.dbUrl)
      .then(pool => pool.request())
      .catch(err => console.log(err.red))
    ).map(request => {
      this.instance = request;
      return request;
    });
     
    sql.on('error', err => console.log(err.red));
  }

  query(queryString) {
    console.log(queryString.cyan);

    return Observable.fromPromise(
      this.instance.query(queryString)
      .then(({ recordsets }) => {
        console.log(prettyjson.render(recordsets))
        return recordsets;
      })
      .catch(err => console.log(err))
    ).map(recordsets => recordsets);
  }
}

module.exports = DbService;