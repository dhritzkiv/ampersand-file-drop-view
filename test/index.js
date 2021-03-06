/*globals Blob*/

//I currently know no way of testing dnd events, so the tests are very basic, and don't cover the more complex logic in dealing with files.
var test = require('tape');
var viewCompliance = require('ampersand-view-conventions');
var FileDropView = require('../ampersand-file-drop-view');

var defaultFileValue = new Blob(['a text file'], {type: 'text/plain'});

viewCompliance.formField(test, FileDropView, {name: 'file'}, [defaultFileValue]);

viewCompliance.view(test, FileDropView, {name: 'file'});

test('basic init', function (t) {
	var input = new FileDropView({
		name: 'file'
	});
	input.render();

	var inputEl = input.el.querySelector('input');
	var labelEl = input.el.querySelector('[data-hook=label]');

	t.equal(false, input.required, 'not a required field by default');
	t.equal(input.accept, '*/*');
	t.equal(input._accept, '*/*');
	t.equal(input._acceptArray.join(), ['*/*'].join());
	t.equal(input.el.tagName, 'DIV');
	t.ok(labelEl, 'label element exists');
	t.equal(labelEl.textContent, 'Drag and drop a file', 'default field label is correct');
	t.ok(inputEl, 'input element exists');
	t.equal(input.input, inputEl, 'view\'s `input` property reports the correct input element');
	t.equal(inputEl.type, 'file', 'input\'s `type` attribute is correct');
	t.equal(inputEl.name, 'file', 'input\'s `name` attribute is correct');
	t.equal(inputEl.getAttribute('style'), 'visibility:hidden;width:0;height:0;', 'input has the correct style applied');
	t.equal(inputEl.getAttribute('multiple'), null, 'input doesn\'t have a `multiple` attribute by default');
	t.end();
});

test('label property and element', function(t) {
	var input = new FileDropView({
		label: 'Feed me files'
	});
	input.render();

	var labelEl = input.el.querySelector('[data-hook=label]');

	t.equal(input.label, 'Feed me files', 'custom field label property value is correct');
	t.ok(labelEl, 'label element exists');
	t.equal(labelEl.textContent, 'Feed me files', 'custom field label is correct');
	t.end();
});

test('label property and element when passed false', function(t) {
	var input = new FileDropView({
		label: ''
	});
	input.render();

	var labelEl = input.el.querySelector('[data-hook=label]');
	t.equal(input.label, '');
	t.ok(labelEl);
	t.equal(labelEl.textContent, '');
	t.equal(labelEl.getAttribute('data-anddom-display'), '');
	t.equal(labelEl.getAttribute('data-anddom-hidden'), 'true');
	t.equal(labelEl.style.display, 'none');
	t.end();
});

test('holderClass property and attribute', function(t) {
	var input = new FileDropView({
		holderClass: 'holder'
	});
	input.render();

	t.equal(input.holderClass, 'holder');
	t.equal(input.el.className, 'holder');
	t.end();
});

test('`name` property and attribute', function(t) {
	var input = new FileDropView({
		name: 'files'
	});
	input.render();

	t.equal(input.name, 'files');
	t.equal(input.el.querySelector('input').name, 'files');
	t.end();
});

test('`multiple` property and attribute', function(t) {
	var input = new FileDropView({
		multiple: true
	});
	input.render();

	t.equal(input.get('multiple'), true);
	t.equal(input.el.querySelector('input').getAttribute('multiple'), '');
	t.end();
});

test('`accept` property and attribute when passed as string', function(t) {
	var input = new FileDropView({
		accept: 'image/*,video/*'
	});
	input.render();

	t.equal(input.accept, 'image/*,video/*');
	t.equal(input._accept, 'image/*,video/*');
	t.equal(input._acceptArray.join(), ['image/*','video/*'].join());
	t.equal(input.el.querySelector('input').getAttribute('accept'), 'image/*,video/*');
	t.end();
});

test('`accept` property and attribute when passed as array', function(t) {
	var input = new FileDropView({
		accept: ['image/jpeg', 'image/png']
	});
	input.render();

	t.ok(Array.isArray(input.accept));
	t.equal(input.accept.join(), ['image/jpeg', 'image/png'].join());
	t.equal(input._accept, 'image/jpeg,image/png');
	t.equal(input._acceptArray.join(), ['image/jpeg', 'image/png'].join());
	t.equal(input.el.querySelector('input').getAttribute('accept'), 'image/jpeg,image/png');
	t.end();
});

