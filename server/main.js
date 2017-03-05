var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var session = require('./sessions.js')
const util = require('util')

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('register', function() {
    console.log('register recieved');
  });
});
    
http.listen(3000, function(){
    console.log(util.inspect(session.getSessionById(id), false, null))
});
