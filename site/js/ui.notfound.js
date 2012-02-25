(function (window) {

  var contentHtml = document.getElementById('notfound-content-template').innerHTML;


  var notfound = function (hash) {
    var content = $(contentHtml);
    content.find('h1 small').html(hash);
    $('.container .content').html(content);
    $('.nav li').removeClass('active');
  };

  if (window.aw == undefined) {
    window.aw = {};
  }

  if (window.aw.ui == undefined) {
    window.aw.ui = {};
  }

  window.aw.ui.notfound = notfound;
})(window);