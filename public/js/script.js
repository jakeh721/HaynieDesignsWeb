/**
 * Global variables
 */
"use strict";

var userAgent = navigator.userAgent.toLowerCase(),
  initialDate = new Date(),

  $document = $(document),
  $window = $(window),
  $html = $("html"),

  isDesktop = $html.hasClass("desktop"),
  isIE = userAgent.indexOf("msie") != -1 ? parseInt(userAgent.split("msie")[1]) : userAgent.indexOf("trident") != -1 ? 11 : userAgent.indexOf("edge") != -1 ? 12 : false,
  isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  isTouch = "ontouchstart" in window,

  plugins = {
    pointerEvents: isIE < 11 ? "js/pointer-events.min.js" : false,
    smoothScroll: $html.hasClass("use--smoothscroll") ? "js/smoothscroll.min.js" : false,
    bootstrapTabs: $(".tabs"),
    rdParallax: $(".rd-parallax"),
    responsiveTabs: $(".responsive-tabs"),
    rdGoogleMaps: $("#rd-google-map"),
    rdInputLabel: $(".form-label"),
    rdNavbar: $(".rd-navbar"),
    regula: $("[data-constraints]"),
    stepper: $("input[type='number']"),
    radio: $("input[type='radio']"),
    checkbox: $("input[type='checkbox']"),
    swiper: $(".swiper-slider"),
    photoSwipeGallery: $("[data-photo-swipe-item]"),
    isotope: $(".isotope"),
    customToggle: $("[data-custom-toggle]"),
    rdMailForm: $(".rd-mailform")
  };

/**
 * Initialize All Scripts
 */
