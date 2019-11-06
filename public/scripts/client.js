/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 *
 */

const escapeText = function(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
};

const daysAgo = function(date) {
  const days = Math.ceil((Date.now() - date) / 86400000);
  return days + ' day' + (days > 1 && 's' || '') + ' ago';
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
  const $container = $('#error-container').attr('data-error', err || null);
  err && $container.toggle(true);
  setTimeout(() => $container.slideUp(1000, toggleError), 2000);
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
        success(data.reverse());
        counter += data.length;
      }
    });
  };
})();

const loadTweets = function(latestOnly = false) {
  getTweets(null, renderTweets, latestOnly);
};

const hasScrolledY = (function() {
  let lastScrollY = window.scrollY;
  return () => {
    const output = window.scrollY > lastScrollY;
    lastScrollY = window.scrollY;
    return output;
  };
})();


$(function() {

  //register handler for form post
  $('form').on('submit', (event) => {
    event.preventDefault();
    const $form = $(event.target);

    //get form data
    const $textarea = $(event.target).children('textarea');
    const formData = $textarea.val();

    // data validation
    if (!formData) {
      toggleError('You tweet cannot be empty');
    } else if (formData.length > 140) {
      toggleError('Your tweet cannot exceed 140 characters in length');
    } else {

      //post tweets
      $.ajax({
        method: 'POST',
        url: '/tweets/',
        data: $form.serialize(),
        error: () => toggleError('Error while posting your tweet!'),
        statusCode: {
          400: () => toggleError('Tweets cannot be blank!'),
          500: () => toggleError('Server Error'),
          201: () => {
            loadTweets(true);
            $textarea.val('');
          }
        }
      });
    }
  
  });

  //register form toggle handler
  $('nav button').on('click', function(event) {
    event.preventDefault();
    $(this).toggleClass('toggle-form');
    const $formWrapper = $('.new-tweet');
    $formWrapper.slideToggle(400, () => $formWrapper.find('textarea')[$(this).hasClass('toggle-form') && 'focus'  || 'blur']());
  });

  //get all tweets on load
  loadTweets();

  //scroll
  setTimeout(() => {
    window.scrollY
  }, 500);

});