var test = require('tape');
var FileDropView = require('../ampersand-file-drop-view');

test('basic init', function (t) {
    var input = new FileDropView({
	    name: 'file'
	});
	input.render();

    t.equal(input.el.tagName, 'DIV');
    t.ok(input.el.querySelector('[data-hook=label]'));
    t.ok(input.el.querySelector('input'));
    t.equal(input.el.querySelector('input').type, 'file');
    t.equal(input.el.querySelector('input').name, 'file');
    t.equal(input.el.querySelector('input').getAttribute('style'), 'visibility:hidden;width:0;height:0;');
    t.equal(input.el.querySelector('[data-hook=label]').textContent, 'Drag and drop a file');
    t.end();
});

test('basic init', function (t) {
    var input = new FileDropView({
	    name: 'files',
	    multiple: true,
	    accept: 'image/*,video/*',
	    holderClass: 'holder'
	});
	input.render();

    t.equal(input.el.className, 'holder');
    t.ok(input.el.querySelector('[data-hook=label]'));
    t.ok(input.el.querySelector('input'));
    t.equal(input.el.querySelector('input').name, 'files');
    t.equal(input.el.querySelector('input').getAttribute('multiple'), '');
    t.equal(input.el.querySelector('input').getAttribute('accept'), 'image/*,video/*');
    t.end();
});