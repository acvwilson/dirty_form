// TODO's 
// remove dependency of ID attribute
// Support dynamicaly added inputs (event delegation?)
// send off forms dirty event when a form is dirtied so the page knows its been tarnished.



if (typeof jQuery == 'undefined') throw("jQuery could not be found.");

(function($){
  
  $.extend({
    DirtyForm: {
      debug: true, // print out debug info? works best with firebug.
      formID: null,
      hasFirebug:   "console" in window && "firebug" in window.console,
      logger:       function(msg){
                      if(this.debug){
                        msg = "DirtyForm: " + msg;
                        this.hasFirebug ? console.log(msg) : alert(msg);
                      }
                    }
    }
  });
  
  $.fn.dirty_form = function(){
    
    function checkbox_checker(){
      var my = $(this);
      if(my.data('initial') != my.attr('checked')) {
        $.DirtyForm.logger('Dirty form set!');
        form.data("dirty",true);
      } else {
        form.data("dirty",false);
      }
    }
    
    function input_checker(){
      var my = $(this);
      if(my.data("initial") != my.val()) {
        $.DirtyForm.logger('Dirty form set!');
        form.data("dirty",true);
      } else {
        form.data("dirty",false);
      }
    }
    
    return this.each(function(){
      form = $(this);
      var inputs = $("#" + form.attr("id")).find(":input:not(:hidden,:submit,:password)")
      $.DirtyForm.logger("Storing Data!");
      inputs.each(function(i){
        var input = $(this);
        if(input.is(':radio,:checkbox')){
          input.data('initial',input.attr('checked')).blur(function(){checkbox_checker()});
        } else {
          input.data("initial",input.val()).blur(function(){input_checker()});
        }
        
      });
    });
  };
  
  $.fn.dirty_stopper = function(){
    var defaults = {
      formID: $.DirtyForm.formID
    }
    
    var settings = $.extend(defaults, arguments.length != 0 ? arguments[0] : {});
    
    $.DirtyForm.logger("Setting dirty stoppers")
    
    return this.each(function(){
      stopper = $(this);
      stopper.click(function(event){
        if($("#" + settings.formID).data("dirty")) {
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
    var defaults = {
      formID: $.DirtyForm.formID
    }
    
    var settings = $.extend(defaults, arguments.length != 0 ? arguments[0] : {});
    
    $.DirtyForm.logger("Setting dirty checkers!")
    
    return this.each(function(){
      checker = $(this);
      checker.click(function(){
        if($("#" + settings.formID).data("dirty")) {
          alert("Dirty Form!!");
        } else {
          alert("Clean Form ...phew!");
        }
      });
    });
  }
})(jQuery);