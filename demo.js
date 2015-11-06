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

formView.render();

window.formView = formView;

document.body.appendChild(formView.el);

var style = document.createElement('style');
style.innerHTML = [
	'html {height: 100%;}',
	'body {',
		'min-height: 100%;',
		'display: flex;',
		'justify-content: center;',
		'align-items: center;',
		'text-align: center;',
	'}',
	'[data-hook=drop-zone] {',
		'background-color: #ddd;',
		'min-height: 100px;',
		'padding: 10px;',
		'margin-bottom: 20px;',
	'}',
	'[data-hook=drop-zone].document-hover {',
		'background-color: #c8e4e4;',
	'}',
	'[data-hook=drop-zone].file-holder-hover {',
		'background-color: #c8ffc8;',
	'}',
	'[data-hook=drop-zone] [data-hook=label] {',
		'line-height: 100px;',
	'}',
	'[data-hook=drop-zone].has-files [data-hook=label] {',
		'display: none;',
	'}'
].join('');

document.body.appendChild(style);
