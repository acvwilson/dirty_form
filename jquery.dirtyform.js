// TODO's 
// Support dynamicaly added inputs (livequery dependency)
// send off forms dirty event when a form is dirtied so the page knows its been tarnished.



if (typeof jQuery == 'undefined') throw("jQuery could not be found.");

(function($){
  
  $.extend({
    DirtyForm: {
      debug: true, // print out debug info? works best with firebug.
      hasFirebug:   "console" in window && "firebug" in window.console,
      changedClass: 'changed',
      logger:       function(msg){
                      if(this.debug){
                        msg = "DirtyForm: " + msg;
                        this.hasFirebug ? console.log(msg) : alert(msg);
                      }
                    }
    }
  });
  
  $.fn.dirty_form = function(){
    var defaults = {
      changedClass: $.DirtyForm.changedClass
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
      var inputs = $("#" + form.attr("id")).find(":input:not(:hidden,:submit,:password)")
      $.DirtyForm.logger("Storing Data!");
      inputs.each(function(i){
        var input = $(this);
        input.data('initial', input_value(input)).blur(function(){input_checker(input, inputs)})
      });
    });
  };
  
  $.fn.dirty_stopper = function(){
    $.DirtyForm.logger("Setting dirty stoppers")
    
    return this.each(function(){
      stopper = $(this);
      stopper.click(function(event){
        if($("form").data("dirty")) {
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
  
  $.fn.dirty_checker = function(){    
    $.DirtyForm.logger("Setting dirty checkers!")
    
    return this.each(function(){
      checker = $(this);
      checker.click(function(){
        if($("form").data("dirty")) {
          alert("Dirty Form!!");
        } else {
          alert("Clean Form ...phew!");
        }
      });
    });
  }
})(jQuery);