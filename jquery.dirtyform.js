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
    return this.each(function(){
      form = $(this);
      var text_inputs = $("#" + form.attr("id") + " :text");
      $.DirtyForm.logger("Storing Data!");
      text_inputs.each(function(i){
        var input = $(this);
        input.data("initial",input.val());
        
        input.blur(function(){
          var my = $(this);
          if(my.data("initial") != my.val()) {
            $.DirtyForm.logger('Dirty form set!');
            form.data("dirty",true);
          } else {
            form.data("dirty",false);
          }
        });
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