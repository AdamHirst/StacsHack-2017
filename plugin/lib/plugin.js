'use babel';

import PluginView from './plugin-view';
import { CompositeDisposable } from 'atom';

export default {

  pluginView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.pluginView = new PluginView(state.pluginViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.pluginView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'plugin:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.pluginView.destroy();
  },

  serialize() {
    return {
      pluginViewState: this.pluginView.serialize()
    };
  },

  toggle() {
    console.log('Plugin was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
