//returns function which returns true is user has scrolled vertically since function was last called or if a destination is passed then when the destination is reached
const hasScrolledY = (function() {
  let lastScrollY = 0;
  return (destination = -1) => {
    const output = destination >= 0 ? lastScrollY !== destination && window.scrollY === destination : window.scrollY !== lastScrollY;
    lastScrollY = window.scrollY;
    return output;
  };
})();


//using setInterval instead of attaching an event handler to 'scroll' as scroll fires at a high rate
const toggleScrollControl = function(destination = -1) {
  let scrollInterval = setInterval(() => {
    if (hasScrolledY(destination)) {
      clearInterval(scrollInterval);
      $('#scroll-control').toggleClass('show');
      $('nav').toggleClass('show');

      destination < 0 && $('#scroll-control').one('click', () => {
        toggleForm(null, true);
        $('html').animate({ scrollTop: 0 }, 400);
      });
      toggleScrollControl(destination < 0 ? 0 : -1);
    }
  }, 400);
};

const toggleForm = (function() {
  let toggled = false;
  return function(event, show) {
    if (show && toggled) return;
    event && event.preventDefault();
    toggled = !toggled;
    $('nav button').toggleClass('toggled');
    const $formWrapper = $('.new-tweet');
    $formWrapper.slideToggle(400, () => $formWrapper.find('textarea')[toggled && 'focus'  || 'blur']());
  };
})();

$(() => {
  //register form toggle handler
  $('nav button').on('click', toggleForm);

  //scroll to top controll
  toggleScrollControl();
});