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

  // Slideshow
  $('.intro-slideshow').flickity({
    draggable: false,
    wrapAround: true,
    autoPlay: 3500,
  });

  // Modal behaviour
  $('.buy-now').on('click', function() {
    $('.buy-overlay').addClass('show');
    $('.buy-modal-wrapper').addClass('display');
    setTimeout(function() {
      $('.buy-modal-wrapper').addClass('show');
    }, 10);
    $('body').addClass('hold');

    ga('send', 'event', {
        eventCategory: 'Modal',
        eventAction: 'Opened'
      }
    );

  })

  $('.close, .buy-overlay').on('click', function() {
    $('.buy-overlay, .buy-modal-wrapper').removeClass('show');
    $('.buy-modal-wrapper').removeClass('display');
    $('body').removeClass('hold');
  })

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
        if (data.result !== 'success') {
          $('.form-response .error').show();
        } else {
          $('.form-response .success').show();
        }

        setTimeout(function() {
          $('.form-response div').hide();
          $(this).find('input[type="submit"]').val('Join');
        }, 5000);
      }
    });

    $(this).find('input[type="submit"]').val('.....');

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
      order.shipping = 8;
      updateFinalPrice();
      $('.extra .price').show();
    } else if (country === 'INT') {
      $('.shipping-options label.international').show();
      order.shipping = 12;
      updateFinalPrice();
      $('.extra .price').show();
    }
  });

  $('#quantity').bind('keyup mouseup', function() {
    order.quantity = $('#quantity').val();
    updateFinalPrice();
  });
  
  function updateFinalPrice() {
    if (order.quantity > 3 ) {
      $('#quantity').val(3);  
      order.quantity = 3;
    }

    if (order.quantity < 1 ) {
      $('#quantity').val(1);  
      order.quantity = 1;
    }

    $('.total-price').html((order.quantity * 25) + order.shipping);

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
