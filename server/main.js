var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var session = require('./sessions.js')
const util = require('util')

io.on("connection", function(socket) {
	console.log("user connected (socket ID " + socket.id + ")");
	socket.on("register", function(client) {
		var user = client.desiredUsername;
		var filename = client.fileName;
		var passwd = client.password;
		var sessionId;
		//if the client also sent a session id then it wants to join the session
		if (client.hasOwnProperty("sessionId")) {
			session.addUserToSession(client.sessionId, user);
			sessionId = client.sessionId;
		} else
			sessionId = session.createNewSession(user, filename, passwd);
		//add this client to the group defined by the session id
		socket.join(sessionId)
		return JSON.stringify({
			"sessionId": sessionId,
			"username": user,
		})
	});
	socket.on("deregister", function(client) {
		//TODO more checking here
		socket.leave(client.sessionId);
	});
	socket.on("request", function(client) {
		for (s in session.sessions)
			socket.broadcast.to(s.id).emit("update");
		return null;
	})
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
