'use babel';

/*
  View for joining a session
*/
export default class JoinView {

  constructor(serializedState, submitCallback) {
    this.element = document.createElement('div');

    // Message
    const title = document.createElement('div');
    title.textContent = 'Join code:'
    this.element.appendChild(title);

    // Textbox
    const codeTextbox = document.createElement('input');
    codeTextbox.type = "text";
    codeTextbox.className = 'editor mini';
    this.element.appendChild(codeTextbox);

    // Buttons
    const button = document.createElement('button');
    button.className = 'btn btn-success';
    button.textContent = 'Join session';
    button.onclick = function() {
      submitCallback(codeTextbox.value);
    }
    this.element.appendChild(button);
  }

  serialize() {}

  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  getCode() {
    return this.code;
  }

}
