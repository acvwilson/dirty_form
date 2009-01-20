if (typeof jQuery == 'undefined') throw("jQuery could not be found.");

(function($){
  
  $.extend({
    DirtyForm: {
      debug         : false, // print out debug info? works best with firebug.
      changedClass  : 'changed',
      addClassOn    : new Function,
      observed_forms: [], 
      hasFirebug    : "console" in window && "firebug" in window.console,
      logger        : function(msg){
                        if(this.debug){
                          msg = "DirtyForm: " + msg;
                          this.hasFirebug ? console.log(msg) : alert(msg);
                        }
                      },
      input_value   : function(input){
                        if(input.is(':radio,:checkbox')){
                          return typeof(input.attr("checked")) == "undefined" ? false : input.attr("checked");
                        } else {
                          return input.val();
                        }
                      }, 
      input_checker : function(event){
                        var npt = $(event.target), form = event.data.form, initial = npt.data("initial"), current = $.DirtyForm.input_value(npt), inputs = event.data.inputs, settings = event.data.settings
                        
                        if(initial != current) {
                          $.DirtyForm.logger("Form "+form.id+" is dirty. Changed from \""+initial+"\" to \""+current+"\"");
                          $.DirtyForm.logger("Class: "+settings.changedClass);
                          form
                            .data("dirty", true)                                      //TODO: check if we can use an expando property here
                            .trigger("dirty", {target: npt, from: initial, to: current, preventDefault: function(){return false}, stopPropagation: function(){return false}, bubbles: true, cancelable: true});
                          npt
                            .add(settings.addClassOn.apply(npt))
                            .addClass(settings.changedClass);                          // TODO: maybe we need to check if the class exists already?
                            
                        } else {
                          npt
                            .add(settings.addClassOn.apply(npt))
                            .removeClass(settings.changedClass)
                        }
                        
                        if(!inputs.filter('.' + settings.changedClass).size()){
                          form
                            .data("dirty",false)
                            .trigger("clean", {target: npt, preventDefault: function(){return false}, stopPropagation: function(){return false}, bubbles: true, cancelable: true});
                        }
                      }
    }
    
  });
    
  // will flag a form as dirty if something is changed on the form.
  $.fn.dirty_form = function(){
    var defaults = {
      changedClass  : $.DirtyForm.changedClass,
      addClassOn    : $.DirtyForm.addClassOn,
      dynamic       : $.isFunction($.livequery)
    }
    
    var settings = $.extend(defaults, arguments.length != 0 ? arguments[0] : {});

    return this.each(function(){
      form = $(this);

      var inputs = $(':input:not(:hidden,:submit,:password,:button)', form)

      if( $.inArray(this, $.DirtyForm.observed_forms) == -1 ){
        $.DirtyForm.observed_forms.push(this);  // A new form, pushing on the list of the observed. Pushing the DOM element, rather than the jQuery'ized one, "form", because $.inArray() didn't work... :(
      }else{
        // unbind all DirtyForms specific events, then proceed to re-add them
        form.unbind("dirty").unbind("clean");
        inputs.unbind("blur.dirty_form");
      }

      $.DirtyForm.logger('Storing initial data for form ' + form.id);
      
      if (settings.dynamic) {
        inputs.livequery(function(){ // use livequery to perform these functions on the new elements added to the form
          $(this)
            .bind("blur.dirty_form", {inputs: inputs, settings: settings, form: form}, $.DirtyForm.input_checker)
            .data('initial', $.DirtyForm.input_value($(this)))
        });
      }else {
        inputs.each(function(){
          $(this)
            .bind("blur.dirty_form", {inputs: inputs, settings: settings, form: form}, $.DirtyForm.input_checker)
            .data("initial", $.DirtyForm.input_value($(this)));
        });
      }
    });
  };
  
  
  // this is meant for selecting links that will warn about proceeding if there are any dirty forms on the page
  $.fn.dirty_stopper = function(){
    var defaults = {
      dialog : {
        title: "Warning: Unsaved Changes!",
        height: 300,
        width: 500,
        modal: true,
        resizeable: false,
        autoResize: false,
        overlay: {backgroundColor: "black", opacity: 0.5}
      },
      message : '<br/><p>You have changed form data without saving. All of your changes will be lost.</p><p>Are you sure you want to proceed?</p>'
    }
    
    var settings = $.extend(defaults, arguments.length != 0 ? arguments[0] : {});
    
    
    $.DirtyForm.logger("Setting dirty stoppers")    
    
    return this.each(function(){
      var stopper = $(this);
      if ($(this).parents('.ui-tabs-nav').length > 0){
        // Unchaining these tabs calls made the tab links not work
        var tabs = $(this).parents('.ui-tabs-nav')
        tabs.find('a').unbind('click.dirty_form')
        tabs.unbind('tabsselect.dirty_form')
        tabs.bind('tabsselect.dirty_form', function(event, ui){          
          if($($.DirtyForm.observed_forms).are_dirty()) {
            event.preventDefault();
            var div = $("<div id='dirty_stopper_dialog'/>").appendTo(document.body)
            var href = $(this).attr('href')
            div.dialog($.extend(settings.dialog, {
              buttons: {
                'Proceed': function(){
                  var selected_id = $(ui.tab).parent().siblings('.ui-tabs-selected').find('a').attr('href');
                  
                  // reset the form in the selected tab and make sure it cleans up after itself
                  $('form', selected_id).each(function(){this.reset();})
                    .find('.changed:input').each(function(){
                      $(this).trigger('blur.dirty_form')
                    });
                  
                  // select the tab now that the old tab is clean
                  tabs.tabs('select', $(ui.tab).attr('href'));
                  
                  // close the dialog with fire
                  $(this).dialog('destroy').remove()
                },
                'Cancel': function(){$(this).dialog('destroy').remove()}
              }
            }));
            div.append(settings.message);
            return false
          }
        })
      } else {
        stopper.unbind('click.dirty_form')
        stopper.bind('click.dirty_form', function(event){
          if($($.DirtyForm.observed_forms).are_dirty()) {
            event.preventDefault();
            var div = $("<div id='dirty_stopper_dialog'/>").appendTo(document.body)
            href = $(this).attr('href')
            div.dialog($.extend(settings.dialog, {
              buttons: {
                'Proceed': function(){window.location = href},
                'Cancel': function(){$(this).dialog('destroy').remove()}
              }
            }));
            div.append(settings.message);
          }
        });
      }
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
  	},
  	clean: function(fn) {
  		return this.bind('clean', fn);
  	}
  });
})(jQuery);
