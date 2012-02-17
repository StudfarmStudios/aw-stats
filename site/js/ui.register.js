(function (window) {

  var content,
      form;

  var contentHtml = ''
        + '<div class="page-header">'
        + '  <h1>Register your pilot <small></small></h1>'
        + '</div>'
        + '<div class="errors"></div>'
        + '<form class="form-horizontal">'
        + ' <fieldset>'
        + '   <legend>Fill in your pilots information</legend>'
        + '   <div class="control-group">'
        + '     <label class="control-label" for="pilot-username">Username</label>'
        + '     <div class="controls">'
        + '       <input class="input-xlarge" id="pilot-username" name="username" size="30" type="text">'
        + '     </div>'
        + '   </div>'
        + '   <div class="control-group">'
        + '     <label class="control-label" for="pilot-email">Email</label>'
        + '     <div class="controls">'
        + '       <input class="input-xlarge" id="pilot-email" name="email" size="30" type="text">'
        + '     </div>'
        + '   </div>'
        + '   <div class="control-group">'
        + '     <label class="control-label" for="pilot-password1">Password</label>'
        + '     <div class="controls">'
        + '       <input class="input-xlarge" id="pilot-password1" name="password1" size="30" type="password">'
        + '     </div>'
        + '   </div>'
        + '   <div class="control-group">'
        + '     <label class="control-label" for="pilot-password2">Confirm password</label>'
        + '     <div class="controls">'
        + '       <input class="input-xlarge" id="pilot-password2" name="password2" size="30" type="password">'
        + '     </div>'
        + '   </div>'
        + '   <div class="form-actions">'
        + '     <input type="submit" class="btn btn-primary" value="Register">'
        + '   </div>'
        + ' </fieldset>'
        + '</form>';

  var thankYouContentHtml =  ''
        + '<div class="page-header">'
        + '  <h1>Thanks for registering your pilot!<small></small></h1>'
        + '</div>'
        + 'Your pilot is now registered and can be use to login from Assault Wing client and gain statistics on the official servers';
  var errorHtml = ''
        +  '<div class="alert alert-error">'
        +  '<p style="padding-top: 10px"><strong>Error! </strong></p>'
        + '</div>';




  var register = function () {
    content = $(contentHtml);
    $('.container .content').html(content);
    form = $('.container .content form');
    $('.nav li').removeClass('active');
    $('.nav .register').addClass('active');

    form.submit(function() {
      var values = $(this).serializeArray();
      var valuesObject = {};;
      for (var i = 0; i < values.length; i++) {
        var value = values[i];
        valuesObject[value.name] = value.value;
      }
      window.aw.stats.register(valuesObject.username,
          valuesObject.password1,
          valuesObject.password2,
          valuesObject.email,
          function (data) {
            if (data.error) {
              $('.errors').empty();
              var error = $(errorHtml);
              error.find('p').append(data.error);
              $('.errors').append(error);
              return;
            }

            $('.container .content').html(thankYouContentHtml);

      });
      return false;
    });

  };

  if (window.aw == undefined) {
    window.aw = {};
  }

  if (window.aw.ui == undefined) {
    window.aw.ui = {};
  }

  window.aw.ui.register = register;
})(window);