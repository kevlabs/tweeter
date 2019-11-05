/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 *
 */

const escapeText = function(text) {
  return document.createElement('div').textContent = text;
};

const daysAgo = function(date) {
  const days = Math.ceil((Date.now() - date) / 86400000);
  return days + ' day' + (days > 1 ? 's' : '') + ' ago';
};

const createTweetElement = (data) => {
  return $('<article>')
    .addClass('single-tweet')
    .html(
      `<header>
        <div><img src="${data.user.avatars}"></div>
        <div>${escapeText(data.user.name)}</div>
        <div>${data.user.handle}</div>
      </header>
      <div>${escapeText(data.content.text)}</div>
      <footer>
        <div>${daysAgo(Number(data.created_at))}</div>
        <ul>
          <li class="fa fa-flag"></li>
          <li class="fa fa-retweet"></li>
          <li class="fa fa-heart"></li>
        </ul>
      </footer>`
    );
};

const renderTweets = function(tweets) {
  $('#tweets-container').prepend(tweets.map(tweet => createTweetElement(tweet)));
};

const toggleError = function(err) {
  console.log(err);
  
  $('#error-container').attr('data-error', err || null);
};

const getTweets = (function() {
  let counter = 0;
  return function(error, success, latestOnly = false) {
    $.ajax({
      method: 'GET',
      url: '/tweets/',
      dataType: 'json',
      error: error || (() => toggleError('Error while fetching tweets!')),
      success: (data) => {
        // load only latest tweets if flag set to true
        data = latestOnly && data.slice(counter) || data;
        success(data);
        counter += data.length;
      }
    });
  };
})();

const loadTweets = function(latestOnly = false) {
  getTweets(null, renderTweets, latestOnly);
};


$(function() {

  //register handlers for form post
  $('form').on('submit', (event) => {
    event.preventDefault();
    const $form = $(event.target);

    //get form data
    const formData = $(event.target).children('textarea').val();

    // data validation
    if (!formData || formData.length > 140) {
      toggleError('Tweets must be 1 to 140 characters');
      return;
    }

    $.ajax({
      method: 'POST',
      url: '/tweets/',
      data: $form.serialize(),
      error: () => toggleError('Error while posting your tweet!'),
      statusCode: {
        400: () => toggleError('Tweets cannot be blank!'),
        500: () => toggleError('Server Error'),
        201: () => loadTweets(true)
      }
    });
  
  });

  //get all tweets on load
  loadTweets();

});