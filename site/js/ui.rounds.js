(function (window) {

  var content,
      roundList,
      pagination;

  var contentHtml = document.getElementById('rounds-content-template').innerHTML;

  var roundHtml = document.getElementById('rounds-round-template').innerHTML;


  function createPageLink(page, limit, total) {
    if (page == 0) {
      return "#!/rounds/1/" + limit
    }

    return "#!/rounds/" + page + "/" + limit;
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

  function constructRoundList(page, limit) {
    window.aw.stats.rounds(page, limit, 'started', function (data) {
      createPagination(data.page, data.limit, data.total);
      $.each(data.rounds, function (indx, round) {
        var roundElement = $(roundHtml);
        roundElement.find('.round-arena').html('<a href="#!/round/' + round._id + '">' + round.arena.name + '</a>');
        roundElement.find('.round-started').html(round.started);
        roundElement.find('.round-ended').html(round.ended);
        var winners = "";
        var i, result;
        for (i = 0; i < round.results.length; i++) {
          result = round.results[i];
          if (result.score < round.results[0].score) {
            break;
          }

          if (i > 0) {
            winners += ', ';
          }

          if (result.anon) {
            winners += result.username + ' <span class="label notice">Not registered</span>';
          } else {
            winners += '<a href="#!/pilot/' + result.username + '">' + result.username + '</a>';
          }
        }
        roundElement.find('.round-winner').html(winners + ' (<small>' + round.results[0].score + '</small>)');
        roundList.append(roundElement);
      });
    });
  }

  var rounds = function (hash) {
    var page = 1;
    var limit = 15;

    content = $(contentHtml);
    $('.container .content').html(content);
    roundList = content.find('.round-table');
    pagination = content.find('ul');

    $('.nav li').removeClass('active');
    $('.nav .rounds').addClass('active');


    var parts = hash.split('/');
    page = parts[2] || page;
    limit = parts[3] || limit;

    constructRoundList(Number(page), Number(limit));

  };

  if (window.aw == undefined) {
    window.aw = {};
  }

  if (window.aw.ui == undefined) {
    window.aw.ui = {};
  }

  window.aw.ui.rounds = rounds;
})(window);