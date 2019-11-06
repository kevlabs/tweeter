/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 *
 */

class PublicError extends Error {
  
};

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
  const name = escapeText(data.user.name);
  const date = new Date(Number(data.created_at));
  return $('<article>')
    .addClass('single-tweet')
    .html(
      `<header>
        <div><img src="${data.user.avatars}" alt="${name}" title="${name}"></div>
        <div>${name}</div>
        <div>${data.user.handle}</div>
      </header>
      <div>${escapeText(data.content.text)}</div>
      <footer>
        <div><time datetime="${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDay()).padStart(2, '0')}">${daysAgo(Number(data.created_at))}</time></div>
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

const displayError = function(err) {
  const $container = $('#error-container').attr('data-error', err || null);
  err && $container.slideDown(500, () => {
    setTimeout(() => $container.slideUp(500, displayError), 2000);
  });
};

// async fn
// error and success are callbacks
const getTweets = (function() {
  let counter = 0;
  return async function(error, success, latestOnly = false) {
    try {
      let data = await $.ajax({
        method: 'GET',
        url: '/tweets/',
        dataType: 'json'
      });

      // load only latest tweets if flag set to true
      data = latestOnly && data.slice(counter) || data;
      counter += data.length;
      data.reverse();
      success(data);

    } catch (err) {
      if (error) {
        error(err);
      } else if (err instanceof PublicError) {
        displayError('Error while fetching tweets!');
      }
    }
  };
})();

// async fn
const loadTweets = function(latestOnly = false) {
  getTweets(null, renderTweets, latestOnly);
};

// returns serialized form data if input valid, throws an error otherwise
// logs error to error container
const getFormData = function() {
  const $form = $('form');

  //get form data
  const formData = $form.children('textarea').val();

  if (!formData) {
    throw new PublicError('Your tweet cannot be empty');
  } else if (formData.length > 140) {
    throw new PublicError('Your tweet cannot exceed 140 characters in length');
  }

  return $form.serialize();
};

const resetForm = () => $('form textarea').val('');

//async fn
const postTweet = async function (event) {
  try {
    event.preventDefault();

    // getFormData will throw an error if data validation fails
    const formData = getFormData();

    // post tweets
    await $.ajax({
      method: 'POST',
      url: '/tweets/',
      data: formData
    });

    loadTweets(true);
    resetForm();

  } catch (err) {
    //only display public errors otherwise show a generic message
    if (err instanceof PublicError) {
      displayError(err.message);
    } else {
      displayError('Error while posting your tweet!');
    }
  }
};


$(() => {

  //register handler for form post
  $('form').on('submit', postTweet);

  //get all tweets on load
  loadTweets();

});