(function (window) {

  var contentHtml = document.getElementById('index-content-template').innerHTML;


  var index = function (hash) {
    var content = $(contentHtml);
    content.find('h1 small').html("");
    $('.container .content').html(content);
    $('.nav li').removeClass('active');
  };

  if (window.aw == undefined) {
    window.aw = {};
  }

  if (window.aw.ui == undefined) {
    window.aw.ui = {};
  }

  window.aw.ui.index = index;
})(window);