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
    codeTextbox.placeholder = "Join Code";
    this.element.appendChild(codeTextbox);

    // Username
    const usernameTextbox = document.createElement('username');
    usernameTextbox.type = "text";
    usernameTextbox.placeholder = "Username";
    this.element.appendChild(usernameTextbox);

    // Buttons
    const buttonSubmit = document.createElement('button');
    buttonSubmit.className = 'btn btn-success';
    buttonSubmit.textContent = 'Join session';
    buttonSubmit.onclick = function() {
      submitCallback(codeTextbox.value, usernameTextbox.value);
    }
    this.element.appendChild(buttonSubmit);
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
