/*!
 * Text Input Changes - Spare jQuery
 * Select Range - Spare jQuery
 *
 * Copyright 2013 Franklin Davenport
 * Released under the MIT license
 *
 * Date: 2013-04-14
 */

( function( $ ) {

  // Text Input Changes
  //////////////////////
  //
  // Attach to an input element to capture backspaces, deletions, and character insertions.
  // This is useful when the regular key events don't work properly (eg, Chrome on Android - 04/2013)
  // Listen for the "text-input-change" with a param like:
  //   {backspaces: 0, deletions: 1, insertions: "abc"}
  //
  // Warning: This plugin will overwrite the text in the input box with "\\\\\\\\////////", When the input
  //          is focused, a timer will check the input's value against "\\\\\\\\////////" to detect changes.
  //
  // Example:
  //  $('input.capture-changes').textInputChanges()
  //    .on('text-input-change', function(ev, changes) { ... });
  //
  // Call the flush method to trigger the "text-input-change" immediately
  //   $(...).textInputChanges('flush')
  //
  $.fn.textInputChanges = function( method ) {
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
    }
  };

  var listenerOps = {
    delay: 90
  };

  var inputOps = {
    charLeft: "\\",
    charRight: "/",
    charRepeat: 15,
    left: "",
    right: "",
    default: ""
  }

  var defaultOps = {
    listener: listenerOps,
    input: inputOps
  }

  function repeatString( rs, count ) {
    var s = "";
    for( var i = 0; i < count; i++ ) {
      s += rs;
    }
    return s;
  }

  inputOps.left = repeatString(inputOps.charLeft, inputOps.charRepeat);
  inputOps.right = repeatString(inputOps.charRight, inputOps.charRepeat);
  inputOps.default = inputOps.left + inputOps.right;

  function _d( ele$, val ) {
    if( arguments.length == 1 ) {
      return ele$.data( 'text-input-changes' )
    } else if( arguments.length == 2 ) {
      return ele$.data( 'text-input-changes', val );
    }
  }


  // Listener Timing
  function listenerStart( ele$ ) {
    _d( ele$ ).listenerRunning = true;
    inputReset( ele$ );
    listenerRunSleep( ele$ );
  }
  function listenerStop( ele$ ) {
    _d( ele$ ).listenerRunning = false;
  }
  function listenerRunSleep( ele$ ) {
    var data = _d( ele$ );
    if( data.listenerRunning ) {
      try {
        listenerRun( ele$ );
      } catch(e) { if( window.console && console.error) { console.error(e); } }

      clearTimeout( data.listener.timeout );
      data.listener.timeout = setTimeout( function() {
        listenerRunSleep( ele$ )
      }, data.listener.delay );
    }
  }

  // Listener Function
  function listenerRun( ele$ ) {
    var iVal = inputFlush( ele$ );
    if( iVal != inputOps.default && iVal != null ) {
      inputReset( ele$ );
      var charMatch = iVal.match( /^(\\*)([^\\\/]*)(\/*)$/ )

      var backspaces = inputOps.charRepeat - charMatch[1].length
      var deletions = inputOps.charRepeat - charMatch[3].length;
      var insertions = repeatString( inputOps.charLeft, -backspaces ) +
        charMatch[2] + repeatString(inputOps.charRight, -deletions);

      ele$.trigger('text-input-change', {
        backspaces: Math.max( 0, backspaces ),
        insertions: insertions,
        deletions: Math.max( 0, deletions )
      });
    }
  }

  // Input Handling
  function inputReset( ele$ ) {
    ele$.val( inputOps.default );
    ele$.selectRange( inputOps.charRepeat, inputOps.charRepeat );
  }

  function inputFlush( ele$ ) {
    var fVal = ele$.val();
    inputReset( ele$ );
    return fVal;
  }


  var methods = {

    // Init
    init: function( ops ) {
      this.each( function() {
        var input$ = $( this );

        // Update Data
        var data = $.extend( true, defaultOps, _d( input$ ), ops );
        _d( input$, data );

        // Bind Events
        input$.on( 'focus', function() {
          listenerStart( input$, data );
        });
        input$.on( 'click', function() {
           inputReset( input$ );
        });
        input$.on( 'blur', function() {
           listenerStop( input$, data );
        });
      });
      return this;
    },

    // Flush, triggers the change event and resets
    flush: function() {
      return inputFlush( this );
    }
  };

})(jQuery);



( function( $ ) {

  // Select Range
  ////////////////
  //
  // Selects a range of characters or moves the cursor
  // in a text input or textarea
  //
  $.fn.selectRange = function( start, end ) {
    return this.each( function() {
      if ( this.setSelectionRange ) {
        this.focus();
        this.setSelectionRange( start, end );
      } else if ( this.createTextRange ) {
        var range = this.createTextRange();
        range.collapse( true );
        range.moveEnd( 'character', end );
        range.moveStart( 'character', start );
        range.select();
      }
    });
  };

})(jQuery);


