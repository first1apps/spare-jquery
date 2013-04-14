/*!
 * 
 * Text Input Changes - Spare jQuery
 *
 * Copyright 2013 Franklin Davenport
 * Released under the MIT license
 *
 * Date: 2013-04-14
 */

(function($) {

	// Text Input Changes
	//////////////////////
	//
	// Attach to an input element to capture backspaces, deletions, and character insertions.
	// This is useful when the regular key events don't work properly (eg, Chrome on Android - 04/2013)
	// Listen for the "text-input-change" with a param like:
	// 	{backspaces: 0, deletions: 1, insertions: "abc"}
	//
	// Warning: This plugin will overwrite the text in the input box with "\\\\\\\\////////", When the input
	//          is focused, a timer will check the input's value against "\\\\\\\\////////" to detect changes.
	//
	// Example:
	//	$('input.capture-changes').textInputChanges()
	//  	.on('text-input-change', function(ev, changes) { ... });
	//
	// Call the flush method to trigger the "text-input-change" immediately
	// 	$(...).textInputChanges('flush')
	//
	$.fn.textInputChanges = (function() {
		var listenerOps = {
			timeoutPeriod: 300,
			timeout: 0
		};

		var inputOps = {
			charLeft: "\\",
			charRight: "/",
			charRepeat: 15,
			left: "",
			right: "",
			default: ""
		}

		var opToKeyCode = {
			"backspace": 8,
			"delete": 46
		}

		function repeatString(rs, count) {
			var s = "";
			for(var i = 0; i < count; i++) {
				s += rs;
			}
			return s;
		}

		inputOps.left = repeatString(inputOps.charLeft, inputOps.charRepeat);
		inputOps.right = repeatString(inputOps.charRight, inputOps.charRepeat);
		inputOps.default = inputOps.left + inputOps.right;


		// Listener Timing
		function listenerStart(ele$, data) {
			data.listenerRunning = true;
			inputReset(ele$, data);
			listenerRunSleep(ele$, data);
		}
		function listenerStop(ele$, data) {
			data.listenerRunning = false;
		}
		function listenerRunSleep(ele$, data) {
			if(data.listenerRunning) {
				try {
					listenerRun(ele$, data);
				} catch(e) {if(window.console && console.error) {console.error(e);} }

				clearTimeout(listenerOps.timeout);
				listenerOps.timeout = setTimeout(function(){
					listenerRunSleep(ele$, data)
				}, listenerOps.timeoutPeriod);
			}
		}
		// Listener Function
		function listenerRun(ele$, data) {
			var iVal = inputFlush(ele$);
			if(iVal != inputOps.default && iVal != null) {
				inputReset(ele$);
				var charMatch = iVal.match(/^(\\*)([^\\\/]*)(\/*)$/)

				var backspaces = inputOps.charRepeat - charMatch[1].length
				var deletions = inputOps.charRepeat - charMatch[3].length;
				var insertions = repeatString(inputOps.charLeft, -backspaces)
					+ charMatch[2]
					+ repeatString(inputOps.charRight, -deletions)

				ele$.trigger('text-input-change', {
					backspaces: Math.max(0, backspaces),
					insertions: insertions,
					deletions: Math.max(0, deletions)
				});
			}
		}

		// Input Handling
		function inputReset(ele$) {
			ele$.val(inputOps.default);
			ele$.selectRange(inputOps.charRepeat, inputOps.charRepeat);
		}

		function inputFlush(ele$) {
			var fVal = ele$.val();
			inputReset(ele$);
			return fVal;
		}


		var methods = {

			// Init
			init: function() {

				this.each(function() {
					var input$ = $(this);

					var data = input$.data('text-input-changes');
					if(data == null) {
						var data = {};
						input$.data('text-input-changes', data);
					}

					input$.on('focus', function() {
						listenerStart(input$, data);
					});
					input$.on('click', function() {
						 inputReset(input$);
					});
					input$.on('blur', function() {
						 listenerStop(input$, data);
					});

					return function(arg1) {
						if(arguments.length == 0) {
							return methods.init.apply(this);
						}
						if(arguments.length == 1) {
							if(typeof arg1 === "string") {
								return methods[arg1].apply(this);
							} else {
								return methods.init.apply(this, [arg1]);
							}
						}
					};
				});
				return this;

			},

			// Flush, Gets the changes and resets
			flush: function() {
				return inputFlush(this);
			}
		};

		return function() {
			if(arguments.length <= 1) {
				return methods.init.apply(this, arguments);
			}

		}

	})();
})(jQuery)

