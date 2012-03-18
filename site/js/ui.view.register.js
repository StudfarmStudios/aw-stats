(function (window) {

  var content,
      form;

  var contentHtml = document.getElementById('register-content-template').innerHTML;
  var thankYouContentHtml = document.getElementById('register-thank-you-template').innerHTML;
  var errorHtml = document.getElementById('register-error-template').innerHTML;

  var register = function () {
      content = $(contentHtml);
      $('.container .content').html(content);
      form = $('.container .content form');

      $('.nav li').removeClass('active');
      $('.nav .register').addClass('active');

      form.submit(function() {
        var values = $(this).serializeArray();
        var valuesObject = {};
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

  if (window.aw.ui.view == undefined) {
    window.aw.ui.view = {};
  }

  window.aw.ui.view.register = register;
})(window);