let express = require('express');
let app = express();
require('colors');
require('dotenv').config();

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

let DbService = require('./services/db.service');

let Observable = require('rxjs/Observable').Observable;
require('rxjs/add/operator/map');
require('rxjs/add/observable/fromPromise');

let dbService = new DbService();

const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin' , '*');
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");
  next();
});

function authorization(req) {
  if (req.headers && req.headers.authorization) {
    var authorization = req.headers.authorization.split(' ')[1];
    var decoded = jwt.verify(authorization, 'secret');
    var userId = decoded.id;
    return userId;
  } else {
    return null;
  }
}

app.post('/api/posts', (req, res) => {
  let userId = authorization(req);

  if (!userId) {
    res.send({status: null});
  } else {
    let { title, content } = req.body;

    let inputParams = {
      pTitle: title,
      pContent: content,
      pUserId: userId
    }
  
    let outputParams = {
      status: null
    }

    dbService
    .execute('createPost', inputParams, outputParams)
    .subscribe((query) => {
      res.send(query);
    });
  }
});

app.get('/api/posts', (req, res) => {
  let { userId } = req.query
  dbService
  .query(`Select id, title, content from POSTS where userId = '${userId}'`)
  .subscribe((query) => {
    res.send(query);
  });
});

app.get('/api/users', (req, res) => {
  dbService
  .query('Select id, login from USERS')
  .subscribe((query) => {
    res.send(query);
  });
});

app.post('/api/users', (req, res) => {

  let { login, password } = req.body;

  let inputParams = {
    pLogin: login,
    pPassword: password
  }

  let outputParams = {
    status: null
  }

  dbService
  .execute('createUser', inputParams, outputParams)
  .subscribe((query) => {
    res.send(query);
  });
});

app.post('/api/authenticate', (req, res) => {
  let { login, password } = req.body;

  let inputParams = {
    pLogin: login,
    pPassword: password
  }

  let outputParams = {
    userId: null
  }

  dbService
  .execute('loginUser', inputParams, outputParams)
  .subscribe((query) => {
    let userId = query && query.output && query.output.userId;

    if (userId == 'null' || !userId) {
      res.send({currentUser: null});
    } else {
      dbService.query(`SELECT id, login FROM USERS where Id = '${userId}'`)
      .subscribe((query) => {
        let user = query && query[0] && query[0][0];

        if (!user) {
          res.send({currentUser: null});
        }

        var token = jwt.sign({ id: user.id, login: user.login }, 'secret', {
          expiresIn: 86400 // expires in 24 hours
        });

        res.send({currentUser: {login: user.login, id: user.id, token: token}});
      })
    }

  })
})

app.listen(PORT, () => {
  dbService
  .init()
  .subscribe(() => {
    console.log('successful connecting to database...'.magenta);
  })
});