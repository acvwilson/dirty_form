// TODO's 
// send off forms dirty event when a form is dirtied so the page knows its been tarnished.
// make the stoppers work for anchor links



if (typeof jQuery == 'undefined') throw("jQuery could not be found.");

(function($){
  
  $.extend({
    DirtyForm: {
      debug         : false, // print out debug info? works best with firebug.
      hasFirebug    : "console" in window && "firebug" in window.console,
      changedClass  : 'changed',
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
      dynamic       : $.isFunction($.livequery)
    }
    
    var settings = $.extend(defaults, arguments.length != 0 ? arguments[0] : {});
    
    function input_checker(my,inputs){
      var form = my.parents("form")
      if(my.data("initial") != input_value(my)) {
        $.DirtyForm.logger('Dirty form set!');
        form.data("dirty", true);
        my.addClass(settings.changedClass)
      } else {
        my.removeClass(settings.changedClass)
      }
      if(!inputs.filter('.' + settings.changedClass).size()){
        form.data("dirty",false);
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
      
      $.DirtyForm.logger('Storing Data!');
      
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
          input.data('initial', input_value(input)).blur(function(){input_checker(input, inputs)})
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
})(jQuery);