test('`accept` property and attribute when passed as `true`', function(t) {
	var input = new FileDropView({
		accept: true
	});
	input.render();

	t.equal(input.accept, true);
	t.equal(input._accept, '*/*');
	t.equal(input._acceptArray.join(), ['*/*'].join());
	t.equal(input.el.querySelector('input').getAttribute('accept'), '*/*');
	t.end();
});

test('`accept` property and attribute when passed as `false`', function(t) {
	var input = new FileDropView({
		accept: false
	});
	input.render();

	t.equal(input.accept, false);
	t.equal(input._accept, '');
	t.equal(input._acceptArray.join(), [].join());
	t.equal(input.el.querySelector('input').getAttribute('accept'), '');
	t.end();
});

test('`itemViewOptions` with the option to use a different file size unit', function(t) {

	var targetFileSize = 9;//in bytes
	var dummyFile = new Blob(['a'.repeat(targetFileSize)], {type: 'text/plain'});

	var input = new FileDropView({
		itemViewOptions: {
			fileSizeUnit: 'b'
		},
		value: [dummyFile]
	});

	input.render();

	t.equal(input.el.querySelector('[data-hook=size]').textContent, targetFileSize.toFixed(2), 'displays the correct file size');
	t.equal(input.el.querySelector('[data-hook=size-unit]').textContent, 'b', 'displays the correct file size unit');

	t.end();
});

test('`reset` method resets value back to the initial value', function(t) {

	var targetFileSize = 9;//in bytes
	var dummyFile = new Blob(['a'.repeat(targetFileSize)], {type: 'text/plain'});
	var dummyFile2 = new Blob(['b'.repeat(targetFileSize)], {type: 'text/plain'});

	var input = new FileDropView({
		value: [dummyFile],
		multiple: true
	});

	input.render();
	input.addFiles([dummyFile2]);
	t.equal(input.value.length, 2, 'the field contains 2 files');
	input.reset();
	t.equal(input.value.length, 1, 'after reset, the field contans the initial amount of files');
	t.equal(input.value[0], dummyFile, 'after reset, the first file of value is the initial file');

	t.end();
});

test('`reset` method resets value back to the back to default initial value', function(t) {

	var targetFileSize = 9;//in bytes
	var dummyFile = new Blob(['a'.repeat(targetFileSize)], {type: 'text/plain'});
	var dummyFile2 = new Blob(['b'.repeat(targetFileSize)], {type: 'text/plain'});

	var input = new FileDropView({
		multiple: true
	});

	input.render();
	input.addFiles([dummyFile]);
	input.addFiles([dummyFile2]);
	t.equal(input.value.length, 2, 'the field contains 2 files');
	input.reset();
	t.equal(input.value.length, 0, 'after reset, the field contans the initial amount of files');

	t.end();
});

test('does not add duplicate files of the same `name` when `mainIndex` is set to `name`', function(t) {

	var targetFileSize = 9;//in bytes
	var dummyFile = new Blob(['a'.repeat(targetFileSize)], {type: 'text/plain'});
	var dummyFile2 = new Blob(['b'.repeat(targetFileSize)], {type: 'text/plain'});

	dummyFile.name = 'foo';
	dummyFile2.name = 'foo';

	var input = new FileDropView({
		multiple: true,
		mainIndex: 'name'
	});

	input.render();
	input.addFiles([dummyFile]);
	input.addFiles([dummyFile2]);

	t.equal(input.value.length, 1, 'the field contains only one file');
	t.end();
});

test('does add duplicate files of the same `name` when no `mainIndex` is set', function(t) {

	var targetFileSize = 9;//in bytes
	var dummyFile = new Blob(['a'.repeat(targetFileSize)], {type: 'text/plain'});
	var dummyFile2 = new Blob(['b'.repeat(targetFileSize)], {type: 'text/plain'});

	dummyFile.name = 'foo';
	dummyFile2.name = 'foo';

	var input = new FileDropView({
		multiple: true
	});

	input.render();
	input.addFiles([dummyFile]);
	input.addFiles([dummyFile2]);

	t.equal(input.value.length, 2, 'the field contains two files');
	t.end();
});
