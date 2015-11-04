/*jslint browser: true */

var View = require("ampersand-view");
var State = require("ampersand-state");
var Collection = require("ampersand-collection");

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
	initialize: function(file){
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
		default: "KB"
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
		var self = this;

		for (var key in opts) {
			self[key] = opts[key];
		}

		var file = self.model.file;

		if (this.displayPreview && /image/.test(file.type)) {
			var reader = new FileReader();
			reader.onloadend = function() {
				self.model.preview = reader.result;
			};
			reader.readAsDataURL(file);
		}
	},
	events: {
		"click [data-hook=remove]": "removeFile",
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

				switch(this.fileSizeUnit.toUpperCase()) {
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

function eventNoOp(event) {
	event.stopPropagation();
	event.preventDefault();
}

function arrayDefault() {
	return [];
}

module.exports = View.extend({
	template: template,
	initialize: function() {
		var self = this;

		this.files.on("add remove", function() {
			self.getValue();
			if (self.parent) {
				self.parent.update(self);
			}
		});
	},
	events: {
		"click [data-hook=drop-zone]": "simulateInputClick",
		"change input[type=file]": "handleFileInput",
		"dragover [data-hook=drop-zone]": "dragOver",
		"dragenter [data-hook=drop-zone]": "dragEnter",
		"dragleave [data-hook=drop-zone]": "dragLeave",
		"drop [data-hook=drop-zone]": "drop"
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

				var filesLength = this.files.length;

				if (this.required && !filesLength) {
					return false;
				}

				if (!this.multiple && filesLength > 1) {
					return false;
				}

				if (!this.tests.every(function(test) {
					return test(this.value);
				})) {
					return false;
				}

				return true;
			}
		},
		holderHoveringClassToShow: {
			deps: ["holderHoverClass", "holderHovering"],
			fn: function () {
				if (!this.holderHovering) {
					return "";
				}

				return this.holderHoverClass;
			}
		},
		documentHoveringClassToShow: {
			deps: ["documentHoverClass", "documentHovering"],
			fn: function () {
				if (!this.documentHovering) {
					return "";
				}

				return this.documentHoverClass;
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
		holderHoveringClass: {
			type: "class",
			hook: "drop-zone"
		},
		documentHoveringClassToShow: {
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
		var self = this;

		this.renderWithTemplate(this);
		this.input = this.query("input[type=file]");
		this.renderCollection(self.files, FileView, self.queryByHook("files"), {
			viewOptions: self.itemViewOptions.toJSON()
		});

		var boundDocumentDragStart = self.documentDragStart.bind(self);
		var boundDocumentDragEnd = self.documentDragEnd.bind(self);

		document.body.addEventListener("dragover", eventNoOp);
		document.body.addEventListener("dragenter", boundDocumentDragStart);
		document.body.addEventListener("dragleave", boundDocumentDragEnd);
		document.body.addEventListener("drop", boundDocumentDragEnd);

		self.on("remove", function() {
			document.body.removeEventListener("dragover", eventNoOp);
			document.body.removeEventListener("dragenter", boundDocumentDragStart);
			document.body.removeEventListener("dragleave", boundDocumentDragEnd);
			document.body.removeEventListener("drop", boundDocumentDragEnd);
		});

		return this;
	},
	reset: function() {
		var self = this;
		setTimeout(function() {
			self.files.reset();
			self.getValue();
		}, 0);
	},
	clear: function() {
		this.reset();
	},
	simulateInputClick: function() {
		this.input.click();
	},
	handleFiles: function(files) {

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
		this.handleFiles(Array.prototype.slice.apply(this.input.files));
	},
	dragOver: function(event) {
		event.stopPropagation();
		event.preventDefault();
		event.dataTransfer.effectAllowed = "copy";
		event.dataTransfer.dropEffect = "copy";
	},
	dragEnter: function(event) {
		event.stopPropagation();
		event.preventDefault();
		this.holderHovering = true;
	},
	dragLeave: function(event) {
		event.stopPropagation();
		event.preventDefault();

		var rect = event.delegateTarget.getBoundingClientRect();

       // Check if mouse coordinates are outside the element,
       // since hovering over children causes a leave event;
		if(event.clientX > rect.left + rect.width || event.clientX < rect.left || event.clientY > rect.top + rect.height || event.clientY < rect.top) {
			this.holderHovering = false;
		}
	},
	drop: function(event) {
		event.stopPropagation();
		event.preventDefault();
		this.holderHovering = false;
		this.handleFiles(Array.prototype.slice.apply(event.dataTransfer.files));
	},
	documentDragStart: function(event) {
		event.stopPropagation();
		event.preventDefault();
		this.documentHovering = true;
	},
	documentDragEnd: function(event) {
		event.stopPropagation();
		event.preventDefault();
		this.documentHovering = false;
	}
});
