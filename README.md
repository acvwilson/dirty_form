# DirtyForms How-To 

## Example usage

All forms in the page will be observed
Whenever an input value changes it will get the 'changed' class added to it

```javascript
$(function(){
  $("form").dirty_form();
});

// All forms in the page will be observed
// Whenever an input value changes it will get the 'forever_changes' class added to it
$(function(){
  $("form").dirty_form({changedClass: "forever_changes"});
});
```

Often times you want to apply the "changed" CSS class to more than one element.
To support this, DirtyForm can take a "addClassOn" option.
Pass in a function that will be executed in the context of the dirty input element
and the return value of the function will be added to the list of elements that
get the "changed" class. In this function "this" refers to the dirty element.
The code below will add the "change" class to the dirty input and to any labels 
descendants of the li element that contains the input. 
Example:

```javascript
$("form").dirty_form({
  addClassOn: function(){ 
    return this.parents("li").find("label");
  }
});
```

Forms within the "ch-ch-ch-changes" DIV in the page will be observed
Whenever an input value changes it will get the 'changed' class added to it

```javascript
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
```

As of this writing jQuery does not support event bubbling for custom events
See discussion here: http://groups.google.com/group/jquery-dev/browse_thread/thread/1acd358ceeacd67a
Once the patch is in any DOM element can subscribe to the "dirty" event

By default, hidden inputs are not observed; this can be overridden by
setting the includeHidden configuration:

```javscript
$.DirtyForm.includeHidden = true;
```

Dirty form detection is performed using the blur event; when any input
loses focus, its value is checked against its previous value and if
they differ the field is marked dirty.  The downside of this is that
changes to radio buttons and checkboxes won't be detected until the
element loses focus, instead of immediately when checked.  You can
tell DirtyForm to use a different event (i.e. change) with the
monitorEvent property:

```javascript
$.DirtyForm.monitorEvent = 'change';
```
  
The $.DirtyForm singleton can be used for whole-page configuration

```javscript
$(function(){
  $.DirtyForm.dynamic = false // Don't bother watching out for dynamic additions to the DOM
  $.DirtyForm.debug = true    // Turn on logging
  $.DirtyForm.logger = my_fancy_logger_fn // Override the default logger from console.log (if Firebug is available) or a plain-jane alert (for IE) -- NOT WORKING RIGHT NOW. GRR
});
```

All configuration options can be set per-instance

```javascript
$(function(){
  $("#some_form").dirty_form({dynamic: false})
  $("#other_form").dirty_form({dynamic: true})
  $("#third_form").dirty_form({debug: true})
});
```
