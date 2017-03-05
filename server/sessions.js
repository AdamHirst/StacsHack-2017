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

    fileUpdated : function(sessionId, fileData) {
        // Always keep track of the previous edit to allow for new cursor 
        // positions to be updated later on 
        session = getSessionById(sessionId)
        session["prevFileData"] = session.fileData
        session.fileData = fileData
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

    getCurrentFileData: function(sessionId) {
        return this.getSessionById(sessionId).fileData
    },  

    getUserForSession: function(sessionId) {
        return this.getSessionById(sessionId).users
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
        
        session["prevCursorPos"] = session["cursorPos"]
        session["prevSelectionPos"] = session["prevSelectionPos"]

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

function updateCursorPositions(sessionId, editingUsername) {
    session = getSessionById(sessionId)
    if (session["prevFileData"] == undefined) return;
    var users = session.users
    var user;
    for (var i = 0; i < users.length; i++) {
        if (users[i].username == editingUsername) user = users[i] 
    }

    if (user == undefined) return;

    prevCursorPos = user["prevCursorPos"]
    prevSelectionPos = user["prevSelectionPos"]

    if (prevCursorPos == undefined) return;
    var shift;

    if (prevSelectionPos != undefined) {
        // Previously a selection
        // Selections are more dangerous as the could have deleted a larger body of 
        // text at once
        // TODO implement
    } else {
        // Worst possible situation = user entered/removed new line character
        prevFileLines = session.prevFileData.split(/\r?\n/)
        currFileLines = session.fileData.split(/\r?\n/)

        // If preceeding line is identical, no changes happened
        if (prevFileLines.length <= prevCursorPos.row + 2) return;
        if (prevFileLines[prevCursorPos.row + 1] == currFileLines[prevCursorPos.row + 1]) return;

        // Not identical could imply that a new line was entered
        if (prevFileLines[prevCursorPos.row + 1] == currFileLines[prevCursorPos.row + 2]) {
            // Shifted down by one
            shift = 1;
        } else if (prevFileLines[prevCursorPos.row + 2] == currFileLines[prevCursorPos.row + 1]) {
            // Shifted up by one
            shift = -1;
        }

        // Actual shift relavent cursors
        for (var i = 0; i < session.users.length; i++) {
            if (session.users[i].username == editingUsername) continue;
            cursorPos = session.users[i].cursorPos
            selectPos = session.users[i].selectionPos
            if (cursorPos == undefined) continue;
            if (cursorPos.row >= prevCursorPos.row) {
                cursorPos.row += shift
                if (selectionPos != undefined) {
                    selectionPos.start.row += 1
                    selectionPos.end.row += 1
                }
            }
        }
    }
}



