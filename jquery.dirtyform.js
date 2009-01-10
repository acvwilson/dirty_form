// TODO's 
// send off forms dirty event when a form is dirtied so the page knows its been tarnished. (done, dvd 09-01-2009)
// make the stoppers work for anchor links
// investigate: can make this work for "non-form"-forms too? I.e. given a container element, check dirtiness for the inputs inside it.
// investigate: possible to change this so that one can provide an extra selector to further filter the inputs in a form. I.e. "this form is to be considered dirty if inputs with class foo changes"
/*
=====================
= DirtyForms How-To =
=====================

Example usage:

  // All forms in the page will be observed
  // Whenever an input value changes it will get the 'changed' class added to it
  $(function(){
    $("form").dirty_form();
  });
    
  // All forms in the page will be observed
  // Whenever an input value changes it will get the 'forever_changes' class added to it
  $(function(){
    $("form").dirty_form({changeClass: "forever_changes"});
  });
    
  // Forms within the "ch-ch-ch-changes" DIV in the page will be observed
  // Whenever an input value changes it will get the 'changed' class added to it
  $(function(){
    $("#ch-ch-ch-changes form").dirty_form();
  });

  // Forms can observe the "dirty" event for customized behavior
  $(function(){
    $("form")
      .dirty_form()
      .dirty(function(event, data){
        var label = $(event.target).parents("li").find("label");
        $("body").append("<p>" + label.text() + "Changed from " + data.from + " to: " + data.to+ "</p>")
      })
  });
  
  // As of this writing jQuery does not support event bubbling for custom events
  // See discussion here: http://groups.google.com/group/jquery-dev/browse_thread/thread/1acd358ceeacd67a
  // Once the patch is in any DOM element can subscribe to the "dirty" event
  
  
  // The $.DirtyForm singleton can be used for whole-page configuration
  $(function(){
    $.DirtyForm.dynamic = false // Don't bother watching out for dynamic additions to the DOM
    $.DirtyForm.debug = true    // Turn on logging
    $.DirtyForm.logger = my_fancy_logger_fn // Override the default logger from console.log (if Firebug is available) or a plain-jane alert (for IE)
  });
  
  // All configuration options can be set per-instance
  $(function(){
    $("#some_form").dirty_form({dynamic: false})
    $("#other_form").dirty_form({dynamic: true})
    $("#third_form").dirty_form({debug: true})
  });

*/

if (typeof jQuery == 'undefined') throw("jQuery could not be found.");

(function($){
  
  $.extend({
    DirtyForm: {
      debug         : false, // print out debug info? works best with firebug.
      dynamic       : $.isFunction($.livequery),
      changedClass  : 'changed',
      hasFirebug    : "console" in window && "firebug" in window.console,
      logger        : function(msg){
                        if(this.debug){
                          msg = "DirtyForm: " + msg;
                          this.hasFirebug ? console.log(msg) : alert(msg);
                        }
                      }
    }
    
  });
    
  // will flag a form as dirty if something is changed on the form.
  $.fn.dirty_form = function(){
    var defaults = {
      changedClass  : $.DirtyForm.changedClass,
      dynamic       : $.DirtyForm.dynamic,
    }
    
    var settings = $.extend(defaults, arguments.length != 0 ? arguments[0] : {});
    
    function input_checker(my,inputs){
      var form = my.parents("form"), initial = my.data("initial"), current = input_value(my)
      
      if(initial != current) {
        $.DirtyForm.logger("Form "+form.id+" is dirty. Changed from \""+initial+"\" to \""+current+"\"");
        form
          .data("dirty", true)                                      //TODO: check if we can use an expando property here
          .trigger("dirty", {target: my, from: initial, to: current, preventDefault: function(){return false}, stopPropagation: function(){return false}, bubbles: true, cancelable: true});
        my.addClass(settings.changedClass)                          // TODO: maybe we need to check if the class exists already?
          
      } else {
        my.removeClass(settings.changedClass)
      }
      
      if(!inputs.filter('.' + settings.changedClass).size()){
        form
          .data("dirty",false)
          .trigger("clean", {target: my, preventDefault: function(){return false}, stopPropagation: function(){return false}, bubbles: true, cancelable: true});
      }
    }
    
    function input_value(input){
      if(input.is(':radio,:checkbox')){
        return input.attr('checked');
      } else {
        return input.val();
      }
    }
    
    return this.each(function(){
      form = $(this);
      var inputs = $(':input:not(:hidden,:submit,:password,:button)', form)

      $.DirtyForm.logger('Storing initial data for form ' + form.id);
      
      if (settings.dynamic) {
        // use livequery to perform these functions on the new elements added to the form
        inputs.livequery(function(){
          $(this).data('initial', input_value($(this)))
        }).livequery('blur', function(){
          input_checker($(this), inputs)
        });
      } else {
        inputs.each(function(i){
          // add to whats there now, but don't worry about what's there in the future
          var input = $(this);
          input
            .data('initial', input_value(input))
            .blur(function(){input_checker(input, inputs)});
        });
      }
    });
  };
  
  
  // this is meant for selecting links that will warn about proceeding if there are any dirty forms on the page
  $.fn.dirty_stopper = function(){
    $.DirtyForm.logger("Setting dirty stoppers")
    
    return this.each(function(){
      stopper = $(this);
      stopper.click(function(event){
        if($("form").are_dirty()) {
          event.preventDefault();
          var div = $("<div id='dirty_stopper_dialog'/>").appendTo(document.body)
          href = $(this).attr('href')
          div.dialog({
            title: "Warning: Unsaved Changes!",
            height: 300,
            width: 500,
            modal: true,
            buttons: {
              'Proceed': function(){window.location = href},
              'Cancel': function(){$(this).dialog('destroy').remove()}
            },
            resizeable: false,
            autoResize: false,
            overlay: {backgroundColor: "black", opacity: 0.5}
          });
          div.append("<br/><p>You have changed form data without saving. Are you sure you want to proceed?</p>");
        }
      });
    });
  }
  
  // not chainable
  // returns false if any of the forms on the page are dirty
  $.fn.are_dirty = function (){
    var dirty = false
    this.each(function(){
      if($(this).data('dirty')) {
        dirty = true;
      }
    })
    return dirty
  }
  
  // This is just for testing purposes...
  $.fn.dirty_checker = function(){    
    $.DirtyForm.logger("Setting dirty checkers!")
    
    return this.each(function(){
      checker = $(this);
      checker.click(function(){
        if($("form").are_dirty()) {
          alert("Dirty Form!!");
        } else {
          alert("Clean Form ...phew!");
        }
      });
    });
  }
  
  // Shortcut to bind a handler to the "ondirty" event
  $.fn.extend({
    dirty: function(fn) {
      return this.bind('dirty', fn);
    }
  });
})(jQuery);