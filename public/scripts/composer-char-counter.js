$(() => {

  // recalculate textarea length whenever input value changes
  $('.new-tweet textarea').on('input', function() {
    const $counter = $(this).siblings('.counter');
    const charLeft = 140 - this.value.length;

    $counter.text(charLeft);
    (charLeft < 0) && $counter.addClass('overlimit') || $counter.removeClass('overlimit');
  });
});