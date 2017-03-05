var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var session = require('./sessions.js')
const util = require('util')

io.on("connection", function(socket) {
	console.log("user connected (socket ID " + socket.id + ")");

	socket.on("register", function(client) {
		console.log("received register event from socket (" + socket.id + ")");
		console.log(client);
		var user = client.desiredUsername;
		var filename = client.fileName;
		var passwd = client.password;
		var sessionId;
		//if the client also sent a session id then it wants to join the session
		if (client.hasOwnProperty("sessionId")) {
			session.addUserToSession(client.sessionId, user);
			sessionId = client.sessionId;
		} else
			sessionId = session.createNewSession(user, filename, "", passwd);
		//add this client to the group defined by the session id
		socket.join(sessionId)
		socket.emit('register_response', {
			"sessionId": sessionId,
			"username": user,
		});
	});

	socket.on("deregister", function(client) {
		//TODO more checking here
		console.log("received deregister from socket (" + socket.id + ")");
		socket.leave(client.sessionId);
	});

	socket.on("request", function(client) {
		console.log("received request event from socket (" + socket.id + ")");
		console.log(client);
		for (s in session.sessions) {
			console.log("broadcasting file data to session: " + s.id);
			data = {"collaborators": []};
			for (username in session.getUsernamesForSession(s.id)) {
				data.collaborators[username] = {
					"fileData": "you big ol' file, you!",
					"cursor": {
						"row": 0,
						"col": 0,
					},
					"selection": {
						"start": {
							"row": 0,
							"col": 0,
						},
						"end": {
							"row": 0,
							"col": 0,
						},
					},
				};
			}
			socket.broadcast.to(s.id).emit("update", data);
		}
		//return null;
	});
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
