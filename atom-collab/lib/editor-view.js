'use babel';

export default class EditorView {

  constructor(serializedState) {
    this.element = document.createElement('div');
    this.element.classList.add('plugin');

  }

  serialize() {}

  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }



}
