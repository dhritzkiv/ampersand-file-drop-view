/*jslint browser: true */

var View = require("ampersand-view");
var State = require("ampersand-state");
var Collection = require("ampersand-collection");
var assign = require("lodash.assign");

var template = ["<div data-hook=\"drop-zone\">",
	"<input type=\"file\" style=\"visibility:hidden;width:0;height:0;\"/>",
	"<span data-hook=\"label\"></span>",
	"<div data-hook=\"files\"></div>",
"</div>"].join("");

var fileTemplate = ["<article>",
	"<img width=\"120px\"/>",
	"<span data-hook=\"name\"></span>",
	"<span data-hook=\"type\"></span>",
	"<div><span data-hook=\"size\"></span><span data-hook=\"size-unit\"></span></div>",
	"<button data-hook=\"remove\">Remove</button>",
"</article>"].join("");

var FileState = State.extend({
	initialize: function(file) {
		this.set("file", file);
	},
	props: {
		size: "number",
		name: "string",
		type: "string",
		file: "any",
		preview: "string"
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

var fileViewProps = {
	fileSizeUnit: {
		type: "string",
		default: "kb"
	},
	displayPreview: {
		type: "boolean",
		default: false
	}
};

var fileViewPropsState = State.extend({
	props: fileViewProps
});

var FileView = View.extend({
	template: fileTemplate,
	initialize: function(opts) {

		assign(this, opts);

		var file = this.model.file;

		if (this.displayPreview && /image/.test(file.type)) {
			var reader = new FileReader();
			reader.onloadend = function() {
				this.model.preview = reader.result;
			}.bind(this);
			reader.readAsDataURL(file);
		}
	},
	events: {
		"click [data-hook=remove]": "removeFile"
	},
	bindings: {
		"fileSizeUnit": {
			type: "text",
			hook: "size-unit"
		},
		"fileSize": {
			type: "text",
			hook: "size"
		},
		"model.name": {
			type: "text",
			hook: "name"
		},
		"model.type": {
			type: "text",
			hook: "type"
		},
		"model.preview": [
			{
				type: "toggle",
				selector: "img"
			},
			{
				type: "attribute",
				selector: "img",
				name: "src"
			}
		]
	},
	props: fileViewProps,
	derived: {
		fileSize: {
			deps: ["model.size", "fileSizeUnit"],
			fn: function() {
				var size = this.model.size;
				var exp = 0;

				switch (this.fileSizeUnit.toUpperCase()) {
					case "KILOBYTE":
					case "KB":
						exp = 10;
						break;
					case "MEGABYTE":
					case "MB":
						exp = 20;
						break;
					case "GIGABYTE":
					case "GB":
						exp = 30;
						break;
					default:
						exp = 0;
				}

				return (size / Math.pow(2, exp)).toFixed(2);
			}
		}
	},
	removeFile: function(event) {
		event.preventDefault();
		event.stopImmediatePropagation();
		this.collection.remove(this.model);
	}
});

function arrayDefault() {
	return [];
}

module.exports = View.extend({
	template: template,
	initialize: function(opts) {

		if (opts.value) {
			this.setValue(opts.value);
		}

		this.listenTo(this.files, "add remove reset", function() {
			this.getValue();
			if (this.parent) {
				this.parent.update(this);
			}
		});
	},
	events: {
		"click [data-hook=drop-zone]": "simulateInputClick",
		"change input[type=file]": "handleFileInput"
	},
	props: {
		holderClass: {
			type: "string",
			default: "file-holder"
		},
		holderHoverClass: {
			type: "string",
			default: "file-holder-hover"
		},
		holderHovering: {
			type: "boolean",
			default: false
		},
		documentHoverClass: {
			type: "string",
			default: "document-hover"
		},
		documentHovering: {
			type: "boolean",
			default: false
		},
		hasFilesClass: {
			type: "string",
			default: "has-files"
		},
		label: {
			type: "string",
			default: "Drag and drop a file"
		},
		value: {
			type: "array",
			default: arrayDefault
		},
		required: {
			type: "boolean",
			default: false
		},
		multiple: {
			type: "boolean",
			default: false
		},
		name: {
			type: "string",
			required: true
		},
		accept: {
			type: "any",
			default: "*/*",
			required: true
		},
		tests: {
			type: "array",
			default: arrayDefault
		}
	},
	children: {
		itemViewOptions: fileViewPropsState
	},
	derived: {
		_accept: {
			deps: ["accept"],
			fn: function() {

				if (typeof this.accept === "string") {
					return this.accept;
				} else if (Array.isArray(this.accept)) {
					return this.accept.join(",");
				} else if (this.accept === true) {
					return "*/*";
				}

				return "";
			}
		},
		_acceptArray: {
			deps: ["_accept"],
			fn: function() {
				return this._accept.split(",").filter(function(i) {
					return i;
				});
			}
		},
		valid: {
			deps: ["value", "required"],
			fn: function() {

				var filesLength = this.value.length;

				if (this.required && !filesLength) {
					return false;
				}

				if (!this.multiple && filesLength > 1) {
					return false;
				}

				return this.tests.every(function(test) {
					return test(this.value);
				}, this);
			}
		},
		_holderHoveringClassToShow: {
			deps: ["holderHoverClass", "holderHovering"],
			fn: function () {
				return this.holderHovering ? this.holderHoverClass : "";
			}
		},
		_documentHoveringClassToShow: {
			deps: ["documentHoverClass", "documentHovering"],
			fn: function () {
				return this.documentHovering ? this.documentHoverClass : "";
			}
		},
		_hasFilesClassToShow: {
			deps: ["value", "hasFilesClass"],
			fn: function () {
				return this.value.length ? this.hasFilesClass : "";
			}
		}
	},
	bindings: {
		name: {
			type: "attribute",
			selector: "input[type=file]",
			name: "name"
		},
		label: [
			{
				type: "toggle",
				hook: "label"
			},
			{
				type: "text",
				hook: "label"
			}
		],
		holderClass: {
			type: "class",
			hook: "drop-zone"
		},
		_holderHoveringClassToShow: {
			type: "class",
			hook: "drop-zone"
		},
		_documentHoveringClassToShow: {
			type: "class",
			hook: "drop-zone"
		},
		_hasFilesClassToShow: {
			type: "class",
			hook: "drop-zone"
		},
		multiple: {
			type: "booleanAttribute",
			selector: "input[type=file]",
			name: "multiple"
		},
		_accept: {
			type: "attribute",
			selector: "input[type=file]",
			name: "accept"
		}
	},
	collections: {
		files: FilesCollection
	},
	getValue: function() {
		this.value = this.files.toFiles();
		return this.value;
	},
	render: function() {
		this.renderWithTemplate(this);
		this.input = this.query("input[type=file]");

		this.renderCollection(this.files, FileView, this.queryByHook("files"), {
			viewOptions: this.itemViewOptions.toJSON()
		});

		var boundDocumentDragOver = this.documentDragOver.bind(this);
		var boundDocumentDragEnter = this.documentDragEnter.bind(this);
		var boundDocumentDragLeave = this.documentDragLeave.bind(this);
		var boundDocumentDragDrop = this.documentDragDrop.bind(this);

		document.body.addEventListener("dragover", boundDocumentDragOver);
		document.body.addEventListener("dragenter", boundDocumentDragEnter);
		document.body.addEventListener("dragleave", boundDocumentDragLeave);
		document.body.addEventListener("drop", boundDocumentDragDrop);

		this.on("remove", function() {
			document.body.removeEventListener("dragover", boundDocumentDragOver);
			document.body.removeEventListener("dragenter", boundDocumentDragEnter);
			document.body.removeEventListener("dragleave", boundDocumentDragLeave);
			document.body.removeEventListener("drop", boundDocumentDragDrop);
		});

		return this;
	},
	clear: function() {
		this.files.reset();
	},
	simulateInputClick: function() {
		this.input.click();
	},
	setValue: function(files) {
		this.clear();
		this.addFiles(files);
	},
	addFiles: function(files) {

		if (this._acceptArray.length) {
			var MIMEtypes = this._acceptArray.map(function(accept) {
				return new RegExp(accept.replace("*", "[^\\/,]+"));
			});

			files = files.filter(function(file) {
				return MIMEtypes.some(function(mime) {
					return mime.test(file.type || "application/octet-stream");
				});
			});
		}

		if (!this.multiple) {

			if (this.files.length && files.length) {
				throw new Error("Multiple files are not allowed");
			}

			files = files.splice(0, 1);
		}

		this.files.add(files);
	},
	handleFileInput: function() {
		this.addFiles(Array.prototype.slice.apply(this.input.files));
	},
	documentDragCounter: 0,
	documentDragOver: function(event) {
		event.stopPropagation();
		event.preventDefault();

		//contains returns true if the element is itself or a descendent of itself.
		if (this.el.contains(event.target)) {
			event.dataTransfer.effectAllowed = "copy";
			event.dataTransfer.dropEffect = "copy";
		}
	},
	documentDragEnter: function(event) {
		event.stopPropagation();
		event.preventDefault();
		this.documentDragCounter++;
		this.documentHovering = true;

		if (this.el.contains(event.target)) {
			this.holderHovering = true;
		}
	},
	documentDragLeave: function(event) {
		event.stopPropagation();
		event.preventDefault();
		this.documentDragCounter--;

		var rect = this.el.getBoundingClientRect();

		if (!this.documentDragCounter) {
			this.documentHovering = false;
		}

		if (!(event.clientX < rect.left + rect.width && event.clientX > rect.left && event.clientY < rect.top + rect.height && event.clientY > rect.top)) {
			// Check if mouse coordinates are inside the element,
			// since hovering over children causes a leave event;
			this.holderHovering = false;
		}
	},
	documentDragDrop: function(event) {
		event.stopPropagation();
		event.preventDefault();
		this.holderHovering = false;
		this.documentHovering = false;
		this.documentDragCounter = 0;

		//contains returns true if the element is itself or a descendent of itself.
		if (this.el.contains(event.target) && event.dataTransfer.files.length) {
			this.addFiles(Array.prototype.slice.apply(event.dataTransfer.files));
		}
	}
});
