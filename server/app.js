var express = require( 'express' );
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded( {extended: false} );
var pg = require('pg');
var connectionString = 'postgres://localhost:5432/treatYoSelf';
var port = process.env.PORT || 3005;

//static folder
app.use( express.static('public'));

//spin up server
app.listen( port, function(){
  console.log('server up on', port);
});

//base url hit
app.get('/', function(req,res){
  console.log('base url hit');
  // send index file
  res.sendFile(path.resolve('public/views/index.html'));
});

// get all the treats
app.get('/treats', function(req, res){
  console.log('getting treats');
  // send treat list to client
  pg.connect(connectionString, function(err, client, done){
    if (err){
      console.log(err);
    }else{
      var resultsArray = [];
      var query = client.query('SELECT * FROM treat');
      query.on('row', function(row){
        resultsArray.push(row);
      });
      query.on('end', function(){
        done();
        return res.json( resultsArray);
      });
    }// end else
  }); // end connect
}); // end get table
// add treat route
app.post('/treats', urlEncodedParser, function(req, res){
  console.log('add treat hit:', req.body);
  // add treat
  var data = {name: req.body.name, description: req.body.description, url:req.body.url};
  pg.connect( connectionString, function( err, client, done){
    if (err) {
      console.log(err);
    }else{
      console.log('connect to db');
      //insert new row
      client.query('INSERT INTO treat (name, description, pica) VALUES ($1, $2, $3)', [data.name, data.description, data.url]);
      done();
    } // end else
  }); // end pg connect
    // send back something ...
    res.send(true);
}); // end add treat post
