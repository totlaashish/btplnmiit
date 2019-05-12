

+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="ms-alert"]'
  var msAlert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  msAlert.VERSION = '3.2.0'

  msAlert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.hasClass('ms-alert') ? $this : $this.parent()
    }

    $parent.trigger(e = $.Event('close.ms.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      // detach from parent, fire event then clean up data
      $parent.detach().trigger('closed.ms.alert').remove()
    }

    $.support.transition && $parent.hasClass('ms-fade') ?
      $parent
        .one('bsTransitionEnd', removeElement)
        .emulateTransitionEnd(150) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('ms.alert')

      if (!data) $this.data('ms.alert', (data = new msAlert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.spbalert

  $.fn.spbalert             = Plugin
  $.fn.spbalert.Constructor = msAlert

  // ALERT NO CONFLICT
  // =================

  $.fn.spbalert.noConflict = function () {
    $.fn.spbalert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.ms.alert.data-api', dismiss, msAlert.prototype.close)

}(jQuery);




+function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================

  var msCarousel = function (element, options) {
    this.$element    = $(element).on('keydown.ms.carousel', $.proxy(this.keydown, this))
    this.$indicators = this.$element.find('.ms-carousel-indicators')
    this.options     = options
    this.paused      =
    this.sliding     = 
    this.interval    =
    this.$active     =
    this.$items      = null

    this.options.pause == 'hover' && this.$element
      .on('mouseenter.ms.carousel', $.proxy(this.pause, this))
      .on('mouseleave.ms.carousel', $.proxy(this.cycle, this))
  }

  msCarousel.VERSION  = '3.2.0'

  msCarousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true
  }

  msCarousel.prototype.keydown = function (e) {
    switch (e.which) {
      case 37: this.prev(); break
      case 39: this.next(); break
      default: return
    }

    e.preventDefault()
  }

  msCarousel.prototype.cycle = function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  msCarousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.ms-item')
    return this.$items.index(item || this.$active)
  }

  msCarousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.ms-item.active'))

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid.ms.carousel', function () { that.to(pos) }) // yes, "slid"
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]))
  }

  msCarousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  msCarousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  msCarousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  msCarousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.ms-item.active')
    var $next     = next || $active[type]()
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var fallback  = type == 'next' ? 'first' : 'last'
    var that      = this

    if (!$next.length) {
      if (!this.options.wrap) return
      $next = this.$element.find('.ms-item')[fallback]()
    }

    if ($next.hasClass('active')) return (this.sliding = false)

    var relatedTarget = $next[0]
    var slideEvent = $.Event('slide.ms.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    this.$element.trigger(slideEvent)
    if (slideEvent.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      $nextIndicator && $nextIndicator.addClass('active')
    }

    var slidEvent = $.Event('slid.ms.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
    if ($.support.transition && this.$element.hasClass('ms-slide')) {
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one('bsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger(slidEvent)
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('ms.carousel')
      var options = $.extend({}, msCarousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('ms.carousel', (data = new msCarousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  var old = $.fn.mscarousel

  $.fn.mscarousel             = Plugin
  $.fn.mscarousel.Constructor = msCarousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.mscarousel.noConflict = function () {
    $.fn.mscarousel = old
    return this
  }

  //SP Page Builder
  $(document).ready(function(){
    $('.ms-carousel').each(function (index) {
      var items = $(this).find('.ms-item');
      var id = 'ms-carousel' + (index+1);
      var controller_items = '';

      //Set ID
      $(this).attr('id', id );

      for (var i = 0; i < items.length; i++) {
        if(i==0) {
          controller_items += '<li data-ms-target="#' + id + '" class="active" data-ms-slide-to="0"></li>';
        } else {
          controller_items += '\n<li data-ms-target="#' + id + '" data-ms-slide-to="' + i + '"></li>';
        }
      };

      $(this).find('>.ms-carousel-indicators').html(controller_items);

      $(this).find('.ms-carousel-control').attr('href', '#' + id);

      $(this).find('.ms-item').first().addClass('active');
    });
  })

  // CAROUSEL DATA-API
  // =================

  $(document).on('click.ms.carousel.data-api', '[data-slide], [data-ms-slide-to]', function (e) {
    var href
    var $this   = $(this)
    var $target = $($this.attr('data-ms-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
    if (!$target.hasClass('ms-carousel')) return
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-ms-slide-to')
    if (slideIndex) options.interval = false

    Plugin.call($target, options)

    if (slideIndex) {
      $target.data('ms.carousel').to(slideIndex)
    }

    e.preventDefault()
  })

  $(window).on('load', function () {
    $('[data-ms-ride="ms-carousel"]').each(function () {
      var $carousel = $(this)
      Plugin.call($carousel, $carousel.data())
    })
  })

}(jQuery);



+function ($) {
  'use strict';

  $(document).on('click', '.ms-panel-heading', function(event){
    event.preventDefault();
    var $this = $(this);
    var $items = $this.closest('.ms-panel-group').find('>div');
    var $handlers = $items.find('.ms-panel-heading');
    var $panels = $items.find('.ms-panel-collapse');

    if( $(this).hasClass('active') )
    {
      $(this).removeClass('active');
      $panels.slideUp();
    }
    else
    {
      $handlers.removeClass('active');
      $panels.slideUp();
      $(this).addClass('active').next().slideDown();
    }
  });
  $(document).on('click', '.ms-panel-heading-sub', function (event) {
      event.preventDefault();
      var $this = $(this);
      var $items = $this.closest('.ms-panel-group-sub').find('>div');
      var $handlers = $items.find('.ms-panel-heading-sub');
      var $panels = $items.find('.ms-panel-collapse-sub');

      if ($(this).hasClass('active')) {
          $(this).removeClass('active');
          $panels.slideUp();
      }
      else {
          $handlers.removeClass('active');
          $panels.slideUp();
          $(this).addClass('active').next().slideDown();
      }
  });
}(jQuery);




+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var msTab = function (element) {
    this.element = $(element)
  }

  msTab.VERSION = '3.2.0'

  msTab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var previous = $ul.find('.active:last a')[0]
    var e        = $.Event('show.ms.tab', {
      relatedTarget: previous
    })

    $this.trigger(e)

    if (e.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.closest('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $this.trigger({
        type: 'shown.ms.tab',
        relatedTarget: previous
      })
    })
  }

  msTab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && $active.hasClass('ms-fade')

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
        .removeClass('active')

      element.addClass('active')

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('ms-fade')
      }

      if (element.parent('.dropdown-menu')) {
        element.closest('li.dropdown').addClass('active')
      }

      callback && callback()
    }

    transition ?
      $active
        .one('bsTransitionEnd', next)
        .emulateTransitionEnd(150) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('ms.tab')

      if (!data) $this.data('ms.tab', (data = new msTab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.mstab

  $.fn.mstab             = Plugin
  $.fn.mstab.Constructor = msTab


  // TAB NO CONFLICT
  // ===============

  $.fn.mstab.noConflict = function () {
    $.fn.mstab = old
    return this
  }

  //Dynamic IDS
  $(document).ready(function () {
    $('.ms-tab').each(function (index){
      var id = 'ms-tab' + (index+1);

      $(this).find('>.ms-nav').children().each(function (index) {
        $(this).find('>a').attr('href', '#' + id + '-' + (index+1) )
      });

      $(this).find('>.ms-tab-content').children().each(function (index) {
        $(this).attr('id', id + '-' + (index+1) )
      });
    });
  });

  // TAB DATA-API
  // ============

  $(document).on('click.ms.tab.data-api', '[data-toggle="ms-tab"], [data-toggle="ms-pill"]', function (e) {
    e.preventDefault()
    Plugin.call($(this), 'show')
  })

}(jQuery);



+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var msTooltip = function (element, options) {
    this.type       =
    this.options    =
    this.enabled    =
    this.timeout    =
    this.hoverState =
    this.$element   = null

    this.init('mstooltip', element, options)
  }

  msTooltip.VERSION  = '3.2.0'

  msTooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="ms-tooltip" role="tooltip"><div class="ms-tooltip-arrow"></div><div class="ms-tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  }

  msTooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $(this.options.viewport.selector || this.options.viewport)

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  msTooltip.prototype.getDefaults = function () {
    return msTooltip.DEFAULTS
  }

  msTooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  msTooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  msTooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('ms.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('ms.' + this.type, self)
    }

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  msTooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('ms.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('ms.' + this.type, self)
    }

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  msTooltip.prototype.show = function () {
    var e = $.Event('show.ms.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      var inDom = $.contains(document.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this

      var $tip = this.tip()

      var tipId = this.getUID(this.type)

      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)

      if (this.options.animation) $tip.addClass('ms-fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('ms.' + this.type, this)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var $parent      = this.$element.parent()
        var parentDim    = this.getPosition($parent)

        placement = placement == 'bottom' && pos.top   + pos.height       + actualHeight - parentDim.scroll > parentDim.height ? 'top'    :
                    placement == 'top'    && pos.top   - parentDim.scroll - actualHeight < 0                                   ? 'bottom' :
                    placement == 'right'  && pos.right + actualWidth      > parentDim.width                                    ? 'left'   :
                    placement == 'left'   && pos.left  - actualWidth      < parentDim.left                                     ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        that.$element.trigger('shown.ms.' + that.type)
        that.hoverState = null
      }

      $.support.transition && this.$tip.hasClass('ms-') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(150) :
        complete()
    }
  }

  msTooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  = offset.top  + marginTop
    offset.left = offset.left + marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var arrowDelta          = delta.left ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowPosition       = delta.left ? 'left'        : 'top'
    var arrowOffsetPosition = delta.left ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], arrowPosition)
  }

  msTooltip.prototype.replaceArrow = function (delta, dimension, position) {
    this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '')
  }

  msTooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.ms-tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('ms-fade in top bottom left right')
  }

  msTooltip.prototype.hide = function () {
    var that = this
    var $tip = this.tip()
    var e    = $.Event('hide.ms.' + this.type)

    this.$element.removeAttr('aria-describedby')

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      that.$element.trigger('hidden.ms.' + that.type)
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && this.$tip.hasClass('ms-fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(150) :
      complete()

    this.hoverState = null

    return this
  }

  msTooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof ($e.attr('data-original-title')) != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  msTooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  msTooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element
    var el     = $element[0]
    var isBody = el.tagName == 'BODY'
    return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : null, {
      scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop(),
      width:  isBody ? $(window).width()  : $element.outerWidth(),
      height: isBody ? $(window).height() : $element.outerHeight()
    }, isBody ? { top: 0, left: 0 } : $element.offset())
  }

  msTooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   }

  }

  msTooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.width) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  msTooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  msTooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  msTooltip.prototype.tip = function () {
    return (this.$tip = this.$tip || $(this.options.template))
  }

  msTooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.ms-tooltip-arrow'))
  }

  msTooltip.prototype.validate = function () {
    if (!this.$element[0].parentNode) {
      this.hide()
      this.$element = null
      this.options  = null
    }
  }

  msTooltip.prototype.enable = function () {
    this.enabled = true
  }

  msTooltip.prototype.disable = function () {
    this.enabled = false
  }

  msTooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  msTooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('ms.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('ms.' + this.type, self)
      }
    }

    self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
  }

  msTooltip.prototype.destroy = function () {
    clearTimeout(this.timeout)
    this.hide().$element.off('.' + this.type).removeData('ms.' + this.type)
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('ms.tooltip')
      var options = typeof option == 'object' && option

      if (!data && option == 'destroy') return
      if (!data) $this.data('ms.tooltip', (data = new msTooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.mstooltip

  $.fn.mstooltip             = Plugin
  $.fn.mstooltip.Constructor = msTooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.mstooltip.noConflict = function () {
    $.fn.mstooltip = old
    return this
  }

}(jQuery);





+function ($) {
  'use strict';

 
  var msPopover = function (element, options) {
    this.init('mspopover', element, options)
  }

  if (!$.fn.mstooltip) throw new Error('Popover requires tooltip.js')

  msPopover.VERSION  = '3.2.0'

  msPopover.DEFAULTS = $.extend({}, $.fn.mstooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="ms-popover" role="tooltip"><div class="arrow"></div><h3 class="ms-popover-title"></h3><div class="ms-popover-content"></div></div>'
  })




  msPopover.prototype = $.extend({}, $.fn.mstooltip.Constructor.prototype)

  msPopover.prototype.constructor = msPopover

  msPopover.prototype.getDefaults = function () {
    return msPopover.DEFAULTS
  }

  msPopover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.ms-popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.ms-popover-content').empty()[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('ms-fade top bottom left right in')


    if (!$tip.find('.ms-popover-title').html()) $tip.find('.ms-popover-title').hide()
  }

  msPopover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  msPopover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  msPopover.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }

  msPopover.prototype.tip = function () {
    if (!this.$tip) this.$tip = $(this.options.template)
    return this.$tip
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('ms.popover')
      var options = typeof option == 'object' && option

      if (!data && option == 'destroy') return
      if (!data) $this.data('ms.popover', (data = new msPopover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.mspopover

  $.fn.mspopover             = Plugin
  $.fn.mspopover.Constructor = msPopover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.mspopover.noConflict = function () {
    $.fn.mspopover = old
    return this
  }

}(jQuery);


+function ($) {
  'use strict';

  
  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }


  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);


if (typeof jQuery != 'undefined' && typeof MooTools != 'undefined' ) {
  (function($) {
   $(document).ready(function(){
    $('.ms-carousel').each(function(index, element) {
      $(this)[index].slide = null;
    });
  });
 })(jQuery);
}



;(function ($, window, document, navigator) {
    "use strict";

    /**
     * Vide settings
     */
    var pluginName = "vide",
        defaults = {
            volume: 1,
            playbackRate: 1,
            muted: true,
            loop: true,
            autoplay: true,
            position: "50% 50%"
        };

    /**
     * Is iOs or Android?
     */
    var iOS = /iPad|iPhone|iPod/i.test(navigator.userAgent),
        android = /Android/i.test(navigator.userAgent);

    /**
     * Special plugin object for instances.
     * @type {Object}
     */
    $[pluginName] = {
        lookup: []
    };

    var parseOptions = function (str) {
        var obj = {}, clearedStr, arr;

        // remove spaces before and after delimiters
        clearedStr = str.replace(/\s*:\s*/g, ":").replace(/\s*,\s*/g, ",");

        // parse string
        arr = clearedStr.split(",");
        var i, len, val;
        for (i = 0, len = arr.length; i < len; i++) {
            arr[i] = arr[i].split(":");
            val = arr[i][1];

            // if val is an empty string, make it undefined
            if (!val) {
                val = undefined;
            }

            // convert string value if it is like a boolean
            if (typeof val === "string" || val instanceof String) {
                val = val === "true" || (val === "false" ? false : val);
            }

            // convert string value if it is like a number
            if (typeof val === "string" || val instanceof String) {
                val = !isNaN(val) ? +val : val;
            }

            obj[arr[i][0]] = val;
        }

        return obj;
    };

  
    var parsePosition = function (str) {
        // convert anything to the string
        str = "" + str;

        // default value is a center
        var args = str.split(/\s+/),
            x = "50%", y = "50%";

        for (var i = 0, len = args.length, arg; i < len; i++) {
            arg = args[i];

            // convert values
            if (arg === "left") {
                x = "0%";
            } else if (arg === "right") {
                x = "100%";
            } else if (arg === "top") {
                y = "0%";
            } else if (arg === "bottom") {
                y = "100%";
            } else if (arg === "center"){
                if (i === 0) {
                    x = "50%";
                } else {
                    y = "50%";
                }
            } else {
                if (i === 0) {
                    x = arg;
                } else {
                    y = arg;
                }
            }
        }

        return { x: x, y: y };
    };


    function Vide(element, path, options) {
        this.element = $(element);
        this._defaults = defaults;
        this._name = pluginName;

        // remove extension
        path = path.replace(/\.\w*$/, "");

        this.settings = $.extend({}, defaults, options);
        this.path = path;

        this.init();
    }

    /**
     * Initialization
     */
    Vide.prototype.init = function () {
        var that = this;

        this.wrapper = $("<div>");

        // Set video wrapper styles
        var position = parsePosition(this.settings.position);
        this.wrapper.css({
            "position": "absolute",
            "z-index": -1,
            "top": 0,
            "left": 0,
            "bottom": 0,
            "right": 0,
            "overflow": "hidden",
            "-webkit-background-size": "cover",
            "-moz-background-size": "cover",
            "-o-background-size": "cover",
            "background-size": "cover",
            "background-repeat": "no-repeat",
            "background-position": position.x + " " + position.y
        });

        // Set video poster
        if ($(this.element).data('vide-image')) {
          this.wrapper.css("background-image", "url(" + $(this.element).data('vide-image') + ")");
        }

        // if parent element has a static position, make it relative
        if (this.element.css("position") === "static") {
            this.element.css("position", "relative");
        }

        this.element.prepend(this.wrapper);

        if (!iOS && !android) {

            var video_src = '';

            if($(this.element).data('vide-mp4')) {
              video_src += "<source src='" + $(this.element).data('vide-mp4') + "' type='video/mp4'>";
            }

            if($(this.element).data('vide-ogv')) {
              video_src += "<source src='" + $(this.element).data('vide-ogv') + "' type='video/ogg'>";
            }

            this.video = $("<video>" + video_src + "</video>");

            // Disable visibility, while loading
            this.video.css("visibility", "hidden");

            // Set video properties
            this.video.prop({
                autoplay: this.settings.autoplay,
                loop: this.settings.loop,
                volume: this.settings.volume,
                muted: this.settings.muted,
                playbackRate: this.settings.playbackRate
            });

            // Append video
            this.wrapper.append(this.video);

            // Video alignment
            this.video.css({
                "margin": "auto",
                "position": "absolute",
                "z-index": -1,
                "top": position.y,
                "left": position.x,
                "-webkit-transform": "translate(-" + position.x + ", -" + position.y + ")",
                "-ms-transform": "translate(-" + position.x + ", -" + position.y + ")",
                "transform": "translate(-" + position.x + ", -" + position.y + ")"
            });

            // resize video, when it's loaded
            this.video.bind("loadedmetadata." + pluginName, function () {
                that.video.css("visibility", "visible");
                that.resize();
            });

            // resize event is available only for 'window',
            // use another code solutions to detect DOM elements resizing
            $(this.element).bind("resize." + pluginName, function () {
                that.resize();
            });
        }
    };


    Vide.prototype.getVideoObject = function () {
        return this.video ? this.video[0] : null;
    };

    
    Vide.prototype.resize = function () {
        if (!this.video) {
            return;
        }

        // get native video size
        var videoHeight = this.video[0].videoHeight,
            videoWidth = this.video[0].videoWidth;

        // get wrapper size
        var wrapperHeight = this.wrapper.height(),
            wrapperWidth = this.wrapper.width();

        if (wrapperWidth / videoWidth > wrapperHeight / videoHeight) {
            this.video.css({
                "width": wrapperWidth + 2, // +2 pixels to prevent empty space after transformation
                "height": "auto"
            });
        } else {
            this.video.css({
                "width": "auto",
                "height": wrapperHeight + 2 // +2 pixels to prevent empty space after transformation
            });
        }
    };

    Vide.prototype.destroy = function () {
        this.element.unbind(pluginName);
        if (this.video) {
            this.video.unbind(pluginName);
        }

        delete $[pluginName].lookup[this.index];
        this.element.removeData(pluginName);
        this.wrapper.remove();
    };


    $.fn[pluginName] = function (path, options) {
        var instance;
        this.each(function () {
            instance = $.data(this, pluginName);
            if (instance) {
                // destroy plugin instance if exists
                instance.destroy();
            }
            // create plugin instance
            instance = new Vide(this, path, options);
            instance.index = $[pluginName].lookup.push(instance) - 1;
            $.data(this, pluginName, instance);
        });

        return this;
    };

    $(document).ready(function () {
        // window resize event listener
        $(window).bind("resize." + pluginName, function () {
            for (var len = $[pluginName].lookup.length, instance, i = 0; i < len; i++) {
                instance = $[pluginName].lookup[i];
                if (instance) {
                    instance.resize();
                }
            }
        });


        $(document).find("[data-" + pluginName + "-bg]").each(function (i, element) {
            var $element = $(element),
                options = $element.data(pluginName + "-options"),
                path = '';

            if (!options) {
                options = {};
            } else {
                options = parseOptions(options);
            }

            $element[pluginName](path, options);
        });
    });
})(window.jQuery, window, document, navigator);


;(function() {
    var a, b, c, d = function(a, b) {
            return function() {
                return a.apply(b, arguments)
            }
        },
        e = [].indexOf || function(a) {
            for (var b = 0, c = this.length; c > b; b++)
                if (b in this && this[b] === a) return b;
            return -1
        };
    b = function() {
        function a() {}
        return a.prototype.extend = function(a, b) {
            var c, d;
            for (c in b) d = b[c], null == a[c] && (a[c] = d);
            return a
        }, a.prototype.isMobile = function(a) {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(a)
        }, a
    }(), c = this.WeakMap || this.MozWeakMap || (c = function() {
        function a() {
            this.keys = [], this.values = []
        }
        return a.prototype.get = function(a) {
            var b, c, d, e, f;
            for (f = this.keys, b = d = 0, e = f.length; e > d; b = ++d)
                if (c = f[b], c === a) return this.values[b]
        }, a.prototype.set = function(a, b) {
            var c, d, e, f, g;
            for (g = this.keys, c = e = 0, f = g.length; f > e; c = ++e)
                if (d = g[c], d === a) return void(this.values[c] = b);
            return this.keys.push(a), this.values.push(b)
        }, a
    }()), a = this.MutationObserver || this.WebkitMutationObserver || this.MozMutationObserver || (a = function() {
        function a() {
            console.warn("MutationObserver is not supported by your browser."), console.warn("WOW.js cannot detect dom mutations, please call .sync() after loading new content.")
        }
        return a.notSupported = !0, a.prototype.observe = function() {}, a
    }()), this.msWOW = function() {
        function f(a) {
            null == a && (a = {}), this.scrollCallback = d(this.scrollCallback, this), this.scrollHandler = d(this.scrollHandler, this), this.start = d(this.start, this), this.scrolled = !0, this.config = this.util().extend(a, this.defaults), this.animationNameCache = new c
        }
        return f.prototype.defaults = {
            boxClass: "ms-wow",
            animateClass: "ms-animated",
            offset: 0,
            mobile: !0,
            live: !0
        }, f.prototype.init = function() {
            var a;
            return this.element = window.document.documentElement, "interactive" === (a = document.readyState) || "complete" === a ? this.start() : document.addEventListener("DOMContentLoaded", this.start), this.finished = []
        }, f.prototype.start = function() {
            var b, c, d, e;
            if (this.stopped = !1, this.boxes = function() {
                var a, c, d, e;
                for (d = this.element.querySelectorAll("." + this.config.boxClass), e = [], a = 0, c = d.length; c > a; a++) b = d[a], e.push(b);
                return e
            }.call(this), this.all = function() {
                var a, c, d, e;
                for (d = this.boxes, e = [], a = 0, c = d.length; c > a; a++) b = d[a], e.push(b);
                return e
            }.call(this), this.boxes.length)
                if (this.disabled()) this.resetStyle();
                else {
                    for (e = this.boxes, c = 0, d = e.length; d > c; c++) b = e[c], this.applyStyle(b, !0);
                    window.addEventListener("scroll", this.scrollHandler, !1), window.addEventListener("resize", this.scrollHandler, !1), this.interval = setInterval(this.scrollCallback, 50)
                }
            return this.config.live ? new a(function(a) {
                return function(b) {
                    var c, d, e, f, g;
                    for (g = [], e = 0, f = b.length; f > e; e++) d = b[e], g.push(function() {
                        var a, b, e, f;
                        for (e = d.addedNodes || [], f = [], a = 0, b = e.length; b > a; a++) c = e[a], f.push(this.doSync(c));
                        return f
                    }.call(a));
                    return g
                }
            }(this)).observe(document.body, {
                childList: !0,
                subtree: !0
            }) : void 0
        }, f.prototype.stop = function() {
            return this.stopped = !0, window.removeEventListener("scroll", this.scrollHandler, !1), window.removeEventListener("resize", this.scrollHandler, !1), null != this.interval ? clearInterval(this.interval) : void 0
        }, f.prototype.sync = function() {
            return a.notSupported ? this.doSync(this.element) : void 0
        }, f.prototype.doSync = function(a) {
            var b, c, d, f, g;
            if (!this.stopped) {
                if (null == a && (a = this.element), 1 !== a.nodeType) return;
                for (a = a.parentNode || a, f = a.querySelectorAll("." + this.config.boxClass), g = [], c = 0, d = f.length; d > c; c++) b = f[c], e.call(this.all, b) < 0 ? (this.applyStyle(b, !0), this.boxes.push(b), this.all.push(b), g.push(this.scrolled = !0)) : g.push(void 0);
                return g
            }
        }, f.prototype.show = function(a) {
            return this.applyStyle(a), a.className = "" + a.className + " " + this.config.animateClass
        }, f.prototype.applyStyle = function(a, b) {
            var c, d, e;
            return d = a.getAttribute("data-ms-wow-duration"), c = a.getAttribute("data-ms-wow-delay"), e = a.getAttribute("data-ms-wow-iteration"), this.animate(function(f) {
                return function() {
                    return f.customStyle(a, b, d, c, e)
                }
            }(this))
        }, f.prototype.animate = function() {
            return "requestAnimationFrame" in window ? function(a) {
                return window.requestAnimationFrame(a)
            } : function(a) {
                return a()
            }
        }(), f.prototype.resetStyle = function() {
            var a, b, c, d, e;
            for (d = this.boxes, e = [], b = 0, c = d.length; c > b; b++) a = d[b], e.push(a.setAttribute("style", "visibility: visible;"));
            return e
        }, f.prototype.customStyle = function(a, b, c, d, e) {
            return b && this.cacheAnimationName(a), a.style.visibility = b ? "hidden" : "visible", c && this.vendorSet(a.style, {
                animationDuration: c
            }), d && this.vendorSet(a.style, {
                animationDelay: d
            }), e && this.vendorSet(a.style, {
                animationIterationCount: e
            }), this.vendorSet(a.style, {
                animationName: b ? "none" : this.cachedAnimationName(a)
            }), a
        }, f.prototype.vendors = ["moz", "webkit"], f.prototype.vendorSet = function(a, b) {
            var c, d, e, f;
            f = [];
            for (c in b) d = b[c], a["" + c] = d, f.push(function() {
                var b, f, g, h;
                for (g = this.vendors, h = [], b = 0, f = g.length; f > b; b++) e = g[b], h.push(a["" + e + c.charAt(0).toUpperCase() + c.substr(1)] = d);
                return h
            }.call(this));
            return f
        }, f.prototype.vendorCSS = function(a, b) {
            var c, d, e, f, g, h;
            for (d = window.getComputedStyle(a), c = d.getPropertyCSSValue(b), h = this.vendors, f = 0, g = h.length; g > f; f++) e = h[f], c = c || d.getPropertyCSSValue("-" + e + "-" + b);
            return c
        }, f.prototype.animationName = function(a) {
            var b;
            try {
                b = this.vendorCSS(a, "animation-name").cssText
            } catch (c) {
                b = window.getComputedStyle(a).getPropertyValue("animation-name")
            }
            return "none" === b ? "" : b
        }, f.prototype.cacheAnimationName = function(a) {
            return this.animationNameCache.set(a, this.animationName(a))
        }, f.prototype.cachedAnimationName = function(a) {
            return this.animationNameCache.get(a)
        }, f.prototype.scrollHandler = function() {
            return this.scrolled = !0
        }, f.prototype.scrollCallback = function() {
            var a;
            return !this.scrolled || (this.scrolled = !1, this.boxes = function() {
                var b, c, d, e;
                for (d = this.boxes, e = [], b = 0, c = d.length; c > b; b++) a = d[b], a && (this.isVisible(a) ? this.show(a) : e.push(a));
                return e
            }.call(this), this.boxes.length || this.config.live) ? void 0 : this.stop()
        }, f.prototype.offsetTop = function(a) {
            for (var b; void 0 === a.offsetTop;) a = a.parentNode;
            for (b = a.offsetTop; a = a.offsetParent;) b += a.offsetTop;
            return b
        }, f.prototype.isVisible = function(a) {
            var b, c, d, e, f;
            return c = a.getAttribute("data-ms-wow-offset") || this.config.offset, f = window.pageYOffset, e = f + Math.min(this.element.clientHeight, innerHeight) - c, d = this.offsetTop(a), b = d + a.clientHeight, e >= d && b >= f
        }, f.prototype.util = function() {
            return null != this._util ? this._util : this._util = new b
        }, f.prototype.disabled = function() {
            return !this.config.mobile && this.util().isMobile(navigator.userAgent)
        }, f
    }()
}).call(this);

jQuery(function($){
   new msWOW().init();
});


(function ($) {
  var inviewObjects = {}, viewportSize, viewportOffset,
      d = document, w = window, documentElement = d.documentElement, expando = $.expando, timer;

  $.event.special.inview = {
    add: function(data) {
      inviewObjects[data.guid + "-" + this[expando]] = { data: data, $element: $(this) };

     
      if (!timer && !$.isEmptyObject(inviewObjects)) {
         timer = setInterval(checkInView, 250);
      }
    },

    remove: function(data) {
      try { delete inviewObjects[data.guid + "-" + this[expando]]; } catch(e) {}

      
      if ($.isEmptyObject(inviewObjects)) {
         clearInterval(timer);
         timer = null;
      }
    }
  };

  function getViewportSize() {
    var mode, domObject, size = { height: w.innerHeight, width: w.innerWidth };

   
    if (!size.height) {
      mode = d.compatMode;
      if (mode || !$.support.boxModel) { // IE
        domObject = mode === 'CSS1Compat' ?
          documentElement : 
          d.body; 
        size = {
          height: domObject.clientHeight,
          width:  domObject.clientWidth
        };
      }
    }

    return size;
  }

  function getViewportOffset() {
    return {
      top:  w.pageYOffset || documentElement.scrollTop   || d.body.scrollTop,
      left: w.pageXOffset || documentElement.scrollLeft  || d.body.scrollLeft
    };
  }

  function checkInView() {
    var $elements = $(), elementsLength, i = 0;

    $.each(inviewObjects, function(i, inviewObject) {
      var selector  = inviewObject.data.selector,
          $element  = inviewObject.$element;
      $elements = $elements.add(selector ? $element.find(selector) : $element);
    });

    elementsLength = $elements.length;
    if (elementsLength) {
      viewportSize   = viewportSize   || getViewportSize();
      viewportOffset = viewportOffset || getViewportOffset();

      for (; i<elementsLength; i++) {
      
        if (!$.contains(documentElement, $elements[i])) {
          continue;
        }

        var $element      = $($elements[i]),
            elementSize   = { height: $element.height(), width: $element.width() },
            elementOffset = $element.offset(),
            inView        = $element.data('inview'),
            visiblePartX,
            visiblePartY,
            visiblePartsMerged;


        if (!viewportOffset || !viewportSize) {
          return;
        }

        if (elementOffset.top + elementSize.height > viewportOffset.top &&
            elementOffset.top < viewportOffset.top + viewportSize.height &&
            elementOffset.left + elementSize.width > viewportOffset.left &&
            elementOffset.left < viewportOffset.left + viewportSize.width) {
          visiblePartX = (viewportOffset.left > elementOffset.left ?
            'right' : (viewportOffset.left + viewportSize.width) < (elementOffset.left + elementSize.width) ?
            'left' : 'both');
          visiblePartY = (viewportOffset.top > elementOffset.top ?
            'bottom' : (viewportOffset.top + viewportSize.height) < (elementOffset.top + elementSize.height) ?
            'top' : 'both');
          visiblePartsMerged = visiblePartX + "-" + visiblePartY;
          if (!inView || inView !== visiblePartsMerged) {
            $element.data('inview', visiblePartsMerged).trigger('inview', [true, visiblePartX, visiblePartY]);
          }
        } else if (inView) {
          $element.data('inview', false).trigger('inview', [false]);
        }
      }
    }
  }

  $(w).bind("scroll resize scrollstop", function() {
    viewportSize = viewportOffset = null;
  });

  // IE < 9 scrolls to focused elements without firing the "scroll" event
  if (!documentElement.addEventListener && documentElement.attachEvent) {
    documentElement.attachEvent("onfocusin", function() {
      viewportOffset = null;
    });
  }

  //Animated Progress
  $(document).on('inview', '.ms-progress', function(event, visible, visiblePartX, visiblePartY) {
    var $bar = $(this).find('.ms-progress-bar');
    if (visible) {
      $bar.css('width', $bar.data('width'));
      $(this).unbind('inview');
    }
  });

  //Animated Number
  $.fn.msanimateNumbers = function(stop, commas, duration, ease) {
      return this.each(function() {
          var $this = $(this);
          var start = parseInt($this.text().replace(/,/g, ""));
    commas = (commas === undefined) ? true : commas;
          $({value: start}).animate({value: stop}, {
            duration: duration == undefined ? 1000 : duration,
            easing: ease == undefined ? "swing" : ease,
            step: function() {
              $this.text(Math.floor(this.value));
        if (commas) { $this.text($this.text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")); }
            },
            complete: function() {
               if (parseInt($this.text()) !== stop) {
                   $this.text(stop);
           if (commas) { $this.text($this.text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")); }
               }
            }
          });
      });
  };

  $(document).on('inview', '.ms-animated-number', function(event, visible, visiblePartX, visiblePartY) {
    var $this = $(this);
    if (visible) {
      $this.msanimateNumbers($this.data('digit'), false, $this.data('duration'));
      $this.unbind('inview');
    }
  });

  // Pie Chart
  $(document).on('inview', '.ms-pie-chart', function(event, visible, visiblePartX, visiblePartY) {
      var $this = $(this);

      if (visible) {

        $this.easyPieChart({
          barColor: $this.data('barcolor'),
          trackColor: $this.data('trackcolor'),
          scaleColor: false,
          lineWidth: $this.data('width'),
          size: $this.data('size'),
          onStep: function(from, to, percent) {
            $this.find('.ms-chart-percent > span').text(Math.round(percent) + '%');
          }
        });

        $this.unbind('inview');
      }
    });

})(jQuery);

//Ajax Contact Form
jQuery(function($) {
    $(document).on('submit', '.ms-ajaxt-contact-form', function(event) {

        event.preventDefault();

        var $self   = $(this);
        var value   = $(this).serializeArray();
        var request = {
            'option' : 'com_sppagebuilder',
            'task' : 'ajax',
            'addon' : 'ajax_contact',
            'data'   : value
        };

        $.ajax({
            type   : 'POST',
            data   : request,
            beforeSend: function(){
                $self.find('.fa').addClass('fa-spinner fa-spin');
            },
            success: function (response) {
                $self.find('.fa-spin').removeClass('fa-spinner fa-spin');
                $self.next('.ms-ajax-contact-status').html($.parseJSON(response).data).fadeIn().delay(2000).fadeOut(500);;
            }
        });

        return false;
    });
});
