var bcrypt = require("bcrypt-nodejs")
var ranstr = require("randomstring")

var sessions = [];

module.exports = {
    createNewSession: function(username, fileName, fileData, password) {
        var id = ranstr.generate(7)
        session = {
            "fileName": fileName,
            "password" : bcrypt.hashSync(password),
            "id" : id,
            "users" : [{"username" : username}],
            "fileData" : fileData
        }

        sessions.push(session)
        return id
    },

    getSessionById: function(id) {
        for (var i = 0; i < sessions.length; i++) {
            var session = sessions[i]
            if (session.id == id) return session
        }

        return null
    },

    // Adds a user to a session.
    // Note that this function completly ignores any authentication requirements on the server.
    // To use authentication, then use addUserToAuthenticatedSession instead
    addUserToSession: function(sessionId, username) {
        this.getSessionById(sessionId).users.push({"username" : username})
    },

    // Only adds the user to the session if they have the correct password
    // A boolean is returned to indicate the authentication status (true = success)
    // If the session does not have a password set, then this function will add 
    // the user to the session regardless of the plainPassword contents
    addUserToAuthenticatedSession: function(sessionId, username, plainPassword) {
        session = this.getSessionById(sessionId)
        if (session["password"] == undefined || this.validPassword(sessionId, plainPassword)) {
            this.addUserToSession(sessionId, username)
            return true;
        }

        return false
    },

    getUsernamesForSession: function(sessionId) {
        this.getSessionById(sessionId).users
    },

    validPassword: function(sessionId, plainPassword) {
        return bcrypt.compareSync(plainPassword, this.getSessionById(sessionId).password)
    },

    // Set the cursor and selection positions 
    // These come straight from atom

    /*
        cursorPos : {
            row: int
            column: int
        }

        selectionPos : {
            start: cursorPos,
            end: cursorPos
        }
    */
    setCursorAndSelectionPos: function(sessionId, username, cursorPos, selectionPos) {
        session = this.getSessionById(sessionId)
        if (!session) return null;
        for (var i = 0; i < session.users.length; i++) {
            var user = session.users[i]

            if (user.username == username) {
                user["cursorPos"] = cursorPos
                user["selectionPos"] = selectionPos
            }
        }
    },

    getUsersForSession: function(sessionId) {
        return this.getSessionById(sessionId).users
    }

}

