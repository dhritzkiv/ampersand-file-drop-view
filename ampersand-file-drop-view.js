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
		name: "text",
		type: "text",
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

var FileView = View.extend({
	template: fileTemplate,
	initialize: function(opts) {
		var self = this;
		self.displayPreview = opts.displayPreview;
		self.fileSizeUnit = opts.fileSizeUnit;
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
	props: {
		displayPreview: {
			type: "boolean"
		},
		fileSizeUnit: {
			type: "string"
		}
	},
	derived: {
		fileSize: {
			deps: ["model.size", "fileSizeUnit"],
			fn: function() {
				var number = this.model.size;
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

				return (number / Math.pow(2,exp)).toFixed(2);
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

module.exports = View.extend({
	template: template,
	initialize: function() {
		var self = this;

		this.files.on("add remove", function() {
			self.getValue();
			//self.valid;
			if (self.parent) {
				self.parent.update(self);
			}
		});
	},
	events: {
		"click [data-hook=drop-zone]": "simulateInputClick",
		"change input[type=file]": "handleFileInput",
		"dragenter [data-hook=drop-zone]": "dragEnter",
		"dragover [data-hook=drop-zone]": "dragOver",
		"drop [data-hook=drop-zone]": "drop"
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
		multiple: {
			type: "booleanAttribute",
			selector: "input[type=file]",
			name: "multiple"
		},
		accept: {
			type: "attribute",
			selector: "input[type=file]",
			name: "accept"
		}
	},
	props: {
		holderClass: {
			type: "string"
		},
		label: {
			type: "string",
			default: "Drag and drop a file"
		},
		value: {
			type: "any"
		},
		required: {
			type: "boolean",
			default: true
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
			type: "string",
			default: "*/*"
		},
		tests: {
			type: "array",
			default: function() {
				return [];
			}
		},
		fileSizeUnit: {
			type: "string",
			default: "KB"
		},
		displayPreviews: {
			type: "boolean",
			default: true
		}
	},
	derived: {
		acceptArray: {
			deps: ["accept"],
			fn: function() {
				var accept;
				if (typeof this.accept === "string") {
					accept = this.accept;
				} else if (this.accept === true) {
					accept = "*/*";
				} else {
					accept = "";
				}
				return accept.split(",");
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
	render: function() {
		var self = this;

		this.renderWithTemplate(this);
		this.input = this.query("input[type=file]");
		this.renderCollection(self.files, FileView, self.queryByHook("files"), {
			viewOptions: {
				fileSizeUnit: self.fileSizeUnit,
				displayPreview: self.displayPreviews
			}
		});
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

		if (this.acceptArray.length) {
			var MIMEtypes = this.acceptArray.map(function(accept) {
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
	dragEnter: eventNoOp,
	dragOver: eventNoOp,
	drop: function(event) {
		event.stopPropagation();
		event.preventDefault();

		this.handleFiles(Array.prototype.slice.apply(event.dataTransfer.files));
	}
});