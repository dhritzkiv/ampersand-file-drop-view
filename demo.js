/*global console, window, document*/
// can be run with `npm run demo`
var FileDropView = require('./ampersand-file-drop-view');
var FormView = require('ampersand-form-view');

var input = new FileDropView({
	name: 'files',
	multiple: true,
	accept: 'image/*'
});

var form = document.createElement('form');
form.innerHTML = '<div data-hook="field-container"></div><input type="submit">';

var formView = new FormView({
	el: form,
	fields: [input],
	submitCallback: function (vals) {
		console.log(vals);
	}
});

window.formView = formView;

document.body.appendChild(formView.el);
