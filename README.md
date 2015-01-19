EasyForms.js
============

JavaScript library for creating HTML forms by minimal JSON format.

Quick example
-------------

Login form

```javascript
// define form
var form = new EasyForms({
	"model": {
		"Elem=fieldset": [{
			"Elem.form\\-group": [{
				"Label->email@sm:4": "E-mail"
			}, {
				"Input=email@sm:8#email": "Your e-mail"
			}]
		}, {
			"Elem.form\\-group": [{
				"Label->passwd@sm:4": "Password"
			}, {
				"Input.password=pass@sm:8#passwd": "Password"
			}]
		}, {
			"Elem.form\\-group": {
				"Elem@sm>4:8": {
					"Button.submit!": "Login <span class=\"glyphicon glyphicon-chevron-right\"></span>"
				}
			}
		}
	}
});

// render form to page
$('#login-form').html(form.form());
```	
	
TODO list
---------

* precompile Handlebars templates
* refactor API: form() -> render()
* add jQuery for bindings, attributes, validations, etc.
