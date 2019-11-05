$(function() {

  // recalculate length whenever key is pressed - 'input' event also works
  $('.new-tweet textarea').on('input', function(event) {
    const $counter = $(this).siblings('.counter');
    const charLeft = 140 - this.value.length;

    $counter.html(charLeft);
    (charLeft < 0) && $counter.addClass('overlimit') || $counter.removeClass('overlimit');
  });
});