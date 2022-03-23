$(window).on('load', function() {
  var curve = $.bez([0.55, 0, .1, 1]);
});

$(document).ready(function() {
  var curve = $.bez([0.55, 0, .1, 1]);
  FastClick.attach(document.body);

  var order = {
    quantity: 1,
    shipping: 0
  };

  function onScroll() {
  }

  function onResize() {
  }

  onScroll();
  onResize();

  $(window).scroll(function() {
    onScroll();
  });

  $(window).resize(function() {
    onResize();
  });

  // Marquee Safari fix
  $('.marquee-pre').addClass('marquee');
  $('.marquee-pre').removeClass('marquee-pre');

  // Slideshow
  $('.intro-slideshow').flickity({
    draggable: false,
    wrapAround: true,
    autoPlay: 3500,
  });

  $('.close, .buy-overlay').on('click', function() {
    $('.buy-overlay, .buy-modal-wrapper').removeClass('show');
    $('.buy-modal-wrapper').removeClass('display');
    $('body').removeClass('hold');
  })

  var dots;
  var dot = '.';
  var currentDots = 0;
  var maxDots = 4;

  $('.mailchimp').on('submit', function() {
    var that = this;

    $.ajax({
      type: $(this).attr('method'),
      url: $(this).attr('action').replace('/post?', '/post-json?').concat('&c=?'),
      data: $(this).serialize(),
      timeout: 5000,
      cache: false,
      dataType: 'jsonp',
      contentType: 'application/json; charset=utf-8',
      error: function(err) {
      },
      success: function(data) {
        clearInterval(dots);
        if (data.result !== 'success') {
          $(that).find('input[type="submit"]').val('Join');

          if (data.msg.indexOf('already subscribed to list') !== -1) {
            $('.form-response .already').show();
          } else {
            $('.form-response .error').show();
          }
        } else {
          ga('send', 'event', {
              eventCategory: 'Newsletter',
              eventAction: 'Sign up'
            }
          );

          $(that).find('input[type="submit"]').val('');
          $(that).find('input[type="submit"]').addClass('ok');

          $('.form-response .success').show();
        }

        setTimeout(function() {
          $('.form-response div').hide();
          $(that).find('input[type="submit"]').val('Join');
          $(that).find('input[type="submit"]').removeClass('ok');
        }, 5000);
      }
    });

    dots = setInterval(function() {
      currentDots = (currentDots > maxDots) ? 1 : currentDots + 1;
      var newValue = dot.repeat(currentDots);
      $('.mailchimp input[type="submit"]').val(newValue);
    }, 200);

    return false;
  });


  $('.plus').on('click', function() {
    $('#quantity').val(parseInt($('#quantity').val(), 10) + 1);
    order.quantity = $('#quantity').val();
    updateFinalPrice();
  });

  $('.minus').on('click', function() {
    $('#quantity').val(parseInt($('#quantity').val(), 10) - 1);
    order.quantity = $('#quantity').val();
    updateFinalPrice();
  });

  $('.country').change(function() {
    var country = $('.country option:selected').val();

    $('.shipping-options label').hide();
    $('.pointer').hide();
    order.shipping = 0;
    updateFinalPrice();

    if (country === 'AU') {
      $('.shipping-options label.regular').show();
      order.shipping = 9.5;
      updateFinalPrice();
      $('.extra .price').show();
    } else if (country === 'INT') {
      $('.shipping-options label.international').show();
      order.shipping = 15;
      updateFinalPrice();
      $('.extra .price').show();
    }
  });

  $('#quantity').bind('keyup mouseup', function() {
    order.quantity = $('#quantity').val();
    updateFinalPrice();
  });
  
  function updateFinalPrice() {
    if (order.quantity > 3) $('.top .message').show();
    else $('.top .message').hide();

    if (order.quantity > 3 ) {
      $('#quantity').val(3);  
      order.quantity = 3;
    }

    if (order.quantity < 1 ) {
      $('#quantity').val(1);  
      order.quantity = 1;
    }

    if (order.quantity > 1) $('.plural').show();
    else $('.plural').hide();

    $('.book-price').html((order.quantity * 25).toFixed(2));
    $('.shipping-price').html(order.shipping.toFixed(2));
    $('.total-price').html(((order.quantity * 25) + order.shipping).toFixed(2));

    if (order.shipping > 0) {
      $('.extra').addClass('show');
    } else {
      $('.extra').removeClass('show');
    }

    $('#paypal-button').html('');

    paypal.Button.render({
      env: 'production', // 'production' or 'sandbox'
      style: {
        size:  'responsive',    // small | medium | large | responsive
        shape: 'rect',     // pill | rect
        color: 'black'      // gold | blue | silver | black
      },
      client: {
        sandbox: 'ATi_wJcJ7Cv_pqUWuoKaFsPI-Iq9GLF9C1BwS6f4GTiv4QqILnBC5CBH0N3i68UOg_JMhN3usRyikViS',
        production: 'AXqKyb-iuzscPaDxD_xJMllWPWOblQ09P9-jjgPq5AjFgpuIlbyO5GE-WqGHwxg7VnTQ9BUlsInVLWDQ'
      },
      commit: true, // Show a 'Pay Now' button
      payment: function(data, actions) {
        return actions.payment.create({
          payment: {
            intent: 'sale',
            transactions: [
              {
                amount: {
                  total: (order.quantity * 25) + order.shipping,
                  currency: 'AUD',
                  details: {
                    subtotal: order.quantity * 25,
                    shipping: order.shipping
                  }
                },
                item_list: {
                  items: [
                    {
                      name: 'Copywrong to copywriter',
                      quantity: order.quantity,
                      price: 25,
                      currency: 'AUD'
                    }
                  ]
                }
              }
            ]
          }
        });
      },
      onAuthorize: function(data, actions) {
        return actions.payment.execute().then(function(payment) {
          ga('send', 'event', {
              eventCategory: 'Purchase',
              eventAction: 'Complete'
            }
          );
          ga('ecommerce:addTransaction', {
            'id': payment.id,
            'revenue': (order.quantity * 25) + order.shipping,
            'shipping': order.shipping
          });
          ga('ecommerce:addItem', {
            'id': payment.id,
            'name': 'Copywrong to copywriter',
            'category': 'Book',
            'price': '25',
            'quantity': order.quantity
          });
          ga('ecommerce:send');

          $('.extra > div').hide();
          $('.extra .thanks').show();
        });
      },
      onCancel: function(data) {
        ga('send', 'event', {
            eventCategory: 'Purchase',
            eventAction: 'Cancelled'
          }
        );
      }
    }, '#paypal-button');
  }

  updateFinalPrice();
});

if (!String.prototype.repeat) {
  String.prototype.repeat = function(count) {
    'use strict';
    if (this == null) {
      throw new TypeError('can\'t convert ' + this + ' to object');
    }
    var str = '' + this;
    count = +count;
    if (count != count) {
      count = 0;
    }
    if (count < 0) {
      throw new RangeError('repeat count must be non-negative');
    }
    if (count == Infinity) {
      throw new RangeError('repeat count must be less than infinity');
    }
    count = Math.floor(count);
    if (str.length == 0 || count == 0) {
      return '';
    }
    // Ensuring count is a 31-bit integer allows us to heavily optimize the
    // main part. But anyway, most current (August 2014) browsers can't handle
    // strings 1 << 28 chars or longer, so:
    if (str.length * count >= 1 << 28) {
      throw new RangeError('repeat count must not overflow maximum string size');
    }
    var rpt = '';
    for (var i = 0; i < count; i++) {
      rpt += str;
    }
    return rpt;
  }
}
