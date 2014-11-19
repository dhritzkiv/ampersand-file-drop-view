var View = require('ampersand-view');
var State = require('ampersand-state');
var Collection = require('ampersand-collection');

var template = ['<div data-hook=\'drop-zone\'>',
	'<input type=\'file\' style=\'visibility:hidden;width:0;height:0;\'/>',
	'<span data-hook=\'label\'></span>',
	'<div data-hook=\'files\'></div>',
'</div>'].join('');

var fileTemplate = ['<article>',
	'<img width=\'120px\'/>',
	'<span data-hook=\'name\'></span>',
	'<span data-hook=\'type\'></span>',
	'<span data-hook=\'size\'></span>',
	'<button data-hook=\'remove\'>Remove</button>',
'</article>'].join('');

var FileState = State.extend({
	initialize: function(file){
		var self = this;
		this.file = file;

		if (/image/.test(file.type)) {
			var reader = new FileReader();
			reader.onloadend = function() {
				self.preview = reader.result;
			};
			reader.readAsDataURL(file);
		}
	},
	props: {
		size: 'number',
		name: 'text',
		type: 'text',
		file: 'any',
		preview: 'string'
	}
});

var FilesCollection = Collection.extend({
	model: FileState,
	toFiles: function() {
		return this.map(function(fileModel) {
			return fileModel.file;
		});
	}
});

var FileView = View.extend({
	template: fileTemplate,
	events: {
		'click [data-hook=remove]': 'removeFile',
	},
	bindings: {
		'model.size': {
			type: 'text',
			hook: 'size'
		},
		'model.name': {
			type: 'text',
			hook: 'name'
		},
		'model.type': {
			type: 'text',
			hook: 'type'
		},
		'model.preview': [
			{
				type: 'toggle',
				selector: 'img'
			},
			{
				type: 'attribute',
				selector: 'img',
				name: 'src'
			}
		]
	},
	removeFile: function(event) {
		event.preventDefault();
		event.stopImmediatePropagation();
		this.collection.remove(this.model);
	}
});

function eventNoOp(event) {
	event.stopPropagation();
	event.preventDefault();
}

module.exports = View.extend({
	template: template,
	initialize: function() {
		var self = this;

		this.files.on('add remove', function() {
			self.getValue();
			self.checkValid();
			self.parent.update(self);
		});

		window.files = this.files;
	},
	events: {
		'click [data-hook=drop-zone]': 'simulateInputClick',
		'change input[type=file]': 'handleFileInput',
		'dragenter [data-hook=drop-zone]': 'dragEnter',
		'dragover [data-hook=drop-zone]': 'dragOver',
		'drop [data-hook=drop-zone]': 'drop'
	},
	bindings: {
		name: {
			type: 'attribute',
			selector: 'input[type=file]',
			name: 'name'
		},
		label: [
			{
				type: 'toggle',
				hook: 'label'
			},
			{
				type: 'text',
				hook: 'label'
			}
		],
		holderClass: {
			type: 'class',
			hook: 'drop-zone'
		},
		multiple: {
			type: 'booleanAttribute',
			selector: 'input[type=file]',
			name: 'multiple'
		},
		accept: {
			type: 'attribute',
			selector: 'input[type=file]',
			name: 'accept'
		}
	},
	props: {
		holderClass: {
			type: 'string'
		},
		label: {
			type: 'string',
			default: 'Drag and drop a file'
		},
		value: {
			type: 'any'
		},
		required: {
			type: 'boolean',
			default: false
		},
		valid: {
			type: 'boolean',
			default: true
		},
		multiple: {
			type: 'boolean',
			default: false
		},
		name: {
			type: 'string',
			required: true
		},
		accept: {
			type: 'string',
			default: '*/*'
		}
	},
	derived: {
		acceptArray: {
			deps: ['accept'],
			fn: function() {
				return this.accept.split(',');
			}
		}
	},
	collections: {
		files: FilesCollection
	},
	getValue: function() {
		var value;

		value = this.files.toFiles();

		this.value = value;
		return this.value;
	},
	checkValid: function() {

		if (this.required && !this.files.length) {
			this.valid = false;
			return;
		}

		if (this.multiple && this.files.length > 1) {
			this.valid = false;
			return;
		}

		this.valid = true;
	},
	render: function() {
		var self = this;

		this.renderWithTemplate(this);
		this.input = this.query('input[type=file]');
		this.renderCollection(self.files, FileView, self.queryByHook('files'));
	},
	reset: function() {
		var self = this;
		setTimeout(function() {
			self.files.reset();
		}, 0);
	},
	clear: function() {
		this.reset();
	},
	simulateInputClick: function() {
		this.input.click();
	},
	handleFiles: function(files) {

		var MIMEtypes = this.acceptArray.map(function(accept) {
			return new RegExp(accept.replace('*', '[^\\/,]+'));
		});

		files = files.filter(function(file) {
			return MIMEtypes.some(function(mime) {
				return mime.test(file.type);
			});
		});

		if (!this.multiple) {

			if (this.files.length && files.length) {
				throw new Error('Multiple files are not allowed');
			}

			files = files.splice(0, 1);
		}

		this.files.add(files);
	},
	handleFileInput: function() {
		this.handleFiles(Array.prototype.slice.apply(this.input.files));
	},
	dragEnter: eventNoOp,
	dragOver: eventNoOp,
	drop: function(event) {
		event.stopPropagation();
		event.preventDefault();

		this.handleFiles(Array.prototype.slice.apply(event.dataTransfer.files));
	}
});