$(window).on('load', function() {
  var curve = $.bez([0.55, 0, .1, 1]);
});

$(document).ready(function() {
  var curve = $.bez([0.55, 0, .1, 1]);
  FastClick.attach(document.body);

  // Slideshow

  $('.intro-slideshow').flickity({
    draggable: false,
    wrapAround: true,
    autoPlay: 5500,
  });

  // Modal behaviour

  $('button').on('click', function() {
    $('.buy-overlay, .buy-modal').addClass('show');
  })

  $('.close').on('click', function() {
    $('.buy-overlay, .buy-modal').removeClass('show');
  })

  $(window).scroll(function() {
    onScroll();
  });

  $(window).resize(function() {
    onResize();
  });


  function onScroll() {
  }

  function onResize() {
  }

  onScroll();
  onResize();

});
