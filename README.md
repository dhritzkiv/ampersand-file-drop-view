# ampersand-file-drop-view

[![Greenkeeper badge](https://badges.greenkeeper.io/dhritzkiv/ampersand-file-drop-view.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/dhritzkiv/ampersand-file-drop-view.svg?branch=master)](https://travis-ci.org/dhritzkiv/ampersand-file-drop-view) [![Monthly npm downloads](https://img.shields.io/npm/dm/ampersand-file-drop-view.svg)](https://www.npmjs.com/package/ampersand-file-drop-view)

Drag-and-drop file view based on [ampersand-view](https://github.com/AmpersandJS/ampersand-form-view), and for use in [ampersand-form-view.](https://github.com/AmpersandJS/ampersand-view)

## Example

Use with `ampersand-form-view`:

```javascript
var FormView = require('ampersand-form-view');
var FileDropView = require('ampersand-file-drop-view');

new FormView({
	
	fields: function() {
		return [
			new FileDropView({
				holderClass: "file-drop-holder",
				name: "files",
				multiple: true,
				accept: "image/*,video/*",
				parent: this
			})
		];
	}
	
});
```

For a live demo, `git clone` this repo, run `npm install` to install the dependencies, and `npm run demo` to start a small local server that hosts the demo html page.

## Constructor Options

- `name` _String._ *Required.* Name to use. Used by `ampersand-form-view`
- `label` _String._ Label to use for the view. Can be falsy to hide label. Defaults to `"Drag and drop a file"`.
- `required` _Boolean._ Whether or not this view needs to have files. Defaults to `false`
- `value` _Array._ If present, the starting value must be an array of `File` or `Blob` objects.
- `multiple` _Boolean._ Whether to allow one or multiple files. Defaults to `false`
- `accept` _String/Array._ Which mime types to allow. Comma separated if string. Defaults to `"*/*"`
- `holderClass` _String._ Class to use for the main container. Defaults to `"file-holder"`.
- `holderHoverClass` _String._ Class to use for the main container when hovering with a selection over the main container. Defaults to `"file-holder-hover"`.
- `documentHoverClass` _String._ Class to use for the main container when hovering with a selection over the document body element. Defaults to `"document-hover"`.
- `hasFilesClass` _String._ Class to use for the field has files. Defaults to `"has-files"`.
- `itemViewOptions` _Object._ Options object to pass to individual item views (see below)
- `mainIndex` _String._ Which property of the file to use to index. Indexing by a property such as `name` can prevent duplicates being added. See [ampersand-collection](https://github.com/AmpersandJS/ampersand-collection#mainindex-collectionmainindex) for more information.

## Item View Constructor Options (`itemViewOptions`)

- `displayPreview` _Boolean._ Whether or not to display an image preview, if available. Defaults to `false`.
- `fileSizeUnit` _String._  Which file size unit to use. E.g.: "kb", "mb", "gb", etc. Defaults to `"kb"`.

## Methods

- `setValue(files)` `files` is an _array_ of `File` or `Blob` objects.
	- sets the `value` of the view to `files`
- `addFiles(files)` `files` is an _array_ of `File` or `Blob` objects.
	- appends the `value` of the view with `files`
- `clear()`
	- empties the view's `value` of all files
- `reset()`
	- sets the view's `value` to the `value` passed in through the view's constructor options

## Tests

Run tests with `npm test`

## Changelog

### v1.0.0

- [ampersand-view-conventions](https://github.com/AmpersandJS/ampersand-view-conventions) compliance
	- supports setting a value (an array of File or Blob-like objects) programatically, including as an initial value
- more reliable triggering of classes when hovering over the body or the file-holder element
- addition of `hasFilesClass`
- addition of `addFiles` method (previous `handleFiles`)

## License

MIT
