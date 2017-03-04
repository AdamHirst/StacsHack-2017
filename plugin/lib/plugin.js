'use babel';

import { CompositeDisposable } from 'atom';

export default {

  subscriptions: null,
  socket: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'plugin:host': () => this.hostInstance()
    }));
    // this.subscriptions.add(atom.commands.add('atom-workspace', {
    //   'plugin:stop': () => this.stopHosting()
    // }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {},

  hostInstance() {

      var data = {
          username: "Bob",
          files: {
              test: "This is a test document"
          }
      };

      var socket = require('socket.io-client')("http://localhost:8000/socket.io/");
      socket.on('update', function(d) { console.log(d); });

      socket.connect();

      socket.emit('register', data);

      socket.close();

      var code = "YXKSM";
      atom.notifications.addSuccess("Success! Paste this code to collaborators: " + code,
        {
            dismissable: true,
            buttons: [
                {
                    text: "Copy",
                    onDidClick: function() {
                        atom.clipboard.write(code);
                    }
                },
                {
                    text: "Stop hosting",
                    onDidClick: function() {
                        stopHosting();
                    }
                }
            ]
        });
  },

  stopHosting() {
  },

};
