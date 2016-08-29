var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

app.use(express.static(process.cwd()));

app.get('/', function(req, res){
  res.sendFile('index.html')
});

var server = app.listen(port, function() {
   console.log('Listening on port %d', server.address().port);
});