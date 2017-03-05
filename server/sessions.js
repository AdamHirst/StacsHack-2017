var bcrypt = require("bcrypt-nodejs")
var ranstr = require("randomstring")

var sessions = [];

module.exports = {
    createNewSession: function(username, fileName, password) {
        var id = ranstr.generate(7)
        session = {
            "fileName": fileName,
            "password" : bcrypt.hashSync(password),
            "id" : id,
            "users" : [{"username" : username}]
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

    addUserToSession: function(sessionId, username) {
        this.getSessionById(sessionId).users.push({"username" : username})
    },

    getUsernamesForSession: function(sessionId) {
        this.getSessionById(sessionId).users
    },

    validPassword: function(sessionId, plainPassword) {
        bcrypt.compareSync(plainPassword, this.getSessionById(sessionId).password)
    },

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
    }

}

