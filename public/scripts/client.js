// custom error class so we can discriminate between our own errors and standard JS error types which should not be shown to the user
class PublicError extends Error {}


// escape test to prevent injection attacks
const escapeText = function(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
};


// multiline tweets
const parseLineBreaks = function(text) {
  return text.replace(/\r\n|\n/, '<br />');
};


// returns time elapsed since tweet was posted
const daysAgo = function(date) {
  const timeIncrements = [[1000, 'second'], [60, 'minute'], [60, 'hour'], [24, 'day']];
  const timeAgo = {value: Date.now() - date, str: ''};

  for (const [incr, str] of timeIncrements) {
    
    if (timeAgo.value < incr) break;
    timeAgo.value = Math.ceil(timeAgo.value / incr);
    timeAgo.str = str;
  }

  return timeAgo.value + ' ' + timeAgo.str + (timeAgo.value > 1 && 's' || '') + ' ago';
};


// create tweet html
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
      <div>${parseLineBreaks(escapeText(data.content.text))}</div>
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


// render tweets
const renderTweets = function(tweets) {
  $('#tweets-container').prepend(tweets.map(tweet => createTweetElement(tweet)));
};


// toggle error container and display error
const displayError = function(err) {
  const $container = $('#error-container').attr('data-error', err || null);
  err && $container.slideDown(500, () => {
    setTimeout(() => $container.slideUp(500, displayError), 4000);
  });
};


/*
 * fetches tweets from server
 * if latestOnly set to true, will only return tweets with a timestamp greater than prior retrieval's max timestamp
 * async fn
 * error and success are callbacks
 */
const getTweets = (function() {
  let maxTimestamp = 0;
  return async function(error, success, latestOnly = false) {
    try {
      let data = await $.ajax({
        method: 'GET',
        url: '/tweets/',
        dataType: 'json'
      });

      // load only latest tweets if flag set to true
      ({data, maxTimestamp} = data.reduce((output, tweet) => {
        // push tweet if latest && date > max or all otherwise
        (latestOnly ? tweet.created_at > maxTimestamp : true) && output.data.push(tweet);
        // keep track of new max
        tweet.created_at > output.maxTimestamp && (output.maxTimestamp = tweet.created_at);
        return output;
      }, { data: [], maxTimestamp }));

      // sort data by timestamp
      data.sort(({created_at: a}, {created_at: b}) => b - a);
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


/*
 * fetches and renders tweets
 * async fn
 */
const loadTweets = function(latestOnly = false) {
  getTweets(null, renderTweets, latestOnly);
};


/* returns serialized form data if input valid, throws an error otherwise
 * logs error to error container
 */
const getFormData = function() {
  const $form = $('.new-tweet form');

  //get form data
  const formData = $form.children('textarea').val();

  if (!formData) {
    throw new PublicError('Your tweet cannot be empty');
  } else if (formData.length > 140) {
    throw new PublicError('Your tweet cannot exceed 140 characters in length');
  }

  return $form.serialize();
};


// clear form
const resetForm = () => {
  $('form textarea').val('');
  $('form .counter').text(140);
};


/*
 * post tweet to server
 * async fn
 */
const postTweet = async function(event) {
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
  $('.new-tweet form').on('submit', postTweet);

  //get all tweets on load
  loadTweets();

});