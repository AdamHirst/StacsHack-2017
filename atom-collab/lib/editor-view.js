'use babel';

export default class EditorView {

  constructor(serializedState) {
    this.element = document.createElement('div');

    const container = document.createElement('div');
    container.class = "user-container";

  }

  serialize() {}

  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }



}
