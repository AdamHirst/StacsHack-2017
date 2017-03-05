'use babel';

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

  activate(state) {
    this.editorView = new EditorView(state.editorViewState);
    this.joinView = new JoinView(state.joinViewState, this.connectToSession);

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
    }))
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

  hostInstance() {
    // Initiate the socket
    this.socket = require('socket.io-client')("http://localhost:3000/");

    // The data to send to the server
    var data = {
        desiredUsername: "Bob",
        fileName: "hello"
    };

    this.socket.on('connection', function() {
      console.log(this.socket.id);
    });

    this.socket.on('register_response', function(d) {
      var sessionId = d.sessionId;
      this.username = d.username;

      atom.notifications.addSuccess("Success! Send this code to collaborators:",
      {
          dismissable: true,
          description: "Collaborators can join the session by navigating to \"Packages > Neutrino > Join Session...\" and entering the code above.",
          detail: sessionId,
          buttons: [
              {
                  text: "Copy",
                  onDidClick: function() {
                      atom.clipboard.write(sessionId);
                  }
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

      // Setup text editor
      //this.editor = atom.
    });

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
  connectToSession(id) {
    // Close the panel
  },

  leaveSession() {
    // Close the active session
    if (this.socket == null)
      this.socket.close();
  },

};
