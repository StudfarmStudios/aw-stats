(function (window) {

  var content,
      pilotList,
      pagination;

  var contentHtml = document.getElementById('pilots-content-template').innerHTML;

  var pilotHtml = document.getElementById('pilots-pilot-template').innerHTML;


  function createPageLink(page, limit, total) {
    if (page == 0) {
      return "#!/pilots/1/" + limit
    }

    return "#!/pilots/" + page + "/" + limit;
  }

  function createPagination(page, limit, total) {
    pagination.empty();
    var previous = $('<li class="prev' + ( (page == 1) ? ' disabled' : '' ) + '"><a href="' + createPageLink(page - 1, limit, total) + '">&larr; Previous</a></li>');
    pagination.append(previous);
    var totalPages = Math.ceil(total / limit);
    var i;
    for (i = 1; i <= totalPages; i++) {
      (function (p) {
        var pageButton = $('<li><a href="' + createPageLink(p, limit, total) + '">' + p + '</a></li>');
        if (p == page) {
          pageButton.addClass('active');
        }
        pagination.append(pageButton);
      })(i);
    }

    var next = $('<li class="next' + ( (page * limit >= total) ? ' disabled' : '' ) + '"><a href="' + ( (page * limit >= total) ? createPageLink(page + 1, limit, total) : window.location.hash ) + '">Next &rarr;</a></li>');
    pagination.append(next);
  }

  function constructPilotList(page, limit) {
    window.aw.stats.pilots(page, limit, 'username', function (data) {
      createPagination(data.page, data.limit, data.total);
      $.each(data.pilots, function (indx, pilot) {
        var pilotElement = $(pilotHtml);
        pilotElement.find('.pilot-name').html('<a href="#!/pilot/' + pilot.username + '">' + pilot.username + '</a>');
        pilotList.append(pilotElement);
      });
    });
  }

  var pilots = function (hash) {
    var page = 1;
    var limit = 15;

    content = $(contentHtml);
    $('.container .content').html(content);
    pilotList = content.find('.pilot-table');
    pagination = content.find('ul');

    $('.nav li').removeClass('active');
    $('.nav .pilots').addClass('active');


    var parts = hash.split('/');
    page = parts[2] || page;
    limit = parts[3] || limit;

    constructPilotList(Number(page), Number(limit));

  };

  if (window.aw == undefined) {
    window.aw = {};
  }

  if (window.aw.ui == undefined) {
    window.aw.ui = {};
  }

  window.aw.ui.pilots = pilots;
})(window);