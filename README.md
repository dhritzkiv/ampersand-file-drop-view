# ampersand-file-drop-view

![Travis CI](https://api.travis-ci.org/dhritzkiv/ampersand-file-drop-view.svg)

Drag-and-drop file view based on [ampersand-view](https://github.com/AmpersandJS/ampersand-form-view), and for use in [ampersand-form-view.](https://github.com/AmpersandJS/ampersand-view)

## Example

Use with `ampersand-form-view`:

````javascript

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
````


## Constructor Options

- `name` _String._ *Required.* Name to use. Used by `ampersand-form-view`
- `label` _String._ Label to use for the view. Defaults to `"Drag and drop a file"`. Can be falsy to hide label.
- `required` _Boolean._ Whether or not this view needs to have files. Defaults to `false`
- `multiple` _Boolean._ Whether to allow one or multiple files. Defaults to `false`
- `accept` _String/Array._ Which mime types to allow. Comma separated if string. Defaults to `"*/*"`
- `holderClass` _String._ Class to use for the main container.
- `holderHoverClass` _String._ Class to use for the main container when hovering with a selection over the main container.
- `documentHoverClass` _String._ Class to use for the main container when hovering with a selection over the document body element.
- `itemViewOptions` _Object._ Options object to pass to individual item views.

## Item View Constructor Options
- `displayPreview` _Boolean._ Whether or not to display an image preview, if available
- `fileSizeUnit` _String._  Which file size unit to use. E.g.: "kb", "mb", "gb", etc.

## Tests

Run tests with `npm test`

## License

MIT