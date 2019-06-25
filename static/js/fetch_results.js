/* Tweet Stream Callback */

$(document).ready(function(){
  if($( "#tweet_element" ).val() == 0){
    $.get("/newdata", function(response){
      document.write(response)
    });
  }
});

/* Country Code Popover */

$(document).ready(function(){
    $('[data-toggle="popover"]').popover({placement: "left"});
});