$document.ready(function () {

  /**
   * isScrolledIntoView
   * @description  check the element whas been scrolled into the view
   */
  function isScrolledIntoView(elem) {
    var $window = $(window);
    return elem.offset().top + elem.outerHeight() >= $window.scrollTop() && elem.offset().top <= $window.scrollTop() + $window.height();
  }

  /**
   * initOnView
   * @description  calls a function when element has been scrolled into the view
   */
  function lazyInit(element, func) {
    var $win = jQuery(window);
    $win.on('load scroll', function () {
      if ((!element.hasClass('lazy-loaded') && (isScrolledIntoView(element)))) {
        func.call();
        element.addClass('lazy-loaded');
      }
    });
  }

  /**
   * getSwiperHeight
   * @description  calculate the height of swiper slider basing on data attr
   */
  function getSwiperHeight(object, attr) {
    var val = object.attr("data-" + attr),
      dim;

    if (!val) {
      return undefined;
    }

    dim = val.match(/(px)|(%)|(vh)$/i);

    if (dim.length) {
      switch (dim[0]) {
        case "px":
          return parseFloat(val);
        case "vh":
          return $(window).height() * (parseFloat(val) / 100);
        case "%":
          return object.width() * (parseFloat(val) / 100);
      }
    } else {
      return undefined;
    }
  }

  /**
   * toggleSwiperInnerVideos
   * @description  toggle swiper videos on active slides
   */
  function toggleSwiperInnerVideos(swiper) {
    var videos;

    $.grep(swiper.slides, function (element, index) {
      var $slide = $(element),
        video;

      if (index === swiper.activeIndex) {
        videos = $slide.find("video");
        if (videos.length) {
          videos.get(0).play();
        }
      } else {
        $slide.find("video").each(function () {
          this.pause();
        });
      }
    });
  }

  /**
   * toggleSwiperCaptionAnimation
   * @description  toggle swiper animations on active slides
   */
  function toggleSwiperCaptionAnimation(swiper) {
    if (isIE && isIE < 10) {
      return;
    }

    var prevSlide = $(swiper.container),
      nextSlide = $(swiper.slides[swiper.activeIndex]);

    prevSlide
      .find("[data-caption-animate]")
      .each(function () {
        var $this = $(this);
        $this
          .removeClass("animated")
          .removeClass($this.attr("data-caption-animate"))
          .addClass("not-animated");
      });

    nextSlide
      .find("[data-caption-animate]")
      .each(function () {
        var $this = $(this),
          delay = $this.attr("data-caption-delay");

        setTimeout(function () {
          $this
            .removeClass("not-animated")
            .addClass($this.attr("data-caption-animate"))
            .addClass("animated");
        }, delay ? parseInt(delay) : 0);
      });
  }

  /**
   * makeParallax
   * @description  create swiper parallax scrolling effect
   */
  function makeParallax(el, speed, wrapper, prevScroll) {
    var scrollY = window.scrollY || window.pageYOffset;

    if (prevScroll != scrollY) {
      prevScroll = scrollY;
      el.addClass('no-transition');
      el[0].style['transform'] = 'translate3d(0,' + -scrollY * (1 - speed) + 'px,0)';
      el.height();
      el.removeClass('no-transition');

      if (el.attr('data-fade') === 'true') {
        var bound = el[0].getBoundingClientRect(),
          offsetTop = bound.top * 2 + scrollY,
          sceneHeight = wrapper.outerHeight(),
          sceneDevider = wrapper.offset().top + sceneHeight / 2.0,
          layerDevider = offsetTop + el.outerHeight() / 2.0,
          pos = sceneHeight / 6.0,
          opacity;
        if (sceneDevider + pos > layerDevider && sceneDevider - pos < layerDevider) {
          el[0].style["opacity"] = 1;
        } else {
          if (sceneDevider - pos < layerDevider) {
            opacity = 1 + ((sceneDevider + pos - layerDevider) / sceneHeight / 3.0 * 5);
          } else {
            opacity = 1 - ((sceneDevider - pos - layerDevider) / sceneHeight / 3.0 * 5);
          }
          el[0].style["opacity"] = opacity < 0 ? 0 : opacity > 1 ? 1 : opacity.toFixed(2);
        }
      }
    }

    requestAnimationFrame(function () {
      makeParallax(el, speed, wrapper, prevScroll);
    });
  }

  /**
   * attachFormValidator
   * @description  attach form validation to elements
   */
  function attachFormValidator(elements) {
    for (var i = 0; i < elements.length; i++) {
      var o = $(elements[i]), v;
      o.addClass("form-control-has-validation").after("<span class='form-validation'></span>");
      v = o.parent().find(".form-validation");
      if (v.is(":last-child")) {
        o.addClass("form-control-last-child");
      }
    }

    elements
      .on('input change propertychange blur', function (e) {
        var $this = $(this), results;

        if (e.type != "blur") {
          if (!$this.parent().hasClass("has-error")) {
            return;
          }
        }

        if ($this.parents('.rd-mailform').hasClass('success')){
          return;
        }

        if ((results = $this.regula('validate')).length) {
          for (i = 0; i < results.length; i++) {
            $this.siblings(".form-validation").text(results[i].message).parent().addClass("has-error")
          }
        } else {
          $this.siblings(".form-validation").text("").parent().removeClass("has-error")
        }
      })
      .regula('bind');
  }

  /**
   * isValidated
   * @description  check if all elemnts pass validation
   */
  function isValidated(elements) {
    var results, errors = 0;
    if (elements.length) {
      for (j = 0; j < elements.length; j++) {

        var $input = $(elements[j]);

        if ((results = $input.regula('validate')).length) {
          for (k = 0; k < results.length; k++) {
            errors++;
            $input.siblings(".form-validation").text(results[k].message).parent().addClass("has-error");
          }
        } else {
          $input.siblings(".form-validation").text("").parent().removeClass("has-error")
        }
      }

      return errors == 0;
    }
    return true;
  }

  /**
   * IE Polyfills
   * @description  Adds some loosing functionality to IE browsers
   */
  if (isIE) {
    if (isIE < 10) {
      $html.addClass("lt-ie-10");
    }

    if (isIE < 11) {
      if (plugins.pointerEvents) {
        $.getScript(plugins.pointerEvents)
          .done(function () {
            $html.addClass("ie-10");
            PointerEventsPolyfill.initialize({});
          });
      }
    }

    if (isIE === 11) {
      $("html").addClass("ie-11");
    }

    if (isIE === 12) {
      $("html").addClass("ie-edge");
    }
  }

  /**
   * Copyright Year
   * @description  Evaluates correct copyright year
   */
  var o = $("#copyright-year");
  if (o.length) {
    o.text(initialDate.getFullYear());
  }

  /**
   * Smooth scrolling
   * @description  Enables a smooth scrolling for Google Chrome (Windows)
   */
  if (plugins.smoothScroll) {
    $.getScript(plugins.smoothScroll);
  }

  /**
   * Bootstrap tabs
   * @description Activate Bootstrap Tabs
   */
  if (plugins.bootstrapTabs.length) {
    var i;
    for (i = 0; i < plugins.bootstrapTabs.length; i++) {
      var bootstrapTab = $(plugins.bootstrapTabs[i]);

      bootstrapTab.on("click", "a", function (event) {
        event.preventDefault();
        $(this).tab('show');
      });
    }
  }

  /**
   * Responsive Tabs
   * @description Enables Responsive Tabs plugin
   */
  if (plugins.responsiveTabs.length) {
    var i = 0;
    for (i = 0; i < plugins.responsiveTabs.length; i++) {
      var $this = $(plugins.responsiveTabs[i]);
      $this.easyResponsiveTabs({
        type: $this.attr("data-type"),
        tabidentify: $this.find(".resp-tabs-list").attr("data-group") || "tab"
      });
    }
  }

  /**
   * RD Google Maps
   * @description Enables RD Google Maps plugin
   */
  if (plugins.rdGoogleMaps.length) {
    $.getScript("http://maps.google.com/maps/api/js?sensor=false&libraries=geometry&v=3.7", function () {
      var head = document.getElementsByTagName('head')[0],
        insertBefore = head.insertBefore;

      head.insertBefore = function (newElement, referenceElement) {
        if (newElement.href && newElement.href.indexOf('//fonts.googleapis.com/css?family=Roboto') != -1 || newElement.innerHTML.indexOf('gm-style') != -1) {
          return;
        }
        insertBefore.call(head, newElement, referenceElement);
      };

      lazyInit(plugins.rdGoogleMaps, function () {
        var styles = plugins.rdGoogleMaps.attr("data-styles");

        plugins.rdGoogleMaps.googleMap({
          styles: styles ? JSON.parse(styles) : {}
        })
      });
    });
  }

  /**
   * RD Input Label
   * @description Enables RD Input Label Plugin
   */
  if (plugins.rdInputLabel.length) {
    plugins.rdInputLabel.RDInputLabel();
  }

  /**
   * Stepper
   * @description Enables Stepper Plugin
   */
  if (plugins.stepper.length) {
    plugins.stepper.stepper({
      labels: {
        up: "",
        down: ""
      }
    });
  }

  /**
   * Radio
   * @description Add custom styling options for input[type="radio"]
   */
  if (plugins.radio.length) {
    var i;
    for (i = 0; i < plugins.radio.length; i++) {
      var $this = $(plugins.radio[i]);
      $this.addClass("radio-custom").after("<span class='radio-custom-dummy'></span>")
    }
  }

  /**
   * Checkbox
   * @description Add custom styling options for input[type="checkbox"]
   */
  if (plugins.checkbox.length) {
    var i;
    for (i = 0; i < plugins.checkbox.length; i++) {
      var $this = $(plugins.checkbox[i]);
      $this.addClass("checkbox-custom").after("<span class='checkbox-custom-dummy'></span>")
    }
  }

  /**
   * Regula
   * @description Enables Regula plugin
   */
  if (plugins.regula.length) {
    attachFormValidator(plugins.regula);
  }

  /**
   * WOW
   * @description Enables Wow animation plugin
   */
  if ($html.hasClass('desktop') && $html.hasClass("wow-animation") && $(".wow").length) {
    new WOW().init();
  }

  /**
   * Swiper 3.1.7
   * @description  Enable Swiper Slider
   */
  if (plugins.swiper.length) {
    plugins.swiper.each(function () {
      var s = $(this);

      var pag = s.find(".swiper-pagination"),
        next = s.find(".swiper-button-next"),
        prev = s.find(".swiper-button-prev"),
        bar = s.find(".swiper-scrollbar"),
        h = getSwiperHeight(plugins.swiper, "height"), mh = getSwiperHeight(plugins.swiper, "min-height"),
        parallax = s.parents('.rd-parallax').length;

      s.find(".swiper-slide")
        .each(function () {
          var $this = $(this),
            url;

          if (url = $this.attr("data-slide-bg")) {
            $this.css({
              "background-image": "url(" + url + ")",
              "background-size": "cover"
            })
          }

        })
        .end()
        .find("[data-caption-animate]")
        .addClass("not-animated")
        .end()
        .swiper({
          autoplay: s.attr('data-autoplay') === "true" ? 5000 : false,
          direction: s.attr('data-direction') ? s.attr('data-direction') : "horizontal",
          effect: s.attr('data-slide-effect') ? s.attr('data-slide-effect') : "slide",
          speed: s.attr('data-slide-speed') ? s.attr('data-slide-speed') : 600,
          keyboardControl: s.attr('data-keyboard') === "true",
          mousewheelControl: s.attr('data-mousewheel') === "true",
          mousewheelReleaseOnEdges: s.attr('data-mousewheel-release') === "true",
          nextButton: next.length ? next.get(0) : null,
          prevButton: prev.length ? prev.get(0) : null,
          pagination: pag.length ? pag.get(0) : null,
          simulateTouch: false,
          paginationClickable: pag.length ? pag.attr("data-clickable") !== "false" : false,
          paginationBulletRender: pag.length ? pag.attr("data-index-bullet") === "true" ? function (index, className) {
            return '<span class="' + className + '">' + (index + 1) + '</span>';
          } : null : null,
          scrollbar: bar.length ? bar.get(0) : null,
          scrollbarDraggable: bar.length ? bar.attr("data-draggable") !== "false" : true,
          scrollbarHide: bar.length ? bar.attr("data-draggable") === "false" : false,
          loop: s.attr('data-loop') !== "false",
          loopAdditionalSlides: 0,
          loopedSlides: 0,
          onTransitionStart: function (swiper) {
            toggleSwiperInnerVideos(swiper);
          },
          onTransitionEnd: function (swiper) {
            $(window).trigger("resize");
          },

          onInit: function (swiper) {
            toggleSwiperInnerVideos(swiper);

            // Create parallax effect on swiper caption
            s.find(".swiper-parallax")
              .each(function () {
                var $this = $(this),
                  speed;

                if (parallax && !isIE && !isMobile) {
                  if (speed = $this.attr("data-speed")) {
                    makeParallax($this, speed, s, false);
                  }
                }
              });
            $(window).on('resize', function () {
              swiper.update(true);
            })
          },
          onSlideChangeStart: function (swiper) {
            var activeSlideIndex, slidesCount, thumbsToShow = 3;

            activeSlideIndex = swiper.activeIndex;
            slidesCount = swiper.slides.not(".swiper-slide-duplicate").length;

            //If there is not enough slides
            if (slidesCount < thumbsToShow)
              return false;

            //Fix index count
            if (activeSlideIndex === slidesCount + 1) {
              activeSlideIndex = 1;
            } else if (activeSlideIndex === 0) {
              activeSlideIndex = slidesCount;
            }

            //Lopp that adds background to thumbs
            for (var i = -thumbsToShow; i < thumbsToShow + 1; i++) {
              if (i === 0)
                continue;

              //Previous btn thumbs
              if (i < 0) {
                //If there is no slides before current
                if (( activeSlideIndex + i - 1) < 0) {
                  $(swiper.container).find('.swiper-button-prev .preview__img-' + Math.abs(i))
                    .css("background-image", "url(" + swiper.slides[slidesCount + i + 1].getAttribute("data-preview-bg") + ")");
                } else {
                  $(swiper.container).find('.swiper-button-prev .preview__img-' + Math.abs(i))
                    .css("background-image", "url(" + swiper.slides[activeSlideIndex + i].getAttribute("data-preview-bg") + ")");
                }

                //Next btn thumbs
              } else {
                //If there is no slides after current
                if (activeSlideIndex + i - 1 > slidesCount) {
                  $(swiper.container).find('.swiper-button-next .preview__img-' + i)
                    .css("background-image", "url(" + swiper.slides[i].getAttribute("data-preview-bg") + ")");
                } else {
                  $(swiper.container).find('.swiper-button-next .preview__img-' + i)
                    .css("background-image", "url(" + swiper.slides[activeSlideIndex + i].getAttribute("data-preview-bg") + ")");
                }
              }
            }
          },
          on2SlideChangeStart: function (swiper) {
            var activeSlideIndex, slidesCount, thumbsToShow = 3;

            activeSlideIndex = swiper.activeIndex;
            slidesCount = swiper.slides.not(".swiper-slide-duplicate").length;

            //If there is not enough slides
            if (slidesCount < thumbsToShow)
              return false;

            //Fix index count
            if (activeSlideIndex === slidesCount + 1) {
              activeSlideIndex = 1;
            } else if (activeSlideIndex === 0) {
              activeSlideIndex = slidesCount;
            }

            //Loop that adds background to thumbs
            for (var i = -thumbsToShow; i < thumbsToShow + 1; i++) {
              if (i === 0)
                continue;

              //Previous btn thumbs
              if (i < 0) {
                //If there is no slides before current
                if (( activeSlideIndex + i - 1) < 0) {
                  $(swiper.container).find('.swiper-button-prev .preview__img-' + Math.abs(i))
                    .css("background-image", "url(" + swiper.slides[slidesCount + i + 1].getAttribute("data-preview-bg") + ")");
                } else {
                  $(swiper.container).find('.swiper-button-prev .preview__img-' + Math.abs(i))
                    .css("background-image", "url(" + swiper.slides[activeSlideIndex + i].getAttribute("data-preview-bg") + ")");
                }

                //Next btn thumbs
              } else {
                //If there is no slides after current
                if (activeSlideIndex + i - 1 > slidesCount) {
                  $(swiper.container).find('.swiper-button-next .preview__img-' + i)
                    .css("background-image", "url(" + swiper.slides[i].getAttribute("data-preview-bg") + ")");
                } else {
                  $(swiper.container).find('.swiper-button-next .preview__img-' + i)
                    .css("background-image", "url(" + swiper.slides[activeSlideIndex + i].getAttribute("data-preview-bg") + ")");
                }
              }
            }
          }
        });

      $(window)
        .on("resize", function () {
          var mh = getSwiperHeight(s, "min-height"),
            h = getSwiperHeight(s, "height");
          if (h) {
            s.css("height", mh ? mh > h ? mh : h : h);
          }
        })
        .load(function () {
          s.find("video").each(function () {
            if (!$(this).parents(".swiper-slide-active").length) {
              this.pause();
            }
          });
        })
        .trigger("resize");
    });
  }

  /**
   * Isotope
   * @description Enables Isotope plugin
   */
  if (plugins.isotope.length) {
    // var i, isogroup = [];
    // for (i = 0; i < plugins.isotope.length; i++) {
    //   var isotopeItem = plugins.isotope[i]
    //     , iso = new Isotope(isotopeItem, {
    //       itemSelector: '.isotope-item',
    //       layoutMode: isotopeItem.getAttribute('data-isotope-layout') ? isotopeItem.getAttribute('data-isotope-layout') : 'masonry',
    //       filter: '*'
    //     });

    //   isogroup.push(iso);
    // }

    // $(window).on('load', function () {
    //   setTimeout(function () {
    //     var i;
    //     for (i = 0; i < isogroup.length; i++) {
    //       isogroup[i].element.className += " isotope--loaded";
    //       isogroup[i].layout();
    //     }
    //   }, 600);
    // });

    // var resizeTimout;

    // $("[data-isotope-filter]").on("click", function (e) {
    //   e.preventDefault();
    //   var filter = $(this);
    //   clearTimeout(resizeTimout);
    //   filter.parents(".isotope-filters").find('.active').removeClass("active");
    //   filter.addClass("active");
    //   var iso = $('.isotope[data-isotope-group="' + this.getAttribute("data-isotope-group") + '"]');
    //   iso.isotope({
    //     itemSelector: '.isotope-item',
    //     layoutMode: iso.attr('data-isotope-layout') ? iso.attr('data-isotope-layout') : 'masonry',
    //     filter: this.getAttribute("data-isotope-filter") == '*' ? '*' : '[data-filter*="' + this.getAttribute("data-isotope-filter") + '"]'
    //   });
    //   resizeTimout = setTimeout(function () {
    //     $window.trigger('resize');
    //   }, 300);
    // }).eq(0).trigger("click")
  }

  /**
   * RD Navbar
   * @description Enables RD Navbar plugin
   */
  if (plugins.rdNavbar.length) {
    plugins.rdNavbar.RDNavbar({
      stickUpClone: (plugins.rdNavbar.attr("data-stick-up-clone")) ? plugins.rdNavbar.attr("data-stick-up-clone") === 'true' : false,
      stickUpOffset: (plugins.rdNavbar.attr("data-stick-up-offset")) ? plugins.rdNavbar.attr("data-stick-up-offset") : 1
    });
  }

  /**
   * PhotoSwipe Gallery
   * @description Enables PhotoSwipe Gallery plugin
   */
  if (plugins.photoSwipeGallery.length) {

    // init image click event
    $document.delegate("[data-photo-swipe-item]", "click", function (event) {
      event.preventDefault();

      var $el = $(this),
        $galleryItems = $el.parents("[data-photo-swipe-gallery]").find("a[data-photo-swipe-item]"),
        pswpElement = document.querySelectorAll('.pswp')[0],
        encounteredItems = {},
        pswpItems = [],
        options,
        pswpIndex = 0,
        pswp;

      if ($galleryItems.length == 0) {
        $galleryItems = $el;
      }

      // loop over the gallery to build up the photoswipe items
      $galleryItems.each(function () {
        var $item = $(this),
          src = $item.attr('href'),
          size = $item.attr('data-size').split('x'),
          pswdItem;

        // if we have this image the first time
        if (!encounteredItems[src]) {
          // build the photoswipe item
          pswdItem = {
            src: src,
            w: parseInt(size[0], 10),
            h: parseInt(size[1], 10),
            el: $item // save link to element for getThumbBoundsFn
          };

          // store that we already had this item
          encounteredItems[src] = {
            item: pswdItem,
            index: pswpIndex
          };

          // push the item to the photoswipe list
          pswpItems.push(pswdItem);
          pswpIndex++;
        }
      });

      options = {
        index: encounteredItems[$el.attr('href')].index,

        getThumbBoundsFn: function (index) {
          var $el = pswpItems[index].el,
            offset = $el.offset();

          return {
            x: offset.left,
            y: offset.top,
            w: $el.width()
          };
        }
      };

      // open the photoswipe gallery
      pswp = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, pswpItems, options);
      pswp.init();
    });
  }

  /**
   * RD Mailform
   */
  if (plugins.rdMailForm.length) {
    var i, j, k,
      msg = {
        'MF000': 'Successfully sent!',
        'MF001': 'Recipients are not set!',
        'MF002': 'Form will not work locally!',
        'MF003': 'Please, define email field in your form!',
        'MF004': 'Please, define type of your form!',
        'MF254': 'Something went wrong with PHPMailer!',
        'MF255': 'Aw, snap! Something went wrong.'
      };
    for (i = 0; i < plugins.rdMailForm.length; i++) {
      var $form = $(plugins.rdMailForm[i]);

      $form.attr('novalidate', 'novalidate').ajaxForm({
        data: {
          "form-type": $form.attr("data-form-type") || "contact",
          "counter": i
        },
        beforeSubmit: function () {
          var form = $(plugins.rdMailForm[this.extraData.counter]);
          var inputs = form.find("[data-constraints]");
          if (isValidated(inputs)){
            var output = $("#" + form.attr("data-form-output"));

            if (output.hasClass("snackbars")) {
              output.html('<p><span class="icon text-middle fa fa-circle-o-notch fa-spin icon-xxs"></span><span>Sending</span></p>');
              output.addClass("active");
            }
          } else{
            return false;
          }
        },
        error: function (result) {
          var output = $("#" + $(plugins.rdMailForm[this.extraData.counter]).attr("data-form-output"));
          output.text(msg[result]);
        },
        success: function (result) {
          var form = $(plugins.rdMailForm[this.extraData.counter]);
          var output = $("#" + form.attr("data-form-output"));
          form.addClass('success');
          result = result.length == 5 ? result : 'MF255';
          output.text(msg[result]);
          if (result === "MF000") {
            if (output.hasClass("snackbars")) {
              output.html('<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + msg[result] + '</span></p>');
            } else {
              output.addClass("success");
              output.addClass("active");
            }
          } else {
            if (output.hasClass("snackbars")) {
              output.html(' <p class="snackbars-left"><span class="icon icon-xxs mdi mdi-alert-outline text-middle"></span><span>' + msg[result] + '</span></p>');
            } else {
              output.addClass("error");
              output.addClass("active");
            }
          }
          form.clearForm();
          form.find('input, textarea').blur();

          setTimeout(function () {
            output.removeClass("active");
            form.removeClass('success');
          }, 5000);
        }
      });
    }
  }

  /**
   * Custom Toggles
   */
  if (plugins.customToggle.length) {
    var i;
    for (i = 0; i < plugins.customToggle.length; i++) {
      var $this = $(plugins.customToggle[i]);
      $this.on('click', function (e) {
        e.preventDefault();
        $("#" + $(this).attr('data-custom-toggle')).add(this).toggleClass('active');
      });

      if ($this.attr("data-custom-toggle-disable-on-blur") === "true") {
        $("body").on("click", $this, function (e) {
          if (e.target !== e.data[0] && $("#" + e.data.attr('data-custom-toggle')).find($(e.target)).length == 0 && e.data.find($(e.target)).length == 0) {
            $("#" + e.data.attr('data-custom-toggle')).add(e.data[0]).removeClass('active');
          }
        })
      }
    }
  }

  /**
   * RD Parallax
   * @description Enables RD Parallax plugin
   */
  if (plugins.rdParallax.length) {
    var i;
    $.RDParallax();

    if (!isIE && !isMobile){
      $(window).on("scroll", function () {
        for (i = 0; i < plugins.rdParallax.length; i++){
          var parallax = $(plugins.rdParallax[i]);
          if (isScrolledIntoView(parallax)){
            parallax.find(".rd-parallax-inner").css("position", "fixed");
          }else{
            parallax.find(".rd-parallax-inner").css("position", "absolute");
          }
        }
      });
    }

    $("a[href='#']").on("click", function (e) {
      setTimeout(function () {
        $(window).trigger("resize");
      }, 300);
    });
  }
});

