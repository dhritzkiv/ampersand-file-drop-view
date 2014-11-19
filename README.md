# ampersand-file-drop-view

Drag-and-drop file view based on [ampersand-view](https://github.com/AmpersandJS/ampersand-form-view), and for use in [ampersand-form-view.](https://github.com/AmpersandJS/ampersand-view)


## Constructor Options

- `name` _String._ *Required.* Name to use. Used by `ampersand-form-view`
- `label` _String._ Label to use for the view. Defaults to `"Drag and drop a file"`. Can be falsy to hide label.
- `required` _Boolean._ Whether or not this view needs to have files. Defaults to `false`
- `multiple` _Boolean._ Whether to allow one or multiple files. Defaults to `false`
- `accept` _String._ Which mime types to allow. Comma separated. Defaults to `"*/*"`
- `holderClass` _String._ Class to use for the main container.


## Example

Use with `ampersand-form-view`:

````javascript

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

## Tests

[![browser support](https://ci.testling.com/dhritzkiv/ampersand-array-input-view.png)](https://ci.testling.com/dhritzkiv/ampersand-array-input-view)

Run tests with `npm test`

## License

MIT