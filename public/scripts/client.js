/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 *
 */
const tweetData = JSON.parse(`[
  {
    "user": {
      "name": "Newton",
      "avatars": "https://i.imgur.com/73hZDYK.png"
      ,
      "handle": "@SirIsaac"
    },
    "content": {
      "text": "If I have seen further it is by standing on the shoulders of giants"
    },
    "created_at": 1461116232227
  },
  {
    "user": {
      "name": "Descartes",
      "avatars": "https://i.imgur.com/nlhLi3I.png",
      "handle": "@rd" },
    "content": {
      "text": "Je pense , donc je suis"
    },
    "created_at": 1461113959088
  }
]`);


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
  $('#tweets-container').append(tweets.map(tweet => createTweetElement(tweet)));
};

$(() => renderTweets(tweetData));