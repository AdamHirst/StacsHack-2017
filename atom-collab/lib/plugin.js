'use babel';
// Hello
import { CompositeDisposable } from 'atom';
import EditorView from './editor-view';
import JoinView from './join-view';

export default {

  subscriptions: null,
  username: null,
  socket: null,
  editorView: null,
  editorModalPanel: null,
  joinView: null,
  joinModalPanel: null,
  editor: null,
  sessionId: null,
  blocking: false,

  activate(state) {
    this.editorView = new EditorView(state.editorViewState);
    this.joinView = new JoinView(state.joinViewState, this.connectToSession.bind(this));

    this.joinModalPanel = atom.workspace.addModalPanel({
      item: this.joinView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register commands
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'neutrino:host': () => this.hostInstance()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'neutrino:stop': () => this.stopHosting()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'neutrino:join': () => this.joinSession()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'neutrino:leave': () => this.leaveSession()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return {
      editorViewState: this.editorView.serialize(),
      joinViewState: this.joinView.serialize()
    }
  },

  handleUpdate() {
    console.log("Registered update handler");
    this.socket.on('server_update', function(d) {
      console.log("Update recieved");

      this.blocking = true;
      console.log("Started blocking updates");
      window.setTimeout(function() {
        console.log("Stopped blocking");
        this.blocking = false;
      }.bind(this), 100);

      console.log(d);
      var fileData = d.fileData;
      this.editor.setText(fileData);
      var collaborators = d.collaborators; // [] of { username, cursor, selection }
      var i = 1; // tracks colour
      for (var c in collaborators) {
        if (c.username == this.username) {
          // Update cursor
          this.editor.setCursorBufferPosition([c.cursor.row, c.cursor.col]);
        } else {
          var ml = this.editor.getDefaultMarkerLayer();

          // Show cursor
          var cursor = ml.markBufferPosition([c.cursor.row, c.cursor.col]);
          this.editor.decorateMarker(cursor, { type: 'highlight', class: 'cursor-' + i })

          // Show selections
          var selection = ml.markBufferSelection([
            [c.selection.start.row, c.selection.start.col],
            [c.selection.end.row, c.selection.end.col]]);
          this.editor.decorateMarker(selection, { type: 'highlight', class: 'highlight-cursor-' + i })

          i = (i < 4) ? i++ : 1;
        }
      }
    }.bind(this));
  },

  sendUpdate() {
    if (this.blocking) {
      console.log("update blocked");
      return;
    }

    console.log("sending update:");

    console.log("Global sid: " + this.sessionId + "; username: " + this.username);
    console.log(this.editor.getCursorBufferPosition().column);

    if (!this.socket) return;
    console.log("socket not null");
    this.socket.emit('update', {
      fileData: this.editor.getText(),
      username: this.username,
      sessionId: this.sessionId,
      cursor: {
        row: this.editor.getCursorBufferPosition().row,
        col: this.editor.getCursorBufferPosition().column,
      },
      selection: {
        start: {
          row: this.editor.getSelectedBufferRange().start.row,
          col: this.editor.getSelectedBufferRange().start.column,
        },
        end: {
          row: this.editor.getSelectedBufferRange().end.row,
          col: this.editor.getSelectedBufferRange().end.column,
        }
      }
    });
  },

  initiateEditorAsContext() {
    this.editor = atom.workspace.getActiveTextEditor();

    // Register update events
    this.editor.onDidChange(this.sendUpdate.bind(this));
    this.editor.onDidChangeCursorPosition(this.sendUpdate.bind(this));
    this.editor.onDidChangeSelectionRange(this.sendUpdate.bind(this));
  },

  hostInstance() {
    // Initiate the socket
    this.socket = require('socket.io-client')("http://localhost:3000/");

    // Setup text editor
    this.initiateEditorAsContext();
    this.handleUpdate();

    // The data to send to the server
    var data = {
        desiredUsername: "Bob",
        fileName: "",
        password: "",
        fileData: this.editor.getText(),
    };

    this.socket.on('connection', function() {
      console.log(this.socket.id);
    });

    this.socket.on('register_response', function(d) {
      this.sessionId = d.sessionId;
      this.username = d.username;

      atom.notifications.addSuccess("Success! Send this code to collaborators:",
      {
          dismissable: true,
          description: "Collaborators can join the session by navigating to \"Packages > Neutrino > Join Session...\" and entering the code above.",
          detail: this.sessionId,
          buttons: [
              {
                  text: "Copy",
                  onDidClick: function() {
                      atom.clipboard.write(this.sessionId);
                  }.bind(this)
              },
              {
                  text: "Stop hosting",
                  className: "btn btn-danger",
                  onDidClick: function() {
                      stopHosting();
                  }
              }
          ]
      });
      //this.editor = atom.
    }.bind(this));

    // Open the socket
    this.socket.open();

    // Register the client as the host of a new session
    this.socket.emit('register', data, function(d) {
      console.log(d);
    });
  },

  stopHosting() {
    // TODO
    // Close the active session
    if (this.socket)
      this.socket.close();
  },

  // Opens the join modal panel
  joinSession() {
    // TODO
    return this.joinModalPanel.show();
  },

  // Handles joining a session
  connectToSession(id, username) {
    console.log("Connecting to session: " + id);

    this.joinModalPanel.hide();

    this.sessionId = id;
    this.username = username;

    console.log("Global sid: " + this.sessionId + "; username: " + this.username);

    // Initiate socket
    this.socket = require('socket.io-client')("http://localhost:3000/");

    this.initiateEditorAsContext();
    this.handleUpdate();

    // Server does not implement error handling at all, so we implicitly assume the connection is valid
    // Open connection
    this.socket.open();

    this.socket.emit('join', {
      sessionId: id,
      desiredUsername: username
    });
  },

  leaveSession() {
    // Close the active session
    if (this.socket == null)
      this.socket.close();
  },

};
