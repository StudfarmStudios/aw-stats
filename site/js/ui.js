(function (window) {


  var toaster = function (options) {
    var toasterContainer = $('.toaster');

    var toast = $(tmpl('toaster-popup-template', {title: options.title, content: options.content}));
    
    toast.hide();

    toasterContainer.prepend(toast);

    toast.fadeIn();

    var closeTimeout = setTimeout(function () {
      toast.fadeOut("slow", function () {
        toast.remove();
      });
    }, 4000);

    toast.find('.close').click(function (e) {
      e.preventDefault();
      toast.fadeOut("slow", function () {
        toast.remove();
      });
    });

  };

  if (window.aw == null) {
    window.aw = {};
  }

  if (window.aw == undefined) {
    window.aw = {};
  }

  if (window.aw.ui == undefined) {
    window.aw.ui = {};
  }

  window.aw.ui.toaster = toaster;


})(window);