/*



     Creative Tim Modifications

     Lines: 238, 239 was changed from top: 5px to top: 50% and we added margin-top: -13px. In this way the close button will be aligned vertically
     Line:222 - modified when the icon is set, we add the class "alert-with-icon", so there will be enough space for the icon.




*/


/*
 * Project: Bootstrap Notify = v3.1.5
 * Description: Turns standard Bootstrap alerts into "Growl-like" notifications.
 * Author: Mouse0270 aka Robert McIntosh
 * License: MIT License
 * Website: https://github.com/mouse0270/bootstrap-growl
 */

/* global define:false, require: false, jQuery:false */

(function(factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node/CommonJS
    factory(require('jquery'));
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function($) {
  // Create the defaults once
  var defaults = {
    element: 'body',
    position: null,
    type: "info",
    allow_dismiss: true,
    allow_duplicates: true,
    newest_on_top: false,
    showProgressbar: false,
    placement: {
      from: "top",
      align: "right"
    },
    offset: 20,
    spacing: 10,
    z_index: 1060,
    delay: 5000,
    timer: 1000,
    url_target: '_blank',
    mouse_over: null,
    animate: {
      enter: 'animated fadeInDown',
      exit: 'animated fadeOutUp'
    },
    onShow: null,
    onShown: null,
    onClose: null,
    onClosed: null,
    onClick: null,
    icon_type: 'class',
    template: '<div data-notify="container" class="col-xs-11 col-sm-4 alert alert-{0}" role="alert"><button type="button" aria-hidden="true" class="close" data-notify="dismiss"><i class="tim-icons icon-simple-remove"></i></button><span data-notify="icon"></span> <span data-notify="title">{1}</span> <span data-notify="message">{2}</span><div class="progress" data-notify="progressbar"><div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div></div><a href="{3}" target="{4}" data-notify="url"></a></div>'
  };

  String.format = function() {
    var args = arguments;
    var str = arguments[0];
    return str.replace(/(\{\{\d\}\}|\{\d\})/g, function(str) {
      if (str.substring(0, 2) === "{{") return str;
      var num = parseInt(str.match(/\d/)[0]);
      return args[num + 1];
    });
  };

  function isDuplicateNotification(notification) {
    var isDupe = false;

    $('[data-notify="container"]').each(function(i, el) {
      var $el = $(el);
      var title = $el.find('[data-notify="title"]').html().trim();
      var message = $el.find('[data-notify="message"]').html().trim();

      // The input string might be different than the actual parsed HTML string!
      // (<br> vs <br /> for example)
      // So we have to force-parse this as HTML here!
      var isSameTitle = title === $("<div>" + notification.settings.content.title + "</div>").html().trim();
      var isSameMsg = message === $("<div>" + notification.settings.content.message + "</div>").html().trim();
      var isSameType = $el.hasClass('alert-' + notification.settings.type);

      if (isSameTitle && isSameMsg && isSameType) {
        //we found the dupe. Set the var and stop checking.
        isDupe = true;
      }
      return !isDupe;
    });

    return isDupe;
  }

  function Notify(element, content, options) {
    // Setup Content of Notify
    var contentObj = {
      content: {
        message: typeof content === 'object' ? content.message : content,
        title: content.title ? content.title : '',
        icon: content.icon ? content.icon : '',
        url: content.url ? content.url : '#',
        target: content.target ? content.target : '-'
      }
    };

    options = $.extend(true, {}, contentObj, options);
    this.settings = $.extend(true, {}, defaults, options);
    this._defaults = defaults;
    if (this.settings.content.target === "-") {
      this.settings.content.target = this.settings.url_target;
    }
    this.animations = {
      start: 'webkitAnimationStart oanimationstart MSAnimationStart animationstart',
      end: 'webkitAnimationEnd oanimationend MSAnimationEnd animationend'
    };

    if (typeof this.settings.offset === 'number') {
      this.settings.offset = {
        x: this.settings.offset,
        y: this.settings.offset
      };
    }

    //if duplicate messages are not allowed, then only continue if this new message is not a duplicate of one that it already showing
    if (this.settings.allow_duplicates || (!this.settings.allow_duplicates && !isDuplicateNotification(this))) {
      this.init();
    }
  }

  $.extend(Notify.prototype, {
    init: function() {
      var self = this;

      this.buildNotify();
      if (this.settings.content.icon) {
        this.setIcon();
      }
      if (this.settings.content.url != "#") {
        this.styleURL();
      }
      this.styleDismiss();
      this.placement();
      this.bind();

      this.notify = {
        $ele: this.$ele,
        update: function(command, update) {
          var commands = {};
          if (typeof command === "string") {
            commands[command] = update;
          } else {
            commands = command;
          }
          for (var cmd in commands) {
            switch (cmd) {
              case "type":
                this.$ele.removeClass('alert-' + self.settings.type);
                this.$ele.find('[data-notify="progressbar"] > .progress-bar').removeClass('progress-bar-' + self.settings.type);
                self.settings.type = commands[cmd];
                this.$ele.addClass('alert-' + commands[cmd]).find('[data-notify="progressbar"] > .progress-bar').addClass('progress-bar-' + commands[cmd]);
                break;
              case "icon":
                var $icon = this.$ele.find('[data-notify="icon"]');
                if (self.settings.icon_type.toLowerCase() === 'class') {
                  $icon.removeClass(self.settings.content.icon).addClass(commands[cmd]);
                } else {
                  if (!$icon.is('img')) {
                    $icon.find('img');
                  }
                  $icon.attr('src', commands[cmd]);
                }
                self.settings.content.icon = commands[command];
                break;
              case "progress":
                var newDelay = self.settings.delay - (self.settings.delay * (commands[cmd] / 100));
                this.$ele.data('notify-delay', newDelay);
                this.$ele.find('[data-notify="progressbar"] > div').attr('aria-valuenow', commands[cmd]).css('width', commands[cmd] + '%');
                break;
              case "url":
                this.$ele.find('[data-notify="url"]').attr('href', commands[cmd]);
                break;
              case "target":
                this.$ele.find('[data-notify="url"]').attr('target', commands[cmd]);
                break;
              default:
                this.$ele.find('[data-notify="' + cmd + '"]').html(commands[cmd]);
            }
          }
          var posX = this.$ele.outerHeight() + parseInt(self.settings.spacing) + parseInt(self.settings.offset.y);
          self.reposition(posX);
        },
        close: function() {
          self.close();
        }
      };

    },
    buildNotify: function() {
      var content = this.settings.content;
      this.$ele = $(String.format(this.settings.template, this.settings.type, content.title, content.message, content.url, content.target));
      this.$ele.attr('data-notify-position', this.settings.placement.from + '-' + this.settings.placement.align);
      if (!this.settings.allow_dismiss) {
        this.$ele.find('[data-notify="dismiss"]').css('display', 'none');
      }
      if ((this.settings.delay <= 0 && !this.settings.showProgressbar) || !this.settings.showProgressbar) {
        this.$ele.find('[data-notify="progressbar"]').remove();
      }
    },
    setIcon: function() {
      this.$ele.addClass('alert-with-icon');

      if (this.settings.icon_type.toLowerCase() === 'class') {
        this.$ele.find('[data-notify="icon"]').addClass(this.settings.content.icon);
      } else {
        if (this.$ele.find('[data-notify="icon"]').is('img')) {
          this.$ele.find('[data-notify="icon"]').attr('src', this.settings.content.icon);
        } else {
          this.$ele.find('[data-notify="icon"]').append('<img src="' + this.settings.content.icon + '" alt="Notify Icon" />');
        }
      }
    },
    styleDismiss: function() {
      this.$ele.find('[data-notify="dismiss"]').css({
        position: 'absolute',
        right: '10px',
        top: '50%',
        marginTop: '-13px',
        zIndex: this.settings.z_index + 2
      });
    },
    styleURL: function() {
      this.$ele.find('[data-notify="url"]').css({
        backgroundImage: 'url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)',
        height: '100%',
        left: 0,
        position: 'absolute',
        top: 0,
        width: '100%',
        zIndex: this.settings.z_index + 1
      });
    },
    placement: function() {
      var self = this,
        offsetAmt = this.settings.offset.y,
        css = {
          display: 'inline-block',
          margin: '0px auto',
          position: this.settings.position ? this.settings.position : (this.settings.element === 'body' ? 'fixed' : 'absolute'),
          transition: 'all .5s ease-in-out',
          zIndex: this.settings.z_index
        },
        hasAnimation = false,
        settings = this.settings;

      $('[data-notify-position="' + this.settings.placement.from + '-' + this.settings.placement.align + '"]:not([data-closing="true"])').each(function() {
        offsetAmt = Math.max(offsetAmt, parseInt($(this).css(settings.placement.from)) + parseInt($(this).outerHeight()) + parseInt(settings.spacing));
      });
      if (this.settings.newest_on_top === true) {
        offsetAmt = this.settings.offset.y;
      }
      css[this.settings.placement.from] = offsetAmt + 'px';

      switch (this.settings.placement.align) {
        case "left":
        case "right":
          css[this.settings.placement.align] = this.settings.offset.x + 'px';
          break;
        case "center":
          css.left = 0;
          css.right = 0;
          break;
      }
      this.$ele.css(css).addClass(this.settings.animate.enter);
      $.each(Array('webkit-', 'moz-', 'o-', 'ms-', ''), function(index, prefix) {
        self.$ele[0].style[prefix + 'AnimationIterationCount'] = 1;
      });

      $(this.settings.element).append(this.$ele);

      if (this.settings.newest_on_top === true) {
        offsetAmt = (parseInt(offsetAmt) + parseInt(this.settings.spacing)) + this.$ele.outerHeight();
        this.reposition(offsetAmt);
      }

      if ($.isFunction(self.settings.onShow)) {
        self.settings.onShow.call(this.$ele);
      }

      this.$ele.one(this.animations.start, function() {
        hasAnimation = true;
      }).one(this.animations.end, function() {
        self.$ele.removeClass(self.settings.animate.enter);
        if ($.isFunction(self.settings.onShown)) {
          self.settings.onShown.call(this);
        }
      });

      setTimeout(function() {
        if (!hasAnimation) {
          if ($.isFunction(self.settings.onShown)) {
            self.settings.onShown.call(this);
          }
        }
      }, 600);
    },
    bind: function() {
      var self = this;

      this.$ele.find('[data-notify="dismiss"]').on('click', function() {
        self.close();
      });

      if ($.isFunction(self.settings.onClick)) {
        this.$ele.on('click', function(event) {
          if (event.target != self.$ele.find('[data-notify="dismiss"]')[0]) {
            self.settings.onClick.call(this, event);
          }
        });
      }

      this.$ele.mouseover(function() {
        $(this).data('data-hover', "true");
      }).mouseout(function() {
        $(this).data('data-hover', "false");
      });
      this.$ele.data('data-hover', "false");

      if (this.settings.delay > 0) {
        self.$ele.data('notify-delay', self.settings.delay);
        var timer = setInterval(function() {
          var delay = parseInt(self.$ele.data('notify-delay')) - self.settings.timer;
          if ((self.$ele.data('data-hover') === 'false' && self.settings.mouse_over === "pause") || self.settings.mouse_over != "pause") {
            var percent = ((self.settings.delay - delay) / self.settings.delay) * 100;
            self.$ele.data('notify-delay', delay);
            self.$ele.find('[data-notify="progressbar"] > div').attr('aria-valuenow', percent).css('width', percent + '%');
          }
          if (delay <= -(self.settings.timer)) {
            clearInterval(timer);
            self.close();
          }
        }, self.settings.timer);
      }
    },
    close: function() {
      var self = this,
        posX = parseInt(this.$ele.css(this.settings.placement.from)),
        hasAnimation = false;

      this.$ele.attr('data-closing', 'true').addClass(this.settings.animate.exit);
      self.reposition(posX);

      if ($.isFunction(self.settings.onClose)) {
        self.settings.onClose.call(this.$ele);
      }

      this.$ele.one(this.animations.start, function() {
        hasAnimation = true;
      }).one(this.animations.end, function() {
        $(this).remove();
        if ($.isFunction(self.settings.onClosed)) {
          self.settings.onClosed.call(this);
        }
      });

      setTimeout(function() {
        if (!hasAnimation) {
          self.$ele.remove();
          if (self.settings.onClosed) {
            self.settings.onClosed(self.$ele);
          }
        }
      }, 600);
    },
    reposition: function(posX) {
      var self = this,
        notifies = '[data-notify-position="' + this.settings.placement.from + '-' + this.settings.placement.align + '"]:not([data-closing="true"])',
        $elements = this.$ele.nextAll(notifies);
      if (this.settings.newest_on_top === true) {
        $elements = this.$ele.prevAll(notifies);
      }
      $elements.each(function() {
        $(this).css(self.settings.placement.from, posX);
        posX = (parseInt(posX) + parseInt(self.settings.spacing)) + $(this).outerHeight();
      });
    }
  });

  $.notify = function(content, options) {
    var plugin = new Notify(this, content, options);
    return plugin.notify;
  };
  $.notifyDefaults = function(options) {
    defaults = $.extend(true, {}, defaults, options);
    return defaults;
  };

  $.notifyClose = function(selector) {

    if (typeof selector === "undefined" || selector === "all") {
      $('[data-notify]').find('[data-notify="dismiss"]').trigger('click');
    } else if (selector === 'success' || selector === 'info' || selector === 'warning' || selector === 'danger') {
      $('.alert-' + selector + '[data-notify]').find('[data-notify="dismiss"]').trigger('click');
    } else if (selector) {
      $(selector + '[data-notify]').find('[data-notify="dismiss"]').trigger('click');
    } else {
      $('[data-notify-position="' + selector + '"]').find('[data-notify="dismiss"]').trigger('click');
    }
  };

  $.notifyCloseExcept = function(selector) {

    if (selector === 'success' || selector === 'info' || selector === 'warning' || selector === 'danger') {
      $('[data-notify]').not('.alert-' + selector).find('[data-notify="dismiss"]').trigger('click');
    } else {
      $('[data-notify]').not(selector).find('[data-notify="dismiss"]').trigger('click');
    }
  };


}));
//
// Chart extension for making the bars rounded
// Code from: https://codepen.io/jedtrow/full/ygRYgo
//

Chart.elements.Rectangle.prototype.draw = function() {

  var ctx = this._chart.ctx;
  var vm = this._view;
  var left, right, top, bottom, signX, signY, borderSkipped, radius;
  var borderWidth = vm.borderWidth;
  // Set Radius Here
  // If radius is large enough to cause drawing errors a max radius is imposed
  var cornerRadius = 6;

  if (!vm.horizontal) {
    // bar
    left = vm.x - vm.width / 2;
    right = vm.x + vm.width / 2;
    top = vm.y;
    bottom = vm.base;
    signX = 1;
    signY = bottom > top ? 1 : -1;
    borderSkipped = vm.borderSkipped || 'bottom';
  } else {
    // horizontal bar
    left = vm.base;
    right = vm.x;
    top = vm.y - vm.height / 2;
    bottom = vm.y + vm.height / 2;
    signX = right > left ? 1 : -1;
    signY = 1;
    borderSkipped = vm.borderSkipped || 'left';
  }

  // Canvas doesn't allow us to stroke inside the width so we can
  // adjust the sizes to fit if we're setting a stroke on the line
  if (borderWidth) {
    // borderWidth shold be less than bar width and bar height.
    var barSize = Math.min(Math.abs(left - right), Math.abs(top - bottom));
    borderWidth = borderWidth > barSize ? barSize : borderWidth;
    var halfStroke = borderWidth / 2;
    // Adjust borderWidth when bar top position is near vm.base(zero).
    var borderLeft = left + (borderSkipped !== 'left' ? halfStroke * signX : 0);
    var borderRight = right + (borderSkipped !== 'right' ? -halfStroke * signX : 0);
    var borderTop = top + (borderSkipped !== 'top' ? halfStroke * signY : 0);
    var borderBottom = bottom + (borderSkipped !== 'bottom' ? -halfStroke * signY : 0);
    // not become a vertical line?
    if (borderLeft !== borderRight) {
      top = borderTop;
      bottom = borderBottom;
    }
    // not become a horizontal line?
    if (borderTop !== borderBottom) {
      left = borderLeft;
      right = borderRight;
    }
  }

  ctx.beginPath();
  ctx.fillStyle = vm.backgroundColor;
  ctx.strokeStyle = vm.borderColor;
  ctx.lineWidth = borderWidth;

  // Corner points, from bottom-left to bottom-right clockwise
  // | 1 2 |
  // | 0 3 |
  var corners = [
    [left, bottom],
    [left, top],
    [right, top],
    [right, bottom]
  ];

  // Find first (starting) corner with fallback to 'bottom'
  var borders = ['bottom', 'left', 'top', 'right'];
  var startCorner = borders.indexOf(borderSkipped, 0);
  if (startCorner === -1) {
    startCorner = 0;
  }

  function cornerAt(index) {
    return corners[(startCorner + index) % 4];
  }

  // Draw rectangle from 'startCorner'
  var corner = cornerAt(0);
  ctx.moveTo(corner[0], corner[1]);

  for (var i = 1; i < 4; i++) {
    corner = cornerAt(i);
    nextCornerId = i + 1;
    if (nextCornerId == 4) {
      nextCornerId = 0
    }

    nextCorner = cornerAt(nextCornerId);

    width = corners[2][0] - corners[1][0];
    height = corners[0][1] - corners[1][1];
    x = corners[1][0];
    y = corners[1][1];

    var radius = cornerRadius;

    // Fix radius being too large
    if (radius > height / 2) {
      radius = height / 2;
    }
    if (radius > width / 2) {
      radius = width / 2;
    }

    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);

  }

  ctx.fill();
  if (borderWidth) {
    ctx.stroke();
  }
};
/*!
 * Chart.js v3.0.2
 * https://www.chartjs.org
 * (c) 2021 Chart.js Contributors
 * Released under the MIT License
 */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).Chart=e()}(this,(function(){"use strict";const t="undefined"==typeof window?function(t){return t()}:window.requestAnimationFrame;function e(e,i,n){const o=n||(t=>Array.prototype.slice.call(t));let s=!1,a=[];return function(...n){a=o(n),s||(s=!0,t.call(window,(()=>{s=!1,e.apply(i,a)})))}}function i(t,e){let i;return function(){return e?(clearTimeout(i),i=setTimeout(t,e)):t(),e}}const n=t=>"start"===t?"left":"end"===t?"right":"center",o=(t,e,i)=>"start"===t?e:"end"===t?i:(e+i)/2,s=(t,e,i)=>"right"===t?i:"center"===t?(e+i)/2:e;var a=new class{constructor(){this._request=null,this._charts=new Map,this._running=!1,this._lastDate=void 0}_notify(t,e,i,n){const o=e.listeners[n],s=e.duration;o.forEach((n=>n({chart:t,numSteps:s,currentStep:Math.min(i-e.start,s)})))}_refresh(){const e=this;e._request||(e._running=!0,e._request=t.call(window,(()=>{e._update(),e._request=null,e._running&&e._refresh()})))}_update(t=Date.now()){const e=this;let i=0;e._charts.forEach(((n,o)=>{if(!n.running||!n.items.length)return;const s=n.items;let a,r=s.length-1,l=!1;for(;r>=0;--r)a=s[r],a._active?(a._total>n.duration&&(n.duration=a._total),a.tick(t),l=!0):(s[r]=s[s.length-1],s.pop());l&&(o.draw(),e._notify(o,n,t,"progress")),s.length||(n.running=!1,e._notify(o,n,t,"complete")),i+=s.length})),e._lastDate=t,0===i&&(e._running=!1)}_getAnims(t){const e=this._charts;let i=e.get(t);return i||(i={running:!1,items:[],listeners:{complete:[],progress:[]}},e.set(t,i)),i}listen(t,e,i){this._getAnims(t).listeners[e].push(i)}add(t,e){e&&e.length&&this._getAnims(t).items.push(...e)}has(t){return this._getAnims(t).items.length>0}start(t){const e=this._charts.get(t);e&&(e.running=!0,e.start=Date.now(),e.duration=e.items.reduce(((t,e)=>Math.max(t,e._duration)),0),this._refresh())}running(t){if(!this._running)return!1;const e=this._charts.get(t);return!!(e&&e.running&&e.items.length)}stop(t){const e=this._charts.get(t);if(!e||!e.items.length)return;const i=e.items;let n=i.length-1;for(;n>=0;--n)i[n].cancel();e.items=[],this._notify(t,e,Date.now(),"complete")}remove(t){return this._charts.delete(t)}};
/*!
 * @kurkle/color v0.1.9
 * https://github.com/kurkle/color#readme
 * (c) 2020 Jukka Kurkela
 * Released under the MIT License
 */const r={0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,A:10,B:11,C:12,D:13,E:14,F:15,a:10,b:11,c:12,d:13,e:14,f:15},l="0123456789ABCDEF",c=t=>l[15&t],h=t=>l[(240&t)>>4]+l[15&t],d=t=>(240&t)>>4==(15&t);function u(t){var e=function(t){return d(t.r)&&d(t.g)&&d(t.b)&&d(t.a)}(t)?c:h;return t?"#"+e(t.r)+e(t.g)+e(t.b)+(t.a<255?e(t.a):""):t}function f(t){return t+.5|0}const g=(t,e,i)=>Math.max(Math.min(t,i),e);function p(t){return g(f(2.55*t),0,255)}function m(t){return g(f(255*t),0,255)}function x(t){return g(f(t/2.55)/100,0,1)}function b(t){return g(f(100*t),0,100)}const _=/^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;const y=/^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;function v(t,e,i){const n=e*Math.min(i,1-i),o=(e,o=(e+t/30)%12)=>i-n*Math.max(Math.min(o-3,9-o,1),-1);return[o(0),o(8),o(4)]}function M(t,e,i){const n=(n,o=(n+t/60)%6)=>i-i*e*Math.max(Math.min(o,4-o,1),0);return[n(5),n(3),n(1)]}function w(t,e,i){const n=v(t,1,.5);let o;for(e+i>1&&(o=1/(e+i),e*=o,i*=o),o=0;o<3;o++)n[o]*=1-e-i,n[o]+=e;return n}function k(t){const e=t.r/255,i=t.g/255,n=t.b/255,o=Math.max(e,i,n),s=Math.min(e,i,n),a=(o+s)/2;let r,l,c;return o!==s&&(c=o-s,l=a>.5?c/(2-o-s):c/(o+s),r=o===e?(i-n)/c+(i<n?6:0):o===i?(n-e)/c+2:(e-i)/c+4,r=60*r+.5),[0|r,l||0,a]}function S(t,e,i,n){return(Array.isArray(e)?t(e[0],e[1],e[2]):t(e,i,n)).map(m)}function P(t,e,i){return S(v,t,e,i)}function D(t){return(t%360+360)%360}function C(t){const e=y.exec(t);let i,n=255;if(!e)return;e[5]!==i&&(n=e[6]?p(+e[5]):m(+e[5]));const o=D(+e[2]),s=+e[3]/100,a=+e[4]/100;return i="hwb"===e[1]?function(t,e,i){return S(w,t,e,i)}(o,s,a):"hsv"===e[1]?function(t,e,i){return S(M,t,e,i)}(o,s,a):P(o,s,a),{r:i[0],g:i[1],b:i[2],a:n}}const A={x:"dark",Z:"light",Y:"re",X:"blu",W:"gr",V:"medium",U:"slate",A:"ee",T:"ol",S:"or",B:"ra",C:"lateg",D:"ights",R:"in",Q:"turquois",E:"hi",P:"ro",O:"al",N:"le",M:"de",L:"yello",F:"en",K:"ch",G:"arks",H:"ea",I:"ightg",J:"wh"},O={OiceXe:"f0f8ff",antiquewEte:"faebd7",aqua:"ffff",aquamarRe:"7fffd4",azuY:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"0",blanKedOmond:"ffebcd",Xe:"ff",XeviTet:"8a2be2",bPwn:"a52a2a",burlywood:"deb887",caMtXe:"5f9ea0",KartYuse:"7fff00",KocTate:"d2691e",cSO:"ff7f50",cSnflowerXe:"6495ed",cSnsilk:"fff8dc",crimson:"dc143c",cyan:"ffff",xXe:"8b",xcyan:"8b8b",xgTMnPd:"b8860b",xWay:"a9a9a9",xgYF:"6400",xgYy:"a9a9a9",xkhaki:"bdb76b",xmagFta:"8b008b",xTivegYF:"556b2f",xSange:"ff8c00",xScEd:"9932cc",xYd:"8b0000",xsOmon:"e9967a",xsHgYF:"8fbc8f",xUXe:"483d8b",xUWay:"2f4f4f",xUgYy:"2f4f4f",xQe:"ced1",xviTet:"9400d3",dAppRk:"ff1493",dApskyXe:"bfff",dimWay:"696969",dimgYy:"696969",dodgerXe:"1e90ff",fiYbrick:"b22222",flSOwEte:"fffaf0",foYstWAn:"228b22",fuKsia:"ff00ff",gaRsbSo:"dcdcdc",ghostwEte:"f8f8ff",gTd:"ffd700",gTMnPd:"daa520",Way:"808080",gYF:"8000",gYFLw:"adff2f",gYy:"808080",honeyMw:"f0fff0",hotpRk:"ff69b4",RdianYd:"cd5c5c",Rdigo:"4b0082",ivSy:"fffff0",khaki:"f0e68c",lavFMr:"e6e6fa",lavFMrXsh:"fff0f5",lawngYF:"7cfc00",NmoncEffon:"fffacd",ZXe:"add8e6",ZcSO:"f08080",Zcyan:"e0ffff",ZgTMnPdLw:"fafad2",ZWay:"d3d3d3",ZgYF:"90ee90",ZgYy:"d3d3d3",ZpRk:"ffb6c1",ZsOmon:"ffa07a",ZsHgYF:"20b2aa",ZskyXe:"87cefa",ZUWay:"778899",ZUgYy:"778899",ZstAlXe:"b0c4de",ZLw:"ffffe0",lime:"ff00",limegYF:"32cd32",lRF:"faf0e6",magFta:"ff00ff",maPon:"800000",VaquamarRe:"66cdaa",VXe:"cd",VScEd:"ba55d3",VpurpN:"9370db",VsHgYF:"3cb371",VUXe:"7b68ee",VsprRggYF:"fa9a",VQe:"48d1cc",VviTetYd:"c71585",midnightXe:"191970",mRtcYam:"f5fffa",mistyPse:"ffe4e1",moccasR:"ffe4b5",navajowEte:"ffdead",navy:"80",Tdlace:"fdf5e6",Tive:"808000",TivedBb:"6b8e23",Sange:"ffa500",SangeYd:"ff4500",ScEd:"da70d6",pOegTMnPd:"eee8aa",pOegYF:"98fb98",pOeQe:"afeeee",pOeviTetYd:"db7093",papayawEp:"ffefd5",pHKpuff:"ffdab9",peru:"cd853f",pRk:"ffc0cb",plum:"dda0dd",powMrXe:"b0e0e6",purpN:"800080",YbeccapurpN:"663399",Yd:"ff0000",Psybrown:"bc8f8f",PyOXe:"4169e1",saddNbPwn:"8b4513",sOmon:"fa8072",sandybPwn:"f4a460",sHgYF:"2e8b57",sHshell:"fff5ee",siFna:"a0522d",silver:"c0c0c0",skyXe:"87ceeb",UXe:"6a5acd",UWay:"708090",UgYy:"708090",snow:"fffafa",sprRggYF:"ff7f",stAlXe:"4682b4",tan:"d2b48c",teO:"8080",tEstN:"d8bfd8",tomato:"ff6347",Qe:"40e0d0",viTet:"ee82ee",JHt:"f5deb3",wEte:"ffffff",wEtesmoke:"f5f5f5",Lw:"ffff00",LwgYF:"9acd32"};let T;function L(t){T||(T=function(){const t={},e=Object.keys(O),i=Object.keys(A);let n,o,s,a,r;for(n=0;n<e.length;n++){for(a=r=e[n],o=0;o<i.length;o++)s=i[o],r=r.replace(s,A[s]);s=parseInt(O[a],16),t[r]=[s>>16&255,s>>8&255,255&s]}return t}(),T.transparent=[0,0,0,0]);const e=T[t.toLowerCase()];return e&&{r:e[0],g:e[1],b:e[2],a:4===e.length?e[3]:255}}function R(t,e,i){if(t){let n=k(t);n[e]=Math.max(0,Math.min(n[e]+n[e]*i,0===e?360:1)),n=P(n),t.r=n[0],t.g=n[1],t.b=n[2]}}function E(t,e){return t?Object.assign(e||{},t):t}function I(t){var e={r:0,g:0,b:0,a:255};return Array.isArray(t)?t.length>=3&&(e={r:t[0],g:t[1],b:t[2],a:255},t.length>3&&(e.a=m(t[3]))):(e=E(t,{r:0,g:0,b:0,a:1})).a=m(e.a),e}function F(t){return"r"===t.charAt(0)?function(t){const e=_.exec(t);let i,n,o,s=255;if(e){if(e[7]!==i){const t=+e[7];s=255&(e[8]?p(t):255*t)}return i=+e[1],n=+e[3],o=+e[5],i=255&(e[2]?p(i):i),n=255&(e[4]?p(n):n),o=255&(e[6]?p(o):o),{r:i,g:n,b:o,a:s}}}(t):C(t)}class z{constructor(t){if(t instanceof z)return t;const e=typeof t;let i;var n,o,s;"object"===e?i=I(t):"string"===e&&(s=(n=t).length,"#"===n[0]&&(4===s||5===s?o={r:255&17*r[n[1]],g:255&17*r[n[2]],b:255&17*r[n[3]],a:5===s?17*r[n[4]]:255}:7!==s&&9!==s||(o={r:r[n[1]]<<4|r[n[2]],g:r[n[3]]<<4|r[n[4]],b:r[n[5]]<<4|r[n[6]],a:9===s?r[n[7]]<<4|r[n[8]]:255})),i=o||L(t)||F(t)),this._rgb=i,this._valid=!!i}get valid(){return this._valid}get rgb(){var t=E(this._rgb);return t&&(t.a=x(t.a)),t}set rgb(t){this._rgb=I(t)}rgbString(){return this._valid?(t=this._rgb)&&(t.a<255?`rgba(${t.r}, ${t.g}, ${t.b}, ${x(t.a)})`:`rgb(${t.r}, ${t.g}, ${t.b})`):this._rgb;var t}hexString(){return this._valid?u(this._rgb):this._rgb}hslString(){return this._valid?function(t){if(!t)return;const e=k(t),i=e[0],n=b(e[1]),o=b(e[2]);return t.a<255?`hsla(${i}, ${n}%, ${o}%, ${x(t.a)})`:`hsl(${i}, ${n}%, ${o}%)`}(this._rgb):this._rgb}mix(t,e){const i=this;if(t){const n=i.rgb,o=t.rgb;let s;const a=e===s?.5:e,r=2*a-1,l=n.a-o.a,c=((r*l==-1?r:(r+l)/(1+r*l))+1)/2;s=1-c,n.r=255&c*n.r+s*o.r+.5,n.g=255&c*n.g+s*o.g+.5,n.b=255&c*n.b+s*o.b+.5,n.a=a*n.a+(1-a)*o.a,i.rgb=n}return i}clone(){return new z(this.rgb)}alpha(t){return this._rgb.a=m(t),this}clearer(t){return this._rgb.a*=1-t,this}greyscale(){const t=this._rgb,e=f(.3*t.r+.59*t.g+.11*t.b);return t.r=t.g=t.b=e,this}opaquer(t){return this._rgb.a*=1+t,this}negate(){const t=this._rgb;return t.r=255-t.r,t.g=255-t.g,t.b=255-t.b,this}lighten(t){return R(this._rgb,2,t),this}darken(t){return R(this._rgb,2,-t),this}saturate(t){return R(this._rgb,1,t),this}desaturate(t){return R(this._rgb,1,-t),this}rotate(t){return function(t,e){var i=k(t);i[0]=D(i[0]+e),i=P(i),t.r=i[0],t.g=i[1],t.b=i[2]}(this._rgb,t),this}}function V(t){return new z(t)}const B=t=>t instanceof CanvasGradient||t instanceof CanvasPattern;function W(t){return B(t)?t:V(t)}function H(t){return B(t)?t:V(t).saturate(.5).darken(.1).hexString()}function N(){}const j=function(){let t=0;return function(){return t++}}();function $(t){return null==t}function Y(t){if(Array.isArray&&Array.isArray(t))return!0;const e=Object.prototype.toString.call(t);return"[object"===e.substr(0,7)&&"Array]"===e.substr(-6)}function U(t){return null!==t&&"[object Object]"===Object.prototype.toString.call(t)}const X=t=>("number"==typeof t||t instanceof Number)&&isFinite(+t);function q(t,e){return X(t)?t:e}function K(t,e){return void 0===t?e:t}const G=(t,e)=>"string"==typeof t&&t.endsWith("%")?parseFloat(t)/100:t/e,Z=(t,e)=>"string"==typeof t&&t.endsWith("%")?parseFloat(t)/100*e:+t;function Q(t,e,i){if(t&&"function"==typeof t.call)return t.apply(i,e)}function J(t,e,i,n){let o,s,a;if(Y(t))if(s=t.length,n)for(o=s-1;o>=0;o--)e.call(i,t[o],o);else for(o=0;o<s;o++)e.call(i,t[o],o);else if(U(t))for(a=Object.keys(t),s=a.length,o=0;o<s;o++)e.call(i,t[a[o]],a[o])}function tt(t,e){let i,n,o,s;if(!t||!e||t.length!==e.length)return!1;for(i=0,n=t.length;i<n;++i)if(o=t[i],s=e[i],o.datasetIndex!==s.datasetIndex||o.index!==s.index)return!1;return!0}function et(t){if(Y(t))return t.map(et);if(U(t)){const e=Object.create(null),i=Object.keys(t),n=i.length;let o=0;for(;o<n;++o)e[i[o]]=et(t[i[o]]);return e}return t}function it(t){return-1===["__proto__","prototype","constructor"].indexOf(t)}function nt(t,e,i,n){if(!it(t))return;const o=e[t],s=i[t];U(o)&&U(s)?ot(o,s,n):e[t]=et(s)}function ot(t,e,i){const n=Y(e)?e:[e],o=n.length;if(!U(t))return t;const s=(i=i||{}).merger||nt;for(let a=0;a<o;++a){if(!U(e=n[a]))continue;const o=Object.keys(e);for(let n=0,a=o.length;n<a;++n)s(o[n],t,e,i)}return t}function st(t,e){return ot(t,e,{merger:at})}function at(t,e,i){if(!it(t))return;const n=e[t],o=i[t];U(n)&&U(o)?st(n,o):Object.prototype.hasOwnProperty.call(e,t)||(e[t]=et(o))}function rt(t,e){const i=t.indexOf(".",e);return-1===i?t.length:i}function lt(t,e){if(""===e)return t;let i=0,n=rt(e,i);for(;t&&n>i;)t=t[e.substr(i,n-i)],i=n+1,n=rt(e,i);return t}function ct(t){return t.charAt(0).toUpperCase()+t.slice(1)}const ht=t=>void 0!==t,dt=t=>"function"==typeof t,ut=Object.create(null),ft=Object.create(null);function gt(t,e){if(!e)return t;const i=e.split(".");for(let e=0,n=i.length;e<n;++e){const n=i[e];t=t[n]||(t[n]=Object.create(null))}return t}function pt(t,e,i){return"string"==typeof e?ot(gt(t,e),i):ot(gt(t,""),e)}var mt=new class{constructor(t){this.animation=void 0,this.backgroundColor="rgba(0,0,0,0.1)",this.borderColor="rgba(0,0,0,0.1)",this.color="#666",this.datasets={},this.devicePixelRatio=t=>t.chart.platform.getDevicePixelRatio(),this.elements={},this.events=["mousemove","mouseout","click","touchstart","touchmove"],this.font={family:"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",size:12,style:"normal",lineHeight:1.2,weight:null},this.hover={},this.hoverBackgroundColor=(t,e)=>H(e.backgroundColor),this.hoverBorderColor=(t,e)=>H(e.borderColor),this.hoverColor=(t,e)=>H(e.color),this.indexAxis="x",this.interaction={mode:"nearest",intersect:!0},this.maintainAspectRatio=!0,this.onHover=null,this.onClick=null,this.parsing=!0,this.plugins={},this.responsive=!0,this.scale=void 0,this.scales={},this.showLine=!0,this.describe(t)}set(t,e){return pt(this,t,e)}get(t){return gt(this,t)}describe(t,e){return pt(ft,t,e)}override(t,e){return pt(ut,t,e)}route(t,e,i,n){const o=gt(this,t),s=gt(this,i),a="_"+e;Object.defineProperties(o,{[a]:{value:o[e],writable:!0},[e]:{enumerable:!0,get(){const t=this[a],e=s[n];return U(t)?Object.assign({},e,t):K(t,e)},set(t){this[a]=t}}})}}({_scriptable:t=>!t.startsWith("on"),_indexable:t=>"events"!==t,hover:{_fallback:"interaction"},interaction:{_scriptable:!1,_indexable:!1}});const xt=Math.PI,bt=2*xt,_t=bt+xt,yt=Number.POSITIVE_INFINITY,vt=xt/180,Mt=xt/2,wt=xt/4,kt=2*xt/3,St=Math.log10,Pt=Math.sign;function Dt(t){const e=Math.pow(10,Math.floor(St(t))),i=t/e;return(i<=1?1:i<=2?2:i<=5?5:10)*e}function Ct(t){const e=[],i=Math.sqrt(t);let n;for(n=1;n<i;n++)t%n==0&&(e.push(n),e.push(t/n));return i===(0|i)&&e.push(i),e.sort(((t,e)=>t-e)).pop(),e}function At(t){return!isNaN(parseFloat(t))&&isFinite(t)}function Ot(t,e,i){return Math.abs(t-e)<i}function Tt(t,e){const i=Math.round(t);return i-e<=t&&i+e>=t}function Lt(t,e,i){let n,o,s;for(n=0,o=t.length;n<o;n++)s=t[n][i],isNaN(s)||(e.min=Math.min(e.min,s),e.max=Math.max(e.max,s))}function Rt(t){return t*(xt/180)}function Et(t){return t*(180/xt)}function It(t){if(!X(t))return;let e=1,i=0;for(;Math.round(t*e)/e!==t;)e*=10,i++;return i}function Ft(t,e){const i=e.x-t.x,n=e.y-t.y,o=Math.sqrt(i*i+n*n);let s=Math.atan2(n,i);return s<-.5*xt&&(s+=bt),{angle:s,distance:o}}function zt(t,e){return Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))}function Vt(t,e){return(t-e+_t)%bt-xt}function Bt(t){return(t%bt+bt)%bt}function Wt(t,e,i){const n=Bt(t),o=Bt(e),s=Bt(i),a=Bt(o-n),r=Bt(s-n),l=Bt(n-o),c=Bt(n-s);return n===o||n===s||a>r&&l<c}function Ht(t,e,i){return Math.max(e,Math.min(i,t))}function Nt(t){return Ht(t,-32768,32767)}function jt(t){return!t||$(t.size)||$(t.family)?null:(t.style?t.style+" ":"")+(t.weight?t.weight+" ":"")+t.size+"px "+t.family}function $t(t,e,i,n,o){let s=e[o];return s||(s=e[o]=t.measureText(o).width,i.push(o)),s>n&&(n=s),n}function Yt(t,e,i,n){let o=(n=n||{}).data=n.data||{},s=n.garbageCollect=n.garbageCollect||[];n.font!==e&&(o=n.data={},s=n.garbageCollect=[],n.font=e),t.save(),t.font=e;let a=0;const r=i.length;let l,c,h,d,u;for(l=0;l<r;l++)if(d=i[l],null!=d&&!0!==Y(d))a=$t(t,o,s,a,d);else if(Y(d))for(c=0,h=d.length;c<h;c++)u=d[c],null==u||Y(u)||(a=$t(t,o,s,a,u));t.restore();const f=s.length/2;if(f>i.length){for(l=0;l<f;l++)delete o[s[l]];s.splice(0,f)}return a}function Ut(t,e,i){const n=t.currentDevicePixelRatio,o=0!==i?Math.max(i/2,.5):0;return Math.round((e-o)*n)/n+o}function Xt(t,e){(e=e||t.getContext("2d")).save(),e.resetTransform(),e.clearRect(0,0,t.width,t.height),e.restore()}function qt(t,e,i,n){let o,s,a,r,l;const c=e.pointStyle,h=e.rotation,d=e.radius;let u=(h||0)*vt;if(c&&"object"==typeof c&&(o=c.toString(),"[object HTMLImageElement]"===o||"[object HTMLCanvasElement]"===o))return t.save(),t.translate(i,n),t.rotate(u),t.drawImage(c,-c.width/2,-c.height/2,c.width,c.height),void t.restore();if(!(isNaN(d)||d<=0)){switch(t.beginPath(),c){default:t.arc(i,n,d,0,bt),t.closePath();break;case"triangle":t.moveTo(i+Math.sin(u)*d,n-Math.cos(u)*d),u+=kt,t.lineTo(i+Math.sin(u)*d,n-Math.cos(u)*d),u+=kt,t.lineTo(i+Math.sin(u)*d,n-Math.cos(u)*d),t.closePath();break;case"rectRounded":l=.516*d,r=d-l,s=Math.cos(u+wt)*r,a=Math.sin(u+wt)*r,t.arc(i-s,n-a,l,u-xt,u-Mt),t.arc(i+a,n-s,l,u-Mt,u),t.arc(i+s,n+a,l,u,u+Mt),t.arc(i-a,n+s,l,u+Mt,u+xt),t.closePath();break;case"rect":if(!h){r=Math.SQRT1_2*d,t.rect(i-r,n-r,2*r,2*r);break}u+=wt;case"rectRot":s=Math.cos(u)*d,a=Math.sin(u)*d,t.moveTo(i-s,n-a),t.lineTo(i+a,n-s),t.lineTo(i+s,n+a),t.lineTo(i-a,n+s),t.closePath();break;case"crossRot":u+=wt;case"cross":s=Math.cos(u)*d,a=Math.sin(u)*d,t.moveTo(i-s,n-a),t.lineTo(i+s,n+a),t.moveTo(i+a,n-s),t.lineTo(i-a,n+s);break;case"star":s=Math.cos(u)*d,a=Math.sin(u)*d,t.moveTo(i-s,n-a),t.lineTo(i+s,n+a),t.moveTo(i+a,n-s),t.lineTo(i-a,n+s),u+=wt,s=Math.cos(u)*d,a=Math.sin(u)*d,t.moveTo(i-s,n-a),t.lineTo(i+s,n+a),t.moveTo(i+a,n-s),t.lineTo(i-a,n+s);break;case"line":s=Math.cos(u)*d,a=Math.sin(u)*d,t.moveTo(i-s,n-a),t.lineTo(i+s,n+a);break;case"dash":t.moveTo(i,n),t.lineTo(i+Math.cos(u)*d,n+Math.sin(u)*d)}t.fill(),e.borderWidth>0&&t.stroke()}}function Kt(t,e,i){return i=i||.5,t&&t.x>e.left-i&&t.x<e.right+i&&t.y>e.top-i&&t.y<e.bottom+i}function Gt(t,e){t.save(),t.beginPath(),t.rect(e.left,e.top,e.right-e.left,e.bottom-e.top),t.clip()}function Zt(t){t.restore()}function Qt(t,e,i,n,o){if(!e)return t.lineTo(i.x,i.y);if("middle"===o){const n=(e.x+i.x)/2;t.lineTo(n,e.y),t.lineTo(n,i.y)}else"after"===o!=!!n?t.lineTo(e.x,i.y):t.lineTo(i.x,e.y);t.lineTo(i.x,i.y)}function Jt(t,e,i,n){if(!e)return t.lineTo(i.x,i.y);t.bezierCurveTo(n?e.cp1x:e.cp2x,n?e.cp1y:e.cp2y,n?i.cp2x:i.cp1x,n?i.cp2y:i.cp1y,i.x,i.y)}function te(t,e,i,n,o,s={}){const a=Y(e)?e:[e],r=s.strokeWidth>0&&""!==s.strokeColor;let l,c;for(t.save(),s.translation&&t.translate(s.translation[0],s.translation[1]),$(s.rotation)||t.rotate(s.rotation),t.font=o.string,s.color&&(t.fillStyle=s.color),s.textAlign&&(t.textAlign=s.textAlign),s.textBaseline&&(t.textBaseline=s.textBaseline),l=0;l<a.length;++l){if(c=a[l],r&&(s.strokeColor&&(t.strokeStyle=s.strokeColor),$(s.strokeWidth)||(t.lineWidth=s.strokeWidth),t.strokeText(c,i,n,s.maxWidth)),t.fillText(c,i,n,s.maxWidth),s.strikethrough||s.underline){const e=t.measureText(c),o=i-e.actualBoundingBoxLeft,a=i+e.actualBoundingBoxRight,r=n-e.actualBoundingBoxAscent,l=n+e.actualBoundingBoxDescent,h=s.strikethrough?(r+l)/2:l;t.strokeStyle=t.fillStyle,t.beginPath(),t.lineWidth=s.decorationWidth||2,t.moveTo(o,h),t.lineTo(a,h),t.stroke()}n+=o.lineHeight}t.restore()}function ee(t,e,i){i=i||(i=>t[i]<e);let n,o=t.length-1,s=0;for(;o-s>1;)n=s+o>>1,i(n)?s=n:o=n;return{lo:s,hi:o}}const ie=(t,e,i)=>ee(t,i,(n=>t[n][e]<i)),ne=(t,e,i)=>ee(t,i,(n=>t[n][e]>=i));function oe(t,e,i){let n=0,o=t.length;for(;n<o&&t[n]<e;)n++;for(;o>n&&t[o-1]>i;)o--;return n>0||o<t.length?t.slice(n,o):t}const se=["push","pop","shift","splice","unshift"];function ae(t,e){t._chartjs?t._chartjs.listeners.push(e):(Object.defineProperty(t,"_chartjs",{configurable:!0,enumerable:!1,value:{listeners:[e]}}),se.forEach((e=>{const i="_onData"+ct(e),n=t[e];Object.defineProperty(t,e,{configurable:!0,enumerable:!1,value(...e){const o=n.apply(this,e);return t._chartjs.listeners.forEach((t=>{"function"==typeof t[i]&&t[i](...e)})),o}})})))}function re(t,e){const i=t._chartjs;if(!i)return;const n=i.listeners,o=n.indexOf(e);-1!==o&&n.splice(o,1),n.length>0||(se.forEach((e=>{delete t[e]})),delete t._chartjs)}function le(t){const e=new Set;let i,n;for(i=0,n=t.length;i<n;++i)e.add(t[i]);if(e.size===n)return t;const o=[];return e.forEach((t=>{o.push(t)})),o}function ce(t){let e=t.parentNode;return e&&"[object ShadowRoot]"===e.toString()&&(e=e.host),e}function he(t,e,i){let n;return"string"==typeof t?(n=parseInt(t,10),-1!==t.indexOf("%")&&(n=n/100*e.parentNode[i])):n=t,n}const de=t=>window.getComputedStyle(t,null);function ue(t,e){return de(t).getPropertyValue(e)}const fe=["top","right","bottom","left"];function ge(t,e,i){const n={};i=i?"-"+i:"";for(let o=0;o<4;o++){const s=fe[o];n[s]=parseFloat(t[e+"-"+s+i])||0}return n.width=n.left+n.right,n.height=n.top+n.bottom,n}function pe(t,e){const{canvas:i,currentDevicePixelRatio:n}=e,o=de(i),s="border-box"===o.boxSizing,a=ge(o,"padding"),r=ge(o,"border","width"),{x:l,y:c,box:h}=function(t,e){const i=t.native||t,n=i.touches,o=n&&n.length?n[0]:i,{offsetX:s,offsetY:a}=o;let r,l,c=!1;if(((t,e,i)=>(t>0||e>0)&&(!i||!i.shadowRoot))(s,a,i.target))r=s,l=a;else{const t=e.getBoundingClientRect();r=o.clientX-t.left,l=o.clientY-t.top,c=!0}return{x:r,y:l,box:c}}(t,i),d=a.left+(h&&r.left),u=a.top+(h&&r.top);let{width:f,height:g}=e;return s&&(f-=a.width+r.width,g-=a.height+r.height),{x:Math.round((l-d)/f*i.width/n),y:Math.round((c-u)/g*i.height/n)}}const me=t=>Math.round(10*t)/10;function xe(t,e,i,n){const o=de(t),s=ge(o,"margin"),a=he(o.maxWidth,t,"clientWidth")||yt,r=he(o.maxHeight,t,"clientHeight")||yt,l=function(t,e,i){let n,o;if(void 0===e||void 0===i){const s=ce(t);if(s){const t=s.getBoundingClientRect(),a=de(s),r=ge(a,"border","width"),l=ge(a,"padding");e=t.width-l.width-r.width,i=t.height-l.height-r.height,n=he(a.maxWidth,s,"clientWidth"),o=he(a.maxHeight,s,"clientHeight")}else e=t.clientWidth,i=t.clientHeight}return{width:e,height:i,maxWidth:n||yt,maxHeight:o||yt}}(t,e,i);let{width:c,height:h}=l;if("content-box"===o.boxSizing){const t=ge(o,"border","width"),e=ge(o,"padding");c-=e.width+t.width,h-=e.height+t.height}return c=Math.max(0,c-s.width),h=Math.max(0,n?Math.floor(c/n):h-s.height),c=me(Math.min(c,a,l.maxWidth)),h=me(Math.min(h,r,l.maxHeight)),c&&!h&&(h=me(c/2)),{width:c,height:h}}function be(t,e,i){const n=t.currentDevicePixelRatio=e||1,{canvas:o,width:s,height:a}=t;o.height=a*n,o.width=s*n,t.ctx.setTransform(n,0,0,n,0,0),o.style&&(i||!o.style.height&&!o.style.width)&&(o.style.height=a+"px",o.style.width=s+"px")}const _e=function(){let t=!1;try{const e={get passive(){return t=!0,!1}};window.addEventListener("test",null,e),window.removeEventListener("test",null,e)}catch(t){}return t}();function ye(t,e){const i=ue(t,e),n=i&&i.match(/^(\d+)(\.\d+)?px$/);return n?+n[1]:void 0}function ve(t,e){return"native"in t?{x:t.x,y:t.y}:pe(t,e)}function Me(t,e,i,n){const{controller:o,data:s,_sorted:a}=t,r=o._cachedMeta.iScale;if(r&&e===r.axis&&a&&s.length){const t=r._reversePixels?ne:ie;if(!n)return t(s,e,i);if(o._sharedOptions){const n=s[0],o="function"==typeof n.getRange&&n.getRange(e);if(o){const n=t(s,e,i-o),a=t(s,e,i+o);return{lo:n.lo,hi:a.hi}}}}return{lo:0,hi:s.length-1}}function we(t,e,i,n,o){const s=t.getSortedVisibleDatasetMetas(),a=i[e];for(let t=0,i=s.length;t<i;++t){const{index:i,data:r}=s[t],{lo:l,hi:c}=Me(s[t],e,a,o);for(let t=l;t<=c;++t){const e=r[t];e.skip||n(e,i,t)}}}function ke(t,e,i,n){const o=[];if(!Kt(e,t.chartArea,t._minPadding))return o;return we(t,i,e,(function(t,i,s){t.inRange(e.x,e.y,n)&&o.push({element:t,datasetIndex:i,index:s})}),!0),o}function Se(t,e,i,n,o){const s=function(t){const e=-1!==t.indexOf("x"),i=-1!==t.indexOf("y");return function(t,n){const o=e?Math.abs(t.x-n.x):0,s=i?Math.abs(t.y-n.y):0;return Math.sqrt(Math.pow(o,2)+Math.pow(s,2))}}(i);let a=Number.POSITIVE_INFINITY,r=[];if(!Kt(e,t.chartArea,t._minPadding))return r;return we(t,i,e,(function(t,i,l){if(n&&!t.inRange(e.x,e.y,o))return;const c=t.getCenterPoint(o),h=s(e,c);h<a?(r=[{element:t,datasetIndex:i,index:l}],a=h):h===a&&r.push({element:t,datasetIndex:i,index:l})})),r}function Pe(t,e,i,n){const o=ve(e,t),s=[],a=i.axis,r="x"===a?"inXRange":"inYRange";let l=!1;return function(t,e){const i=t.getSortedVisibleDatasetMetas();let n,o,s;for(let t=0,a=i.length;t<a;++t){({index:n,data:o}=i[t]);for(let t=0,i=o.length;t<i;++t)s=o[t],s.skip||e(s,n,t)}}(t,((t,e,i)=>{t[r](o[a],n)&&s.push({element:t,datasetIndex:e,index:i}),t.inRange(o.x,o.y,n)&&(l=!0)})),i.intersect&&!l?[]:s}var De={modes:{index(t,e,i,n){const o=ve(e,t),s=i.axis||"x",a=i.intersect?ke(t,o,s,n):Se(t,o,s,!1,n),r=[];return a.length?(t.getSortedVisibleDatasetMetas().forEach((t=>{const e=a[0].index,i=t.data[e];i&&!i.skip&&r.push({element:i,datasetIndex:t.index,index:e})})),r):[]},dataset(t,e,i,n){const o=ve(e,t),s=i.axis||"xy";let a=i.intersect?ke(t,o,s,n):Se(t,o,s,!1,n);if(a.length>0){const e=a[0].datasetIndex,i=t.getDatasetMeta(e).data;a=[];for(let t=0;t<i.length;++t)a.push({element:i[t],datasetIndex:e,index:t})}return a},point:(t,e,i,n)=>ke(t,ve(e,t),i.axis||"xy",n),nearest:(t,e,i,n)=>Se(t,ve(e,t),i.axis||"xy",i.intersect,n),x:(t,e,i,n)=>(i.axis="x",Pe(t,e,i,n)),y:(t,e,i,n)=>(i.axis="y",Pe(t,e,i,n))}};const Ce=new RegExp(/^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/);function Ae(t,e){const i=(""+t).match(Ce);if(!i||"normal"===i[1])return 1.2*e;switch(t=+i[2],i[3]){case"px":return t;case"%":t/=100}return e*t}function Oe(t,e){const i={},n=U(e),o=n?Object.keys(e):e,s=U(t)?n?i=>K(t[i],t[e[i]]):e=>t[e]:()=>t;for(const t of o)i[t]=+s(t)||0;return i}function Te(t){return Oe(t,{top:"y",right:"x",bottom:"y",left:"x"})}function Le(t){return Oe(t,["topLeft","topRight","bottomLeft","bottomRight"])}function Re(t){const e=Te(t);return e.width=e.left+e.right,e.height=e.top+e.bottom,e}function Ee(t,e){t=t||{},e=e||mt.font;let i=K(t.size,e.size);"string"==typeof i&&(i=parseInt(i,10));const n={family:K(t.family,e.family),lineHeight:Ae(K(t.lineHeight,e.lineHeight),i),size:i,style:K(t.style,e.style),weight:K(t.weight,e.weight),string:""};return n.string=jt(n),n}function Ie(t,e,i,n){let o,s,a,r=!0;for(o=0,s=t.length;o<s;++o)if(a=t[o],void 0!==a&&(void 0!==e&&"function"==typeof a&&(a=a(e),r=!1),void 0!==i&&Y(a)&&(a=a[i%a.length],r=!1),void 0!==a))return n&&!r&&(n.cacheable=!1),a}function Fe(t,e){const{min:i,max:n}=t;return{min:i-Math.abs(Z(e,i)),max:n+Z(e,n)}}const ze=["left","top","right","bottom"];function Ve(t,e){return t.filter((t=>t.pos===e))}function Be(t,e){return t.filter((t=>-1===ze.indexOf(t.pos)&&t.box.axis===e))}function We(t,e){return t.sort(((t,i)=>{const n=e?i:t,o=e?t:i;return n.weight===o.weight?n.index-o.index:n.weight-o.weight}))}function He(t,e,i,n){return Math.max(t[i],e[i])+Math.max(t[n],e[n])}function Ne(t,e){t.top=Math.max(t.top,e.top),t.left=Math.max(t.left,e.left),t.bottom=Math.max(t.bottom,e.bottom),t.right=Math.max(t.right,e.right)}function je(t,e,i){const n=i.box,o=t.maxPadding;if(U(i.pos))return{same:!1,other:!1};i.size&&(t[i.pos]-=i.size),i.size=i.horizontal?n.height:n.width,t[i.pos]+=i.size,n.getPadding&&Ne(o,n.getPadding());const s=Math.max(0,e.outerWidth-He(o,t,"left","right")),a=Math.max(0,e.outerHeight-He(o,t,"top","bottom")),r=s!==t.w,l=a!==t.h;return t.w=s,t.h=a,i.horizontal?{same:r,other:l}:{same:l,other:r}}function $e(t,e){const i=e.maxPadding;function n(t){const n={left:0,top:0,right:0,bottom:0};return t.forEach((t=>{n[t]=Math.max(e[t],i[t])})),n}return n(t?["left","right"]:["top","bottom"])}function Ye(t,e,i){const n=[];let o,s,a,r,l,c;for(o=0,s=t.length,l=0;o<s;++o){a=t[o],r=a.box,r.update(a.width||e.w,a.height||e.h,$e(a.horizontal,e));const{same:s,other:h}=je(e,i,a);l|=s&&n.length,c=c||h,r.fullSize||n.push(a)}return l&&Ye(n,e,i)||c}function Ue(t,e,i){const n=i.padding;let o,s,a,r,l=e.x,c=e.y;for(o=0,s=t.length;o<s;++o)a=t[o],r=a.box,a.horizontal?(r.left=r.fullSize?n.left:e.left,r.right=r.fullSize?i.outerWidth-n.right:e.left+e.w,r.top=c,r.bottom=c+r.height,r.width=r.right-r.left,c=r.bottom):(r.left=l,r.right=l+r.width,r.top=r.fullSize?n.top:e.top,r.bottom=r.fullSize?i.outerHeight-n.right:e.top+e.h,r.height=r.bottom-r.top,l=r.right);e.x=l,e.y=c}mt.set("layout",{padding:{top:0,right:0,bottom:0,left:0}});var Xe={addBox(t,e){t.boxes||(t.boxes=[]),e.fullSize=e.fullSize||!1,e.position=e.position||"top",e.weight=e.weight||0,e._layers=e._layers||function(){return[{z:0,draw(t){e.draw(t)}}]},t.boxes.push(e)},removeBox(t,e){const i=t.boxes?t.boxes.indexOf(e):-1;-1!==i&&t.boxes.splice(i,1)},configure(t,e,i){e.fullSize=i.fullSize,e.position=i.position,e.weight=i.weight},update(t,e,i,n){if(!t)return;const o=Re(t.options.layout.padding),s=e-o.width,a=i-o.height,r=function(t){const e=function(t){const e=[];let i,n,o;for(i=0,n=(t||[]).length;i<n;++i)o=t[i],e.push({index:i,box:o,pos:o.position,horizontal:o.isHorizontal(),weight:o.weight});return e}(t),i=We(e.filter((t=>t.box.fullSize)),!0),n=We(Ve(e,"left"),!0),o=We(Ve(e,"right")),s=We(Ve(e,"top"),!0),a=We(Ve(e,"bottom")),r=Be(e,"x"),l=Be(e,"y");return{fullSize:i,leftAndTop:n.concat(s),rightAndBottom:o.concat(l).concat(a).concat(r),chartArea:Ve(e,"chartArea"),vertical:n.concat(o).concat(l),horizontal:s.concat(a).concat(r)}}(t.boxes),l=r.vertical,c=r.horizontal;J(t.boxes,(t=>{"function"==typeof t.beforeLayout&&t.beforeLayout()}));const h=l.reduce(((t,e)=>e.box.options&&!1===e.box.options.display?t:t+1),0)||1,d=Object.freeze({outerWidth:e,outerHeight:i,padding:o,availableWidth:s,availableHeight:a,vBoxMaxWidth:s/2/h,hBoxMaxHeight:a/2}),u=Object.assign({},o);Ne(u,Re(n));const f=Object.assign({maxPadding:u,w:s,h:a,x:o.left,y:o.top},o);!function(t,e){let i,n,o;for(i=0,n=t.length;i<n;++i)o=t[i],o.horizontal?(o.width=o.box.fullSize&&e.availableWidth,o.height=e.hBoxMaxHeight):(o.width=e.vBoxMaxWidth,o.height=o.box.fullSize&&e.availableHeight)}(l.concat(c),d),Ye(r.fullSize,f,d),Ye(l,f,d),Ye(c,f,d)&&Ye(l,f,d),function(t){const e=t.maxPadding;function i(i){const n=Math.max(e[i]-t[i],0);return t[i]+=n,n}t.y+=i("top"),t.x+=i("left"),i("right"),i("bottom")}(f),Ue(r.leftAndTop,f,d),f.x+=f.w,f.y+=f.h,Ue(r.rightAndBottom,f,d),t.chartArea={left:f.left,top:f.top,right:f.left+f.w,bottom:f.top+f.h,height:f.h,width:f.w},J(r.chartArea,(e=>{const i=e.box;Object.assign(i,t.chartArea),i.update(f.w,f.h)}))}};class qe{acquireContext(t,e){}releaseContext(t){return!1}addEventListener(t,e,i){}removeEventListener(t,e,i){}getDevicePixelRatio(){return 1}getMaximumSize(t,e,i,n){return e=Math.max(0,e||t.width),i=i||t.height,{width:e,height:Math.max(0,n?Math.floor(e/n):i)}}isAttached(t){return!0}}class Ke extends qe{acquireContext(t){return t&&t.getContext&&t.getContext("2d")||null}}const Ge={touchstart:"mousedown",touchmove:"mousemove",touchend:"mouseup",pointerenter:"mouseenter",pointerdown:"mousedown",pointermove:"mousemove",pointerup:"mouseup",pointerleave:"mouseout",pointerout:"mouseout"},Ze=t=>null===t||""===t;const Qe=!!_e&&{passive:!0};function Je(t,e,i){t.canvas.removeEventListener(e,i,Qe)}function ti(t,e,i){const n=t.canvas,o=n&&ce(n)||n,s=new MutationObserver((t=>{const e=ce(o);t.forEach((t=>{for(let n=0;n<t.addedNodes.length;n++){const s=t.addedNodes[n];s!==o&&s!==e||i(t.target)}}))}));return s.observe(document,{childList:!0,subtree:!0}),s}function ei(t,e,i){const n=t.canvas,o=n&&ce(n);if(!o)return;const s=new MutationObserver((t=>{t.forEach((t=>{for(let e=0;e<t.removedNodes.length;e++)if(t.removedNodes[e]===n){i();break}}))}));return s.observe(o,{childList:!0}),s}const ii=new Map;let ni=0;function oi(){const t=window.devicePixelRatio;t!==ni&&(ni=t,ii.forEach(((e,i)=>{i.currentDevicePixelRatio!==t&&e()})))}function si(t,i,n){const o=t.canvas,s=o&&ce(o);if(!s)return;const a=e(((t,e)=>{const i=s.clientWidth;n(t,e),i<s.clientWidth&&n()}),window),r=new ResizeObserver((t=>{const e=t[0],i=e.contentRect.width,n=e.contentRect.height;0===i&&0===n||a(i,n)}));return r.observe(s),function(t,e){ii.size||window.addEventListener("resize",oi),ii.set(t,e)}(t,a),r}function ai(t,e,i){i&&i.disconnect(),"resize"===e&&function(t){ii.delete(t),ii.size||window.removeEventListener("resize",oi)}(t)}function ri(t,i,n){const o=t.canvas,s=e((e=>{null!==t.ctx&&n(function(t,e){const i=Ge[t.type]||t.type,{x:n,y:o}=pe(t,e);return{type:i,chart:e,native:t,x:void 0!==n?n:null,y:void 0!==o?o:null}}(e,t))}),t,(t=>{const e=t[0];return[e,e.offsetX,e.offsetY]}));return function(t,e,i){t.addEventListener(e,i,Qe)}(o,i,s),s}class li extends qe{acquireContext(t,e){const i=t&&t.getContext&&t.getContext("2d");return i&&i.canvas===t?(function(t,e){const i=t.style,n=t.getAttribute("height"),o=t.getAttribute("width");if(t.$chartjs={initial:{height:n,width:o,style:{display:i.display,height:i.height,width:i.width}}},i.display=i.display||"block",i.boxSizing=i.boxSizing||"border-box",Ze(o)){const e=ye(t,"width");void 0!==e&&(t.width=e)}if(Ze(n))if(""===t.style.height)t.height=t.width/(e||2);else{const e=ye(t,"height");void 0!==e&&(t.height=e)}}(t,e),i):null}releaseContext(t){const e=t.canvas;if(!e.$chartjs)return!1;const i=e.$chartjs.initial;["height","width"].forEach((t=>{const n=i[t];$(n)?e.removeAttribute(t):e.setAttribute(t,n)}));const n=i.style||{};return Object.keys(n).forEach((t=>{e.style[t]=n[t]})),e.width=e.width,delete e.$chartjs,!0}addEventListener(t,e,i){this.removeEventListener(t,e);const n=t.$proxies||(t.$proxies={}),o={attach:ti,detach:ei,resize:si}[e]||ri;n[e]=o(t,e,i)}removeEventListener(t,e){const i=t.$proxies||(t.$proxies={}),n=i[e];if(!n)return;({attach:ai,detach:ai,resize:ai}[e]||Je)(t,e,n),i[e]=void 0}getDevicePixelRatio(){return window.devicePixelRatio}getMaximumSize(t,e,i,n){return xe(t,e,i,n)}isAttached(t){const e=ce(t);return!(!e||!ce(e))}}var ci=Object.freeze({__proto__:null,BasePlatform:qe,BasicPlatform:Ke,DomPlatform:li});const hi=t=>0===t||1===t,di=(t,e,i)=>-Math.pow(2,10*(t-=1))*Math.sin((t-e)*bt/i),ui=(t,e,i)=>Math.pow(2,-10*t)*Math.sin((t-e)*bt/i)+1,fi={linear:t=>t,easeInQuad:t=>t*t,easeOutQuad:t=>-t*(t-2),easeInOutQuad:t=>(t/=.5)<1?.5*t*t:-.5*(--t*(t-2)-1),easeInCubic:t=>t*t*t,easeOutCubic:t=>(t-=1)*t*t+1,easeInOutCubic:t=>(t/=.5)<1?.5*t*t*t:.5*((t-=2)*t*t+2),easeInQuart:t=>t*t*t*t,easeOutQuart:t=>-((t-=1)*t*t*t-1),easeInOutQuart:t=>(t/=.5)<1?.5*t*t*t*t:-.5*((t-=2)*t*t*t-2),easeInQuint:t=>t*t*t*t*t,easeOutQuint:t=>(t-=1)*t*t*t*t+1,easeInOutQuint:t=>(t/=.5)<1?.5*t*t*t*t*t:.5*((t-=2)*t*t*t*t+2),easeInSine:t=>1-Math.cos(t*Mt),easeOutSine:t=>Math.sin(t*Mt),easeInOutSine:t=>-.5*(Math.cos(xt*t)-1),easeInExpo:t=>0===t?0:Math.pow(2,10*(t-1)),easeOutExpo:t=>1===t?1:1-Math.pow(2,-10*t),easeInOutExpo:t=>hi(t)?t:t<.5?.5*Math.pow(2,10*(2*t-1)):.5*(2-Math.pow(2,-10*(2*t-1))),easeInCirc:t=>t>=1?t:-(Math.sqrt(1-t*t)-1),easeOutCirc:t=>Math.sqrt(1-(t-=1)*t),easeInOutCirc:t=>(t/=.5)<1?-.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-(t-=2)*t)+1),easeInElastic:t=>hi(t)?t:di(t,.075,.3),easeOutElastic:t=>hi(t)?t:ui(t,.075,.3),easeInOutElastic(t){const e=.1125;return hi(t)?t:t<.5?.5*di(2*t,e,.45):.5+.5*ui(2*t-1,e,.45)},easeInBack(t){const e=1.70158;return t*t*((e+1)*t-e)},easeOutBack(t){const e=1.70158;return(t-=1)*t*((e+1)*t+e)+1},easeInOutBack(t){let e=1.70158;return(t/=.5)<1?t*t*((1+(e*=1.525))*t-e)*.5:.5*((t-=2)*t*((1+(e*=1.525))*t+e)+2)},easeInBounce:t=>1-fi.easeOutBounce(1-t),easeOutBounce(t){const e=7.5625,i=2.75;return t<1/i?e*t*t:t<2/i?e*(t-=1.5/i)*t+.75:t<2.5/i?e*(t-=2.25/i)*t+.9375:e*(t-=2.625/i)*t+.984375},easeInOutBounce:t=>t<.5?.5*fi.easeInBounce(2*t):.5*fi.easeOutBounce(2*t-1)+.5},gi="transparent",pi={boolean:(t,e,i)=>i>.5?e:t,color(t,e,i){const n=W(t||gi),o=n.valid&&W(e||gi);return o&&o.valid?o.mix(n,i).hexString():e},number:(t,e,i)=>t+(e-t)*i};class mi{constructor(t,e,i,n){const o=e[i];n=Ie([t.to,n,o,t.from]);const s=Ie([t.from,o,n]);this._active=!0,this._fn=t.fn||pi[t.type||typeof s],this._easing=fi[t.easing]||fi.linear,this._start=Math.floor(Date.now()+(t.delay||0)),this._duration=this._total=Math.floor(t.duration),this._loop=!!t.loop,this._target=e,this._prop=i,this._from=s,this._to=n,this._promises=void 0}active(){return this._active}update(t,e,i){const n=this;if(n._active){n._notify(!1);const o=n._target[n._prop],s=i-n._start,a=n._duration-s;n._start=i,n._duration=Math.floor(Math.max(a,t.duration)),n._total+=s,n._loop=!!t.loop,n._to=Ie([t.to,e,o,t.from]),n._from=Ie([t.from,o,e])}}cancel(){const t=this;t._active&&(t.tick(Date.now()),t._active=!1,t._notify(!1))}tick(t){const e=this,i=t-e._start,n=e._duration,o=e._prop,s=e._from,a=e._loop,r=e._to;let l;if(e._active=s!==r&&(a||i<n),!e._active)return e._target[o]=r,void e._notify(!0);i<0?e._target[o]=s:(l=i/n%2,l=a&&l>1?2-l:l,l=e._easing(Math.min(1,Math.max(0,l))),e._target[o]=e._fn(s,r,l))}wait(){const t=this._promises||(this._promises=[]);return new Promise(((e,i)=>{t.push({res:e,rej:i})}))}_notify(t){const e=t?"res":"rej",i=this._promises||[];for(let t=0;t<i.length;t++)i[t][e]()}}mt.set("animation",{delay:void 0,duration:1e3,easing:"easeOutQuart",fn:void 0,from:void 0,loop:void 0,to:void 0,type:void 0});const xi=Object.keys(mt.animation);mt.describe("animation",{_fallback:!1,_indexable:!1,_scriptable:t=>"onProgress"!==t&&"onComplete"!==t&&"fn"!==t}),mt.set("animations",{colors:{type:"color",properties:["color","borderColor","backgroundColor"]},numbers:{type:"number",properties:["x","y","borderWidth","radius","tension"]}}),mt.describe("animations",{_fallback:"animation"}),mt.set("transitions",{active:{animation:{duration:400}},resize:{animation:{duration:0}},show:{animations:{colors:{from:"transparent"},visible:{type:"boolean",duration:0}}},hide:{animations:{colors:{to:"transparent"},visible:{type:"boolean",easing:"linear",fn:t=>0|t}}}});class bi{constructor(t,e){this._chart=t,this._properties=new Map,this.configure(e)}configure(t){if(!U(t))return;const e=this._properties;Object.getOwnPropertyNames(t).forEach((i=>{const n=t[i];if(!U(n))return;const o={};for(const t of xi)o[t]=n[t];(Y(n.properties)&&n.properties||[i]).forEach((t=>{t!==i&&e.has(t)||e.set(t,o)}))}))}_animateOptions(t,e){const i=e.options,n=function(t,e){if(!e)return;let i=t.options;if(!i)return void(t.options=e);i.$shared&&(t.options=i=Object.assign({},i,{$shared:!1,$animations:{}}));return i}(t,i);if(!n)return[];const o=this._createAnimations(n,i);return i.$shared&&function(t,e){const i=[],n=Object.keys(e);for(let e=0;e<n.length;e++){const o=t[n[e]];o&&o.active()&&i.push(o.wait())}return Promise.all(i)}(t.options.$animations,i).then((()=>{t.options=i}),(()=>{})),o}_createAnimations(t,e){const i=this._properties,n=[],o=t.$animations||(t.$animations={}),s=Object.keys(e),a=Date.now();let r;for(r=s.length-1;r>=0;--r){const l=s[r];if("$"===l.charAt(0))continue;if("options"===l){n.push(...this._animateOptions(t,e));continue}const c=e[l];let h=o[l];const d=i.get(l);if(h){if(d&&h.active()){h.update(d,c,a);continue}h.cancel()}d&&d.duration?(o[l]=h=new mi(d,t,l,c),n.push(h)):t[l]=c}return n}update(t,e){if(0===this._properties.size)return void Object.assign(t,e);const i=this._createAnimations(t,e);return i.length?(a.add(this._chart,i),!0):void 0}}function _i(t,e){const i=t&&t.options||{},n=i.reverse,o=void 0===i.min?e:0,s=void 0===i.max?e:0;return{start:n?s:o,end:n?o:s}}function yi(t,e){const i=[],n=t._getSortedDatasetMetas(e);let o,s;for(o=0,s=n.length;o<s;++o)i.push(n[o].index);return i}function vi(t,e,i,n){const o=t.keys,s="single"===n.mode;let a,r,l,c;if(null!==e){for(a=0,r=o.length;a<r;++a){if(l=+o[a],l===i){if(n.all)continue;break}c=t.values[l],X(c)&&(s||0===e||Pt(e)===Pt(c))&&(e+=c)}return e}}function Mi(t,e){const i=t&&t.options.stacked;return i||void 0===i&&void 0!==e.stack}function wi(t,e,i){const n=t[e]||(t[e]={});return n[i]||(n[i]={})}function ki(t,e){const{chart:i,_cachedMeta:n}=t,o=i._stacks||(i._stacks={}),{iScale:s,vScale:a,index:r}=n,l=s.axis,c=a.axis,h=function(t,e,i){return t.id+"."+e.id+"."+i.stack+"."+i.type}(s,a,n),d=e.length;let u;for(let t=0;t<d;++t){const i=e[t],{[l]:n,[c]:s}=i;u=(i._stacks||(i._stacks={}))[c]=wi(o,h,n),u[r]=s}}function Si(t,e){const i=t.scales;return Object.keys(i).filter((t=>i[t].axis===e)).shift()}function Pi(t,e){e=e||t._parsed;for(const i of e){const e=i._stacks;if(!e||void 0===e[t.vScale.id]||void 0===e[t.vScale.id][t.index])return;delete e[t.vScale.id][t.index]}}const Di=t=>"reset"===t||"none"===t,Ci=(t,e)=>e?t:Object.assign({},t);class Ai{constructor(t,e){this.chart=t,this._ctx=t.ctx,this.index=e,this._cachedDataOpts={},this._cachedMeta=this.getMeta(),this._type=this._cachedMeta.type,this.options=void 0,this._parsing=!1,this._data=void 0,this._objectData=void 0,this._sharedOptions=void 0,this._drawStart=void 0,this._drawCount=void 0,this.enableOptionSharing=!1,this.$context=void 0,this.initialize()}initialize(){const t=this,e=t._cachedMeta;t.configure(),t.linkScales(),e._stacked=Mi(e.vScale,e),t.addElements()}updateIndex(t){this.index=t}linkScales(){const t=this,e=t.chart,i=t._cachedMeta,n=t.getDataset(),o=(t,e,i,n)=>"x"===t?e:"r"===t?n:i,s=i.xAxisID=K(n.xAxisID,Si(e,"x")),a=i.yAxisID=K(n.yAxisID,Si(e,"y")),r=i.rAxisID=K(n.rAxisID,Si(e,"r")),l=i.indexAxis,c=i.iAxisID=o(l,s,a,r),h=i.vAxisID=o(l,a,s,r);i.xScale=t.getScaleForId(s),i.yScale=t.getScaleForId(a),i.rScale=t.getScaleForId(r),i.iScale=t.getScaleForId(c),i.vScale=t.getScaleForId(h)}getDataset(){return this.chart.data.datasets[this.index]}getMeta(){return this.chart.getDatasetMeta(this.index)}getScaleForId(t){return this.chart.scales[t]}_getOtherScale(t){const e=this._cachedMeta;return t===e.iScale?e.vScale:e.iScale}reset(){this._update("reset")}_destroy(){const t=this._cachedMeta;this._data&&re(this._data,this),t._stacked&&Pi(t)}_dataCheck(){const t=this,e=t.getDataset(),i=e.data||(e.data=[]);U(i)?t._data=function(t){const e=Object.keys(t),i=new Array(e.length);let n,o,s;for(n=0,o=e.length;n<o;++n)s=e[n],i[n]={x:s,y:t[s]};return i}(i):t._data!==i&&(t._data&&(re(t._data,t),Pi(t._cachedMeta)),i&&Object.isExtensible(i)&&ae(i,t),t._data=i)}addElements(){const t=this,e=t._cachedMeta;t._dataCheck(),t.datasetElementType&&(e.dataset=new t.datasetElementType)}buildOrUpdateElements(t){const e=this,i=e._cachedMeta,n=e.getDataset();let o=!1;e._dataCheck(),i._stacked=Mi(i.vScale,i),i.stack!==n.stack&&(o=!0,Pi(i),i.stack=n.stack),e._resyncElements(t),o&&ki(e,i._parsed)}configure(){const t=this,e=t.chart.config,i=e.datasetScopeKeys(t._type),n=e.getOptionScopes(t.getDataset(),i,!0);t.options=e.createResolver(n,t.getContext()),t._parsing=t.options.parsing}parse(t,e){const i=this,{_cachedMeta:n,_data:o}=i,{iScale:s,_stacked:a}=n,r=s.axis;let l,c,h,d=0===t&&e===o.length||n._sorted,u=t>0&&n._parsed[t-1];if(!1===i._parsing)n._parsed=o,n._sorted=!0;else{h=Y(o[t])?i.parseArrayData(n,o,t,e):U(o[t])?i.parseObjectData(n,o,t,e):i.parsePrimitiveData(n,o,t,e);const s=()=>null===c[r]||u&&c[r]<u[r];for(l=0;l<e;++l)n._parsed[l+t]=c=h[l],d&&(s()&&(d=!1),u=c);n._sorted=d}a&&ki(i,h)}parsePrimitiveData(t,e,i,n){const{iScale:o,vScale:s}=t,a=o.axis,r=s.axis,l=o.getLabels(),c=o===s,h=new Array(n);let d,u,f;for(d=0,u=n;d<u;++d)f=d+i,h[d]={[a]:c||o.parse(l[f],f),[r]:s.parse(e[f],f)};return h}parseArrayData(t,e,i,n){const{xScale:o,yScale:s}=t,a=new Array(n);let r,l,c,h;for(r=0,l=n;r<l;++r)c=r+i,h=e[c],a[r]={x:o.parse(h[0],c),y:s.parse(h[1],c)};return a}parseObjectData(t,e,i,n){const{xScale:o,yScale:s}=t,{xAxisKey:a="x",yAxisKey:r="y"}=this._parsing,l=new Array(n);let c,h,d,u;for(c=0,h=n;c<h;++c)d=c+i,u=e[d],l[c]={x:o.parse(lt(u,a),d),y:s.parse(lt(u,r),d)};return l}getParsed(t){return this._cachedMeta._parsed[t]}getDataElement(t){return this._cachedMeta.data[t]}applyStack(t,e,i){const n=this.chart,o=this._cachedMeta,s=e[t.axis];return vi({keys:yi(n,!0),values:e._stacks[t.axis]},s,o.index,{mode:i})}updateRangeFromParsed(t,e,i,n){const o=i[e.axis];let s=null===o?NaN:o;const a=n&&i._stacks[e.axis];n&&a&&(n.values=a,t.min=Math.min(t.min,s),t.max=Math.max(t.max,s),s=vi(n,o,this._cachedMeta.index,{all:!0})),t.min=Math.min(t.min,s),t.max=Math.max(t.max,s)}getMinMax(t,e){const i=this,n=i._cachedMeta,o=n._parsed,s=n._sorted&&t===n.iScale,a=o.length,r=i._getOtherScale(t),l=e&&n._stacked&&{keys:yi(i.chart,!0),values:null},c={min:Number.POSITIVE_INFINITY,max:Number.NEGATIVE_INFINITY},{min:h,max:d}=function(t){const{min:e,max:i,minDefined:n,maxDefined:o}=t.getUserBounds();return{min:n?e:Number.NEGATIVE_INFINITY,max:o?i:Number.POSITIVE_INFINITY}}(r);let u,f,g,p;function m(){return g=o[u],f=g[t.axis],p=g[r.axis],!X(f)||h>p||d<p}for(u=0;u<a&&(m()||(i.updateRangeFromParsed(c,t,g,l),!s));++u);if(s)for(u=a-1;u>=0;--u)if(!m()){i.updateRangeFromParsed(c,t,g,l);break}return c}getAllParsedValues(t){const e=this._cachedMeta._parsed,i=[];let n,o,s;for(n=0,o=e.length;n<o;++n)s=e[n][t.axis],X(s)&&i.push(s);return i}getMaxOverflow(){return!1}getLabelAndValue(t){const e=this._cachedMeta,i=e.iScale,n=e.vScale,o=this.getParsed(t);return{label:i?""+i.getLabelForValue(o[i.axis]):"",value:n?""+n.getLabelForValue(o[n.axis]):""}}_update(t){const e=this,i=e._cachedMeta;e.configure(),e._cachedDataOpts={},e.update(t||"default"),i._clip=function(t){let e,i,n,o;return U(t)?(e=t.top,i=t.right,n=t.bottom,o=t.left):e=i=n=o=t,{top:e,right:i,bottom:n,left:o}}(K(e.options.clip,function(t,e,i){if(!1===i)return!1;const n=_i(t,i),o=_i(e,i);return{top:o.end,right:n.end,bottom:o.start,left:n.start}}(i.xScale,i.yScale,e.getMaxOverflow())))}update(t){}draw(){const t=this,e=t._ctx,i=t.chart,n=t._cachedMeta,o=n.data||[],s=i.chartArea,a=[],r=t._drawStart||0,l=t._drawCount||o.length-r;let c;for(n.dataset&&n.dataset.draw(e,s,r,l),c=r;c<r+l;++c){const t=o[c];t.active?a.push(t):t.draw(e,s)}for(c=0;c<a.length;++c)a[c].draw(e,s)}getStyle(t,e){const i=e?"active":"default";return void 0===t&&this._cachedMeta.dataset?this.resolveDatasetElementOptions(i):this.resolveDataElementOptions(t||0,i)}getContext(t,e,i){const n=this,o=n.getDataset();let s;if(t>=0&&t<n._cachedMeta.data.length){const e=n._cachedMeta.data[t];s=e.$context||(e.$context=function(t,e,i){return Object.assign(Object.create(t),{active:!1,dataIndex:e,parsed:void 0,raw:void 0,element:i,index:e,mode:"default",type:"data"})}(n.getContext(),t,e)),s.parsed=n.getParsed(t),s.raw=o.data[t]}else s=n.$context||(n.$context=function(t,e){return Object.assign(Object.create(t),{active:!1,dataset:void 0,datasetIndex:e,index:e,mode:"default",type:"dataset"})}(n.chart.getContext(),n.index)),s.dataset=o;return s.active=!!e,s.mode=i,s}resolveDatasetElementOptions(t){return this._resolveElementOptions(this.datasetElementType.id,t)}resolveDataElementOptions(t,e){return this._resolveElementOptions(this.dataElementType.id,e,t)}_resolveElementOptions(t,e="default",i){const n=this,o="active"===e,s=n._cachedDataOpts,a=t+"-"+e,r=s[a],l=n.enableOptionSharing&&ht(i);if(r)return Ci(r,l);const c=n.chart.config,h=c.datasetElementScopeKeys(n._type,t),d=o?[t+"Hover","hover",t,""]:[t,""],u=c.getOptionScopes(n.getDataset(),h),f=Object.keys(mt.elements[t]),g=c.resolveNamedOptions(u,f,(()=>n.getContext(i,o)),d);return g.$shared&&(g.$shared=l,s[a]=Object.freeze(Ci(g,l))),g}_resolveAnimations(t,e,i){const n=this,o=n.chart,s=n._cachedDataOpts,a="animation-"+e,r=s[a];if(r)return r;let l;if(!1!==o.options.animation){const o=n.chart.config,s=o.datasetAnimationScopeKeys(n._type,e),a=o.getOptionScopes(n.getDataset(),s);l=o.createResolver(a,n.getContext(t,i,e))}const c=new bi(o,l&&l.animations);return l&&l._cacheable&&(s[a]=Object.freeze(c)),c}getSharedOptions(t){if(t.$shared)return this._sharedOptions||(this._sharedOptions=Object.assign({},t))}includeOptions(t,e){return!e||Di(t)||this.chart._animationsDisabled}updateElement(t,e,i,n){Di(n)?Object.assign(t,i):this._resolveAnimations(e,n).update(t,i)}updateSharedOptions(t,e,i){t&&!Di(e)&&this._resolveAnimations(void 0,e).update(t,i)}_setStyle(t,e,i,n){t.active=n;const o=this.getStyle(e,n);this._resolveAnimations(e,i,n).update(t,{options:!n&&this.getSharedOptions(o)||o})}removeHoverStyle(t,e,i){this._setStyle(t,i,"active",!1)}setHoverStyle(t,e,i){this._setStyle(t,i,"active",!0)}_removeDatasetHoverStyle(){const t=this._cachedMeta.dataset;t&&this._setStyle(t,void 0,"active",!1)}_setDatasetHoverStyle(){const t=this._cachedMeta.dataset;t&&this._setStyle(t,void 0,"active",!0)}_resyncElements(t){const e=this,i=e._cachedMeta.data.length,n=e._data.length;n>i?e._insertElements(i,n-i,t):n<i&&e._removeElements(n,i-n);const o=Math.min(n,i);o&&e.parse(0,o)}_insertElements(t,e,i=!0){const n=this,o=n._cachedMeta,s=o.data,a=t+e;let r;const l=t=>{for(t.length+=e,r=t.length-1;r>=a;r--)t[r]=t[r-e]};for(l(s),r=t;r<a;++r)s[r]=new n.dataElementType;n._parsing&&l(o._parsed),n.parse(t,e),i&&n.updateElements(s,t,e,"reset")}updateElements(t,e,i,n){}_removeElements(t,e){const i=this._cachedMeta;if(this._parsing){const n=i._parsed.splice(t,e);i._stacked&&Pi(i,n)}i.data.splice(t,e)}_onDataPush(){const t=arguments.length;this._insertElements(this.getDataset().data.length-t,t)}_onDataPop(){this._removeElements(this._cachedMeta.data.length-1,1)}_onDataShift(){this._removeElements(0,1)}_onDataSplice(t,e){this._removeElements(t,e),this._insertElements(t,arguments.length-2)}_onDataUnshift(){this._insertElements(0,arguments.length)}}Ai.defaults={},Ai.prototype.datasetElementType=null,Ai.prototype.dataElementType=null;class Oi{constructor(){this.x=void 0,this.y=void 0,this.active=!1,this.options=void 0,this.$animations=void 0}tooltipPosition(t){const{x:e,y:i}=this.getProps(["x","y"],t);return{x:e,y:i}}hasValue(){return At(this.x)&&At(this.y)}getProps(t,e){const i=this,n=this.$animations;if(!e||!n)return i;const o={};return t.forEach((t=>{o[t]=n[t]&&n[t].active()?n[t]._to:i[t]})),o}}Oi.defaults={},Oi.defaultRoutes=void 0;const Ti=new Map;function Li(t,e,i){return function(t,e){e=e||{};const i=t+JSON.stringify(e);let n=Ti.get(i);return n||(n=new Intl.NumberFormat(t,e),Ti.set(i,n)),n}(e,i).format(t)}const Ri={values:t=>Y(t)?t:""+t,numeric(t,e,i){if(0===t)return"0";const n=this.chart.options.locale;let o,s=t;if(i.length>1){const e=Math.max(Math.abs(i[0].value),Math.abs(i[i.length-1].value));(e<1e-4||e>1e15)&&(o="scientific"),s=function(t,e){let i=e.length>3?e[2].value-e[1].value:e[1].value-e[0].value;Math.abs(i)>1&&t!==Math.floor(t)&&(i=t-Math.floor(t));return i}(t,i)}const a=St(Math.abs(s)),r=Math.max(Math.min(-1*Math.floor(a),20),0),l={notation:o,minimumFractionDigits:r,maximumFractionDigits:r};return Object.assign(l,this.options.ticks.format),Li(t,n,l)},logarithmic(t,e,i){if(0===t)return"0";const n=t/Math.pow(10,Math.floor(St(t)));return 1===n||2===n||5===n?Ri.numeric.call(this,t,e,i):""}};var Ei={formatters:Ri};function Ii(t,e){const i=t.options.ticks,n=i.maxTicksLimit||function(t){const e=t.options.offset,i=t._tickSize(),n=t._length/i+(e?0:1),o=t._maxLength/i;return Math.floor(Math.min(n,o))}(t),o=i.major.enabled?function(t){const e=[];let i,n;for(i=0,n=t.length;i<n;i++)t[i].major&&e.push(i);return e}(e):[],s=o.length,a=o[0],r=o[s-1],l=[];if(s>n)return function(t,e,i,n){let o,s=0,a=i[0];for(n=Math.ceil(n),o=0;o<t.length;o++)o===a&&(e.push(t[o]),s++,a=i[s*n])}(e,l,o,s/n),l;const c=function(t,e,i){const n=function(t){const e=t.length;let i,n;if(e<2)return!1;for(n=t[0],i=1;i<e;++i)if(t[i]-t[i-1]!==n)return!1;return n}(t),o=e.length/i;if(!n)return Math.max(o,1);const s=Ct(n);for(let t=0,e=s.length-1;t<e;t++){const e=s[t];if(e>o)return e}return Math.max(o,1)}(o,e,n);if(s>0){let t,i;const n=s>1?Math.round((r-a)/(s-1)):null;for(Fi(e,l,c,$(n)?0:a-n,a),t=0,i=s-1;t<i;t++)Fi(e,l,c,o[t],o[t+1]);return Fi(e,l,c,r,$(n)?e.length:r+n),l}return Fi(e,l,c),l}function Fi(t,e,i,n,o){const s=K(n,0),a=Math.min(K(o,t.length),t.length);let r,l,c,h=0;for(i=Math.ceil(i),o&&(r=o-n,i=r/Math.floor(r/i)),c=s;c<0;)h++,c=Math.round(s+h*i);for(l=Math.max(s,0);l<a;l++)l===c&&(e.push(t[l]),h++,c=Math.round(s+h*i))}mt.set("scale",{display:!0,offset:!1,reverse:!1,beginAtZero:!1,bounds:"ticks",grace:0,grid:{display:!0,lineWidth:1,drawBorder:!0,drawOnChartArea:!0,drawTicks:!0,tickLength:8,tickWidth:(t,e)=>e.lineWidth,tickColor:(t,e)=>e.color,offset:!1,borderDash:[],borderDashOffset:0,borderColor:(t,e)=>e.color,borderWidth:(t,e)=>e.lineWidth},title:{display:!1,text:"",padding:{top:4,bottom:4}},ticks:{minRotation:0,maxRotation:50,mirror:!1,textStrokeWidth:0,textStrokeColor:"",padding:3,display:!0,autoSkip:!0,autoSkipPadding:3,labelOffset:0,callback:Ei.formatters.values,minor:{},major:{},align:"center",crossAlign:"near"}}),mt.route("scale.ticks","color","","color"),mt.route("scale.grid","color","","borderColor"),mt.route("scale.title","color","","color"),mt.describe("scale",{_fallback:!1,_scriptable:t=>!t.startsWith("before")&&!t.startsWith("after")&&"callback"!==t&&"parser"!==t,_indexable:t=>"borderDash"!==t&&"tickBorderDash"!==t}),mt.describe("scales",{_fallback:"scale"});const zi=(t,e,i)=>"top"===e||"left"===e?t[e]+i:t[e]-i;function Vi(t,e){const i=[],n=t.length/e,o=t.length;let s=0;for(;s<o;s+=n)i.push(t[Math.floor(s)]);return i}function Bi(t,e,i){const n=t.ticks.length,o=Math.min(e,n-1),s=t._startPixel,a=t._endPixel,r=1e-6;let l,c=t.getPixelForTick(o);if(!(i&&(l=1===n?Math.max(c-s,a-c):0===e?(t.getPixelForTick(1)-c)/2:(c-t.getPixelForTick(o-1))/2,c+=o<e?l:-l,c<s-r||c>a+r)))return c}function Wi(t){return t.drawTicks?t.tickLength:0}function Hi(t,e){if(!t.display)return 0;const i=Ee(t.font,e),n=Re(t.padding);return(Y(t.text)?t.text.length:1)*i.lineHeight+n.height}function Ni(t,e,i){let o=n(t);return(i&&"right"!==e||!i&&"right"===e)&&(o=(t=>"left"===t?"right":"right"===t?"left":t)(o)),o}class ji extends Oi{constructor(t){super(),this.id=t.id,this.type=t.type,this.options=void 0,this.ctx=t.ctx,this.chart=t.chart,this.top=void 0,this.bottom=void 0,this.left=void 0,this.right=void 0,this.width=void 0,this.height=void 0,this._margins={left:0,right:0,top:0,bottom:0},this.maxWidth=void 0,this.maxHeight=void 0,this.paddingTop=void 0,this.paddingBottom=void 0,this.paddingLeft=void 0,this.paddingRight=void 0,this.axis=void 0,this.labelRotation=void 0,this.min=void 0,this.max=void 0,this.ticks=[],this._gridLineItems=null,this._labelItems=null,this._labelSizes=null,this._length=0,this._maxLength=0,this._longestTextCache={},this._startPixel=void 0,this._endPixel=void 0,this._reversePixels=!1,this._userMax=void 0,this._userMin=void 0,this._suggestedMax=void 0,this._suggestedMin=void 0,this._ticksLength=0,this._borderValue=0,this._cache={},this._dataLimitsCached=!1,this.$context=void 0}init(t){const e=this;e.options=t,e.axis=t.axis,e._userMin=e.parse(t.min),e._userMax=e.parse(t.max),e._suggestedMin=e.parse(t.suggestedMin),e._suggestedMax=e.parse(t.suggestedMax)}parse(t,e){return t}getUserBounds(){let{_userMin:t,_userMax:e,_suggestedMin:i,_suggestedMax:n}=this;return t=q(t,Number.POSITIVE_INFINITY),e=q(e,Number.NEGATIVE_INFINITY),i=q(i,Number.POSITIVE_INFINITY),n=q(n,Number.NEGATIVE_INFINITY),{min:q(t,i),max:q(e,n),minDefined:X(t),maxDefined:X(e)}}getMinMax(t){const e=this;let i,{min:n,max:o,minDefined:s,maxDefined:a}=e.getUserBounds();if(s&&a)return{min:n,max:o};const r=e.getMatchingVisibleMetas();for(let l=0,c=r.length;l<c;++l)i=r[l].controller.getMinMax(e,t),s||(n=Math.min(n,i.min)),a||(o=Math.max(o,i.max));return{min:q(n,q(o,n)),max:q(o,q(n,o))}}getPadding(){const t=this;return{left:t.paddingLeft||0,top:t.paddingTop||0,right:t.paddingRight||0,bottom:t.paddingBottom||0}}getTicks(){return this.ticks}getLabels(){const t=this.chart.data;return this.options.labels||(this.isHorizontal()?t.xLabels:t.yLabels)||t.labels||[]}beforeLayout(){this._cache={},this._dataLimitsCached=!1}beforeUpdate(){Q(this.options.beforeUpdate,[this])}update(t,e,i){const n=this,o=n.options.ticks,s=o.sampleSize;n.beforeUpdate(),n.maxWidth=t,n.maxHeight=e,n._margins=i=Object.assign({left:0,right:0,top:0,bottom:0},i),n.ticks=null,n._labelSizes=null,n._gridLineItems=null,n._labelItems=null,n.beforeSetDimensions(),n.setDimensions(),n.afterSetDimensions(),n._maxLength=n.isHorizontal()?n.width+i.left+i.right:n.height+i.top+i.bottom,n._dataLimitsCached||(n.beforeDataLimits(),n.determineDataLimits(),n.afterDataLimits(),n._dataLimitsCached=!0),n.beforeBuildTicks(),n.ticks=n.buildTicks()||[],n.afterBuildTicks();const a=s<n.ticks.length;n._convertTicksToLabels(a?Vi(n.ticks,s):n.ticks),n.configure(),n.beforeCalculateLabelRotation(),n.calculateLabelRotation(),n.afterCalculateLabelRotation(),o.display&&(o.autoSkip||"auto"===o.source)&&(n.ticks=Ii(n,n.ticks),n._labelSizes=null),a&&n._convertTicksToLabels(n.ticks),n.beforeFit(),n.fit(),n.afterFit(),n.afterUpdate()}configure(){const t=this;let e,i,n=t.options.reverse;t.isHorizontal()?(e=t.left,i=t.right):(e=t.top,i=t.bottom,n=!n),t._startPixel=e,t._endPixel=i,t._reversePixels=n,t._length=i-e,t._alignToPixels=t.options.alignToPixels}afterUpdate(){Q(this.options.afterUpdate,[this])}beforeSetDimensions(){Q(this.options.beforeSetDimensions,[this])}setDimensions(){const t=this;t.isHorizontal()?(t.width=t.maxWidth,t.left=0,t.right=t.width):(t.height=t.maxHeight,t.top=0,t.bottom=t.height),t.paddingLeft=0,t.paddingTop=0,t.paddingRight=0,t.paddingBottom=0}afterSetDimensions(){Q(this.options.afterSetDimensions,[this])}_callHooks(t){const e=this;e.chart.notifyPlugins(t,e.getContext()),Q(e.options[t],[e])}beforeDataLimits(){this._callHooks("beforeDataLimits")}determineDataLimits(){}afterDataLimits(){this._callHooks("afterDataLimits")}beforeBuildTicks(){this._callHooks("beforeBuildTicks")}buildTicks(){return[]}afterBuildTicks(){this._callHooks("afterBuildTicks")}beforeTickToLabelConversion(){Q(this.options.beforeTickToLabelConversion,[this])}generateTickLabels(t){const e=this,i=e.options.ticks;let n,o,s;for(n=0,o=t.length;n<o;n++)s=t[n],s.label=Q(i.callback,[s.value,n,t],e)}afterTickToLabelConversion(){Q(this.options.afterTickToLabelConversion,[this])}beforeCalculateLabelRotation(){Q(this.options.beforeCalculateLabelRotation,[this])}calculateLabelRotation(){const t=this,e=t.options,i=e.ticks,n=t.ticks.length,o=i.minRotation||0,s=i.maxRotation;let a,r,l,c=o;if(!t._isVisible()||!i.display||o>=s||n<=1||!t.isHorizontal())return void(t.labelRotation=o);const h=t._getLabelSizes(),d=h.widest.width,u=h.highest.height,f=Ht(t.chart.width-d,0,t.maxWidth);a=e.offset?t.maxWidth/n:f/(n-1),d+6>a&&(a=f/(n-(e.offset?.5:1)),r=t.maxHeight-Wi(e.grid)-i.padding-Hi(e.title,t.chart.options.font),l=Math.sqrt(d*d+u*u),c=Et(Math.min(Math.asin(Math.min((h.highest.height+6)/a,1)),Math.asin(Math.min(r/l,1))-Math.asin(u/l))),c=Math.max(o,Math.min(s,c))),t.labelRotation=c}afterCalculateLabelRotation(){Q(this.options.afterCalculateLabelRotation,[this])}beforeFit(){Q(this.options.beforeFit,[this])}fit(){const t=this,e={width:0,height:0},{chart:i,options:{ticks:n,title:o,grid:s}}=t,a=t._isVisible(),r=t.isHorizontal();if(a){const a=Hi(o,i.options.font);if(r?(e.width=t.maxWidth,e.height=Wi(s)+a):(e.height=t.maxHeight,e.width=Wi(s)+a),n.display&&t.ticks.length){const{first:i,last:o,widest:s,highest:a}=t._getLabelSizes(),l=2*n.padding,c=Rt(t.labelRotation),h=Math.cos(c),d=Math.sin(c);if(r){const i=d*s.width+h*a.height;e.height=Math.min(t.maxHeight,e.height+i+l)}else{const i=n.mirror?0:h*s.width+d*a.height;e.width=Math.min(t.maxWidth,e.width+i+l)}t._calculatePadding(i,o,d,h)}}t._handleMargins(),r?(t.width=t._length=i.width-t._margins.left-t._margins.right,t.height=e.height):(t.width=e.width,t.height=t._length=i.height-t._margins.top-t._margins.bottom)}_calculatePadding(t,e,i,n){const o=this,{ticks:{align:s,padding:a},position:r}=o.options,l=0!==o.labelRotation,c="top"!==r&&"x"===o.axis;if(o.isHorizontal()){const r=o.getPixelForTick(0)-o.left,h=o.right-o.getPixelForTick(o.ticks.length-1);let d=0,u=0;l?c?(d=n*t.width,u=i*e.height):(d=i*t.height,u=n*e.width):"start"===s?u=e.width:"end"===s?d=t.width:(d=t.width/2,u=e.width/2),o.paddingLeft=Math.max((d-r+a)*o.width/(o.width-r),0),o.paddingRight=Math.max((u-h+a)*o.width/(o.width-h),0)}else{let i=e.height/2,n=t.height/2;"start"===s?(i=0,n=t.height):"end"===s&&(i=e.height,n=0),o.paddingTop=i+a,o.paddingBottom=n+a}}_handleMargins(){const t=this;t._margins&&(t._margins.left=Math.max(t.paddingLeft,t._margins.left),t._margins.top=Math.max(t.paddingTop,t._margins.top),t._margins.right=Math.max(t.paddingRight,t._margins.right),t._margins.bottom=Math.max(t.paddingBottom,t._margins.bottom))}afterFit(){Q(this.options.afterFit,[this])}isHorizontal(){const{axis:t,position:e}=this.options;return"top"===e||"bottom"===e||"x"===t}isFullSize(){return this.options.fullSize}_convertTicksToLabels(t){const e=this;e.beforeTickToLabelConversion(),e.generateTickLabels(t),e.afterTickToLabelConversion()}_getLabelSizes(){const t=this;let e=t._labelSizes;if(!e){const i=t.options.ticks.sampleSize;let n=t.ticks;i<n.length&&(n=Vi(n,i)),t._labelSizes=e=t._computeLabelSizes(n,n.length)}return e}_computeLabelSizes(t,e){const{ctx:i,_longestTextCache:n}=this,o=[],s=[];let a,r,l,c,h,d,u,f,g,p,m,x=0,b=0;for(a=0;a<e;++a){if(c=t[a].label,h=this._resolveTickFontOptions(a),i.font=d=h.string,u=n[d]=n[d]||{data:{},gc:[]},f=h.lineHeight,g=p=0,$(c)||Y(c)){if(Y(c))for(r=0,l=c.length;r<l;++r)m=c[r],$(m)||Y(m)||(g=$t(i,u.data,u.gc,g,m),p+=f)}else g=$t(i,u.data,u.gc,g,c),p=f;o.push(g),s.push(p),x=Math.max(g,x),b=Math.max(p,b)}!function(t,e){J(t,(t=>{const i=t.gc,n=i.length/2;let o;if(n>e){for(o=0;o<n;++o)delete t.data[i[o]];i.splice(0,n)}}))}(n,e);const _=o.indexOf(x),y=s.indexOf(b),v=t=>({width:o[t]||0,height:s[t]||0});return{first:v(0),last:v(e-1),widest:v(_),highest:v(y)}}getLabelForValue(t){return t}getPixelForValue(t,e){return NaN}getValueForPixel(t){}getPixelForTick(t){const e=this.ticks;return t<0||t>e.length-1?null:this.getPixelForValue(e[t].value)}getPixelForDecimal(t){const e=this;e._reversePixels&&(t=1-t);const i=e._startPixel+t*e._length;return Nt(e._alignToPixels?Ut(e.chart,i,0):i)}getDecimalForPixel(t){const e=(t-this._startPixel)/this._length;return this._reversePixels?1-e:e}getBasePixel(){return this.getPixelForValue(this.getBaseValue())}getBaseValue(){const{min:t,max:e}=this;return t<0&&e<0?e:t>0&&e>0?t:0}getContext(t){const e=this,i=e.ticks||[];if(t>=0&&t<i.length){const n=i[t];return n.$context||(n.$context=function(t,e,i){return Object.assign(Object.create(t),{tick:i,index:e,type:"tick"})}(e.getContext(),t,n))}return e.$context||(e.$context=(n=e.chart.getContext(),o=e,Object.assign(Object.create(n),{scale:o,type:"scale"})));var n,o}_tickSize(){const t=this,e=t.options.ticks,i=Rt(t.labelRotation),n=Math.abs(Math.cos(i)),o=Math.abs(Math.sin(i)),s=t._getLabelSizes(),a=e.autoSkipPadding||0,r=s?s.widest.width+a:0,l=s?s.highest.height+a:0;return t.isHorizontal()?l*n>r*o?r/n:l/o:l*o<r*n?l/n:r/o}_isVisible(){const t=this.options.display;return"auto"!==t?!!t:this.getMatchingVisibleMetas().length>0}_computeGridLineItems(t){const e=this,i=e.axis,n=e.chart,o=e.options,{grid:s,position:a}=o,r=s.offset,l=e.isHorizontal(),c=e.ticks.length+(r?1:0),h=Wi(s),d=[],u=s.setContext(e.getContext(0)),f=u.drawBorder?u.borderWidth:0,g=f/2,p=function(t){return Ut(n,t,f)};let m,x,b,_,y,v,M,w,k,S,P,D;if("top"===a)m=p(e.bottom),v=e.bottom-h,w=m-g,S=p(t.top)+g,D=t.bottom;else if("bottom"===a)m=p(e.top),S=t.top,D=p(t.bottom)-g,v=m+g,w=e.top+h;else if("left"===a)m=p(e.right),y=e.right-h,M=m-g,k=p(t.left)+g,P=t.right;else if("right"===a)m=p(e.left),k=t.left,P=p(t.right)-g,y=m+g,M=e.left+h;else if("x"===i){if("center"===a)m=p((t.top+t.bottom)/2+.5);else if(U(a)){const t=Object.keys(a)[0],i=a[t];m=p(e.chart.scales[t].getPixelForValue(i))}S=t.top,D=t.bottom,v=m+g,w=v+h}else if("y"===i){if("center"===a)m=p((t.left+t.right)/2);else if(U(a)){const t=Object.keys(a)[0],i=a[t];m=p(e.chart.scales[t].getPixelForValue(i))}y=m-g,M=y-h,k=t.left,P=t.right}for(x=0;x<c;++x){const t=s.setContext(e.getContext(x)),i=t.lineWidth,o=t.color,a=s.borderDash||[],c=t.borderDashOffset,h=t.tickWidth,u=t.tickColor,f=t.tickBorderDash||[],g=t.tickBorderDashOffset;b=Bi(e,x,r),void 0!==b&&(_=Ut(n,b,i),l?y=M=k=P=_:v=w=S=D=_,d.push({tx1:y,ty1:v,tx2:M,ty2:w,x1:k,y1:S,x2:P,y2:D,width:i,color:o,borderDash:a,borderDashOffset:c,tickWidth:h,tickColor:u,tickBorderDash:f,tickBorderDashOffset:g}))}return e._ticksLength=c,e._borderValue=m,d}_computeLabelItems(t){const e=this,i=e.axis,n=e.options,{position:o,ticks:s}=n,a=e.isHorizontal(),r=e.ticks,{align:l,crossAlign:c,padding:h}=s,d=Wi(n.grid),u=d+h,f=-Rt(e.labelRotation),g=[];let p,m,x,b,_,y,v,M,w,k,S,P,D="middle";if("top"===o)y=e.bottom-u,v=e._getXAxisLabelAlignment();else if("bottom"===o)y=e.top+u,v=e._getXAxisLabelAlignment();else if("left"===o){const t=this._getYAxisLabelAlignment(d);v=t.textAlign,_=t.x}else if("right"===o){const t=this._getYAxisLabelAlignment(d);v=t.textAlign,_=t.x}else if("x"===i){if("center"===o)y=(t.top+t.bottom)/2+u;else if(U(o)){const t=Object.keys(o)[0],i=o[t];y=e.chart.scales[t].getPixelForValue(i)+u}v=e._getXAxisLabelAlignment()}else if("y"===i){if("center"===o)_=(t.left+t.right)/2-u;else if(U(o)){const t=Object.keys(o)[0],i=o[t];_=e.chart.scales[t].getPixelForValue(i)}v=this._getYAxisLabelAlignment(d).textAlign}"y"===i&&("start"===l?D="top":"end"===l&&(D="bottom"));const C=e._getLabelSizes();for(p=0,m=r.length;p<m;++p){x=r[p],b=x.label;const t=s.setContext(e.getContext(p));M=e.getPixelForTick(p)+s.labelOffset,w=e._resolveTickFontOptions(p),k=w.lineHeight,S=Y(b)?b.length:1;const i=S/2,n=t.color,l=t.textStrokeColor,h=t.textStrokeWidth;a?(_=M,P="top"===o?"near"===c||0!==f?-S*k+k/2:"center"===c?-C.highest.height/2-i*k+k:-C.highest.height+k/2:"near"===c||0!==f?k/2:"center"===c?C.highest.height/2-i*k:C.highest.height-S*k):(y=M,P=(1-S)*k/2),g.push({rotation:f,label:b,font:w,color:n,strokeColor:l,strokeWidth:h,textOffset:P,textAlign:v,textBaseline:D,translation:[_,y]})}return g}_getXAxisLabelAlignment(){const{position:t,ticks:e}=this.options;if(-Rt(this.labelRotation))return"top"===t?"left":"right";let i="center";return"start"===e.align?i="left":"end"===e.align&&(i="right"),i}_getYAxisLabelAlignment(t){const e=this,{position:i,ticks:{crossAlign:n,mirror:o,padding:s}}=e.options,a=t+s,r=e._getLabelSizes().widest.width;let l,c;return"left"===i?o?(l="left",c=e.right-s):(c=e.right-a,"near"===n?l="right":"center"===n?(l="center",c-=r/2):(l="left",c=e.left)):"right"===i?o?(l="right",c=e.left+s):(c=e.left+a,"near"===n?l="left":"center"===n?(l="center",c+=r/2):(l="right",c=e.right)):l="right",{textAlign:l,x:c}}_computeLabelArea(){const t=this;if(t.options.ticks.mirror)return;const e=t.chart,i=t.options.position;return"left"===i||"right"===i?{top:0,left:t.left,bottom:e.height,right:t.right}:"top"===i||"bottom"===i?{top:t.top,left:0,bottom:t.bottom,right:e.width}:void 0}drawBackground(){const{ctx:t,options:{backgroundColor:e},left:i,top:n,width:o,height:s}=this;e&&(t.save(),t.fillStyle=e,t.fillRect(i,n,o,s),t.restore())}getLineWidthForValue(t){const e=this,i=e.options.grid;if(!e._isVisible()||!i.display)return 0;const n=e.ticks.findIndex((e=>e.value===t));if(n>=0){return i.setContext(e.getContext(n)).lineWidth}return 0}drawGrid(t){const e=this,i=e.options.grid,n=e.ctx,o=e.chart,s=i.setContext(e.getContext(0)),a=i.drawBorder?s.borderWidth:0,r=e._gridLineItems||(e._gridLineItems=e._computeGridLineItems(t));let l,c;const h=(t,e,i)=>{i.width&&i.color&&(n.save(),n.lineWidth=i.width,n.strokeStyle=i.color,n.setLineDash(i.borderDash||[]),n.lineDashOffset=i.borderDashOffset,n.beginPath(),n.moveTo(t.x,t.y),n.lineTo(e.x,e.y),n.stroke(),n.restore())};if(i.display)for(l=0,c=r.length;l<c;++l){const t=r[l];i.drawOnChartArea&&h({x:t.x1,y:t.y1},{x:t.x2,y:t.y2},t),i.drawTicks&&h({x:t.tx1,y:t.ty1},{x:t.tx2,y:t.ty2},{color:t.tickColor,width:t.tickWidth,borderDash:t.tickBorderDash,borderDashOffset:t.tickBorderDashOffset})}if(a){const t=i.setContext(e.getContext(e._ticksLength-1)),n=t.lineWidth,s=e._borderValue;let r,l,c,d;e.isHorizontal()?(r=Ut(o,e.left,a)-a/2,l=Ut(o,e.right,n)+n/2,c=d=s):(c=Ut(o,e.top,a)-a/2,d=Ut(o,e.bottom,n)+n/2,r=l=s),h({x:r,y:c},{x:l,y:d},{width:a,color:t.borderColor})}}drawLabels(t){const e=this;if(!e.options.ticks.display)return;const i=e.ctx,n=e._computeLabelArea();n&&Gt(i,n);const o=e._labelItems||(e._labelItems=e._computeLabelItems(t));let s,a;for(s=0,a=o.length;s<a;++s){const t=o[s],e=t.font;te(i,t.label,0,t.textOffset,e,t)}n&&Zt(i)}drawTitle(){const{ctx:t,options:{position:e,title:i,reverse:n}}=this;if(!i.display)return;const s=Ee(i.font),a=Re(i.padding),r=i.align;let l=s.lineHeight/2;"bottom"===e?(l+=a.bottom,Y(i.text)&&(l+=s.lineHeight*(i.text.length-1))):l+=a.top;const{titleX:c,titleY:h,maxWidth:d,rotation:u}=function(t,e,i,n){const{top:s,left:a,bottom:r,right:l}=t;let c,h,d,u=0;return t.isHorizontal()?(h=o(n,a,l),d=zi(t,i,e),c=l-a):(h=zi(t,i,e),d=o(n,r,s),u="left"===i?-Mt:Mt),{titleX:h,titleY:d,maxWidth:c,rotation:u}}(this,l,e,r);te(t,i.text,0,0,s,{color:i.color,maxWidth:d,rotation:u,textAlign:Ni(r,e,n),textBaseline:"middle",translation:[c,h]})}draw(t){const e=this;e._isVisible()&&(e.drawBackground(),e.drawGrid(t),e.drawTitle(),e.drawLabels(t))}_layers(){const t=this,e=t.options,i=e.ticks&&e.ticks.z||0,n=e.grid&&e.grid.z||0;return t._isVisible()&&i!==n&&t.draw===ji.prototype.draw?[{z:n,draw(e){t.drawBackground(),t.drawGrid(e),t.drawTitle()}},{z:i,draw(e){t.drawLabels(e)}}]:[{z:i,draw(e){t.draw(e)}}]}getMatchingVisibleMetas(t){const e=this,i=e.chart.getSortedVisibleDatasetMetas(),n=e.axis+"AxisID",o=[];let s,a;for(s=0,a=i.length;s<a;++s){const a=i[s];a[n]!==e.id||t&&a.type!==t||o.push(a)}return o}_resolveTickFontOptions(t){return Ee(this.options.ticks.setContext(this.getContext(t)).font)}}function $i(t,e=[""],i=t,n){ht(n)||(n=en("_fallback",t));const o={[Symbol.toStringTag]:"Object",_cacheable:!0,_scopes:t,_rootScopes:i,_fallback:n,override:o=>$i([o,...t],e,i,n)};return new Proxy(o,{deleteProperty:(e,i)=>(delete e[i],delete e._keys,delete t[0][i],!0),get:(i,n)=>Ki(i,n,(()=>function(t,e,i,n){let o;for(const s of e)if(o=en(Xi(s,t),i),ht(o))return qi(t,o)?Ji(i,n,t,o):o}(n,e,t,i))),getOwnPropertyDescriptor:(t,e)=>Reflect.getOwnPropertyDescriptor(t._scopes[0],e),getPrototypeOf:()=>Reflect.getPrototypeOf(t[0]),has:(t,e)=>nn(t).includes(e),ownKeys:t=>nn(t),set:(e,i,n)=>(t[0][i]=n,delete e[i],delete e._keys,!0)})}function Yi(t,e,i,n){const o={_cacheable:!1,_proxy:t,_context:e,_subProxy:i,_stack:new Set,_descriptors:Ui(t,n),setContext:e=>Yi(t,e,i,n),override:o=>Yi(t.override(o),e,i,n)};return new Proxy(o,{deleteProperty:(e,i)=>(delete e[i],delete t[i],!0),get:(t,e,i)=>Ki(t,e,(()=>function(t,e,i){const{_proxy:n,_context:o,_subProxy:s,_descriptors:a}=t;let r=n[e];dt(r)&&a.isScriptable(e)&&(r=function(t,e,i,n){const{_proxy:o,_context:s,_subProxy:a,_stack:r}=i;if(r.has(t))throw new Error("Recursion detected: "+[...r].join("->")+"->"+t);r.add(t),e=e(s,a||n),r.delete(t),U(e)&&(e=Ji(o._scopes,o,t,e));return e}(e,r,t,i));Y(r)&&r.length&&(r=function(t,e,i,n){const{_proxy:o,_context:s,_subProxy:a,_descriptors:r}=i;if(ht(s.index)&&n(t))e=e[s.index%e.length];else if(U(e[0])){const i=e,n=o._scopes.filter((t=>t!==i));e=[];for(const l of i){const i=Ji(n,o,t,l);e.push(Yi(i,s,a&&a[t],r))}}return e}(e,r,t,a.isIndexable));qi(e,r)&&(r=Yi(r,o,s&&s[e],a));return r}(t,e,i))),getOwnPropertyDescriptor:(e,i)=>e._descriptors.allKeys?Reflect.has(t,i)?{enumerable:!0,configurable:!0}:void 0:Reflect.getOwnPropertyDescriptor(t,i),getPrototypeOf:()=>Reflect.getPrototypeOf(t),has:(e,i)=>Reflect.has(t,i),ownKeys:()=>Reflect.ownKeys(t),set:(e,i,n)=>(t[i]=n,delete e[i],!0)})}function Ui(t,e={scriptable:!0,indexable:!0}){const{_scriptable:i=e.scriptable,_indexable:n=e.indexable,_allKeys:o=e.allKeys}=t;return{allKeys:o,scriptable:i,indexable:n,isScriptable:dt(i)?i:()=>i,isIndexable:dt(n)?n:()=>n}}const Xi=(t,e)=>t?t+ct(e):e,qi=(t,e)=>U(e)&&"adapters"!==t;function Ki(t,e,i){let n=t[e];return ht(n)||(n=i(),ht(n)&&(t[e]=n)),n}function Gi(t,e,i){return dt(t)?t(e,i):t}const Zi=(t,e)=>!0===t?e:"string"==typeof t?lt(e,t):void 0;function Qi(t,e,i,n){for(const o of e){const e=Zi(i,o);if(e){t.add(e);const o=Gi(e._fallback,i,e);if(ht(o)&&o!==i&&o!==n)return o}else if(!1===e&&ht(n)&&i!==n)return null}return!1}function Ji(t,e,i,n){const o=e._rootScopes,s=Gi(e._fallback,i,n),a=[...t,...o],r=new Set,l=t[0];U(l)&&!(i in l)&&r.add(l[i]={}),r.add(n);let c=tn(r,a,i,s||i);return null!==c&&((!ht(s)||s===i||(c=tn(r,a,s,c),null!==c))&&$i([...r],[""],o,s))}function tn(t,e,i,n){for(;i;)i=Qi(t,e,i,n);return i}function en(t,e){for(const i of e){if(!i)continue;const e=i[t];if(ht(e))return e}}function nn(t){let e=t._keys;return e||(e=t._keys=function(t){const e=new Set;for(const i of t)for(const t of Object.keys(i).filter((t=>!t.startsWith("_"))))e.add(t);return[...e]}(t._scopes)),e}const on=Number.EPSILON||1e-14,sn=(t,e)=>e<t.length&&!t[e].skip&&t[e];function an(t,e,i,n){const o=t.skip?e:t,s=e,a=i.skip?e:i,r=zt(s,o),l=zt(a,s);let c=r/(r+l),h=l/(r+l);c=isNaN(c)?0:c,h=isNaN(h)?0:h;const d=n*c,u=n*h;return{previous:{x:s.x-d*(a.x-o.x),y:s.y-d*(a.y-o.y)},next:{x:s.x+u*(a.x-o.x),y:s.y+u*(a.y-o.y)}}}function rn(t){const e=t.length,i=Array(e).fill(0),n=Array(e);let o,s,a,r=sn(t,0);for(o=0;o<e;++o)if(s=a,a=r,r=sn(t,o+1),a){if(r){const t=r.x-a.x;i[o]=0!==t?(r.y-a.y)/t:0}n[o]=s?r?Pt(i[o-1])!==Pt(i[o])?0:(i[o-1]+i[o])/2:i[o-1]:i[o]}!function(t,e,i){const n=t.length;let o,s,a,r,l,c=sn(t,0);for(let h=0;h<n-1;++h)l=c,c=sn(t,h+1),l&&c&&(Ot(e[h],0,on)?i[h]=i[h+1]=0:(o=i[h]/e[h],s=i[h+1]/e[h],r=Math.pow(o,2)+Math.pow(s,2),r<=9||(a=3/Math.sqrt(r),i[h]=o*a*e[h],i[h+1]=s*a*e[h])))}(t,i,n),function(t,e){const i=t.length;let n,o,s,a=sn(t,0);for(let r=0;r<i;++r){if(o=s,s=a,a=sn(t,r+1),!s)continue;const{x:i,y:l}=s;o&&(n=(i-o.x)/3,s.cp1x=i-n,s.cp1y=l-n*e[r]),a&&(n=(a.x-i)/3,s.cp2x=i+n,s.cp2y=l+n*e[r])}}(t,n)}function ln(t,e,i){return Math.max(Math.min(t,i),e)}function cn(t,e,i,n){let o,s,a,r;if(e.spanGaps&&(t=t.filter((t=>!t.skip))),"monotone"===e.cubicInterpolationMode)rn(t);else{let i=n?t[t.length-1]:t[0];for(o=0,s=t.length;o<s;++o)a=t[o],r=an(i,a,t[Math.min(o+1,s-(n?0:1))%s],e.tension),a.cp1x=r.previous.x,a.cp1y=r.previous.y,a.cp2x=r.next.x,a.cp2y=r.next.y,i=a}e.capBezierPoints&&function(t,e){let i,n,o,s,a,r=Kt(t[0],e);for(i=0,n=t.length;i<n;++i)a=s,s=r,r=i<n-1&&Kt(t[i+1],e),s&&(o=t[i],a&&(o.cp1x=ln(o.cp1x,e.left,e.right),o.cp1y=ln(o.cp1y,e.top,e.bottom)),r&&(o.cp2x=ln(o.cp2x,e.left,e.right),o.cp2y=ln(o.cp2y,e.top,e.bottom)))}(t,i)}function hn(t,e,i,n){return{x:t.x+i*(e.x-t.x),y:t.y+i*(e.y-t.y)}}function dn(t,e,i,n){return{x:t.x+i*(e.x-t.x),y:"middle"===n?i<.5?t.y:e.y:"after"===n?i<1?t.y:e.y:i>0?e.y:t.y}}function un(t,e,i,n){const o={x:t.cp2x,y:t.cp2y},s={x:e.cp1x,y:e.cp1y},a=hn(t,o,i),r=hn(o,s,i),l=hn(s,e,i),c=hn(a,r,i),h=hn(r,l,i);return hn(c,h,i)}function fn(t,e,i){return t?function(t,e){return{x:i=>t+t+e-i,setWidth(t){e=t},textAlign:t=>"center"===t?t:"right"===t?"left":"right",xPlus:(t,e)=>t-e,leftForLtr:(t,e)=>t-e}}(e,i):{x:t=>t,setWidth(t){},textAlign:t=>t,xPlus:(t,e)=>t+e,leftForLtr:(t,e)=>t}}function gn(t,e){let i,n;"ltr"!==e&&"rtl"!==e||(i=t.canvas.style,n=[i.getPropertyValue("direction"),i.getPropertyPriority("direction")],i.setProperty("direction",e,"important"),t.prevTextDirection=n)}function pn(t,e){void 0!==e&&(delete t.prevTextDirection,t.canvas.style.setProperty("direction",e[0],e[1]))}function mn(t){return"angle"===t?{between:Wt,compare:Vt,normalize:Bt}:{between:(t,e,i)=>t>=e&&t<=i,compare:(t,e)=>t-e,normalize:t=>t}}function xn(t,e,i,n){return{start:t%n,end:e%n,loop:i&&(e-t+1)%n==0}}function bn(t,e,i){if(!i)return[t];const{property:n,start:o,end:s}=i,a=e.length,{compare:r,between:l,normalize:c}=mn(n),{start:h,end:d,loop:u}=function(t,e,i){const{property:n,start:o,end:s}=i,{between:a,normalize:r}=mn(n),l=e.length;let c,h,{start:d,end:u,loop:f}=t;if(f){for(d+=l,u+=l,c=0,h=l;c<h&&a(r(e[d%l][n]),o,s);++c)d--,u--;d%=l,u%=l}return u<d&&(u+=l),{start:d,end:u,loop:f}}(t,e,i),f=[];let g,p,m,x=!1,b=null;const _=()=>x||l(o,m,g)&&0!==r(o,m),y=()=>!x||0===r(s,g)||l(s,m,g);for(let t=h,i=h;t<=d;++t)p=e[t%a],p.skip||(g=c(p[n]),x=l(g,o,s),null===b&&_()&&(b=0===r(g,o)?t:i),null!==b&&y()&&(f.push(xn(b,t,u,a)),b=null),i=t,m=g);return null!==b&&f.push(xn(b,d,u,a)),f}function _n(t,e){const i=[],n=t.segments;for(let o=0;o<n.length;o++){const s=bn(n[o],t.points,e);s.length&&i.push(...s)}return i}function yn(t){const e=t.points,i=t.options.spanGaps,n=e.length;if(!n)return[];const o=!!t._loop,{start:s,end:a}=function(t,e,i,n){let o=0,s=e-1;if(i&&!n)for(;o<e&&!t[o].skip;)o++;for(;o<e&&t[o].skip;)o++;for(o%=e,i&&(s+=o);s>o&&t[s%e].skip;)s--;return s%=e,{start:o,end:s}}(e,n,o,i);if(!0===i)return[{start:s,end:a,loop:o}];return function(t,e,i,n){const o=t.length,s=[];let a,r=e,l=t[e];for(a=e+1;a<=i;++a){const i=t[a%o];i.skip||i.stop?l.skip||(n=!1,s.push({start:e%o,end:(a-1)%o,loop:n}),e=r=i.stop?a:null):(r=a,l.skip&&(e=a)),l=i}return null!==r&&s.push({start:e%o,end:r%o,loop:n}),s}(e,s,a<s?a+n:a,!!t._fullLoop&&0===s&&a===n-1)}var vn=Object.freeze({__proto__:null,easingEffects:fi,color:W,getHoverColor:H,noop:N,uid:j,isNullOrUndef:$,isArray:Y,isObject:U,isFinite:X,finiteOrDefault:q,valueOrDefault:K,toPercentage:G,toDimension:Z,callback:Q,each:J,_elementsEqual:tt,clone:et,_merger:nt,merge:ot,mergeIf:st,_mergerIf:at,_deprecated:function(t,e,i,n){void 0!==e&&console.warn(t+': "'+i+'" is deprecated. Please use "'+n+'" instead')},resolveObjectKey:lt,_capitalize:ct,defined:ht,isFunction:dt,toFontString:jt,_measureText:$t,_longestText:Yt,_alignPixel:Ut,clearCanvas:Xt,drawPoint:qt,_isPointInArea:Kt,clipArea:Gt,unclipArea:Zt,_steppedLineTo:Qt,_bezierCurveTo:Jt,renderText:te,_lookup:ee,_lookupByKey:ie,_rlookupByKey:ne,_filterBetween:oe,listenArrayEvents:ae,unlistenArrayEvents:re,_arrayUnique:le,_createResolver:$i,_attachContext:Yi,_descriptors:Ui,splineCurve:an,splineCurveMonotone:rn,_updateBezierControlPoints:cn,_getParentNode:ce,getStyle:ue,getRelativePosition:pe,getMaximumSize:xe,retinaScale:be,supportsEventListenerOptions:_e,readUsedSize:ye,fontString:function(t,e,i){return e+" "+t+"px "+i},requestAnimFrame:t,throttled:e,debounce:i,_toLeftRightCenter:n,_alignStartEnd:o,_textX:s,_pointInLine:hn,_steppedInterpolation:dn,_bezierInterpolation:un,formatNumber:Li,toLineHeight:Ae,toTRBL:Te,toTRBLCorners:Le,toPadding:Re,toFont:Ee,resolve:Ie,_addGrace:Fe,PI:xt,TAU:bt,PITAU:_t,INFINITY:yt,RAD_PER_DEG:vt,HALF_PI:Mt,QUARTER_PI:wt,TWO_THIRDS_PI:kt,log10:St,sign:Pt,niceNum:Dt,_factorize:Ct,isNumber:At,almostEquals:Ot,almostWhole:Tt,_setMinAndMaxByKey:Lt,toRadians:Rt,toDegrees:Et,_decimalPlaces:It,getAngleFromPoint:Ft,distanceBetweenPoints:zt,_angleDiff:Vt,_normalizeAngle:Bt,_angleBetween:Wt,_limitValue:Ht,_int16Range:Nt,getRtlAdapter:fn,overrideTextDirection:gn,restoreTextDirection:pn,_boundSegment:bn,_boundSegments:_n,_computeSegments:yn});class Mn{constructor(t,e,i){this.type=t,this.scope=e,this.override=i,this.items=Object.create(null)}isForType(t){return Object.prototype.isPrototypeOf.call(this.type.prototype,t.prototype)}register(t){const e=this,i=Object.getPrototypeOf(t);let n;(function(t){return"id"in t&&"defaults"in t})(i)&&(n=e.register(i));const o=e.items,s=t.id,a=e.scope+"."+s;if(!s)throw new Error("class does not have id: "+t);return s in o||(o[s]=t,function(t,e,i){const n=ot(Object.create(null),[i?mt.get(i):{},mt.get(e),t.defaults]);mt.set(e,n),t.defaultRoutes&&function(t,e){Object.keys(e).forEach((i=>{const n=i.split("."),o=n.pop(),s=[t].concat(n).join("."),a=e[i].split("."),r=a.pop(),l=a.join(".");mt.route(s,o,l,r)}))}(e,t.defaultRoutes);t.descriptors&&mt.describe(e,t.descriptors)}(t,a,n),e.override&&mt.override(t.id,t.overrides)),a}get(t){return this.items[t]}unregister(t){const e=this.items,i=t.id,n=this.scope;i in e&&delete e[i],n&&i in mt[n]&&(delete mt[n][i],this.override&&delete ut[i])}}var wn=new class{constructor(){this.controllers=new Mn(Ai,"datasets",!0),this.elements=new Mn(Oi,"elements"),this.plugins=new Mn(Object,"plugins"),this.scales=new Mn(ji,"scales"),this._typedRegistries=[this.controllers,this.scales,this.elements]}add(...t){this._each("register",t)}remove(...t){this._each("unregister",t)}addControllers(...t){this._each("register",t,this.controllers)}addElements(...t){this._each("register",t,this.elements)}addPlugins(...t){this._each("register",t,this.plugins)}addScales(...t){this._each("register",t,this.scales)}getController(t){return this._get(t,this.controllers,"controller")}getElement(t){return this._get(t,this.elements,"element")}getPlugin(t){return this._get(t,this.plugins,"plugin")}getScale(t){return this._get(t,this.scales,"scale")}removeControllers(...t){this._each("unregister",t,this.controllers)}removeElements(...t){this._each("unregister",t,this.elements)}removePlugins(...t){this._each("unregister",t,this.plugins)}removeScales(...t){this._each("unregister",t,this.scales)}_each(t,e,i){const n=this;[...e].forEach((e=>{const o=i||n._getRegistryForType(e);i||o.isForType(e)||o===n.plugins&&e.id?n._exec(t,o,e):J(e,(e=>{const o=i||n._getRegistryForType(e);n._exec(t,o,e)}))}))}_exec(t,e,i){const n=ct(t);Q(i["before"+n],[],i),e[t](i),Q(i["after"+n],[],i)}_getRegistryForType(t){for(let e=0;e<this._typedRegistries.length;e++){const i=this._typedRegistries[e];if(i.isForType(t))return i}return this.plugins}_get(t,e,i){const n=e.get(t);if(void 0===n)throw new Error('"'+t+'" is not a registered '+i+".");return n}};class kn{constructor(){this._init=[]}notify(t,e,i){const n=this;"beforeInit"===e&&(n._init=n._createDescriptors(t,!0),n._notify(n._init,t,"install"));const o=n._descriptors(t),s=n._notify(o,t,e,i);return"destroy"===e&&(n._notify(o,t,"stop"),n._notify(n._init,t,"uninstall")),s}_notify(t,e,i,n){n=n||{};for(const o of t){const t=o.plugin;if(!1===Q(t[i],[e,n,o.options],t)&&n.cancelable)return!1}return!0}invalidate(){$(this._cache)||(this._oldCache=this._cache,this._cache=void 0)}_descriptors(t){if(this._cache)return this._cache;const e=this._cache=this._createDescriptors(t);return this._notifyStateChanges(t),e}_createDescriptors(t,e){const i=t&&t.config,n=K(i.options&&i.options.plugins,{}),o=function(t){const e=[],i=Object.keys(wn.plugins.items);for(let t=0;t<i.length;t++)e.push(wn.getPlugin(i[t]));const n=t.plugins||[];for(let t=0;t<n.length;t++){const i=n[t];-1===e.indexOf(i)&&e.push(i)}return e}(i);return!1!==n||e?function(t,e,i,n){const o=[],s=t.getContext();for(let a=0;a<e.length;a++){const r=e[a],l=Sn(i[r.id],n);null!==l&&o.push({plugin:r,options:Pn(t.config,r,l,s)})}return o}(t,o,n,e):[]}_notifyStateChanges(t){const e=this._oldCache||[],i=this._cache,n=(t,e)=>t.filter((t=>!e.some((e=>t.plugin.id===e.plugin.id))));this._notify(n(e,i),t,"stop"),this._notify(n(i,e),t,"start")}}function Sn(t,e){return e||!1!==t?!0===t?{}:t:null}function Pn(t,e,i,n){const o=t.pluginScopeKeys(e),s=t.getOptionScopes(i,o);return t.createResolver(s,n,[""],{scriptable:!1,indexable:!1,allKeys:!0})}function Dn(t,e){const i=mt.datasets[t]||{};return((e.datasets||{})[t]||{}).indexAxis||e.indexAxis||i.indexAxis||"x"}function Cn(t,e){return"x"===t||"y"===t?t:e.axis||("top"===(i=e.position)||"bottom"===i?"x":"left"===i||"right"===i?"y":void 0)||t.charAt(0).toLowerCase();var i}function An(t){const e=t.options||(t.options={});e.plugins=K(e.plugins,{}),e.scales=function(t,e){const i=ut[t.type]||{scales:{}},n=e.scales||{},o=Dn(t.type,e),s=Object.create(null),a=Object.create(null);return Object.keys(n).forEach((t=>{const e=n[t],r=Cn(t,e),l=function(t,e){return t===e?"_index_":"_value_"}(r,o),c=i.scales||{};s[r]=s[r]||t,a[t]=st(Object.create(null),[{axis:r},e,c[r],c[l]])})),t.data.datasets.forEach((i=>{const o=i.type||t.type,r=i.indexAxis||Dn(o,e),l=(ut[o]||{}).scales||{};Object.keys(l).forEach((t=>{const e=function(t,e){let i=t;return"_index_"===t?i=e:"_value_"===t&&(i="x"===e?"y":"x"),i}(t,r),o=i[e+"AxisID"]||s[e]||e;a[o]=a[o]||Object.create(null),st(a[o],[{axis:e},n[o],l[t]])}))})),Object.keys(a).forEach((t=>{const e=a[t];st(e,[mt.scales[e.type],mt.scale])})),a}(t,e)}const On=new Map,Tn=new Set;function Ln(t,e){let i=On.get(t);return i||(i=e(),On.set(t,i),Tn.add(i)),i}const Rn=(t,e,i)=>{const n=lt(e,i);void 0!==n&&t.add(n)};class En{constructor(t){this._config=function(t){const e=(t=t||{}).data=t.data||{datasets:[],labels:[]};return e.datasets=e.datasets||[],e.labels=e.labels||[],An(t),t}(t),this._scopeCache=new Map,this._resolverCache=new Map}get type(){return this._config.type}set type(t){this._config.type=t}get data(){return this._config.data}set data(t){this._config.data=t}get options(){return this._config.options}set options(t){this._config.options=t}get plugins(){return this._config.plugins}update(){const t=this._config;this.clearCache(),An(t)}clearCache(){this._scopeCache.clear(),this._resolverCache.clear()}datasetScopeKeys(t){return Ln(t,(()=>[["datasets."+t,""]]))}datasetAnimationScopeKeys(t,e){return Ln(`${t}.transition.${e}`,(()=>[[`datasets.${t}.transitions.${e}`,"transitions."+e],["datasets."+t,""]]))}datasetElementScopeKeys(t,e){return Ln(`${t}-${e}`,(()=>[[`datasets.${t}.elements.${e}`,"datasets."+t,"elements."+e,""]]))}pluginScopeKeys(t){const e=t.id;return Ln(`${this.type}-plugin-${e}`,(()=>[["plugins."+e,...t.additionalOptionScopes||[]]]))}_cachedScopes(t,e){const i=this._scopeCache;let n=i.get(t);return n&&!e||(n=new Map,i.set(t,n)),n}getOptionScopes(t,e,i){const{options:n,type:o}=this,s=this._cachedScopes(t,i),a=s.get(e);if(a)return a;const r=new Set;e.forEach((e=>{t&&(r.add(t),e.forEach((e=>Rn(r,t,e)))),e.forEach((t=>Rn(r,n,t))),e.forEach((t=>Rn(r,ut[o]||{},t))),e.forEach((t=>Rn(r,mt,t))),e.forEach((t=>Rn(r,ft,t)))}));const l=[...r];return Tn.has(e)&&s.set(e,l),l}chartOptionScopes(){const{options:t,type:e}=this;return[t,ut[e]||{},mt.datasets[e]||{},{type:e},mt,ft]}resolveNamedOptions(t,e,i,n=[""]){const o={$shared:!0},{resolver:s,subPrefixes:a}=In(this._resolverCache,t,n);let r=s;if(function(t,e){const{isScriptable:i,isIndexable:n}=Ui(t);for(const o of e)if(i(o)&&dt(t[o])||n(o)&&Y(t[o]))return!0;return!1}(s,e)){o.$shared=!1;r=Yi(s,i=dt(i)?i():i,this.createResolver(t,i,a))}for(const t of e)o[t]=r[t];return o}createResolver(t,e,i=[""],n){const{resolver:o}=In(this._resolverCache,t,i);return U(e)?Yi(o,e,void 0,n):o}}function In(t,e,i){let n=t.get(e);n||(n=new Map,t.set(e,n));const o=i.join();let s=n.get(o);if(!s){s={resolver:$i(e,i),subPrefixes:i.filter((t=>!t.toLowerCase().includes("hover")))},n.set(o,s)}return s}const Fn=["top","bottom","left","right","chartArea"];function zn(t,e){return"top"===t||"bottom"===t||-1===Fn.indexOf(t)&&"x"===e}function Vn(t,e){return function(i,n){return i[t]===n[t]?i[e]-n[e]:i[t]-n[t]}}function Bn(t){const e=t.chart,i=e.options.animation;e.notifyPlugins("afterRender"),Q(i&&i.onComplete,[t],e)}function Wn(t){const e=t.chart,i=e.options.animation;Q(i&&i.onProgress,[t],e)}function Hn(){return"undefined"!=typeof window&&"undefined"!=typeof document}function Nn(t){return Hn()&&"string"==typeof t?t=document.getElementById(t):t&&t.length&&(t=t[0]),t&&t.canvas&&(t=t.canvas),t}const jn={},$n=t=>{const e=Nn(t);return Object.values(jn).filter((t=>t.canvas===e)).pop()};class Yn{constructor(t,e){const n=this;this.config=e=new En(e);const o=Nn(t),s=$n(o);if(s)throw new Error("Canvas is already in use. Chart with ID '"+s.id+"' must be destroyed before the canvas can be reused.");const r=e.createResolver(e.chartOptionScopes(),n.getContext());this.platform=n._initializePlatform(o,e);const l=n.platform.acquireContext(o,r.aspectRatio),c=l&&l.canvas,h=c&&c.height,d=c&&c.width;this.id=j(),this.ctx=l,this.canvas=c,this.width=d,this.height=h,this._options=r,this._aspectRatio=this.aspectRatio,this._layers=[],this._metasets=[],this._stacks=void 0,this.boxes=[],this.currentDevicePixelRatio=void 0,this.chartArea=void 0,this._active=[],this._lastEvent=void 0,this._listeners={},this._sortedMetasets=[],this.scales={},this.scale=void 0,this._plugins=new kn,this.$proxies={},this._hiddenIndices={},this.attached=!1,this._animationsDisabled=void 0,this.$context=void 0,this._doResize=i((()=>this.update("resize")),r.resizeDelay||0),jn[n.id]=n,l&&c?(a.listen(n,"complete",Bn),a.listen(n,"progress",Wn),n._initialize(),n.attached&&n.update()):console.error("Failed to create chart: can't acquire context from the given item")}get aspectRatio(){const{options:{aspectRatio:t,maintainAspectRatio:e},width:i,height:n,_aspectRatio:o}=this;return $(t)?e&&o?o:n?i/n:null:t}get data(){return this.config.data}set data(t){this.config.data=t}get options(){return this._options}set options(t){this.config.options=t}_initialize(){const t=this;return t.notifyPlugins("beforeInit"),t.options.responsive?t.resize():be(t,t.options.devicePixelRatio),t.bindEvents(),t.notifyPlugins("afterInit"),t}_initializePlatform(t,e){return e.platform?new e.platform:!Hn()||"undefined"!=typeof OffscreenCanvas&&t instanceof OffscreenCanvas?new Ke:new li}clear(){return Xt(this.canvas,this.ctx),this}stop(){return a.stop(this),this}resize(t,e){a.running(this)?this._resizeBeforeDraw={width:t,height:e}:this._resize(t,e)}_resize(t,e){const i=this,n=i.options,o=i.canvas,s=n.maintainAspectRatio&&i.aspectRatio,a=i.platform.getMaximumSize(o,t,e,s),r=i.currentDevicePixelRatio,l=n.devicePixelRatio||i.platform.getDevicePixelRatio();i.width===a.width&&i.height===a.height&&r===l||(i.width=a.width,i.height=a.height,i._aspectRatio=i.aspectRatio,be(i,l,!0),i.notifyPlugins("resize",{size:a}),Q(n.onResize,[i,a],i),i.attached&&i._doResize()&&i.render())}ensureScalesHaveIDs(){J(this.options.scales||{},((t,e)=>{t.id=e}))}buildOrUpdateScales(){const t=this,e=t.options,i=e.scales,n=t.scales,o=Object.keys(n).reduce(((t,e)=>(t[e]=!1,t)),{});let s=[];i&&(s=s.concat(Object.keys(i).map((t=>{const e=i[t],n=Cn(t,e),o="r"===n,s="x"===n;return{options:e,dposition:o?"chartArea":s?"bottom":"left",dtype:o?"radialLinear":s?"category":"linear"}})))),J(s,(i=>{const s=i.options,a=s.id,r=Cn(a,s),l=K(s.type,i.dtype);void 0!==s.position&&zn(s.position,r)===zn(i.dposition)||(s.position=i.dposition),o[a]=!0;let c=null;if(a in n&&n[a].type===l)c=n[a];else{c=new(wn.getScale(l))({id:a,type:l,ctx:t.ctx,chart:t}),n[c.id]=c}c.init(s,e)})),J(o,((t,e)=>{t||delete n[e]})),J(n,(e=>{Xe.configure(t,e,e.options),Xe.addBox(t,e)}))}_updateMetasetIndex(t,e){const i=this._metasets,n=t.index;n!==e&&(i[n]=i[e],i[e]=t,t.index=e)}_updateMetasets(){const t=this,e=t._metasets,i=t.data.datasets.length,n=e.length;if(n>i){for(let e=i;e<n;++e)t._destroyDatasetMeta(e);e.splice(i,n-i)}t._sortedMetasets=e.slice(0).sort(Vn("order","index"))}_removeUnreferencedMetasets(){const t=this,{_metasets:e,data:{datasets:i}}=t;e.length>i.length&&delete t._stacks,e.forEach(((e,n)=>{0===i.filter((t=>t===e._dataset)).length&&t._destroyDatasetMeta(n)}))}buildOrUpdateControllers(){const t=this,e=[],i=t.data.datasets;let n,o;for(t._removeUnreferencedMetasets(),n=0,o=i.length;n<o;n++){const o=i[n];let s=t.getDatasetMeta(n);const a=o.type||t.config.type;if(s.type&&s.type!==a&&(t._destroyDatasetMeta(n),s=t.getDatasetMeta(n)),s.type=a,s.indexAxis=o.indexAxis||Dn(a,t.options),s.order=o.order||0,t._updateMetasetIndex(s,n),s.label=""+o.label,s.visible=t.isDatasetVisible(n),s.controller)s.controller.updateIndex(n),s.controller.linkScales();else{const i=wn.getController(a),{datasetElementType:o,dataElementType:r}=mt.datasets[a];Object.assign(i.prototype,{dataElementType:wn.getElement(r),datasetElementType:o&&wn.getElement(o)}),s.controller=new i(t,n),e.push(s.controller)}}return t._updateMetasets(),e}_resetElements(){const t=this;J(t.data.datasets,((e,i)=>{t.getDatasetMeta(i).controller.reset()}),t)}reset(){this._resetElements(),this.notifyPlugins("reset")}update(t){const e=this,i=e.config;i.update(),e._options=i.createResolver(i.chartOptionScopes(),e.getContext()),J(e.scales,(t=>{Xe.removeBox(e,t)}));const n=e._animationsDisabled=!e.options.animation;if(e.ensureScalesHaveIDs(),e.buildOrUpdateScales(),e._plugins.invalidate(),!1===e.notifyPlugins("beforeUpdate",{mode:t,cancelable:!0}))return;const o=e.buildOrUpdateControllers();e.notifyPlugins("beforeElementsUpdate");let s=0;for(let t=0,i=e.data.datasets.length;t<i;t++){const{controller:i}=e.getDatasetMeta(t),a=!n&&-1===o.indexOf(i);i.buildOrUpdateElements(a),s=Math.max(+i.getMaxOverflow(),s)}e._minPadding=s,e._updateLayout(s),n||J(o,(t=>{t.reset()})),e._updateDatasets(t),e.notifyPlugins("afterUpdate",{mode:t}),e._layers.sort(Vn("z","_idx")),e._lastEvent&&e._eventHandler(e._lastEvent,!0),e.render()}_updateLayout(t){const e=this;if(!1===e.notifyPlugins("beforeLayout",{cancelable:!0}))return;Xe.update(e,e.width,e.height,t);const i=e.chartArea,n=i.width<=0||i.height<=0;e._layers=[],J(e.boxes,(t=>{n&&"chartArea"===t.position||(t.configure&&t.configure(),e._layers.push(...t._layers()))}),e),e._layers.forEach(((t,e)=>{t._idx=e})),e.notifyPlugins("afterLayout")}_updateDatasets(t){const e=this,i="function"==typeof t;if(!1!==e.notifyPlugins("beforeDatasetsUpdate",{mode:t,cancelable:!0})){for(let n=0,o=e.data.datasets.length;n<o;++n)e._updateDataset(n,i?t({datasetIndex:n}):t);e.notifyPlugins("afterDatasetsUpdate",{mode:t})}}_updateDataset(t,e){const i=this,n=i.getDatasetMeta(t),o={meta:n,index:t,mode:e,cancelable:!0};!1!==i.notifyPlugins("beforeDatasetUpdate",o)&&(n.controller._update(e),o.cancelable=!1,i.notifyPlugins("afterDatasetUpdate",o))}render(){const t=this;!1!==t.notifyPlugins("beforeRender",{cancelable:!0})&&(a.has(t)?t.attached&&!a.running(t)&&a.start(t):(t.draw(),Bn({chart:t})))}draw(){const t=this;let e;if(t._resizeBeforeDraw){const{width:e,height:i}=t._resizeBeforeDraw;t._resize(e,i),t._resizeBeforeDraw=null}if(t.clear(),t.width<=0||t.height<=0)return;if(!1===t.notifyPlugins("beforeDraw",{cancelable:!0}))return;const i=t._layers;for(e=0;e<i.length&&i[e].z<=0;++e)i[e].draw(t.chartArea);for(t._drawDatasets();e<i.length;++e)i[e].draw(t.chartArea);t.notifyPlugins("afterDraw")}_getSortedDatasetMetas(t){const e=this._sortedMetasets,i=[];let n,o;for(n=0,o=e.length;n<o;++n){const o=e[n];t&&!o.visible||i.push(o)}return i}getSortedVisibleDatasetMetas(){return this._getSortedDatasetMetas(!0)}_drawDatasets(){const t=this;if(!1===t.notifyPlugins("beforeDatasetsDraw",{cancelable:!0}))return;const e=t.getSortedVisibleDatasetMetas();for(let i=e.length-1;i>=0;--i)t._drawDataset(e[i]);t.notifyPlugins("afterDatasetsDraw")}_drawDataset(t){const e=this,i=e.ctx,n=t._clip,o=e.chartArea,s={meta:t,index:t.index,cancelable:!0};!1!==e.notifyPlugins("beforeDatasetDraw",s)&&(Gt(i,{left:!1===n.left?0:o.left-n.left,right:!1===n.right?e.width:o.right+n.right,top:!1===n.top?0:o.top-n.top,bottom:!1===n.bottom?e.height:o.bottom+n.bottom}),t.controller.draw(),Zt(i),s.cancelable=!1,e.notifyPlugins("afterDatasetDraw",s))}getElementsAtEventForMode(t,e,i,n){const o=De.modes[e];return"function"==typeof o?o(this,t,i,n):[]}getDatasetMeta(t){const e=this.data.datasets[t],i=this._metasets;let n=i.filter((t=>t&&t._dataset===e)).pop();return n||(n=i[t]={type:null,data:[],dataset:null,controller:null,hidden:null,xAxisID:null,yAxisID:null,order:e&&e.order||0,index:t,_dataset:e,_parsed:[],_sorted:!1}),n}getContext(){return this.$context||(this.$context={chart:this,type:"chart"})}getVisibleDatasetCount(){return this.getSortedVisibleDatasetMetas().length}isDatasetVisible(t){const e=this.data.datasets[t];if(!e)return!1;const i=this.getDatasetMeta(t);return"boolean"==typeof i.hidden?!i.hidden:!e.hidden}setDatasetVisibility(t,e){this.getDatasetMeta(t).hidden=!e}toggleDataVisibility(t){this._hiddenIndices[t]=!this._hiddenIndices[t]}getDataVisibility(t){return!this._hiddenIndices[t]}_updateDatasetVisibility(t,e){const i=this,n=e?"show":"hide",o=i.getDatasetMeta(t),s=o.controller._resolveAnimations(void 0,n);i.setDatasetVisibility(t,e),s.update(o,{visible:e}),i.update((e=>e.datasetIndex===t?n:void 0))}hide(t){this._updateDatasetVisibility(t,!1)}show(t){this._updateDatasetVisibility(t,!0)}_destroyDatasetMeta(t){const e=this,i=e._metasets&&e._metasets[t];i&&i.controller&&(i.controller._destroy(),delete e._metasets[t])}destroy(){const t=this,{canvas:e,ctx:i}=t;let n,o;for(t.stop(),a.remove(t),n=0,o=t.data.datasets.length;n<o;++n)t._destroyDatasetMeta(n);t.config.clearCache(),e&&(t.unbindEvents(),Xt(e,i),t.platform.releaseContext(i),t.canvas=null,t.ctx=null),t.notifyPlugins("destroy"),delete jn[t.id]}toBase64Image(...t){return this.canvas.toDataURL(...t)}bindEvents(){const t=this,e=t._listeners,i=t.platform,n=(n,o)=>{i.addEventListener(t,n,o),e[n]=o},o=(n,o)=>{e[n]&&(i.removeEventListener(t,n,o),delete e[n])};let s=function(e,i,n){e.offsetX=i,e.offsetY=n,t._eventHandler(e)};if(J(t.options.events,(t=>n(t,s))),t.options.responsive){let e;s=(e,i)=>{t.canvas&&t.resize(e,i)};const a=()=>{o("attach",a),t.attached=!0,t.resize(),n("resize",s),n("detach",e)};e=()=>{t.attached=!1,o("resize",s),n("attach",a)},i.isAttached(t.canvas)?a():e()}else t.attached=!0}unbindEvents(){const t=this,e=t._listeners;e&&(delete t._listeners,J(e,((e,i)=>{t.platform.removeEventListener(t,i,e)})))}updateHoverStyle(t,e,i){const n=i?"set":"remove";let o,s,a,r;for("dataset"===e&&(o=this.getDatasetMeta(t[0].datasetIndex),o.controller["_"+n+"DatasetHoverStyle"]()),a=0,r=t.length;a<r;++a){s=t[a];const e=s&&this.getDatasetMeta(s.datasetIndex).controller;e&&e[n+"HoverStyle"](s.element,s.datasetIndex,s.index)}}getActiveElements(){return this._active||[]}setActiveElements(t){const e=this,i=e._active||[],n=t.map((({datasetIndex:t,index:i})=>{const n=e.getDatasetMeta(t);if(!n)throw new Error("No dataset found at index "+t);return{datasetIndex:t,element:n.data[i],index:i}}));!tt(n,i)&&(e._active=n,e._updateHoverStyles(n,i))}notifyPlugins(t,e){return this._plugins.notify(this,t,e)}_updateHoverStyles(t,e,i){const n=this,o=n.options.hover,s=(t,e)=>t.filter((t=>!e.some((e=>t.datasetIndex===e.datasetIndex&&t.index===e.index)))),a=s(e,t),r=i?t:s(t,e);a.length&&n.updateHoverStyle(a,o.mode,!1),r.length&&o.mode&&n.updateHoverStyle(r,o.mode,!0)}_eventHandler(t,e){const i=this,n={event:t,replay:e,cancelable:!0};if(!1===i.notifyPlugins("beforeEvent",n))return;const o=i._handleEvent(t,e);return n.cancelable=!1,i.notifyPlugins("afterEvent",n),(o||n.changed)&&i.render(),i}_handleEvent(t,e){const i=this,{_active:n=[],options:o}=i,s=o.hover,a=e;let r=[],l=!1,c=null;return"mouseout"!==t.type&&(r=i.getElementsAtEventForMode(t,s.mode,s,a),c="click"===t.type?i._lastEvent:t),i._lastEvent=null,Q(o.onHover,[t,r,i],i),"mouseup"!==t.type&&"click"!==t.type&&"contextmenu"!==t.type||Kt(t,i.chartArea,i._minPadding)&&Q(o.onClick,[t,r,i],i),l=!tt(r,n),(l||e)&&(i._active=r,i._updateHoverStyles(r,n,e)),i._lastEvent=c,l}}const Un=()=>J(Yn.instances,(t=>t._plugins.invalidate())),Xn=!0;function qn(){throw new Error("This method is not implemented: either no adapter can be found or an incomplete integration was provided.")}Object.defineProperties(Yn,{defaults:{enumerable:Xn,value:mt},instances:{enumerable:Xn,value:jn},overrides:{enumerable:Xn,value:ut},registry:{enumerable:Xn,value:wn},version:{enumerable:Xn,value:"3.0.2"},getChart:{enumerable:Xn,value:$n},register:{enumerable:Xn,value:(...t)=>{wn.add(...t),Un()}},unregister:{enumerable:Xn,value:(...t)=>{wn.remove(...t),Un()}}});class Kn{constructor(t){this.options=t||{}}formats(){return qn()}parse(t,e){return qn()}format(t,e){return qn()}add(t,e,i){return qn()}diff(t,e,i){return qn()}startOf(t,e,i){return qn()}endOf(t,e){return qn()}}Kn.override=function(t){Object.assign(Kn.prototype,t)};var Gn={_date:Kn};function Zn(t){const e=function(t){if(!t._cache.$bar){const e=t.getMatchingVisibleMetas("bar");let i=[];for(let n=0,o=e.length;n<o;n++)i=i.concat(e[n].controller.getAllParsedValues(t));t._cache.$bar=le(i.sort(((t,e)=>t-e)))}return t._cache.$bar}(t);let i,n,o,s,a=t._length;const r=()=>{a=Math.min(a,i&&Math.abs(o-s)||a),s=o};for(i=0,n=e.length;i<n;++i)o=t.getPixelForValue(e[i]),r();for(i=0,n=t.ticks.length;i<n;++i)o=t.getPixelForTick(i),r();return a}function Qn(t,e,i,n){return Y(t)?function(t,e,i,n){const o=i.parse(t[0],n),s=i.parse(t[1],n),a=Math.min(o,s),r=Math.max(o,s);let l=a,c=r;Math.abs(a)>Math.abs(r)&&(l=r,c=a),e[i.axis]=c,e._custom={barStart:l,barEnd:c,start:o,end:s,min:a,max:r}}(t,e,i,n):e[i.axis]=i.parse(t,n),e}function Jn(t,e,i,n){const o=t.iScale,s=t.vScale,a=o.getLabels(),r=o===s,l=[];let c,h,d,u;for(c=i,h=i+n;c<h;++c)u=e[c],d={},d[o.axis]=r||o.parse(a[c],c),l.push(Qn(u,d,s,c));return l}function to(t){return t&&void 0!==t.barStart&&void 0!==t.barEnd}class eo extends Ai{parsePrimitiveData(t,e,i,n){return Jn(t,e,i,n)}parseArrayData(t,e,i,n){return Jn(t,e,i,n)}parseObjectData(t,e,i,n){const{iScale:o,vScale:s}=t,{xAxisKey:a="x",yAxisKey:r="y"}=this._parsing,l="x"===o.axis?a:r,c="x"===s.axis?a:r,h=[];let d,u,f,g;for(d=i,u=i+n;d<u;++d)g=e[d],f={},f[o.axis]=o.parse(lt(g,l),d),h.push(Qn(lt(g,c),f,s,d));return h}updateRangeFromParsed(t,e,i,n){super.updateRangeFromParsed(t,e,i,n);const o=i._custom;o&&e===this._cachedMeta.vScale&&(t.min=Math.min(t.min,o.min),t.max=Math.max(t.max,o.max))}getLabelAndValue(t){const e=this._cachedMeta,{iScale:i,vScale:n}=e,o=this.getParsed(t),s=o._custom,a=to(s)?"["+s.start+", "+s.end+"]":""+n.getLabelForValue(o[n.axis]);return{label:""+i.getLabelForValue(o[i.axis]),value:a}}initialize(){const t=this;t.enableOptionSharing=!0,super.initialize();t._cachedMeta.stack=t.getDataset().stack}update(t){const e=this._cachedMeta;this.updateElements(e.data,0,e.data.length,t)}updateElements(t,e,i,n){const o=this,s="reset"===n,a=o._cachedMeta.vScale,r=a.getBasePixel(),l=a.isHorizontal(),c=o._getRuler(),h=o.resolveDataElementOptions(e,n),d=o.getSharedOptions(h),u=o.includeOptions(n,d);o.updateSharedOptions(d,n,h);for(let a=e;a<e+i;a++){const e=s?{base:r,head:r}:o._calculateBarValuePixels(a),i=o._calculateBarIndexPixels(a,c),h={horizontal:l,base:e.base,x:l?e.head:i.center,y:l?i.center:e.head,height:l?i.size:void 0,width:l?void 0:i.size};u&&(h.options=d||o.resolveDataElementOptions(a,n)),o.updateElement(t[a],a,h,n)}}_getStacks(t,e){const i=this._cachedMeta.iScale,n=i.getMatchingVisibleMetas(this._type),o=i.options.stacked,s=n.length,a=[];let r,l;for(r=0;r<s;++r){if(l=n[r],void 0!==e){const t=l.controller.getParsed(e)[l.controller._cachedMeta.vScale.axis];if($(t)||isNaN(t))continue}if((!1===o||-1===a.indexOf(l.stack)||void 0===o&&void 0===l.stack)&&a.push(l.stack),l.index===t)break}return a.length||a.push(void 0),a}_getStackCount(t){return this._getStacks(void 0,t).length}_getStackIndex(t,e){const i=this._getStacks(t),n=void 0!==e?i.indexOf(e):-1;return-1===n?i.length-1:n}_getRuler(){const t=this,e=t.options,i=t._cachedMeta,n=i.iScale,o=[];let s,a;for(s=0,a=i.data.length;s<a;++s)o.push(n.getPixelForValue(t.getParsed(s)[n.axis],s));const r=e.barThickness;return{min:r||Zn(n),pixels:o,start:n._startPixel,end:n._endPixel,stackCount:t._getStackCount(),scale:n,grouped:e.grouped,ratio:r?1:e.categoryPercentage*e.barPercentage}}_calculateBarValuePixels(t){const e=this,{vScale:i,_stacked:n}=e._cachedMeta,{base:o,minBarLength:s}=e.options,a=e.getParsed(t),r=a._custom,l=to(r);let c,h,d=a[i.axis],u=0,f=n?e.applyStack(i,a,n):d;f!==d&&(u=f-d,f=d),l&&(d=r.barStart,f=r.barEnd-r.barStart,0!==d&&Pt(d)!==Pt(r.barEnd)&&(u=0),u+=d);const g=$(o)||l?u:o;let p=i.getPixelForValue(g);c=this.chart.getDataVisibility(t)?i.getPixelForValue(u+f):p,h=c-p,void 0!==s&&Math.abs(h)<s&&(h=h<0?-s:s,0===d&&(p-=h/2),c=p+h);const m=o||0;if(p===i.getPixelForValue(m)){const t=i.getLineWidthForValue(m)/2;h>0?(p+=t,h-=t):h<0&&(p-=t,h+=t)}return{size:h,base:p,head:c,center:c+h/2}}_calculateBarIndexPixels(t,e){const i=this,n=e.scale,o=i.options,s=K(o.maxBarThickness,1/0);let a,r;if(e.grouped){const n=o.skipNull?i._getStackCount(t):e.stackCount,l="flex"===o.barThickness?function(t,e,i,n){const o=e.pixels,s=o[t];let a=t>0?o[t-1]:null,r=t<o.length-1?o[t+1]:null;const l=i.categoryPercentage;null===a&&(a=s-(null===r?e.end-e.start:r-s)),null===r&&(r=s+s-a);const c=s-(s-Math.min(a,r))/2*l;return{chunk:Math.abs(r-a)/2*l/n,ratio:i.barPercentage,start:c}}(t,e,o,n):function(t,e,i,n){const o=i.barThickness;let s,a;return $(o)?(s=e.min*i.categoryPercentage,a=i.barPercentage):(s=o*n,a=1),{chunk:s/n,ratio:a,start:e.pixels[t]-s/2}}(t,e,o,n),c=i._getStackIndex(i.index,i._cachedMeta.stack);a=l.start+l.chunk*c+l.chunk/2,r=Math.min(s,l.chunk*l.ratio)}else a=n.getPixelForValue(i.getParsed(t)[n.axis],t),r=Math.min(s,e.min*e.ratio);return{base:a-r/2,head:a+r/2,center:a,size:r}}draw(){const t=this,e=t.chart,i=t._cachedMeta,n=i.vScale,o=i.data,s=o.length;let a=0;for(Gt(e.ctx,e.chartArea);a<s;++a)null!==t.getParsed(a)[n.axis]&&o[a].draw(t._ctx);Zt(e.ctx)}}eo.id="bar",eo.defaults={datasetElementType:!1,dataElementType:"bar",categoryPercentage:.8,barPercentage:.9,grouped:!0,animations:{numbers:{type:"number",properties:["x","y","base","width","height"]}}},eo.overrides={interaction:{mode:"index"},scales:{_index_:{type:"category",offset:!0,grid:{offset:!0}},_value_:{type:"linear",beginAtZero:!0}}};class io extends Ai{initialize(){this.enableOptionSharing=!0,super.initialize()}parseObjectData(t,e,i,n){const{xScale:o,yScale:s}=t,{xAxisKey:a="x",yAxisKey:r="y"}=this._parsing,l=[];let c,h,d;for(c=i,h=i+n;c<h;++c)d=e[c],l.push({x:o.parse(lt(d,a),c),y:s.parse(lt(d,r),c),_custom:d&&d.r&&+d.r});return l}getMaxOverflow(){const{data:t,_parsed:e}=this._cachedMeta;let i=0;for(let n=t.length-1;n>=0;--n)i=Math.max(i,t[n].size()/2,e[n]._custom);return i>0&&i}getLabelAndValue(t){const e=this._cachedMeta,{xScale:i,yScale:n}=e,o=this.getParsed(t),s=i.getLabelForValue(o.x),a=n.getLabelForValue(o.y),r=o._custom;return{label:e.label,value:"("+s+", "+a+(r?", "+r:"")+")"}}update(t){const e=this._cachedMeta.data;this.updateElements(e,0,e.length,t)}updateElements(t,e,i,n){const o=this,s="reset"===n,{xScale:a,yScale:r}=o._cachedMeta,l=o.resolveDataElementOptions(e,n),c=o.getSharedOptions(l),h=o.includeOptions(n,c);for(let l=e;l<e+i;l++){const e=t[l],i=!s&&o.getParsed(l),c=s?a.getPixelForDecimal(.5):a.getPixelForValue(i.x),d=s?r.getBasePixel():r.getPixelForValue(i.y),u={x:c,y:d,skip:isNaN(c)||isNaN(d)};h&&(u.options=o.resolveDataElementOptions(l,n),s&&(u.options.radius=0)),o.updateElement(e,l,u,n)}o.updateSharedOptions(c,n,l)}resolveDataElementOptions(t,e){const i=this.getParsed(t);let n=super.resolveDataElementOptions(t,e);n.$shared&&(n=Object.assign({},n,{$shared:!1}));const o=n.radius;return"active"!==e&&(n.radius=0),n.radius+=K(i&&i._custom,o),n}}io.id="bubble",io.defaults={datasetElementType:!1,dataElementType:"point",animations:{numbers:{type:"number",properties:["x","y","borderWidth","radius"]}}},io.overrides={scales:{x:{type:"linear"},y:{type:"linear"}},plugins:{tooltip:{callbacks:{title:()=>""}}}};class no extends Ai{constructor(t,e){super(t,e),this.enableOptionSharing=!0,this.innerRadius=void 0,this.outerRadius=void 0,this.offsetX=void 0,this.offsetY=void 0}linkScales(){}parse(t,e){const i=this.getDataset().data,n=this._cachedMeta;let o,s;for(o=t,s=t+e;o<s;++o)n._parsed[o]=+i[o]}_getRotation(){return Rt(this.options.rotation-90)}_getCircumference(){return Rt(this.options.circumference)}_getRotationExtents(){let t=bt,e=-bt;const i=this;for(let n=0;n<i.chart.data.datasets.length;++n)if(i.chart.isDatasetVisible(n)){const o=i.chart.getDatasetMeta(n).controller,s=o._getRotation(),a=o._getCircumference();t=Math.min(t,s),e=Math.max(e,s+a)}return{rotation:t,circumference:e-t}}update(t){const e=this,i=e.chart,{chartArea:n}=i,o=e._cachedMeta,s=o.data,a=e.getMaxBorderWidth()+e.getMaxOffset(s),r=Math.max((Math.min(n.width,n.height)-a)/2,0),l=Math.min(G(e.options.cutout,r),1),c=e._getRingWeight(e.index),{circumference:h,rotation:d}=e._getRotationExtents(),{ratioX:u,ratioY:f,offsetX:g,offsetY:p}=function(t,e,i){let n=1,o=1,s=0,a=0;if(e<bt){const r=t,l=r+e,c=Math.cos(r),h=Math.sin(r),d=Math.cos(l),u=Math.sin(l),f=(t,e,n)=>Wt(t,r,l)?1:Math.max(e,e*i,n,n*i),g=(t,e,n)=>Wt(t,r,l)?-1:Math.min(e,e*i,n,n*i),p=f(0,c,d),m=f(Mt,h,u),x=g(xt,c,d),b=g(xt+Mt,h,u);n=(p-x)/2,o=(m-b)/2,s=-(p+x)/2,a=-(m+b)/2}return{ratioX:n,ratioY:o,offsetX:s,offsetY:a}}(d,h,l),m=(n.width-a)/u,x=(n.height-a)/f,b=Math.max(Math.min(m,x)/2,0),_=Z(e.options.radius,b),y=(_-Math.max(_*l,0))/e._getVisibleDatasetWeightTotal();e.offsetX=g*_,e.offsetY=p*_,o.total=e.calculateTotal(),e.outerRadius=_-y*e._getRingWeightOffset(e.index),e.innerRadius=Math.max(e.outerRadius-y*c,0),e.updateElements(s,0,s.length,t)}_circumference(t,e){const i=this,n=i.options,o=i._cachedMeta,s=i._getCircumference();return e&&n.animation.animateRotate||!this.chart.getDataVisibility(t)||null===o._parsed[t]?0:i.calculateCircumference(o._parsed[t]*s/bt)}updateElements(t,e,i,n){const o=this,s="reset"===n,a=o.chart,r=a.chartArea,l=a.options.animation,c=(r.left+r.right)/2,h=(r.top+r.bottom)/2,d=s&&l.animateScale,u=d?0:o.innerRadius,f=d?0:o.outerRadius,g=o.resolveDataElementOptions(e,n),p=o.getSharedOptions(g),m=o.includeOptions(n,p);let x,b=o._getRotation();for(x=0;x<e;++x)b+=o._circumference(x,s);for(x=e;x<e+i;++x){const e=o._circumference(x,s),i=t[x],a={x:c+o.offsetX,y:h+o.offsetY,startAngle:b,endAngle:b+e,circumference:e,outerRadius:f,innerRadius:u};m&&(a.options=p||o.resolveDataElementOptions(x,n)),b+=e,o.updateElement(i,x,a,n)}o.updateSharedOptions(p,n,g)}calculateTotal(){const t=this._cachedMeta,e=t.data;let i,n=0;for(i=0;i<e.length;i++){const e=t._parsed[i];null!==e&&!isNaN(e)&&this.chart.getDataVisibility(i)&&(n+=Math.abs(e))}return n}calculateCircumference(t){const e=this._cachedMeta.total;return e>0&&!isNaN(t)?bt*(Math.abs(t)/e):0}getLabelAndValue(t){const e=this._cachedMeta,i=this.chart,n=i.data.labels||[],o=Li(e._parsed[t],i.options.locale);return{label:n[t]||"",value:o}}getMaxBorderWidth(t){const e=this;let i=0;const n=e.chart;let o,s,a,r,l;if(!t)for(o=0,s=n.data.datasets.length;o<s;++o)if(n.isDatasetVisible(o)){a=n.getDatasetMeta(o),t=a.data,r=a.controller,r!==e&&r.configure();break}if(!t)return 0;for(o=0,s=t.length;o<s;++o)l=r.resolveDataElementOptions(o),"inner"!==l.borderAlign&&(i=Math.max(i,l.borderWidth||0,l.hoverBorderWidth||0));return i}getMaxOffset(t){let e=0;for(let i=0,n=t.length;i<n;++i){const t=this.resolveDataElementOptions(i);e=Math.max(e,t.offset||0,t.hoverOffset||0)}return e}_getRingWeightOffset(t){let e=0;for(let i=0;i<t;++i)this.chart.isDatasetVisible(i)&&(e+=this._getRingWeight(i));return e}_getRingWeight(t){return Math.max(K(this.chart.data.datasets[t].weight,1),0)}_getVisibleDatasetWeightTotal(){return this._getRingWeightOffset(this.chart.data.datasets.length)||1}}no.id="doughnut",no.defaults={datasetElementType:!1,dataElementType:"arc",animation:{animateRotate:!0,animateScale:!1},animations:{numbers:{type:"number",properties:["circumference","endAngle","innerRadius","outerRadius","startAngle","x","y","offset","borderWidth"]}},cutout:"50%",rotation:0,circumference:360,radius:"100%",indexAxis:"r"},no.overrides={aspectRatio:1,plugins:{legend:{labels:{generateLabels(t){const e=t.data;return e.labels.length&&e.datasets.length?e.labels.map(((e,i)=>{const n=t.getDatasetMeta(0).controller.getStyle(i);return{text:e,fillStyle:n.backgroundColor,strokeStyle:n.borderColor,lineWidth:n.borderWidth,hidden:!t.getDataVisibility(i),index:i}})):[]}},onClick(t,e,i){i.chart.toggleDataVisibility(e.index),i.chart.update()}},tooltip:{callbacks:{title:()=>"",label(t){let e=t.label;const i=": "+t.formattedValue;return Y(e)?(e=e.slice(),e[0]+=i):e+=i,e}}}}};class oo extends Ai{initialize(){this.enableOptionSharing=!0,super.initialize()}update(t){const e=this,i=e._cachedMeta,{dataset:n,data:o=[],_dataset:s}=i,a=e.chart._animationsDisabled;let{start:r,count:l}=function(t,e,i){const n=e.length;let o=0,s=n;if(t._sorted){const{iScale:a,_parsed:r}=t,l=a.axis,{min:c,max:h,minDefined:d,maxDefined:u}=a.getUserBounds();d&&(o=Ht(Math.min(ie(r,a.axis,c).lo,i?n:ie(e,l,a.getPixelForValue(c)).lo),0,n-1)),s=u?Ht(Math.max(ie(r,a.axis,h).hi+1,i?0:ie(e,l,a.getPixelForValue(h)).hi+1),o,n)-o:n-o}return{start:o,count:s}}(i,o,a);if(e._drawStart=r,e._drawCount=l,function(t){const{xScale:e,yScale:i,_scaleRanges:n}=t,o={xmin:e.min,xmax:e.max,ymin:i.min,ymax:i.max};if(!n)return t._scaleRanges=o,!0;const s=n.xmin!==e.min||n.xmax!==e.max||n.ymin!==i.min||n.ymax!==i.max;return Object.assign(n,o),s}(i)&&(r=0,l=o.length),n._decimated=!!s._decimated,n.points=o,"resize"!==t){const i=e.resolveDatasetElementOptions(t);e.options.showLine||(i.borderWidth=0),e.updateElement(n,void 0,{animated:!a,options:i},t)}e.updateElements(o,r,l,t)}updateElements(t,e,i,n){const o=this,s="reset"===n,{xScale:a,yScale:r,_stacked:l}=o._cachedMeta,c=o.resolveDataElementOptions(e,n),h=o.getSharedOptions(c),d=o.includeOptions(n,h),u=o.options.spanGaps,f=At(u)?u:Number.POSITIVE_INFINITY,g=o.chart._animationsDisabled||s||"none"===n;let p=e>0&&o.getParsed(e-1);for(let c=e;c<e+i;++c){const e=t[c],i=o.getParsed(c),u=g?e:{},m=u.x=a.getPixelForValue(i.x,c),x=u.y=s?r.getBasePixel():r.getPixelForValue(l?o.applyStack(r,i,l):i.y,c);u.skip=isNaN(m)||isNaN(x),u.stop=c>0&&i.x-p.x>f,d&&(u.options=h||o.resolveDataElementOptions(c,n)),g||o.updateElement(e,c,u,n),p=i}o.updateSharedOptions(h,n,c)}getMaxOverflow(){const t=this,e=t._cachedMeta,i=e.dataset,n=i.options&&i.options.borderWidth||0,o=e.data||[];if(!o.length)return n;const s=o[0].size(t.resolveDataElementOptions(0)),a=o[o.length-1].size(t.resolveDataElementOptions(o.length-1));return Math.max(n,s,a)/2}draw(){this._cachedMeta.dataset.updateControlPoints(this.chart.chartArea),super.draw()}}oo.id="line",oo.defaults={datasetElementType:"line",dataElementType:"point",showLine:!0,spanGaps:!1},oo.overrides={scales:{_index_:{type:"category"},_value_:{type:"linear"}}};class so extends Ai{constructor(t,e){super(t,e),this.innerRadius=void 0,this.outerRadius=void 0}update(t){const e=this._cachedMeta.data;this._updateRadius(),this.updateElements(e,0,e.length,t)}_updateRadius(){const t=this,e=t.chart,i=e.chartArea,n=e.options,o=Math.min(i.right-i.left,i.bottom-i.top),s=Math.max(o/2,0),a=(s-Math.max(n.cutoutPercentage?s/100*n.cutoutPercentage:1,0))/e.getVisibleDatasetCount();t.outerRadius=s-a*t.index,t.innerRadius=t.outerRadius-a}updateElements(t,e,i,n){const o=this,s="reset"===n,a=o.chart,r=o.getDataset(),l=a.options.animation,c=o._cachedMeta.rScale,h=c.xCenter,d=c.yCenter,u=c.getIndexAngle(0)-.5*xt;let f,g=u;const p=360/o.countVisibleElements();for(f=0;f<e;++f)g+=o._computeAngle(f,n,p);for(f=e;f<e+i;f++){const e=t[f];let i=g,m=g+o._computeAngle(f,n,p),x=a.getDataVisibility(f)?c.getDistanceFromCenterForValue(r.data[f]):0;g=m,s&&(l.animateScale&&(x=0),l.animateRotate&&(i=m=u));const b={x:h,y:d,innerRadius:0,outerRadius:x,startAngle:i,endAngle:m,options:o.resolveDataElementOptions(f,n)};o.updateElement(e,f,b,n)}}countVisibleElements(){const t=this.getDataset(),e=this._cachedMeta;let i=0;return e.data.forEach(((e,n)=>{!isNaN(t.data[n])&&this.chart.getDataVisibility(n)&&i++})),i}_computeAngle(t,e,i){return this.chart.getDataVisibility(t)?Rt(this.resolveDataElementOptions(t,e).angle||i):0}}so.id="polarArea",so.defaults={dataElementType:"arc",animation:{animateRotate:!0,animateScale:!0},animations:{numbers:{type:"number",properties:["x","y","startAngle","endAngle","innerRadius","outerRadius"]}},indexAxis:"r",startAngle:0},so.overrides={aspectRatio:1,plugins:{legend:{labels:{generateLabels(t){const e=t.data;return e.labels.length&&e.datasets.length?e.labels.map(((e,i)=>{const n=t.getDatasetMeta(0).controller.getStyle(i);return{text:e,fillStyle:n.backgroundColor,strokeStyle:n.borderColor,lineWidth:n.borderWidth,hidden:!t.getDataVisibility(i),index:i}})):[]}},onClick(t,e,i){i.chart.toggleDataVisibility(e.index),i.chart.update()}},tooltip:{callbacks:{title:()=>"",label:t=>t.chart.data.labels[t.dataIndex]+": "+t.formattedValue}}},scales:{r:{type:"radialLinear",angleLines:{display:!1},beginAtZero:!0,grid:{circular:!0},pointLabels:{display:!1},startAngle:0}}};class ao extends no{}ao.id="pie",ao.defaults={cutout:0,rotation:0,circumference:360,radius:"100%"};class ro extends Ai{getLabelAndValue(t){const e=this._cachedMeta.vScale,i=this.getParsed(t);return{label:e.getLabels()[t],value:""+e.getLabelForValue(i[e.axis])}}update(t){const e=this,i=e._cachedMeta,n=i.dataset,o=i.data||[],s=i.iScale.getLabels();if(n.points=o,"resize"!==t){const i=e.resolveDatasetElementOptions(t);e.options.showLine||(i.borderWidth=0);const a={_loop:!0,_fullLoop:s.length===o.length,options:i};e.updateElement(n,void 0,a,t)}e.updateElements(o,0,o.length,t)}updateElements(t,e,i,n){const o=this,s=o.getDataset(),a=o._cachedMeta.rScale,r="reset"===n;for(let l=e;l<e+i;l++){const e=t[l],i=o.resolveDataElementOptions(l,n),c=a.getPointPositionForValue(l,s.data[l]),h=r?a.xCenter:c.x,d=r?a.yCenter:c.y,u={x:h,y:d,angle:c.angle,skip:isNaN(h)||isNaN(d),options:i};o.updateElement(e,l,u,n)}}}ro.id="radar",ro.defaults={datasetElementType:"line",dataElementType:"point",indexAxis:"r",showLine:!0,elements:{line:{fill:"start"}}},ro.overrides={aspectRatio:1,scales:{r:{type:"radialLinear"}}};class lo extends oo{}lo.id="scatter",lo.defaults={showLine:!1,fill:!1},lo.overrides={interaction:{mode:"point"},plugins:{tooltip:{callbacks:{title:()=>"",label:t=>"("+t.label+", "+t.formattedValue+")"}}},scales:{x:{type:"linear"},y:{type:"linear"}}};var co=Object.freeze({__proto__:null,BarController:eo,BubbleController:io,DoughnutController:no,LineController:oo,PolarAreaController:so,PieController:ao,RadarController:ro,ScatterController:lo});function ho(t,e){const{startAngle:i,endAngle:n,pixelMargin:o,x:s,y:a,outerRadius:r,innerRadius:l}=e;let c=o/r;t.beginPath(),t.arc(s,a,r,i-c,n+c),l>o?(c=o/l,t.arc(s,a,l,n+c,i-c,!0)):t.arc(s,a,o,n+Mt,i-Mt),t.closePath(),t.clip()}function uo(t,e){const{x:i,y:n,startAngle:o,endAngle:s,pixelMargin:a}=e,r=Math.max(e.outerRadius-a,0),l=e.innerRadius+a;t.beginPath(),t.arc(i,n,r,o,s),t.arc(i,n,l,s,o,!0),t.closePath()}function fo(t,e){const{x:i,y:n,startAngle:o,endAngle:s,pixelMargin:a,options:r}=e,l=e.outerRadius,c=e.innerRadius+a,h="inner"===r.borderAlign;r.borderWidth&&(h?(t.lineWidth=2*r.borderWidth,t.lineJoin="round"):(t.lineWidth=r.borderWidth,t.lineJoin="bevel"),e.fullCircles&&function(t,e,i){const{x:n,y:o,startAngle:s,endAngle:a,pixelMargin:r}=e,l=Math.max(e.outerRadius-r,0),c=e.innerRadius+r;let h;for(i&&(e.endAngle=e.startAngle+bt,ho(t,e),e.endAngle=a,e.endAngle===e.startAngle&&(e.endAngle+=bt,e.fullCircles--)),t.beginPath(),t.arc(n,o,c,s+bt,s,!0),h=0;h<e.fullCircles;++h)t.stroke();for(t.beginPath(),t.arc(n,o,l,s,s+bt),h=0;h<e.fullCircles;++h)t.stroke()}(t,e,h),h&&ho(t,e),t.beginPath(),t.arc(i,n,l,o,s),t.arc(i,n,c,s,o,!0),t.closePath(),t.stroke())}class go extends Oi{constructor(t){super(),this.options=void 0,this.circumference=void 0,this.startAngle=void 0,this.endAngle=void 0,this.innerRadius=void 0,this.outerRadius=void 0,this.pixelMargin=0,this.fullCircles=0,t&&Object.assign(this,t)}inRange(t,e,i){const n=this.getProps(["x","y"],i),{angle:o,distance:s}=Ft(n,{x:t,y:e}),{startAngle:a,endAngle:r,innerRadius:l,outerRadius:c,circumference:h}=this.getProps(["startAngle","endAngle","innerRadius","outerRadius","circumference"],i);return(h>=bt||Wt(o,a,r))&&(s>=l&&s<=c)}getCenterPoint(t){const{x:e,y:i,startAngle:n,endAngle:o,innerRadius:s,outerRadius:a}=this.getProps(["x","y","startAngle","endAngle","innerRadius","outerRadius"],t),r=(n+o)/2,l=(s+a)/2;return{x:e+Math.cos(r)*l,y:i+Math.sin(r)*l}}tooltipPosition(t){return this.getCenterPoint(t)}draw(t){const e=this,i=e.options,n=i.offset||0;if(e.pixelMargin="inner"===i.borderAlign?.33:0,e.fullCircles=Math.floor(e.circumference/bt),!(0===e.circumference||e.innerRadius<0||e.outerRadius<0)){if(t.save(),n&&e.circumference<bt){const i=(e.startAngle+e.endAngle)/2;t.translate(Math.cos(i)*n,Math.sin(i)*n)}t.fillStyle=i.backgroundColor,t.strokeStyle=i.borderColor,function(t,e){if(e.fullCircles){e.endAngle=e.startAngle+bt,uo(t,e);for(let i=0;i<e.fullCircles;++i)t.fill()}isNaN(e.circumference)||(e.endAngle=e.startAngle+e.circumference%bt),uo(t,e),t.fill()}(t,e),fo(t,e),t.restore()}}}function po(t,e,i){t.lineTo(i.x,i.y)}function mo(t,e,i){i=i||{};const n=t.length,o=Math.max(i.start||0,e.start),s=Math.min(i.end||n-1,e.end);return{count:n,start:o,loop:e.loop,ilen:s<o?n+s-o:s-o}}function xo(t,e,i,n){const{points:o,options:s}=e,{count:a,start:r,loop:l,ilen:c}=mo(o,i,n),h=function(t){return t.stepped?Qt:t.tension?Jt:po}(s);let d,u,f,{move:g=!0,reverse:p}=n||{};for(d=0;d<=c;++d)u=o[(r+(p?c-d:d))%a],u.skip||(g?(t.moveTo(u.x,u.y),g=!1):h(t,f,u,p,s.stepped),f=u);return l&&(u=o[(r+(p?c:0))%a],h(t,f,u,p,s.stepped)),!!l}function bo(t,e,i,n){const o=e.points,{count:s,start:a,ilen:r}=mo(o,i,n),{move:l=!0,reverse:c}=n||{};let h,d,u,f,g,p,m=0,x=0;const b=t=>(a+(c?r-t:t))%s,_=()=>{f!==g&&(t.lineTo(m,g),t.lineTo(m,f),t.lineTo(m,p))};for(l&&(d=o[b(0)],t.moveTo(d.x,d.y)),h=0;h<=r;++h){if(d=o[b(h)],d.skip)continue;const e=d.x,i=d.y,n=0|e;n===u?(i<f?f=i:i>g&&(g=i),m=(x*m+e)/++x):(_(),t.lineTo(e,i),u=n,x=0,f=g=i),p=i}_()}function _o(t){const e=t.options,i=e.borderDash&&e.borderDash.length;return!(t._decimated||t._loop||e.tension||e.stepped||i)?bo:xo}go.id="arc",go.defaults={borderAlign:"center",borderColor:"#fff",borderWidth:2,offset:0,angle:void 0},go.defaultRoutes={backgroundColor:"backgroundColor"};const yo="function"==typeof Path2D?function(t,e,i,n){let o=e._path;o||(o=e._path=new Path2D,e.path(o,i,n)&&o.closePath()),t.stroke(o)}:function(t,e,i,n){t.beginPath(),e.path(t,i,n)&&t.closePath(),t.stroke()};class vo extends Oi{constructor(t){super(),this.animated=!0,this.options=void 0,this._loop=void 0,this._fullLoop=void 0,this._path=void 0,this._points=void 0,this._segments=void 0,this._decimated=!1,this._pointsUpdated=!1,t&&Object.assign(this,t)}updateControlPoints(t){const e=this,i=e.options;if(i.tension&&!i.stepped&&!e._pointsUpdated){const n=i.spanGaps?e._loop:e._fullLoop;cn(e._points,i,t,n),e._pointsUpdated=!0}}set points(t){const e=this;e._points=t,delete e._segments,delete e._path,e._pointsUpdated=!1}get points(){return this._points}get segments(){return this._segments||(this._segments=yn(this))}first(){const t=this.segments,e=this.points;return t.length&&e[t[0].start]}last(){const t=this.segments,e=this.points,i=t.length;return i&&e[t[i-1].end]}interpolate(t,e){const i=this,n=i.options,o=t[e],s=i.points,a=_n(i,{property:e,start:o,end:o});if(!a.length)return;const r=[],l=function(t){return t.stepped?dn:t.tension?un:hn}(n);let c,h;for(c=0,h=a.length;c<h;++c){const{start:i,end:h}=a[c],d=s[i],u=s[h];if(d===u){r.push(d);continue}const f=l(d,u,Math.abs((o-d[e])/(u[e]-d[e])),n.stepped);f[e]=t[e],r.push(f)}return 1===r.length?r[0]:r}pathSegment(t,e,i){return _o(this)(t,this,e,i)}path(t,e,i){const n=this,o=n.segments,s=o.length,a=_o(n);let r=n._loop;e=e||0,i=i||n.points.length-e;for(let l=0;l<s;++l)r&=a(t,n,o[l],{start:e,end:e+i-1});return!!r}draw(t,e,i,n){const o=this,s=o.options||{};(o.points||[]).length&&s.borderWidth&&(t.save(),function(t,e){t.lineCap=e.borderCapStyle,t.setLineDash(e.borderDash),t.lineDashOffset=e.borderDashOffset,t.lineJoin=e.borderJoinStyle,t.lineWidth=e.borderWidth,t.strokeStyle=e.borderColor}(t,s),yo(t,o,i,n),t.restore(),o.animated&&(o._pointsUpdated=!1,o._path=void 0))}}function Mo(t,e,i,n){const o=t.options,{[i]:s}=t.getProps([i],n);return Math.abs(e-s)<o.radius+o.hitRadius}vo.id="line",vo.defaults={borderCapStyle:"butt",borderDash:[],borderDashOffset:0,borderJoinStyle:"miter",borderWidth:3,capBezierPoints:!0,cubicInterpolationMode:"default",fill:!1,spanGaps:!1,stepped:!1,tension:0},vo.defaultRoutes={backgroundColor:"backgroundColor",borderColor:"borderColor"},vo.descriptors={_scriptable:!0,_indexable:t=>"borderDash"!==t&&"fill"!==t};class wo extends Oi{constructor(t){super(),this.options=void 0,this.skip=void 0,this.stop=void 0,t&&Object.assign(this,t)}inRange(t,e,i){const n=this.options,{x:o,y:s}=this.getProps(["x","y"],i);return Math.pow(t-o,2)+Math.pow(e-s,2)<Math.pow(n.hitRadius+n.radius,2)}inXRange(t,e){return Mo(this,t,"x",e)}inYRange(t,e){return Mo(this,t,"y",e)}getCenterPoint(t){const{x:e,y:i}=this.getProps(["x","y"],t);return{x:e,y:i}}size(t){let e=(t=t||this.options||{}).radius||0;e=Math.max(e,e&&t.hoverRadius||0);return 2*(e+(e&&t.borderWidth||0))}draw(t){const e=this,i=e.options;e.skip||i.radius<.1||(t.strokeStyle=i.borderColor,t.lineWidth=i.borderWidth,t.fillStyle=i.backgroundColor,qt(t,i,e.x,e.y))}getRange(){const t=this.options||{};return t.radius+t.hitRadius}}function ko(t,e){const{x:i,y:n,base:o,width:s,height:a}=t.getProps(["x","y","base","width","height"],e);let r,l,c,h,d;return t.horizontal?(d=a/2,r=Math.min(i,o),l=Math.max(i,o),c=n-d,h=n+d):(d=s/2,r=i-d,l=i+d,c=Math.min(n,o),h=Math.max(n,o)),{left:r,top:c,right:l,bottom:h}}function So(t){let e=t.options.borderSkipped;const i={};return e?(e=t.horizontal?Po(e,"left","right",t.base>t.x):Po(e,"bottom","top",t.base<t.y),i[e]=!0,i):i}function Po(t,e,i,n){var o,s,a;return n?(a=i,t=Do(t=(o=t)===(s=e)?a:o===a?s:o,i,e)):t=Do(t,e,i),t}function Do(t,e,i){return"start"===t?e:"end"===t?i:t}function Co(t,e,i,n){return t?0:Math.max(Math.min(e,n),i)}function Ao(t){const e=ko(t),i=e.right-e.left,n=e.bottom-e.top,o=function(t,e,i){const n=t.options.borderWidth,o=So(t),s=Te(n);return{t:Co(o.top,s.top,0,i),r:Co(o.right,s.right,0,e),b:Co(o.bottom,s.bottom,0,i),l:Co(o.left,s.left,0,e)}}(t,i/2,n/2),s=function(t,e,i){const n=Le(t.options.borderRadius),o=Math.min(e,i),s=So(t);return{topLeft:Co(s.top||s.left,n.topLeft,0,o),topRight:Co(s.top||s.right,n.topRight,0,o),bottomLeft:Co(s.bottom||s.left,n.bottomLeft,0,o),bottomRight:Co(s.bottom||s.right,n.bottomRight,0,o)}}(t,i/2,n/2);return{outer:{x:e.left,y:e.top,w:i,h:n,radius:s},inner:{x:e.left+o.l,y:e.top+o.t,w:i-o.l-o.r,h:n-o.t-o.b,radius:{topLeft:Math.max(0,s.topLeft-Math.max(o.t,o.l)),topRight:Math.max(0,s.topRight-Math.max(o.t,o.r)),bottomLeft:Math.max(0,s.bottomLeft-Math.max(o.b,o.l)),bottomRight:Math.max(0,s.bottomRight-Math.max(o.b,o.r))}}}}function Oo(t,e,i,n){const o=null===e,s=null===i,a=t&&!(o&&s)&&ko(t,n);return a&&(o||e>=a.left&&e<=a.right)&&(s||i>=a.top&&i<=a.bottom)}function To(t,e){const{x:i,y:n,w:o,h:s,radius:a}=e;t.arc(i+a.topLeft,n+a.topLeft,a.topLeft,-Mt,xt,!0),t.lineTo(i,n+s-a.bottomLeft),t.arc(i+a.bottomLeft,n+s-a.bottomLeft,a.bottomLeft,xt,Mt,!0),t.lineTo(i+o-a.bottomRight,n+s),t.arc(i+o-a.bottomRight,n+s-a.bottomRight,a.bottomRight,Mt,0,!0),t.lineTo(i+o,n+a.topRight),t.arc(i+o-a.topRight,n+a.topRight,a.topRight,0,-Mt,!0),t.lineTo(i+a.topLeft,n)}function Lo(t,e){t.rect(e.x,e.y,e.w,e.h)}wo.id="point",wo.defaults={borderWidth:1,hitRadius:1,hoverBorderWidth:1,hoverRadius:4,pointStyle:"circle",radius:3,rotation:0},wo.defaultRoutes={backgroundColor:"backgroundColor",borderColor:"borderColor"};class Ro extends Oi{constructor(t){super(),this.options=void 0,this.horizontal=void 0,this.base=void 0,this.width=void 0,this.height=void 0,t&&Object.assign(this,t)}draw(t){const e=this.options,{inner:i,outer:n}=Ao(this),o=(s=n.radius).topLeft||s.topRight||s.bottomLeft||s.bottomRight?To:Lo;var s;t.save(),n.w===i.w&&n.h===i.h||(t.beginPath(),o(t,n),t.clip(),o(t,i),t.fillStyle=e.borderColor,t.fill("evenodd")),t.beginPath(),o(t,i),t.fillStyle=e.backgroundColor,t.fill(),t.restore()}inRange(t,e,i){return Oo(this,t,e,i)}inXRange(t,e){return Oo(this,t,null,e)}inYRange(t,e){return Oo(this,null,t,e)}getCenterPoint(t){const{x:e,y:i,base:n,horizontal:o}=this.getProps(["x","y","base","horizontal"],t);return{x:o?(e+n)/2:e,y:o?i:(i+n)/2}}getRange(t){return"x"===t?this.width/2:this.height/2}}Ro.id="bar",Ro.defaults={borderSkipped:"start",borderWidth:0,borderRadius:0,pointStyle:void 0},Ro.defaultRoutes={backgroundColor:"backgroundColor",borderColor:"borderColor"};var Eo=Object.freeze({__proto__:null,ArcElement:go,LineElement:vo,PointElement:wo,BarElement:Ro});function Io(t){t.data.datasets.forEach((t=>{if(t._decimated){const e=t._data;delete t._decimated,delete t._data,Object.defineProperty(t,"data",{value:e})}}))}var Fo={id:"decimation",defaults:{algorithm:"min-max",enabled:!1},beforeElementsUpdate:(t,e,i)=>{if(!i.enabled)return void Io(t);const n=t.width;t.data.datasets.forEach(((e,o)=>{const{_data:s,indexAxis:a}=e,r=t.getDatasetMeta(o),l=s||e.data;if("y"===Ie([a,t.options.indexAxis]))return;if("line"!==r.type)return;const c=t.scales[r.xAxisID];if("linear"!==c.type&&"time"!==c.type)return;if(t.options.parsing)return;if(l.length<=4*n)return;let h;switch($(s)&&(e._data=l,delete e.data,Object.defineProperty(e,"data",{configurable:!0,enumerable:!0,get:function(){return this._decimated},set:function(t){this._data=t}})),i.algorithm){case"lttb":h=function(t,e,i){const n=i.samples||e,o=[],s=(t.length-2)/(n-2);let a,r,l,c,h,d=0,u=0;for(o[d++]=t[u],a=0;a<n-2;a++){let e,i=0,n=0;const f=Math.floor((a+1)*s)+1,g=Math.min(Math.floor((a+2)*s)+1,t.length),p=g-f;for(e=f;e<g;e++)i=t[e].x,n=t[e].y;i/=p,n/=p;const m=Math.floor(a*s)+1,x=Math.floor((a+1)*s)+1,{x:b,y:_}=t[u];for(l=c=-1,e=m;e<x;e++)c=.5*Math.abs((b-i)*(t[e].y-_)-(b-t[e].x)*(n-_)),c>l&&(l=c,r=t[e],h=e);o[d++]=r,u=h}return o[d++]=t[t.length-1],o}(l,n,i);break;case"min-max":h=function(t,e){let i,n,o,s,a,r,l,c,h,d,u=0,f=0;const g=[],p=t[0].x,m=t[t.length-1].x-p;for(i=0;i<t.length;++i){n=t[i],o=(n.x-p)/m*e,s=n.y;const x=0|o;if(x===a)s<h?(h=s,r=i):s>d&&(d=s,l=i),u=(f*u+n.x)/++f;else{const e=i-1;if(!$(r)&&!$(l)){const i=Math.min(r,l),n=Math.max(r,l);i!==c&&i!==e&&g.push({...t[i],x:u}),n!==c&&n!==e&&g.push({...t[n],x:u})}i>0&&e!==c&&g.push(t[e]),g.push(n),a=x,f=0,h=d=s,r=l=c=i}}return g}(l,n);break;default:throw new Error(`Unsupported decimation algorithm '${i.algorithm}'`)}e._decimated=h}))},destroy(t){Io(t)}};function zo(t,e,i){const n=function(t){const e=t.options,i=e.fill;let n=K(i&&i.target,i);return void 0===n&&(n=!!e.backgroundColor),!1!==n&&null!==n&&(!0===n?"origin":n)}(t);if(U(n))return!isNaN(n.value)&&n;let o=parseFloat(n);return X(o)&&Math.floor(o)===o?("-"!==n[0]&&"+"!==n[0]||(o=e+o),!(o===e||o<0||o>=i)&&o):["origin","start","end","stack"].indexOf(n)>=0&&n}class Vo{constructor(t){this.x=t.x,this.y=t.y,this.radius=t.radius}pathSegment(t,e,i){const{x:n,y:o,radius:s}=this;return e=e||{start:0,end:bt},t.arc(n,o,s,e.end,e.start,!0),!i.bounds}interpolate(t){const{x:e,y:i,radius:n}=this,o=t.angle;return{x:e+Math.cos(o)*n,y:i+Math.sin(o)*n,angle:o}}}function Bo(t){return(t.scale||{}).getPointPositionForValue?function(t){const{scale:e,fill:i}=t,n=e.options,o=e.getLabels().length,s=[],a=n.reverse?e.max:e.min,r=n.reverse?e.min:e.max;let l,c,h;if(h="start"===i?a:"end"===i?r:U(i)?i.value:e.getBaseValue(),n.grid.circular)return c=e.getPointPositionForValue(0,a),new Vo({x:c.x,y:c.y,radius:e.getDistanceFromCenterForValue(h)});for(l=0;l<o;++l)s.push(e.getPointPositionForValue(l,h));return s}(t):function(t){const{scale:e={},fill:i}=t;let n,o=null;return"start"===i?o=e.bottom:"end"===i?o=e.top:U(i)?o=e.getPixelForValue(i.value):e.getBasePixel&&(o=e.getBasePixel()),X(o)?(n=e.isHorizontal(),{x:n?o:null,y:n?null:o}):null}(t)}function Wo(t){const{chart:e,scale:i,index:n,line:o}=t,s=[],a=o.segments,r=o.points,l=function(t,e){const i=[],n=t.getSortedVisibleDatasetMetas();for(let t=0;t<n.length;t++){const o=n[t];if(o.index===e)break;Ho(o)&&i.unshift(o.dataset)}return i}(e,n);l.push($o({x:null,y:i.bottom},o));for(let t=0;t<a.length;t++){const e=a[t];for(let t=e.start;t<=e.end;t++)No(s,r[t],l)}return new vo({points:s,options:{}})}const Ho=t=>"line"===t.type&&!t.hidden;function No(t,e,i){const n=[];for(let o=0;o<i.length;o++){const s=i[o],{first:a,last:r,point:l}=jo(s,e,"x");if(!(!l||a&&r))if(a)n.unshift(l);else if(t.push(l),!r)break}t.push(...n)}function jo(t,e,i){const n=t.interpolate(e,i);if(!n)return{};const o=n[i],s=t.segments,a=t.points;let r=!1,l=!1;for(let t=0;t<s.length;t++){const e=s[t],n=a[e.start][i],c=a[e.end][i];if(o>=n&&o<=c){r=o===n,l=o===c;break}}return{first:r,last:l,point:n}}function $o(t,e){let i=[],n=!1;return Y(t)?(n=!0,i=t):i=function(t,e){const{x:i=null,y:n=null}=t||{},o=e.points,s=[];return e.segments.forEach((t=>{const e=o[t.start],a=o[t.end];null!==n?(s.push({x:e.x,y:n}),s.push({x:a.x,y:n})):null!==i&&(s.push({x:i,y:e.y}),s.push({x:i,y:a.y}))})),s}(t,e),i.length?new vo({points:i,options:{tension:0},_loop:n,_fullLoop:n}):null}function Yo(t,e,i){let n=t[e].fill;const o=[e];let s;if(!i)return n;for(;!1!==n&&-1===o.indexOf(n);){if(!X(n))return n;if(s=t[n],!s)return!1;if(s.visible)return n;o.push(n),n=s.fill}return!1}function Uo(t,e,i){t.beginPath(),e.path(t),t.lineTo(e.last().x,i),t.lineTo(e.first().x,i),t.closePath(),t.clip()}function Xo(t,e,i,n){if(n)return;let o=e[t],s=i[t];return"angle"===t&&(o=Bt(o),s=Bt(s)),{property:t,start:o,end:s}}function qo(t,e,i,n){return t&&e?n(t[i],e[i]):t?t[i]:e?e[i]:0}function Ko(t,e,i){const{top:n,bottom:o}=e.chart.chartArea,{property:s,start:a,end:r}=i||{};"x"===s&&(t.beginPath(),t.rect(a,n,r-a,o-n),t.clip())}function Go(t,e,i,n){const o=e.interpolate(i,n);o&&t.lineTo(o.x,o.y)}function Zo(t,e){const{line:i,target:n,property:o,color:s,scale:a}=e,r=function(t,e,i){const n=t.segments,o=t.points,s=e.points,a=[];for(let t=0;t<n.length;t++){const r=n[t],l=Xo(i,o[r.start],o[r.end],r.loop);if(!e.segments){a.push({source:r,target:l,start:o[r.start],end:o[r.end]});continue}const c=_n(e,l);for(let t=0;t<c.length;++t){const e=c[t],n=Xo(i,s[e.start],s[e.end],e.loop),h=bn(r,o,n);for(let t=0;t<h.length;t++)a.push({source:h[t],target:e,start:{[i]:qo(l,n,"start",Math.max)},end:{[i]:qo(l,n,"end",Math.min)}})}}return a}(i,n,o);t.fillStyle=s;for(let e=0,s=r.length;e<s;++e){const{source:s,target:l,start:c,end:h}=r[e];t.save(),Ko(t,a,Xo(o,c,h)),t.beginPath();const d=!!i.pathSegment(t,s);d?t.closePath():Go(t,n,h,o);const u=!!n.pathSegment(t,l,{move:d,reverse:!0}),f=d&&u;f||Go(t,n,c,o),t.closePath(),t.fill(f?"evenodd":"nonzero"),t.restore()}}var Qo={id:"filler",afterDatasetsUpdate(t,e,i){const n=(t.data.datasets||[]).length,o=i.propagate,s=[];let a,r,l,c;for(r=0;r<n;++r)a=t.getDatasetMeta(r),l=a.dataset,c=null,l&&l.options&&l instanceof vo&&(c={visible:t.isDatasetVisible(r),index:r,fill:zo(l,r,n),chart:t,scale:a.vScale,line:l}),a.$filler=c,s.push(c);for(r=0;r<n;++r)c=s[r],c&&!1!==c.fill&&(c.fill=Yo(s,r,o))},beforeDatasetsDraw(t){const e=t.getSortedVisibleDatasetMetas(),i=t.chartArea;let n,o;for(n=e.length-1;n>=0;--n)o=e[n].$filler,o&&o.line.updateControlPoints(i)},beforeDatasetDraw(t,e){const i=t.chartArea,n=t.ctx,o=e.meta.$filler;if(!o||!1===o.fill)return;const s=function(t){const{chart:e,fill:i,line:n}=t;if(X(i))return function(t,e){const i=t.getDatasetMeta(e);return i&&t.isDatasetVisible(e)?i.dataset:null}(e,i);if("stack"===i)return Wo(t);const o=Bo(t);return o instanceof Vo?o:$o(o,n)}(o),{line:a,scale:r}=o,l=a.options,c=l.fill,h=l.backgroundColor,{above:d=h,below:u=h}=c||{};s&&a.points.length&&(Gt(n,i),function(t,e){const{line:i,target:n,above:o,below:s,area:a,scale:r}=e,l=i._loop?"angle":"x";t.save(),"x"===l&&s!==o&&(Uo(t,n,a.top),Zo(t,{line:i,target:n,color:o,scale:r,property:l}),t.restore(),t.save(),Uo(t,n,a.bottom)),Zo(t,{line:i,target:n,color:s,scale:r,property:l}),t.restore()}(n,{line:a,target:s,above:d,below:u,area:i,scale:r}),Zt(n))},defaults:{propagate:!0}};const Jo=(t,e)=>{let{boxHeight:i=e,boxWidth:n=e}=t;return t.usePointStyle&&(i=Math.min(i,e),n=Math.min(n,e)),{boxWidth:n,boxHeight:i,itemHeight:Math.max(e,i)}};class ts extends Oi{constructor(t){super(),this._added=!1,this.legendHitBoxes=[],this._hoveredItem=null,this.doughnutMode=!1,this.chart=t.chart,this.options=t.options,this.ctx=t.ctx,this.legendItems=void 0,this.columnSizes=void 0,this.lineWidths=void 0,this.maxHeight=void 0,this.maxWidth=void 0,this.top=void 0,this.bottom=void 0,this.left=void 0,this.right=void 0,this.height=void 0,this.width=void 0,this._margins=void 0,this.position=void 0,this.weight=void 0,this.fullSize=void 0}update(t,e,i){const n=this;n.maxWidth=t,n.maxHeight=e,n._margins=i,n.setDimensions(),n.buildLabels(),n.fit()}setDimensions(){const t=this;t.isHorizontal()?(t.width=t.maxWidth,t.left=0,t.right=t.width):(t.height=t.maxHeight,t.top=0,t.bottom=t.height)}buildLabels(){const t=this,e=t.options.labels||{};let i=Q(e.generateLabels,[t.chart],t)||[];e.filter&&(i=i.filter((i=>e.filter(i,t.chart.data)))),e.sort&&(i=i.sort(((i,n)=>e.sort(i,n,t.chart.data)))),t.options.reverse&&i.reverse(),t.legendItems=i}fit(){const t=this,{options:e,ctx:i}=t;if(!e.display)return void(t.width=t.height=0);const n=e.labels,o=Ee(n.font),s=o.size,a=t._computeTitleHeight(),{boxWidth:r,itemHeight:l}=Jo(n,s);let c,h;i.font=o.string,t.isHorizontal()?(c=t.maxWidth,h=t._fitRows(a,s,r,l)+10):(h=t.maxHeight,c=t._fitCols(a,s,r,l)+10),t.width=Math.min(c,e.maxWidth||t.maxWidth),t.height=Math.min(h,e.maxHeight||t.maxHeight)}_fitRows(t,e,i,n){const o=this,{ctx:s,maxWidth:a,options:{labels:{padding:r}}}=o,l=o.legendHitBoxes=[],c=o.lineWidths=[0],h=n+r;let d=t;s.textAlign="left",s.textBaseline="middle";let u=-1,f=-h;return o.legendItems.forEach(((t,o)=>{const g=i+e/2+s.measureText(t.text).width;(0===o||c[c.length-1]+g+2*r>a)&&(d+=h,c[c.length-(o>0?0:1)]=0,f+=h,u++),l[o]={left:0,top:f,row:u,width:g,height:n},c[c.length-1]+=g+r})),d}_fitCols(t,e,i,n){const o=this,{ctx:s,maxHeight:a,options:{labels:{padding:r}}}=o,l=o.legendHitBoxes=[],c=o.columnSizes=[],h=a-t;let d=r,u=0,f=0,g=0,p=0,m=0;return o.legendItems.forEach(((t,o)=>{const a=i+e/2+s.measureText(t.text).width;o>0&&f+e+2*r>h&&(d+=u+r,c.push({width:u,height:f}),g+=u+r,m++,p=0,u=f=0),u=Math.max(u,a),f+=e+r,l[o]={left:g,top:p,col:m,width:a,height:n},p+=n+r})),d+=u,c.push({width:u,height:f}),d}adjustHitBoxes(){const t=this;if(!t.options.display)return;const e=t._computeTitleHeight(),{legendHitBoxes:i,options:{align:n,labels:{padding:s}}}=t;if(this.isHorizontal()){let a=0,r=o(n,t.left+s,t.right-t.lineWidths[a]);for(const l of i)a!==l.row&&(a=l.row,r=o(n,t.left+s,t.right-t.lineWidths[a])),l.top+=t.top+e+s,l.left=r,r+=l.width+s}else{let a=0,r=o(n,t.top+e+s,t.bottom-t.columnSizes[a].height);for(const l of i)l.col!==a&&(a=l.col,r=o(n,t.top+e+s,t.bottom-t.columnSizes[a].height)),l.top=r,l.left+=t.left+s,r+=l.height+s}}isHorizontal(){return"top"===this.options.position||"bottom"===this.options.position}draw(){const t=this;if(t.options.display){const e=t.ctx;Gt(e,t),t._draw(),Zt(e)}}_draw(){const t=this,{options:e,columnSizes:i,lineWidths:n,ctx:a}=t,{align:r,labels:l}=e,c=mt.color,h=fn(e.rtl,t.left,t.width),d=Ee(l.font),{color:u,padding:f}=l,g=d.size,p=g/2;let m;t.drawTitle(),a.textAlign=h.textAlign("left"),a.textBaseline="middle",a.lineWidth=.5,a.strokeStyle=u,a.fillStyle=u,a.font=d.string;const{boxWidth:x,boxHeight:b,itemHeight:_}=Jo(l,g),y=t.isHorizontal(),v=this._computeTitleHeight();m=y?{x:o(r,t.left+f,t.right-n[0]),y:t.top+f+v,line:0}:{x:t.left+f,y:o(r,t.top+v+f,t.bottom-i[0].height),line:0},gn(t.ctx,e.textDirection);const M=_+f;t.legendItems.forEach(((e,u)=>{const w=a.measureText(e.text).width,k=h.textAlign(e.textAlign||(e.textAlign=l.textAlign)),S=x+g/2+w;let P=m.x,D=m.y;h.setWidth(t.width),y?u>0&&P+S+f>t.right&&(D=m.y+=M,m.line++,P=m.x=o(r,t.left+f,t.right-n[m.line])):u>0&&D+M>t.bottom&&(P=m.x=P+i[m.line].width+f,m.line++,D=m.y=o(r,t.top+v+f,t.bottom-i[m.line].height));!function(t,e,i){if(isNaN(x)||x<=0||isNaN(b)||b<0)return;a.save();const n=K(i.lineWidth,1);if(a.fillStyle=K(i.fillStyle,c),a.lineCap=K(i.lineCap,"butt"),a.lineDashOffset=K(i.lineDashOffset,0),a.lineJoin=K(i.lineJoin,"miter"),a.lineWidth=n,a.strokeStyle=K(i.strokeStyle,c),a.setLineDash(K(i.lineDash,[])),l.usePointStyle){const o={radius:x*Math.SQRT2/2,pointStyle:i.pointStyle,rotation:i.rotation,borderWidth:n},s=h.xPlus(t,x/2);qt(a,o,s,e+p)}else{const i=e+Math.max((g-b)/2,0);a.fillRect(h.leftForLtr(t,x),i,x,b),0!==n&&a.strokeRect(h.leftForLtr(t,x),i,x,b)}a.restore()}(h.x(P),D,e),P=s(k,P+x+p,t.right),function(t,e,i){te(a,i.text,t,e+_/2,d,{strikethrough:i.hidden,textAlign:i.textAlign})}(h.x(P),D,e),y?m.x+=S+f:m.y+=M})),pn(t.ctx,e.textDirection)}drawTitle(){const t=this,e=t.options,i=e.title,s=Ee(i.font),a=Re(i.padding);if(!i.display)return;const r=fn(e.rtl,t.left,t.width),l=t.ctx,c=i.position,h=s.size/2,d=a.top+h;let u,f=t.left,g=t.width;if(this.isHorizontal())g=Math.max(...t.lineWidths),u=t.top+d,f=o(e.align,f,t.right-g);else{const i=t.columnSizes.reduce(((t,e)=>Math.max(t,e.height)),0);u=d+o(e.align,t.top,t.bottom-i-e.labels.padding-t._computeTitleHeight())}const p=o(c,f,f+g);l.textAlign=r.textAlign(n(c)),l.textBaseline="middle",l.strokeStyle=i.color,l.fillStyle=i.color,l.font=s.string,te(l,i.text,p,u,s)}_computeTitleHeight(){const t=this.options.title,e=Ee(t.font),i=Re(t.padding);return t.display?e.lineHeight+i.height:0}_getLegendItemAt(t,e){const i=this;let n,o,s;if(t>=i.left&&t<=i.right&&e>=i.top&&e<=i.bottom)for(s=i.legendHitBoxes,n=0;n<s.length;++n)if(o=s[n],t>=o.left&&t<=o.left+o.width&&e>=o.top&&e<=o.top+o.height)return i.legendItems[n];return null}handleEvent(t){const e=this,i=e.options;if(!function(t,e){if("mousemove"===t&&(e.onHover||e.onLeave))return!0;if(e.onClick&&("click"===t||"mouseup"===t))return!0;return!1}(t.type,i))return;const n=e._getLegendItemAt(t.x,t.y);if("mousemove"===t.type){const a=e._hoveredItem,r=(s=n,null!==(o=a)&&null!==s&&o.datasetIndex===s.datasetIndex&&o.index===s.index);a&&!r&&Q(i.onLeave,[t,a,e],e),e._hoveredItem=n,n&&!r&&Q(i.onHover,[t,n,e],e)}else n&&Q(i.onClick,[t,n,e],e);var o,s}}var es={id:"legend",_element:ts,start(t,e,i){const n=t.legend=new ts({ctx:t.ctx,options:i,chart:t});Xe.configure(t,n,i),Xe.addBox(t,n)},stop(t){Xe.removeBox(t,t.legend),delete t.legend},beforeUpdate(t,e,i){const n=t.legend;Xe.configure(t,n,i),n.options=i},afterUpdate(t){const e=t.legend;e.buildLabels(),e.adjustHitBoxes()},afterEvent(t,e){e.replay||t.legend.handleEvent(e.event)},defaults:{display:!0,position:"top",align:"center",fullSize:!0,reverse:!1,weight:1e3,onClick(t,e,i){const n=e.datasetIndex,o=i.chart;o.isDatasetVisible(n)?(o.hide(n),e.hidden=!0):(o.show(n),e.hidden=!1)},onHover:null,onLeave:null,labels:{color:t=>t.chart.options.color,boxWidth:40,padding:10,generateLabels(t){const e=t.data.datasets,{labels:{usePointStyle:i,pointStyle:n,textAlign:o}}=t.legend.options;return t._getSortedDatasetMetas().map((t=>{const s=t.controller.getStyle(i?0:void 0),a=Re(s.borderWidth);return{text:e[t.index].label,fillStyle:s.backgroundColor,hidden:!t.visible,lineCap:s.borderCapStyle,lineDash:s.borderDash,lineDashOffset:s.borderDashOffset,lineJoin:s.borderJoinStyle,lineWidth:(a.width+a.height)/4,strokeStyle:s.borderColor,pointStyle:n||s.pointStyle,rotation:s.rotation,textAlign:o||s.textAlign,datasetIndex:t.index}}),this)}},title:{color:t=>t.chart.options.color,display:!1,position:"center",text:""}},descriptors:{_scriptable:t=>!t.startsWith("on"),labels:{_scriptable:t=>!["generateLabels","filter","sort"].includes(t)}}};class is extends Oi{constructor(t){super(),this.chart=t.chart,this.options=t.options,this.ctx=t.ctx,this._padding=void 0,this.top=void 0,this.bottom=void 0,this.left=void 0,this.right=void 0,this.width=void 0,this.height=void 0,this.position=void 0,this.weight=void 0,this.fullSize=void 0}update(t,e){const i=this,n=i.options;if(i.left=0,i.top=0,!n.display)return void(i.width=i.height=i.right=i.bottom=0);i.width=i.right=t,i.height=i.bottom=e;const o=Y(n.text)?n.text.length:1;i._padding=Re(n.padding);const s=o*Ee(n.font).lineHeight+i._padding.height;i.isHorizontal()?i.height=s:i.width=s}isHorizontal(){const t=this.options.position;return"top"===t||"bottom"===t}_drawArgs(t){const{top:e,left:i,bottom:n,right:s,options:a}=this,r=a.align;let l,c,h,d=0;return this.isHorizontal()?(c=o(r,i,s),h=e+t,l=s-i):("left"===a.position?(c=i+t,h=o(r,n,e),d=-.5*xt):(c=s-t,h=o(r,e,n),d=.5*xt),l=n-e),{titleX:c,titleY:h,maxWidth:l,rotation:d}}draw(){const t=this,e=t.ctx,i=t.options;if(!i.display)return;const o=Ee(i.font),s=o.lineHeight/2+t._padding.top,{titleX:a,titleY:r,maxWidth:l,rotation:c}=t._drawArgs(s);te(e,i.text,0,0,o,{color:i.color,maxWidth:l,rotation:c,textAlign:n(i.align),textBaseline:"middle",translation:[a,r]})}}var ns={id:"title",_element:is,start(t,e,i){!function(t,e){const i=new is({ctx:t.ctx,options:e,chart:t});Xe.configure(t,i,e),Xe.addBox(t,i),t.titleBlock=i}(t,i)},stop(t){const e=t.titleBlock;Xe.removeBox(t,e),delete t.titleBlock},beforeUpdate(t,e,i){const n=t.titleBlock;Xe.configure(t,n,i),n.options=i},defaults:{align:"center",display:!1,font:{style:"bold"},fullSize:!0,padding:10,position:"top",text:"",weight:2e3},defaultRoutes:{color:"color"},descriptors:{_scriptable:!0,_indexable:!1}};const os={average(t){if(!t.length)return!1;let e,i,n=0,o=0,s=0;for(e=0,i=t.length;e<i;++e){const i=t[e].element;if(i&&i.hasValue()){const t=i.tooltipPosition();n+=t.x,o+=t.y,++s}}return{x:n/s,y:o/s}},nearest(t,e){let i,n,o,s=e.x,a=e.y,r=Number.POSITIVE_INFINITY;for(i=0,n=t.length;i<n;++i){const n=t[i].element;if(n&&n.hasValue()){const t=zt(e,n.getCenterPoint());t<r&&(r=t,o=n)}}if(o){const t=o.tooltipPosition();s=t.x,a=t.y}return{x:s,y:a}}};function ss(t,e){return e&&(Y(e)?Array.prototype.push.apply(t,e):t.push(e)),t}function as(t){return("string"==typeof t||t instanceof String)&&t.indexOf("\n")>-1?t.split("\n"):t}function rs(t,e){const{element:i,datasetIndex:n,index:o}=e,s=t.getDatasetMeta(n).controller,{label:a,value:r}=s.getLabelAndValue(o);return{chart:t,label:a,parsed:s.getParsed(o),raw:t.data.datasets[n].data[o],formattedValue:r,dataset:s.getDataset(),dataIndex:o,datasetIndex:n,element:i}}function ls(t,e){const i=t._chart.ctx,{body:n,footer:o,title:s}=t,{boxWidth:a,boxHeight:r}=e,l=Ee(e.bodyFont),c=Ee(e.titleFont),h=Ee(e.footerFont),d=s.length,u=o.length,f=n.length,g=Re(e.padding);let p=g.height,m=0,x=n.reduce(((t,e)=>t+e.before.length+e.lines.length+e.after.length),0);if(x+=t.beforeBody.length+t.afterBody.length,d&&(p+=d*c.lineHeight+(d-1)*e.titleSpacing+e.titleMarginBottom),x){p+=f*(e.displayColors?Math.max(r,l.lineHeight):l.lineHeight)+(x-f)*l.lineHeight+(x-1)*e.bodySpacing}u&&(p+=e.footerMarginTop+u*h.lineHeight+(u-1)*e.footerSpacing);let b=0;const _=function(t){m=Math.max(m,i.measureText(t).width+b)};return i.save(),i.font=c.string,J(t.title,_),i.font=l.string,J(t.beforeBody.concat(t.afterBody),_),b=e.displayColors?a+2:0,J(n,(t=>{J(t.before,_),J(t.lines,_),J(t.after,_)})),b=0,i.font=h.string,J(t.footer,_),i.restore(),m+=g.width,{width:m,height:p}}function cs(t,e,i,n){const{x:o,width:s}=i,{width:a,chartArea:{left:r,right:l}}=t;let c="center";return"center"===n?c=o<=(r+l)/2?"left":"right":o<=s/2?c="left":o>=a-s/2&&(c="right"),function(t,e,i,n){const{x:o,width:s}=n,a=i.caretSize+i.caretPadding;return"left"===t&&o+s+a>e.width||"right"===t&&o-s-a<0||void 0}(c,t,e,i)&&(c="center"),c}function hs(t,e,i){const n=e.yAlign||function(t,e){const{y:i,height:n}=e;return i<n/2?"top":i>t.height-n/2?"bottom":"center"}(t,i);return{xAlign:e.xAlign||cs(t,e,i,n),yAlign:n}}function ds(t,e,i,n){const{caretSize:o,caretPadding:s,cornerRadius:a}=t,{xAlign:r,yAlign:l}=i,c=o+s,h=a+s;let d=function(t,e){let{x:i,width:n}=t;return"right"===e?i-=n:"center"===e&&(i-=n/2),i}(e,r);const u=function(t,e,i){let{y:n,height:o}=t;return"top"===e?n+=i:n-="bottom"===e?o+i:o/2,n}(e,l,c);return"center"===l?"left"===r?d+=c:"right"===r&&(d-=c):"left"===r?d-=h:"right"===r&&(d+=h),{x:Ht(d,0,n.width-e.width),y:Ht(u,0,n.height-e.height)}}function us(t,e,i){const n=Re(i.padding);return"center"===e?t.x+t.width/2:"right"===e?t.x+t.width-n.right:t.x+n.left}function fs(t){return ss([],as(t))}function gs(t,e){const i=e&&e.dataset&&e.dataset.tooltip&&e.dataset.tooltip.callbacks;return i?t.override(i):t}class ps extends Oi{constructor(t){super(),this.opacity=0,this._active=[],this._chart=t._chart,this._eventPosition=void 0,this._size=void 0,this._cachedAnimations=void 0,this._tooltipItems=[],this.$animations=void 0,this.$context=void 0,this.options=t.options,this.dataPoints=void 0,this.title=void 0,this.beforeBody=void 0,this.body=void 0,this.afterBody=void 0,this.footer=void 0,this.xAlign=void 0,this.yAlign=void 0,this.x=void 0,this.y=void 0,this.height=void 0,this.width=void 0,this.caretX=void 0,this.caretY=void 0,this.labelColors=void 0,this.labelPointStyles=void 0,this.labelTextColors=void 0}initialize(t){this.options=t,this._cachedAnimations=void 0,this.$context=void 0}_resolveAnimations(){const t=this,e=t._cachedAnimations;if(e)return e;const i=t._chart,n=t.options.setContext(t.getContext()),o=n.enabled&&i.options.animation&&n.animations,s=new bi(t._chart,o);return o._cacheable&&(t._cachedAnimations=Object.freeze(s)),s}getContext(){const t=this;return t.$context||(t.$context=(e=t._chart.getContext(),i=t,n=t._tooltipItems,Object.assign(Object.create(e),{tooltip:i,tooltipItems:n,type:"tooltip"})));var e,i,n}getTitle(t,e){const i=this,{callbacks:n}=e,o=n.beforeTitle.apply(i,[t]),s=n.title.apply(i,[t]),a=n.afterTitle.apply(i,[t]);let r=[];return r=ss(r,as(o)),r=ss(r,as(s)),r=ss(r,as(a)),r}getBeforeBody(t,e){return fs(e.callbacks.beforeBody.apply(this,[t]))}getBody(t,e){const i=this,{callbacks:n}=e,o=[];return J(t,(t=>{const e={before:[],lines:[],after:[]},s=gs(n,t);ss(e.before,as(s.beforeLabel.call(i,t))),ss(e.lines,s.label.call(i,t)),ss(e.after,as(s.afterLabel.call(i,t))),o.push(e)})),o}getAfterBody(t,e){return fs(e.callbacks.afterBody.apply(this,[t]))}getFooter(t,e){const i=this,{callbacks:n}=e,o=n.beforeFooter.apply(i,[t]),s=n.footer.apply(i,[t]),a=n.afterFooter.apply(i,[t]);let r=[];return r=ss(r,as(o)),r=ss(r,as(s)),r=ss(r,as(a)),r}_createItems(t){const e=this,i=e._active,n=e._chart.data,o=[],s=[],a=[];let r,l,c=[];for(r=0,l=i.length;r<l;++r)c.push(rs(e._chart,i[r]));return t.filter&&(c=c.filter(((e,i,o)=>t.filter(e,i,o,n)))),t.itemSort&&(c=c.sort(((e,i)=>t.itemSort(e,i,n)))),J(c,(i=>{const n=gs(t.callbacks,i);o.push(n.labelColor.call(e,i)),s.push(n.labelPointStyle.call(e,i)),a.push(n.labelTextColor.call(e,i))})),e.labelColors=o,e.labelPointStyles=s,e.labelTextColors=a,e.dataPoints=c,c}update(t,e){const i=this,n=i.options.setContext(i.getContext()),o=i._active;let s,a=[];if(o.length){const t=os[n.position].call(i,o,i._eventPosition);a=i._createItems(n),i.title=i.getTitle(a,n),i.beforeBody=i.getBeforeBody(a,n),i.body=i.getBody(a,n),i.afterBody=i.getAfterBody(a,n),i.footer=i.getFooter(a,n);const e=i._size=ls(i,n),r=Object.assign({},t,e),l=hs(i._chart,n,r),c=ds(n,r,l,i._chart);i.xAlign=l.xAlign,i.yAlign=l.yAlign,s={opacity:1,x:c.x,y:c.y,width:e.width,height:e.height,caretX:t.x,caretY:t.y}}else 0!==i.opacity&&(s={opacity:0});i._tooltipItems=a,i.$context=void 0,s&&i._resolveAnimations().update(i,s),t&&n.external&&n.external.call(i,{chart:i._chart,tooltip:i,replay:e})}drawCaret(t,e,i,n){const o=this.getCaretPosition(t,i,n);e.lineTo(o.x1,o.y1),e.lineTo(o.x2,o.y2),e.lineTo(o.x3,o.y3)}getCaretPosition(t,e,i){const{xAlign:n,yAlign:o}=this,{cornerRadius:s,caretSize:a}=i,{x:r,y:l}=t,{width:c,height:h}=e;let d,u,f,g,p,m;return"center"===o?(p=l+h/2,"left"===n?(d=r,u=d-a,g=p+a,m=p-a):(d=r+c,u=d+a,g=p-a,m=p+a),f=d):(u="left"===n?r+s+a:"right"===n?r+c-s-a:this.caretX,"top"===o?(g=l,p=g-a,d=u-a,f=u+a):(g=l+h,p=g+a,d=u+a,f=u-a),m=g),{x1:d,x2:u,x3:f,y1:g,y2:p,y3:m}}drawTitle(t,e,i){const n=this,o=n.title,s=o.length;let a,r,l;if(s){const c=fn(i.rtl,n.x,n.width);for(t.x=us(n,i.titleAlign,i),e.textAlign=c.textAlign(i.titleAlign),e.textBaseline="middle",a=Ee(i.titleFont),r=i.titleSpacing,e.fillStyle=i.titleColor,e.font=a.string,l=0;l<s;++l)e.fillText(o[l],c.x(t.x),t.y+a.lineHeight/2),t.y+=a.lineHeight+r,l+1===s&&(t.y+=i.titleMarginBottom-r)}}_drawColorBox(t,e,i,n,o){const s=this,a=s.labelColors[i],r=s.labelPointStyles[i],{boxHeight:l,boxWidth:c}=o,h=Ee(o.bodyFont),d=us(s,"left",o),u=n.x(d),f=l<h.lineHeight?(h.lineHeight-l)/2:0,g=e.y+f;if(o.usePointStyle){const e={radius:Math.min(c,l)/2,pointStyle:r.pointStyle,rotation:r.rotation,borderWidth:1},i=n.leftForLtr(u,c)+c/2,s=g+l/2;t.strokeStyle=o.multiKeyBackground,t.fillStyle=o.multiKeyBackground,qt(t,e,i,s),t.strokeStyle=a.borderColor,t.fillStyle=a.backgroundColor,qt(t,e,i,s)}else t.fillStyle=o.multiKeyBackground,t.fillRect(n.leftForLtr(u,c),g,c,l),t.lineWidth=1,t.strokeStyle=a.borderColor,t.strokeRect(n.leftForLtr(u,c),g,c,l),t.fillStyle=a.backgroundColor,t.fillRect(n.leftForLtr(n.xPlus(u,1),c-2),g+1,c-2,l-2);t.fillStyle=s.labelTextColors[i]}drawBody(t,e,i){const n=this,{body:o}=n,{bodySpacing:s,bodyAlign:a,displayColors:r,boxHeight:l,boxWidth:c}=i,h=Ee(i.bodyFont);let d=h.lineHeight,u=0;const f=fn(i.rtl,n.x,n.width),g=function(i){e.fillText(i,f.x(t.x+u),t.y+d/2),t.y+=d+s},p=f.textAlign(a);let m,x,b,_,y,v,M;for(e.textAlign=a,e.textBaseline="middle",e.font=h.string,t.x=us(n,p,i),e.fillStyle=i.bodyColor,J(n.beforeBody,g),u=r&&"right"!==p?"center"===a?c/2+1:c+2:0,_=0,v=o.length;_<v;++_){for(m=o[_],x=n.labelTextColors[_],e.fillStyle=x,J(m.before,g),b=m.lines,r&&b.length&&(n._drawColorBox(e,t,_,f,i),d=Math.max(h.lineHeight,l)),y=0,M=b.length;y<M;++y)g(b[y]),d=h.lineHeight;J(m.after,g)}u=0,d=h.lineHeight,J(n.afterBody,g),t.y-=s}drawFooter(t,e,i){const n=this,o=n.footer,s=o.length;let a,r;if(s){const l=fn(i.rtl,n.x,n.width);for(t.x=us(n,i.footerAlign,i),t.y+=i.footerMarginTop,e.textAlign=l.textAlign(i.footerAlign),e.textBaseline="middle",a=Ee(i.footerFont),e.fillStyle=i.footerColor,e.font=a.string,r=0;r<s;++r)e.fillText(o[r],l.x(t.x),t.y+a.lineHeight/2),t.y+=a.lineHeight+i.footerSpacing}}drawBackground(t,e,i,n){const{xAlign:o,yAlign:s}=this,{x:a,y:r}=t,{width:l,height:c}=i,h=n.cornerRadius;e.fillStyle=n.backgroundColor,e.strokeStyle=n.borderColor,e.lineWidth=n.borderWidth,e.beginPath(),e.moveTo(a+h,r),"top"===s&&this.drawCaret(t,e,i,n),e.lineTo(a+l-h,r),e.quadraticCurveTo(a+l,r,a+l,r+h),"center"===s&&"right"===o&&this.drawCaret(t,e,i,n),e.lineTo(a+l,r+c-h),e.quadraticCurveTo(a+l,r+c,a+l-h,r+c),"bottom"===s&&this.drawCaret(t,e,i,n),e.lineTo(a+h,r+c),e.quadraticCurveTo(a,r+c,a,r+c-h),"center"===s&&"left"===o&&this.drawCaret(t,e,i,n),e.lineTo(a,r+h),e.quadraticCurveTo(a,r,a+h,r),e.closePath(),e.fill(),n.borderWidth>0&&e.stroke()}_updateAnimationTarget(t){const e=this,i=e._chart,n=e.$animations,o=n&&n.x,s=n&&n.y;if(o||s){const n=os[t.position].call(e,e._active,e._eventPosition);if(!n)return;const a=e._size=ls(e,t),r=Object.assign({},n,e._size),l=hs(i,t,r),c=ds(t,r,l,i);o._to===c.x&&s._to===c.y||(e.xAlign=l.xAlign,e.yAlign=l.yAlign,e.width=a.width,e.height=a.height,e.caretX=n.x,e.caretY=n.y,e._resolveAnimations().update(e,c))}}draw(t){const e=this,i=e.options.setContext(e.getContext());let n=e.opacity;if(!n)return;e._updateAnimationTarget(i);const o={width:e.width,height:e.height},s={x:e.x,y:e.y};n=Math.abs(n)<.001?0:n;const a=Re(i.padding),r=e.title.length||e.beforeBody.length||e.body.length||e.afterBody.length||e.footer.length;i.enabled&&r&&(t.save(),t.globalAlpha=n,e.drawBackground(s,t,o,i),gn(t,i.textDirection),s.y+=a.top,e.drawTitle(s,t,i),e.drawBody(s,t,i),e.drawFooter(s,t,i),pn(t,i.textDirection),t.restore())}getActiveElements(){return this._active||[]}setActiveElements(t,e){const i=this,n=i._active,o=t.map((({datasetIndex:t,index:e})=>{const n=i._chart.getDatasetMeta(t);if(!n)throw new Error("Cannot find a dataset at index "+t);return{datasetIndex:t,element:n.data[e],index:e}})),s=!tt(n,o),a=i._positionChanged(o,e);(s||a)&&(i._active=o,i._eventPosition=e,i.update(!0))}handleEvent(t,e){const i=this,n=i.options,o=i._active||[];let s=!1,a=[];"mouseout"!==t.type&&(a=i._chart.getElementsAtEventForMode(t,n.mode,n,e),n.reverse&&a.reverse());const r=i._positionChanged(a,t);return s=e||!tt(a,o)||r,s&&(i._active=a,(n.enabled||n.external)&&(i._eventPosition={x:t.x,y:t.y},i.update(!0,e))),s}_positionChanged(t,e){const i=this,n=os[i.options.position].call(i,t,e);return i.caretX!==n.x||i.caretY!==n.y}}ps.positioners=os;var ms={id:"tooltip",_element:ps,positioners:os,afterInit(t,e,i){i&&(t.tooltip=new ps({_chart:t,options:i}))},beforeUpdate(t,e,i){t.tooltip&&t.tooltip.initialize(i)},reset(t,e,i){t.tooltip&&t.tooltip.initialize(i)},afterDraw(t){const e=t.tooltip,i={tooltip:e};!1!==t.notifyPlugins("beforeTooltipDraw",i)&&(e&&e.draw(t.ctx),t.notifyPlugins("afterTooltipDraw",i))},afterEvent(t,e){if(t.tooltip){const i=e.replay;t.tooltip.handleEvent(e.event,i)&&(e.changed=!0)}},defaults:{enabled:!0,external:null,position:"average",backgroundColor:"rgba(0,0,0,0.8)",titleColor:"#fff",titleFont:{style:"bold"},titleSpacing:2,titleMarginBottom:6,titleAlign:"left",bodyColor:"#fff",bodySpacing:2,bodyFont:{},bodyAlign:"left",footerColor:"#fff",footerSpacing:2,footerMarginTop:6,footerFont:{style:"bold"},footerAlign:"left",padding:6,caretPadding:2,caretSize:5,cornerRadius:6,boxHeight:(t,e)=>e.bodyFont.size,boxWidth:(t,e)=>e.bodyFont.size,multiKeyBackground:"#fff",displayColors:!0,borderColor:"rgba(0,0,0,0)",borderWidth:0,animation:{duration:400,easing:"easeOutQuart"},animations:{numbers:{type:"number",properties:["x","y","width","height","caretX","caretY"]},opacity:{easing:"linear",duration:200}},callbacks:{beforeTitle:N,title(t){if(t.length>0){const e=t[0],i=e.chart.data.labels,n=i?i.length:0;if(this&&this.options&&"dataset"===this.options.mode)return e.dataset.label||"";if(e.label)return e.label;if(n>0&&e.dataIndex<n)return i[e.dataIndex]}return""},afterTitle:N,beforeBody:N,beforeLabel:N,label(t){if(this&&this.options&&"dataset"===this.options.mode)return t.label+": "+t.formattedValue||t.formattedValue;let e=t.dataset.label||"";e&&(e+=": ");const i=t.formattedValue;return $(i)||(e+=i),e},labelColor(t){const e=t.chart.getDatasetMeta(t.datasetIndex).controller.getStyle(t.dataIndex);return{borderColor:e.borderColor,backgroundColor:e.backgroundColor}},labelTextColor(){return this.options.bodyColor},labelPointStyle(t){const e=t.chart.getDatasetMeta(t.datasetIndex).controller.getStyle(t.dataIndex);return{pointStyle:e.pointStyle,rotation:e.rotation}},afterLabel:N,afterBody:N,beforeFooter:N,footer:N,afterFooter:N}},defaultRoutes:{bodyFont:"font",footerFont:"font",titleFont:"font"},descriptors:{_scriptable:t=>"filter"!==t&&"itemSort"!==t&&"external"!==t,_indexable:!1,callbacks:{_scriptable:!1,_indexable:!1},animation:{_fallback:!1},animations:{_fallback:"animation"}},additionalOptionScopes:["interaction"]},xs=Object.freeze({__proto__:null,Decimation:Fo,Filler:Qo,Legend:es,Title:ns,Tooltip:ms});function bs(t,e,i){const n=t.indexOf(e);if(-1===n)return((t,e,i)=>"string"==typeof e?t.push(e)-1:isNaN(e)?null:i)(t,e,i);return n!==t.lastIndexOf(e)?i:n}class _s extends ji{constructor(t){super(t),this._startValue=void 0,this._valueRange=0}parse(t,e){if($(t))return null;const i=this.getLabels();return((t,e)=>null===t?null:Ht(Math.round(t),0,e))(e=isFinite(e)&&i[e]===t?e:bs(i,t,K(e,t)),i.length-1)}determineDataLimits(){const t=this,{minDefined:e,maxDefined:i}=t.getUserBounds();let{min:n,max:o}=t.getMinMax(!0);"ticks"===t.options.bounds&&(e||(n=0),i||(o=t.getLabels().length-1)),t.min=n,t.max=o}buildTicks(){const t=this,e=t.min,i=t.max,n=t.options.offset,o=[];let s=t.getLabels();s=0===e&&i===s.length-1?s:s.slice(e,i+1),t._valueRange=Math.max(s.length-(n?0:1),1),t._startValue=t.min-(n?.5:0);for(let t=e;t<=i;t++)o.push({value:t});return o}getLabelForValue(t){const e=this.getLabels();return t>=0&&t<e.length?e[t]:t}configure(){const t=this;super.configure(),t.isHorizontal()||(t._reversePixels=!t._reversePixels)}getPixelForValue(t){const e=this;return"number"!=typeof t&&(t=e.parse(t)),null===t?NaN:e.getPixelForDecimal((t-e._startValue)/e._valueRange)}getPixelForTick(t){const e=this.ticks;return t<0||t>e.length-1?null:this.getPixelForValue(e[t].value)}getValueForPixel(t){const e=this;return Math.round(e._startValue+e.getDecimalForPixel(t)*e._valueRange)}getBasePixel(){return this.bottom}}_s.id="category",_s.defaults={ticks:{callback:_s.prototype.getLabelForValue}};class ys extends ji{constructor(t){super(t),this.start=void 0,this.end=void 0,this._startValue=void 0,this._endValue=void 0,this._valueRange=0}parse(t,e){return $(t)||("number"==typeof t||t instanceof Number)&&!isFinite(+t)?null:+t}handleTickRangeOptions(){const t=this,{beginAtZero:e,stacked:i}=t.options,{minDefined:n,maxDefined:o}=t.getUserBounds();let{min:s,max:a}=t;const r=t=>s=n?s:t,l=t=>a=o?a:t;if(e||i){const t=Pt(s),e=Pt(a);t<0&&e<0?l(0):t>0&&e>0&&r(0)}s===a&&(l(a+1),e||r(s-1)),t.min=s,t.max=a}getTickLimit(){const t=this,e=t.options.ticks;let i,{maxTicksLimit:n,stepSize:o}=e;return o?i=Math.ceil(t.max/o)-Math.floor(t.min/o)+1:(i=t.computeTickLimit(),n=n||11),n&&(i=Math.min(n,i)),i}computeTickLimit(){return Number.POSITIVE_INFINITY}buildTicks(){const t=this,e=t.options,i=e.ticks;let n=t.getTickLimit();n=Math.max(2,n);const o=function(t,e){const i=[],{step:n,min:o,max:s,precision:a,count:r,maxTicks:l}=t,c=n||1,h=l-1,{min:d,max:u}=e,f=!$(o),g=!$(s),p=!$(r);let m,x,b,_,y=Dt((u-d)/h/c)*c;if(y<1e-14&&!f&&!g)return[{value:d},{value:u}];_=Math.ceil(u/y)-Math.floor(d/y),_>h&&(y=Dt(_*y/h/c)*c),$(a)||(m=Math.pow(10,a),y=Math.ceil(y*m)/m),x=Math.floor(d/y)*y,b=Math.ceil(u/y)*y,f&&g&&n&&Tt((s-o)/n,y/1e3)?(_=Math.min((s-o)/y,l),y=(s-o)/_,x=o,b=s):p?(x=f?o:x,b=g?s:b,_=r-1,y=(b-x)/_):(_=(b-x)/y,_=Ot(_,Math.round(_),y/1e3)?Math.round(_):Math.ceil(_)),m=Math.pow(10,$(a)?It(y):a),x=Math.round(x*m)/m,b=Math.round(b*m)/m;let v=0;for(f&&(i.push({value:o}),x<=o&&v++,Ot(Math.round((x+v*y)*m)/m,o,y/10)&&v++);v<_;++v)i.push({value:Math.round((x+v*y)*m)/m});return g?Ot(i[i.length-1].value,s,y/10)?i[i.length-1].value=s:i.push({value:s}):i.push({value:b}),i}({maxTicks:n,min:e.min,max:e.max,precision:i.precision,step:i.stepSize,count:i.count},Fe(t,e.grace));return"ticks"===e.bounds&&Lt(o,t,"value"),e.reverse?(o.reverse(),t.start=t.max,t.end=t.min):(t.start=t.min,t.end=t.max),o}configure(){const t=this,e=t.ticks;let i=t.min,n=t.max;if(super.configure(),t.options.offset&&e.length){const t=(n-i)/Math.max(e.length-1,1)/2;i-=t,n+=t}t._startValue=i,t._endValue=n,t._valueRange=n-i}getLabelForValue(t){return Li(t,this.chart.options.locale)}}class vs extends ys{determineDataLimits(){const t=this,{min:e,max:i}=t.getMinMax(!0);t.min=X(e)?e:0,t.max=X(i)?i:1,t.handleTickRangeOptions()}computeTickLimit(){const t=this;if(t.isHorizontal())return Math.ceil(t.width/40);const e=t._resolveTickFontOptions(0);return Math.ceil(t.height/e.lineHeight)}getPixelForValue(t){return null===t?NaN:this.getPixelForDecimal((t-this._startValue)/this._valueRange)}getValueForPixel(t){return this._startValue+this.getDecimalForPixel(t)*this._valueRange}}function Ms(t){return 1===t/Math.pow(10,Math.floor(St(t)))}vs.id="linear",vs.defaults={ticks:{callback:Ei.formatters.numeric}};class ws extends ji{constructor(t){super(t),this.start=void 0,this.end=void 0,this._startValue=void 0,this._valueRange=0}parse(t,e){const i=ys.prototype.parse.apply(this,[t,e]);if(0!==i)return X(i)&&i>0?i:null;this._zero=!0}determineDataLimits(){const t=this,{min:e,max:i}=t.getMinMax(!0);t.min=X(e)?Math.max(0,e):null,t.max=X(i)?Math.max(0,i):null,t.options.beginAtZero&&(t._zero=!0),t.handleTickRangeOptions()}handleTickRangeOptions(){const t=this,{minDefined:e,maxDefined:i}=t.getUserBounds();let n=t.min,o=t.max;const s=t=>n=e?n:t,a=t=>o=i?o:t,r=(t,e)=>Math.pow(10,Math.floor(St(t))+e);n===o&&(n<=0?(s(1),a(10)):(s(r(n,-1)),a(r(o,1)))),n<=0&&s(r(o,-1)),o<=0&&a(r(n,1)),t._zero&&t.min!==t._suggestedMin&&n===r(t.min,0)&&s(r(n,-1)),t.min=n,t.max=o}buildTicks(){const t=this,e=t.options,i=function(t,e){const i=Math.floor(St(e.max)),n=Math.ceil(e.max/Math.pow(10,i)),o=[];let s=q(t.min,Math.pow(10,Math.floor(St(e.min)))),a=Math.floor(St(s)),r=Math.floor(s/Math.pow(10,a)),l=a<0?Math.pow(10,Math.abs(a)):1;do{o.push({value:s,major:Ms(s)}),++r,10===r&&(r=1,++a,l=a>=0?1:l),s=Math.round(r*Math.pow(10,a)*l)/l}while(a<i||a===i&&r<n);const c=q(t.max,s);return o.push({value:c,major:Ms(s)}),o}({min:t._userMin,max:t._userMax},t);return"ticks"===e.bounds&&Lt(i,t,"value"),e.reverse?(i.reverse(),t.start=t.max,t.end=t.min):(t.start=t.min,t.end=t.max),i}getLabelForValue(t){return void 0===t?"0":Li(t,this.chart.options.locale)}configure(){const t=this,e=t.min;super.configure(),t._startValue=St(e),t._valueRange=St(t.max)-St(e)}getPixelForValue(t){const e=this;return void 0!==t&&0!==t||(t=e.min),null===t||isNaN(t)?NaN:e.getPixelForDecimal(t===e.min?0:(St(t)-e._startValue)/e._valueRange)}getValueForPixel(t){const e=this,i=e.getDecimalForPixel(t);return Math.pow(10,e._startValue+i*e._valueRange)}}function ks(t){const e=t.ticks;if(e.display&&t.display){const t=Re(e.backdropPadding);return K(e.font&&e.font.size,mt.font.size)+t.height}return 0}function Ss(t,e,i,n,o){return t===n||t===o?{start:e-i/2,end:e+i/2}:t<n||t>o?{start:e-i,end:e}:{start:e,end:e+i}}function Ps(t){return 0===t||180===t?"center":t<180?"left":"right"}function Ds(t,e,i){90===t||270===t?i.y-=e.h/2:(t>270||t<90)&&(i.y-=e.h)}function Cs(t,e,i,n){const{ctx:o}=t;if(i)o.arc(t.xCenter,t.yCenter,e,0,bt);else{let i=t.getPointPosition(0,e);o.moveTo(i.x,i.y);for(let s=1;s<n;s++)i=t.getPointPosition(s,e),o.lineTo(i.x,i.y)}}function As(t){return At(t)?t:0}ws.id="logarithmic",ws.defaults={ticks:{callback:Ei.formatters.logarithmic,major:{enabled:!0}}};class Os extends ys{constructor(t){super(t),this.xCenter=void 0,this.yCenter=void 0,this.drawingArea=void 0,this._pointLabels=[],this._pointLabelItems=[]}setDimensions(){const t=this;t.width=t.maxWidth,t.height=t.maxHeight,t.paddingTop=ks(t.options)/2,t.xCenter=Math.floor(t.width/2),t.yCenter=Math.floor((t.height-t.paddingTop)/2),t.drawingArea=Math.min(t.height-t.paddingTop,t.width)/2}determineDataLimits(){const t=this,{min:e,max:i}=t.getMinMax(!1);t.min=X(e)&&!isNaN(e)?e:0,t.max=X(i)&&!isNaN(i)?i:0,t.handleTickRangeOptions()}computeTickLimit(){return Math.ceil(this.drawingArea/ks(this.options))}generateTickLabels(t){const e=this;ys.prototype.generateTickLabels.call(e,t),e._pointLabels=e.getLabels().map(((t,i)=>{const n=Q(e.options.pointLabels.callback,[t,i],e);return n||0===n?n:""}))}fit(){const t=this,e=t.options;e.display&&e.pointLabels.display?function(t){const e={l:0,r:t.width,t:0,b:t.height-t.paddingTop},i={};let n,o,s;const a=[],r=[],l=t.getLabels().length;for(n=0;n<l;n++){const l=t.options.pointLabels.setContext(t.getContext(n));r[n]=l.padding,s=t.getPointPosition(n,t.drawingArea+r[n]);const u=Ee(l.font);t.ctx.font=u.string,c=t.ctx,h=u.lineHeight,o=Y(d=t._pointLabels[n])?{w:Yt(c,c.font,d),h:d.length*h}:{w:c.measureText(d).width,h:h},a[n]=o;const f=t.getIndexAngle(n),g=Et(f),p=Ss(g,s.x,o.w,0,180),m=Ss(g,s.y,o.h,90,270);p.start<e.l&&(e.l=p.start,i.l=f),p.end>e.r&&(e.r=p.end,i.r=f),m.start<e.t&&(e.t=m.start,i.t=f),m.end>e.b&&(e.b=m.end,i.b=f)}var c,h,d;t._setReductions(t.drawingArea,e,i),t._pointLabelItems=[];const u=t.options,f=ks(u),g=t.getDistanceFromCenterForValue(u.ticks.reverse?t.min:t.max);for(n=0;n<l;n++){const e=0===n?f/2:0,i=t.getPointPosition(n,g+e+r[n]),o=Et(t.getIndexAngle(n)),s=a[n];Ds(o,s,i);const l=Ps(o);let c;c="left"===l?i.x:"center"===l?i.x-s.w/2:i.x-s.w;const h=c+s.w;t._pointLabelItems[n]={x:i.x,y:i.y,textAlign:l,left:c,top:i.y,right:h,bottom:i.y+s.h}}}(t):t.setCenterPoint(0,0,0,0)}_setReductions(t,e,i){const n=this;let o=e.l/Math.sin(i.l),s=Math.max(e.r-n.width,0)/Math.sin(i.r),a=-e.t/Math.cos(i.t),r=-Math.max(e.b-(n.height-n.paddingTop),0)/Math.cos(i.b);o=As(o),s=As(s),a=As(a),r=As(r),n.drawingArea=Math.max(t/2,Math.min(Math.floor(t-(o+s)/2),Math.floor(t-(a+r)/2))),n.setCenterPoint(o,s,a,r)}setCenterPoint(t,e,i,n){const o=this,s=o.width-e-o.drawingArea,a=t+o.drawingArea,r=i+o.drawingArea,l=o.height-o.paddingTop-n-o.drawingArea;o.xCenter=Math.floor((a+s)/2+o.left),o.yCenter=Math.floor((r+l)/2+o.top+o.paddingTop)}getIndexAngle(t){return Bt(t*(bt/this.getLabels().length)+Rt(this.options.startAngle||0))}getDistanceFromCenterForValue(t){const e=this;if($(t))return NaN;const i=e.drawingArea/(e.max-e.min);return e.options.reverse?(e.max-t)*i:(t-e.min)*i}getValueForDistanceFromCenter(t){if($(t))return NaN;const e=this,i=t/(e.drawingArea/(e.max-e.min));return e.options.reverse?e.max-i:e.min+i}getPointPosition(t,e){const i=this,n=i.getIndexAngle(t)-Mt;return{x:Math.cos(n)*e+i.xCenter,y:Math.sin(n)*e+i.yCenter,angle:n}}getPointPositionForValue(t,e){return this.getPointPosition(t,this.getDistanceFromCenterForValue(e))}getBasePosition(t){return this.getPointPositionForValue(t||0,this.getBaseValue())}getPointLabelPosition(t){const{left:e,top:i,right:n,bottom:o}=this._pointLabelItems[t];return{left:e,top:i,right:n,bottom:o}}drawBackground(){const t=this,{backgroundColor:e,grid:{circular:i}}=t.options;if(e){const n=t.ctx;n.save(),n.beginPath(),Cs(t,t.getDistanceFromCenterForValue(t._endValue),i,t.getLabels().length),n.closePath(),n.fillStyle=e,n.fill(),n.restore()}}drawGrid(){const t=this,e=t.ctx,i=t.options,{angleLines:n,grid:o}=i,s=t.getLabels().length;let a,r,l;if(i.pointLabels.display&&function(t,e){const{ctx:i,options:{pointLabels:n}}=t;for(let o=e-1;o>=0;o--){const e=n.setContext(t.getContext(o)),s=Ee(e.font),{x:a,y:r,textAlign:l,left:c,top:h,right:d,bottom:u}=t._pointLabelItems[o],{backdropColor:f}=e;if(!$(f)){const t=Re(e.backdropPadding);i.fillStyle=f,i.fillRect(c-t.left,h-t.top,d-c+t.width,u-h+t.height)}te(i,t._pointLabels[o],a,r+s.lineHeight/2,s,{color:e.color,textAlign:l,textBaseline:"middle"})}}(t,s),o.display&&t.ticks.forEach(((e,i)=>{if(0!==i){r=t.getDistanceFromCenterForValue(e.value);const n=o.setContext(t.getContext(i-1));!function(t,e,i,n){const o=t.ctx,s=e.circular,{color:a,lineWidth:r}=e;!s&&!n||!a||!r||i<0||(o.save(),o.strokeStyle=a,o.lineWidth=r,o.setLineDash(e.borderDash),o.lineDashOffset=e.borderDashOffset,o.beginPath(),Cs(t,i,s,n),o.closePath(),o.stroke(),o.restore())}(t,n,r,s)}})),n.display){for(e.save(),a=t.getLabels().length-1;a>=0;a--){const o=n.setContext(t.getContext(a)),{color:s,lineWidth:c}=o;c&&s&&(e.lineWidth=c,e.strokeStyle=s,e.setLineDash(o.borderDash),e.lineDashOffset=o.borderDashOffset,r=t.getDistanceFromCenterForValue(i.ticks.reverse?t.min:t.max),l=t.getPointPosition(a,r),e.beginPath(),e.moveTo(t.xCenter,t.yCenter),e.lineTo(l.x,l.y),e.stroke())}e.restore()}}drawLabels(){const t=this,e=t.ctx,i=t.options,n=i.ticks;if(!n.display)return;const o=t.getIndexAngle(0);let s,a;e.save(),e.translate(t.xCenter,t.yCenter),e.rotate(o),e.textAlign="center",e.textBaseline="middle",t.ticks.forEach(((o,r)=>{if(0===r&&!i.reverse)return;const l=n.setContext(t.getContext(r)),c=Ee(l.font);if(s=t.getDistanceFromCenterForValue(t.ticks[r].value),l.showLabelBackdrop){a=e.measureText(o.label).width,e.fillStyle=l.backdropColor;const t=Re(l.backdropPadding);e.fillRect(-a/2-t.left,-s-c.size/2-t.top,a+t.width,c.size+t.height)}te(e,o.label,0,-s,c,{color:l.color})})),e.restore()}drawTitle(){}}Os.id="radialLinear",Os.defaults={display:!0,animate:!0,position:"chartArea",angleLines:{display:!0,lineWidth:1,borderDash:[],borderDashOffset:0},grid:{circular:!1},startAngle:0,ticks:{showLabelBackdrop:!0,backdropColor:"rgba(255,255,255,0.75)",backdropPadding:2,callback:Ei.formatters.numeric},pointLabels:{backdropColor:void 0,backdropPadding:2,display:!0,font:{size:10},callback:t=>t,padding:5}},Os.defaultRoutes={"angleLines.color":"borderColor","pointLabels.color":"color","ticks.color":"color"},Os.descriptors={angleLines:{_fallback:"grid"}};const Ts={millisecond:{common:!0,size:1,steps:1e3},second:{common:!0,size:1e3,steps:60},minute:{common:!0,size:6e4,steps:60},hour:{common:!0,size:36e5,steps:24},day:{common:!0,size:864e5,steps:30},week:{common:!1,size:6048e5,steps:4},month:{common:!0,size:2628e6,steps:12},quarter:{common:!1,size:7884e6,steps:4},year:{common:!0,size:3154e7}},Ls=Object.keys(Ts);function Rs(t,e){return t-e}function Es(t,e){if($(e))return null;const i=t._adapter,n=t.options.time,{parser:o,round:s,isoWeekday:a}=n;let r=e;return"function"==typeof o&&(r=o(r)),X(r)||(r="string"==typeof o?i.parse(r,o):i.parse(r)),null===r?null:(s&&(r="week"!==s||!At(a)&&!0!==a?i.startOf(r,s):i.startOf(r,"isoWeek",a)),+r)}function Is(t,e,i,n){const o=Ls.length;for(let s=Ls.indexOf(t);s<o-1;++s){const t=Ts[Ls[s]],o=t.steps?t.steps:Number.MAX_SAFE_INTEGER;if(t.common&&Math.ceil((i-e)/(o*t.size))<=n)return Ls[s]}return Ls[o-1]}function Fs(t,e,i){if(i){if(i.length){const{lo:n,hi:o}=ee(i,e);t[i[n]>=e?i[n]:i[o]]=!0}}else t[e]=!0}function zs(t,e,i){const n=[],o={},s=e.length;let a,r;for(a=0;a<s;++a)r=e[a],o[r]=a,n.push({value:r,major:!1});return 0!==s&&i?function(t,e,i,n){const o=t._adapter,s=+o.startOf(e[0].value,n),a=e[e.length-1].value;let r,l;for(r=s;r<=a;r=+o.add(r,1,n))l=i[r],l>=0&&(e[l].major=!0);return e}(t,n,o,i):n}class Vs extends ji{constructor(t){super(t),this._cache={data:[],labels:[],all:[]},this._unit="day",this._majorUnit=void 0,this._offsets={},this._normalized=!1}init(t,e){const i=t.time||(t.time={}),n=this._adapter=new Gn._date(t.adapters.date);st(i.displayFormats,n.formats()),super.init(t),this._normalized=e.normalized}parse(t,e){return void 0===t?null:Es(this,t)}beforeLayout(){super.beforeLayout(),this._cache={data:[],labels:[],all:[]}}determineDataLimits(){const t=this,e=t.options,i=t._adapter,n=e.time.unit||"day";let{min:o,max:s,minDefined:a,maxDefined:r}=t.getUserBounds();function l(t){a||isNaN(t.min)||(o=Math.min(o,t.min)),r||isNaN(t.max)||(s=Math.max(s,t.max))}a&&r||(l(t._getLabelBounds()),"ticks"===e.bounds&&"labels"===e.ticks.source||l(t.getMinMax(!1))),o=X(o)&&!isNaN(o)?o:+i.startOf(Date.now(),n),s=X(s)&&!isNaN(s)?s:+i.endOf(Date.now(),n)+1,t.min=Math.min(o,s-1),t.max=Math.max(o+1,s)}_getLabelBounds(){const t=this.getLabelTimestamps();let e=Number.POSITIVE_INFINITY,i=Number.NEGATIVE_INFINITY;return t.length&&(e=t[0],i=t[t.length-1]),{min:e,max:i}}buildTicks(){const t=this,e=t.options,i=e.time,n=e.ticks,o="labels"===n.source?t.getLabelTimestamps():t._generate();"ticks"===e.bounds&&o.length&&(t.min=t._userMin||o[0],t.max=t._userMax||o[o.length-1]);const s=t.min,a=oe(o,s,t.max);return t._unit=i.unit||(n.autoSkip?Is(i.minUnit,t.min,t.max,t._getLabelCapacity(s)):function(t,e,i,n,o){for(let s=Ls.length-1;s>=Ls.indexOf(i);s--){const i=Ls[s];if(Ts[i].common&&t._adapter.diff(o,n,i)>=e-1)return i}return Ls[i?Ls.indexOf(i):0]}(t,a.length,i.minUnit,t.min,t.max)),t._majorUnit=n.major.enabled&&"year"!==t._unit?function(t){for(let e=Ls.indexOf(t)+1,i=Ls.length;e<i;++e)if(Ts[Ls[e]].common)return Ls[e]}(t._unit):void 0,t.initOffsets(o),e.reverse&&a.reverse(),zs(t,a,t._majorUnit)}initOffsets(t){const e=this;let i,n,o=0,s=0;e.options.offset&&t.length&&(i=e.getDecimalForValue(t[0]),o=1===t.length?1-i:(e.getDecimalForValue(t[1])-i)/2,n=e.getDecimalForValue(t[t.length-1]),s=1===t.length?n:(n-e.getDecimalForValue(t[t.length-2]))/2);const a=t.length<3?.5:.25;o=Ht(o,0,a),s=Ht(s,0,a),e._offsets={start:o,end:s,factor:1/(o+1+s)}}_generate(){const t=this,e=t._adapter,i=t.min,n=t.max,o=t.options,s=o.time,a=s.unit||Is(s.minUnit,i,n,t._getLabelCapacity(i)),r=K(s.stepSize,1),l="week"===a&&s.isoWeekday,c=At(l)||!0===l,h={};let d,u,f=i;if(c&&(f=+e.startOf(f,"isoWeek",l)),f=+e.startOf(f,c?"day":a),e.diff(n,i,a)>1e5*r)throw new Error(i+" and "+n+" are too far apart with stepSize of "+r+" "+a);const g="data"===o.ticks.source&&t.getDataTimestamps();for(d=f,u=0;d<n;d=+e.add(d,r,a),u++)Fs(h,d,g);return d!==n&&"ticks"!==o.bounds&&1!==u||Fs(h,d,g),Object.keys(h).sort(((t,e)=>t-e)).map((t=>+t))}getLabelForValue(t){const e=this._adapter,i=this.options.time;return i.tooltipFormat?e.format(t,i.tooltipFormat):e.format(t,i.displayFormats.datetime)}_tickFormatFunction(t,e,i,n){const o=this,s=o.options,a=s.time.displayFormats,r=o._unit,l=o._majorUnit,c=r&&a[r],h=l&&a[l],d=i[e],u=l&&h&&d&&d.major,f=o._adapter.format(t,n||(u?h:c)),g=s.ticks.callback;return g?g(f,e,i):f}generateTickLabels(t){let e,i,n;for(e=0,i=t.length;e<i;++e)n=t[e],n.label=this._tickFormatFunction(n.value,e,t)}getDecimalForValue(t){const e=this;return null===t?NaN:(t-e.min)/(e.max-e.min)}getPixelForValue(t){const e=this,i=e._offsets,n=e.getDecimalForValue(t);return e.getPixelForDecimal((i.start+n)*i.factor)}getValueForPixel(t){const e=this,i=e._offsets,n=e.getDecimalForPixel(t)/i.factor-i.end;return e.min+n*(e.max-e.min)}_getLabelSize(t){const e=this,i=e.options.ticks,n=e.ctx.measureText(t).width,o=Rt(e.isHorizontal()?i.maxRotation:i.minRotation),s=Math.cos(o),a=Math.sin(o),r=e._resolveTickFontOptions(0).size;return{w:n*s+r*a,h:n*a+r*s}}_getLabelCapacity(t){const e=this,i=e.options.time,n=i.displayFormats,o=n[i.unit]||n.millisecond,s=e._tickFormatFunction(t,0,zs(e,[t],e._majorUnit),o),a=e._getLabelSize(s),r=Math.floor(e.isHorizontal()?e.width/a.w:e.height/a.h)-1;return r>0?r:1}getDataTimestamps(){const t=this;let e,i,n=t._cache.data||[];if(n.length)return n;const o=t.getMatchingVisibleMetas();if(t._normalized&&o.length)return t._cache.data=o[0].controller.getAllParsedValues(t);for(e=0,i=o.length;e<i;++e)n=n.concat(o[e].controller.getAllParsedValues(t));return t._cache.data=t.normalize(n)}getLabelTimestamps(){const t=this,e=t._cache.labels||[];let i,n;if(e.length)return e;const o=t.getLabels();for(i=0,n=o.length;i<n;++i)e.push(Es(t,o[i]));return t._cache.labels=t._normalized?e:t.normalize(e)}normalize(t){return le(t.sort(Rs))}}function Bs(t,e,i){let n,o,s,a;if(i)n=Math.floor(e),o=Math.ceil(e),s=t[n],a=t[o];else{const i=ee(t,e);s=i.lo,a=i.hi,n=t[s],o=t[a]}const r=o-n;return r?s+(a-s)*(e-n)/r:s}Vs.id="time",Vs.defaults={bounds:"data",adapters:{},time:{parser:!1,unit:!1,round:!1,isoWeekday:!1,minUnit:"millisecond",displayFormats:{}},ticks:{source:"auto",major:{enabled:!1}}};class Ws extends Vs{constructor(t){super(t),this._table=[],this._maxIndex=void 0}initOffsets(){const t=this,e=t._getTimestampsForTable();t._table=t.buildLookupTable(e),t._maxIndex=t._table.length-1,super.initOffsets(e)}buildLookupTable(t){const{min:e,max:i}=this;if(!t.length)return[{time:e,pos:0},{time:i,pos:1}];const n=[e];let o,s,a;for(o=0,s=t.length;o<s;++o)a=t[o],a>e&&a<i&&n.push(a);return n.push(i),n}_getTimestampsForTable(){const t=this;let e=t._cache.all||[];if(e.length)return e;const i=t.getDataTimestamps(),n=t.getLabelTimestamps();return e=i.length&&n.length?t.normalize(i.concat(n)):i.length?i:n,e=t._cache.all=e,e}getPixelForValue(t,e){const i=this,n=i._offsets,o=i._normalized&&i._maxIndex>0&&!$(e)?e/i._maxIndex:i.getDecimalForValue(t);return i.getPixelForDecimal((n.start+o)*n.factor)}getDecimalForValue(t){return Bs(this._table,t)/this._maxIndex}getValueForPixel(t){const e=this,i=e._offsets,n=e.getDecimalForPixel(t)/i.factor-i.end;return Bs(e._table,n*this._maxIndex,!0)}}Ws.id="timeseries",Ws.defaults=Vs.defaults;var Hs=Object.freeze({__proto__:null,CategoryScale:_s,LinearScale:vs,LogarithmicScale:ws,RadialLinearScale:Os,TimeScale:Vs,TimeSeriesScale:Ws});return Yn.register(co,Hs,Eo,xs),Yn.helpers={...vn},Yn._adapters=Gn,Yn.Animation=mi,Yn.Animations=bi,Yn.animator=a,Yn.controllers=wn.controllers.items,Yn.DatasetController=Ai,Yn.Element=Oi,Yn.elements=Eo,Yn.Interaction=De,Yn.layouts=Xe,Yn.platforms=ci,Yn.Scale=ji,Yn.Ticks=Ei,Object.assign(Yn,co,Hs,Eo,xs,ci),Yn.Chart=Yn,"undefined"!=typeof window&&(window.Chart=Yn),Yn}));

/*!
 * perfect-scrollbar v1.5.1
 * Copyright 2020 Hyunje Jun, MDBootstrap and Contributors
 * Licensed under MIT
 */(function(a,b){"object"==typeof exports&&"undefined"!=typeof module?module.exports=b():"function"==typeof define&&define.amd?define(b):(a=a||self,a.PerfectScrollbar=b())})(this,function(){'use strict';var u=Math.abs,v=Math.floor;function a(a){return getComputedStyle(a)}function b(a,b){for(var c in b){var d=b[c];"number"==typeof d&&(d+="px"),a.style[c]=d}return a}function c(a){var b=document.createElement("div");return b.className=a,b}function d(a,b){if(!w)throw new Error("No element matching method supported");return w.call(a,b)}function e(a){a.remove?a.remove():a.parentNode&&a.parentNode.removeChild(a)}function f(a,b){return Array.prototype.filter.call(a.children,function(a){return d(a,b)})}function g(a,b){var c=a.element.classList,d=z.state.scrolling(b);c.contains(d)?clearTimeout(A[b]):c.add(d)}function h(a,b){A[b]=setTimeout(function(){return a.isAlive&&a.element.classList.remove(z.state.scrolling(b))},a.settings.scrollingThreshold)}function j(a,b){g(a,b),h(a,b)}function k(a){if("function"==typeof window.CustomEvent)return new CustomEvent(a);var b=document.createEvent("CustomEvent");return b.initCustomEvent(a,!1,!1,void 0),b}function l(a,b,c,d,e){void 0===d&&(d=!0),void 0===e&&(e=!1);var f;if("top"===b)f=["contentHeight","containerHeight","scrollTop","y","up","down"];else if("left"===b)f=["contentWidth","containerWidth","scrollLeft","x","left","right"];else throw new Error("A proper axis should be provided");m(a,c,f,d,e)}function m(a,b,c,d,e){var f=c[0],g=c[1],h=c[2],i=c[3],l=c[4],m=c[5];void 0===d&&(d=!0),void 0===e&&(e=!1);var n=a.element;// reset reach
a.reach[i]=null,1>n[h]&&(a.reach[i]="start"),n[h]>a[f]-a[g]-1&&(a.reach[i]="end"),b&&(n.dispatchEvent(k("ps-scroll-"+i)),0>b?n.dispatchEvent(k("ps-scroll-"+l)):0<b&&n.dispatchEvent(k("ps-scroll-"+m)),d&&j(a,i)),a.reach[i]&&(b||e)&&n.dispatchEvent(k("ps-"+i+"-reach-"+a.reach[i]))}function n(a){return parseInt(a,10)||0}function o(a){return d(a,"input,[contenteditable]")||d(a,"select,[contenteditable]")||d(a,"textarea,[contenteditable]")||d(a,"button,[contenteditable]")}function p(b){var c=a(b);return n(c.width)+n(c.paddingLeft)+n(c.paddingRight)+n(c.borderLeftWidth)+n(c.borderRightWidth)}function q(a){var b=Math.ceil,c=a.element,d=v(c.scrollTop),g=c.getBoundingClientRect();a.containerWidth=b(g.width),a.containerHeight=b(g.height),a.contentWidth=c.scrollWidth,a.contentHeight=c.scrollHeight,c.contains(a.scrollbarXRail)||(f(c,z.element.rail("x")).forEach(function(a){return e(a)}),c.appendChild(a.scrollbarXRail)),c.contains(a.scrollbarYRail)||(f(c,z.element.rail("y")).forEach(function(a){return e(a)}),c.appendChild(a.scrollbarYRail)),!a.settings.suppressScrollX&&a.containerWidth+a.settings.scrollXMarginOffset<a.contentWidth?(a.scrollbarXActive=!0,a.railXWidth=a.containerWidth-a.railXMarginWidth,a.railXRatio=a.containerWidth/a.railXWidth,a.scrollbarXWidth=r(a,n(a.railXWidth*a.containerWidth/a.contentWidth)),a.scrollbarXLeft=n((a.negativeScrollAdjustment+c.scrollLeft)*(a.railXWidth-a.scrollbarXWidth)/(a.contentWidth-a.containerWidth))):a.scrollbarXActive=!1,!a.settings.suppressScrollY&&a.containerHeight+a.settings.scrollYMarginOffset<a.contentHeight?(a.scrollbarYActive=!0,a.railYHeight=a.containerHeight-a.railYMarginHeight,a.railYRatio=a.containerHeight/a.railYHeight,a.scrollbarYHeight=r(a,n(a.railYHeight*a.containerHeight/a.contentHeight)),a.scrollbarYTop=n(d*(a.railYHeight-a.scrollbarYHeight)/(a.contentHeight-a.containerHeight))):a.scrollbarYActive=!1,a.scrollbarXLeft>=a.railXWidth-a.scrollbarXWidth&&(a.scrollbarXLeft=a.railXWidth-a.scrollbarXWidth),a.scrollbarYTop>=a.railYHeight-a.scrollbarYHeight&&(a.scrollbarYTop=a.railYHeight-a.scrollbarYHeight),s(c,a),a.scrollbarXActive?c.classList.add(z.state.active("x")):(c.classList.remove(z.state.active("x")),a.scrollbarXWidth=0,a.scrollbarXLeft=0,c.scrollLeft=!0===a.isRtl?a.contentWidth:0),a.scrollbarYActive?c.classList.add(z.state.active("y")):(c.classList.remove(z.state.active("y")),a.scrollbarYHeight=0,a.scrollbarYTop=0,c.scrollTop=0)}function r(a,b){var c=Math.min,d=Math.max;return a.settings.minScrollbarLength&&(b=d(b,a.settings.minScrollbarLength)),a.settings.maxScrollbarLength&&(b=c(b,a.settings.maxScrollbarLength)),b}function s(a,c){var d={width:c.railXWidth},e=v(a.scrollTop);d.left=c.isRtl?c.negativeScrollAdjustment+a.scrollLeft+c.containerWidth-c.contentWidth:a.scrollLeft,c.isScrollbarXUsingBottom?d.bottom=c.scrollbarXBottom-e:d.top=c.scrollbarXTop+e,b(c.scrollbarXRail,d);var f={top:e,height:c.railYHeight};c.isScrollbarYUsingRight?c.isRtl?f.right=c.contentWidth-(c.negativeScrollAdjustment+a.scrollLeft)-c.scrollbarYRight-c.scrollbarYOuterWidth-9:f.right=c.scrollbarYRight-a.scrollLeft:c.isRtl?f.left=c.negativeScrollAdjustment+a.scrollLeft+2*c.containerWidth-c.contentWidth-c.scrollbarYLeft-c.scrollbarYOuterWidth:f.left=c.scrollbarYLeft+a.scrollLeft,b(c.scrollbarYRail,f),b(c.scrollbarX,{left:c.scrollbarXLeft,width:c.scrollbarXWidth-c.railBorderXWidth}),b(c.scrollbarY,{top:c.scrollbarYTop,height:c.scrollbarYHeight-c.railBorderYWidth})}function t(a,b){function c(b){b.touches&&b.touches[0]&&(b[k]=b.touches[0].pageY),s[o]=t+v*(b[k]-u),g(a,p),q(a),b.stopPropagation(),b.preventDefault()}function d(){h(a,p),a[r].classList.remove(z.state.clicking),a.event.unbind(a.ownerDocument,"mousemove",c)}function f(b,e){t=s[o],e&&b.touches&&(b[k]=b.touches[0].pageY),u=b[k],v=(a[j]-a[i])/(a[l]-a[n]),e?a.event.bind(a.ownerDocument,"touchmove",c):(a.event.bind(a.ownerDocument,"mousemove",c),a.event.once(a.ownerDocument,"mouseup",d),b.preventDefault()),a[r].classList.add(z.state.clicking),b.stopPropagation()}var i=b[0],j=b[1],k=b[2],l=b[3],m=b[4],n=b[5],o=b[6],p=b[7],r=b[8],s=a.element,t=null,u=null,v=null;a.event.bind(a[m],"mousedown",function(a){f(a)}),a.event.bind(a[m],"touchstart",function(a){f(a,!0)})}var w="undefined"!=typeof Element&&(Element.prototype.matches||Element.prototype.webkitMatchesSelector||Element.prototype.mozMatchesSelector||Element.prototype.msMatchesSelector),z={main:"ps",rtl:"ps__rtl",element:{thumb:function(a){return"ps__thumb-"+a},rail:function(a){return"ps__rail-"+a},consuming:"ps__child--consume"},state:{focus:"ps--focus",clicking:"ps--clicking",active:function(a){return"ps--active-"+a},scrolling:function(a){return"ps--scrolling-"+a}}},A={x:null,y:null},B=function(a){this.element=a,this.handlers={}},C={isEmpty:{configurable:!0}};B.prototype.bind=function(a,b){"undefined"==typeof this.handlers[a]&&(this.handlers[a]=[]),this.handlers[a].push(b),this.element.addEventListener(a,b,!1)},B.prototype.unbind=function(a,b){var c=this;this.handlers[a]=this.handlers[a].filter(function(d){return!!(b&&d!==b)||(c.element.removeEventListener(a,d,!1),!1)})},B.prototype.unbindAll=function(){for(var a in this.handlers)this.unbind(a)},C.isEmpty.get=function(){var a=this;return Object.keys(this.handlers).every(function(b){return 0===a.handlers[b].length})},Object.defineProperties(B.prototype,C);var D=function(){this.eventElements=[]};D.prototype.eventElement=function(a){var b=this.eventElements.filter(function(b){return b.element===a})[0];return b||(b=new B(a),this.eventElements.push(b)),b},D.prototype.bind=function(a,b,c){this.eventElement(a).bind(b,c)},D.prototype.unbind=function(a,b,c){var d=this.eventElement(a);d.unbind(b,c),d.isEmpty&&this.eventElements.splice(this.eventElements.indexOf(d),1)},D.prototype.unbindAll=function(){this.eventElements.forEach(function(a){return a.unbindAll()}),this.eventElements=[]},D.prototype.once=function(a,b,c){var d=this.eventElement(a),e=function(a){d.unbind(b,e),c(a)};d.bind(b,e)};var E={isWebKit:"undefined"!=typeof document&&"WebkitAppearance"in document.documentElement.style,supportsTouch:"undefined"!=typeof window&&("ontouchstart"in window||"maxTouchPoints"in window.navigator&&0<window.navigator.maxTouchPoints||window.DocumentTouch&&document instanceof window.DocumentTouch),supportsIePointer:"undefined"!=typeof navigator&&navigator.msMaxTouchPoints,isChrome:"undefined"!=typeof navigator&&/Chrome/i.test(navigator&&navigator.userAgent)},F=function(){return{handlers:["click-rail","drag-thumb","keyboard","wheel","touch"],maxScrollbarLength:null,minScrollbarLength:null,scrollingThreshold:1e3,scrollXMarginOffset:0,scrollYMarginOffset:0,suppressScrollX:!1,suppressScrollY:!1,swipeEasing:!0,useBothWheelAxes:!1,wheelPropagation:!0,wheelSpeed:1}},G={"click-rail":function(a){a.element;a.event.bind(a.scrollbarY,"mousedown",function(a){return a.stopPropagation()}),a.event.bind(a.scrollbarYRail,"mousedown",function(b){var c=b.pageY-window.pageYOffset-a.scrollbarYRail.getBoundingClientRect().top,d=c>a.scrollbarYTop?1:-1;a.element.scrollTop+=d*a.containerHeight,q(a),b.stopPropagation()}),a.event.bind(a.scrollbarX,"mousedown",function(a){return a.stopPropagation()}),a.event.bind(a.scrollbarXRail,"mousedown",function(b){var c=b.pageX-window.pageXOffset-a.scrollbarXRail.getBoundingClientRect().left,d=c>a.scrollbarXLeft?1:-1;a.element.scrollLeft+=d*a.containerWidth,q(a),b.stopPropagation()})},"drag-thumb":function(a){t(a,["containerWidth","contentWidth","pageX","railXWidth","scrollbarX","scrollbarXWidth","scrollLeft","x","scrollbarXRail"]),t(a,["containerHeight","contentHeight","pageY","railYHeight","scrollbarY","scrollbarYHeight","scrollTop","y","scrollbarYRail"])},keyboard:function(a){function b(b,d){var e=v(c.scrollTop);if(0===b){if(!a.scrollbarYActive)return!1;if(0===e&&0<d||e>=a.contentHeight-a.containerHeight&&0>d)return!a.settings.wheelPropagation}var f=c.scrollLeft;if(0===d){if(!a.scrollbarXActive)return!1;if(0===f&&0>b||f>=a.contentWidth-a.containerWidth&&0<b)return!a.settings.wheelPropagation}return!0}var c=a.element,f=function(){return d(c,":hover")},g=function(){return d(a.scrollbarX,":focus")||d(a.scrollbarY,":focus")};a.event.bind(a.ownerDocument,"keydown",function(d){if(!(d.isDefaultPrevented&&d.isDefaultPrevented()||d.defaultPrevented)&&(f()||g())){var e=document.activeElement?document.activeElement:a.ownerDocument.activeElement;if(e){if("IFRAME"===e.tagName)e=e.contentDocument.activeElement;else// go deeper if element is a webcomponent
for(;e.shadowRoot;)e=e.shadowRoot.activeElement;if(o(e))return}var h=0,i=0;switch(d.which){case 37:h=d.metaKey?-a.contentWidth:d.altKey?-a.containerWidth:-30;break;case 38:i=d.metaKey?a.contentHeight:d.altKey?a.containerHeight:30;break;case 39:h=d.metaKey?a.contentWidth:d.altKey?a.containerWidth:30;break;case 40:i=d.metaKey?-a.contentHeight:d.altKey?-a.containerHeight:-30;break;case 32:i=d.shiftKey?a.containerHeight:-a.containerHeight;break;case 33:i=a.containerHeight;break;case 34:i=-a.containerHeight;break;case 36:i=a.contentHeight;break;case 35:i=-a.contentHeight;break;default:return;}a.settings.suppressScrollX&&0!==h||a.settings.suppressScrollY&&0!==i||(c.scrollTop-=i,c.scrollLeft+=h,q(a),b(h,i)&&d.preventDefault())}})},wheel:function(b){function c(a,c){var d,e=v(h.scrollTop),f=0===h.scrollTop,g=e+h.offsetHeight===h.scrollHeight,i=0===h.scrollLeft,j=h.scrollLeft+h.offsetWidth===h.scrollWidth;return d=u(c)>u(a)?f||g:i||j,!d||!b.settings.wheelPropagation}function d(a){var b=a.deltaX,c=-1*a.deltaY;return("undefined"==typeof b||"undefined"==typeof c)&&(b=-1*a.wheelDeltaX/6,c=a.wheelDeltaY/6),a.deltaMode&&1===a.deltaMode&&(b*=10,c*=10),b!==b&&c!==c/* NaN checks */&&(b=0,c=a.wheelDelta),a.shiftKey?[-c,-b]:[b,c]}function f(b,c,d){// FIXME: this is a workaround for <select> issue in FF and IE #571
if(!E.isWebKit&&h.querySelector("select:focus"))return!0;if(!h.contains(b))return!1;for(var e=b;e&&e!==h;){if(e.classList.contains(z.element.consuming))return!0;var f=a(e);// if deltaY && vertical scrollable
if(d&&f.overflowY.match(/(scroll|auto)/)){var g=e.scrollHeight-e.clientHeight;if(0<g&&(0<e.scrollTop&&0>d||e.scrollTop<g&&0<d))return!0}// if deltaX && horizontal scrollable
if(c&&f.overflowX.match(/(scroll|auto)/)){var i=e.scrollWidth-e.clientWidth;if(0<i&&(0<e.scrollLeft&&0>c||e.scrollLeft<i&&0<c))return!0}e=e.parentNode}return!1}function g(a){var e=d(a),g=e[0],i=e[1];if(!f(a.target,g,i)){var j=!1;b.settings.useBothWheelAxes?b.scrollbarYActive&&!b.scrollbarXActive?(i?h.scrollTop-=i*b.settings.wheelSpeed:h.scrollTop+=g*b.settings.wheelSpeed,j=!0):b.scrollbarXActive&&!b.scrollbarYActive&&(g?h.scrollLeft+=g*b.settings.wheelSpeed:h.scrollLeft-=i*b.settings.wheelSpeed,j=!0):(h.scrollTop-=i*b.settings.wheelSpeed,h.scrollLeft+=g*b.settings.wheelSpeed),q(b),j=j||c(g,i),j&&!a.ctrlKey&&(a.stopPropagation(),a.preventDefault())}}var h=b.element;"undefined"==typeof window.onwheel?"undefined"!=typeof window.onmousewheel&&b.event.bind(h,"mousewheel",g):b.event.bind(h,"wheel",g)},touch:function(b){function c(a,c){var d=v(l.scrollTop),e=l.scrollLeft,f=u(a),g=u(c);if(g>f){// user is perhaps trying to swipe up/down the page
if(0>c&&d===b.contentHeight-b.containerHeight||0<c&&0===d)// set prevent for mobile Chrome refresh
return 0===window.scrollY&&0<c&&E.isChrome;}else if(f>g&&(0>a&&e===b.contentWidth-b.containerWidth||0<a&&0===e))// user is perhaps trying to swipe left/right across the page
return!0;return!0}function d(a,c){l.scrollTop-=c,l.scrollLeft-=a,q(b)}function f(a){return a.targetTouches?a.targetTouches[0]:a}function g(a){return!(a.pointerType&&"pen"===a.pointerType&&0===a.buttons)&&(!!(a.targetTouches&&1===a.targetTouches.length)||!!(a.pointerType&&"mouse"!==a.pointerType&&a.pointerType!==a.MSPOINTER_TYPE_MOUSE))}function h(a){if(g(a)){var b=f(a);m.pageX=b.pageX,m.pageY=b.pageY,n=new Date().getTime(),null!==p&&clearInterval(p)}}function i(b,c,d){if(!l.contains(b))return!1;for(var e=b;e&&e!==l;){if(e.classList.contains(z.element.consuming))return!0;var f=a(e);// if deltaY && vertical scrollable
if(d&&f.overflowY.match(/(scroll|auto)/)){var g=e.scrollHeight-e.clientHeight;if(0<g&&(0<e.scrollTop&&0>d||e.scrollTop<g&&0<d))return!0}// if deltaX && horizontal scrollable
if(c&&f.overflowX.match(/(scroll|auto)/)){var h=e.scrollWidth-e.clientWidth;if(0<h&&(0<e.scrollLeft&&0>c||e.scrollLeft<h&&0<c))return!0}e=e.parentNode}return!1}function j(a){if(g(a)){var b=f(a),e={pageX:b.pageX,pageY:b.pageY},h=e.pageX-m.pageX,j=e.pageY-m.pageY;if(i(a.target,h,j))return;d(h,j),m=e;var k=new Date().getTime(),l=k-n;0<l&&(o.x=h/l,o.y=j/l,n=k),c(h,j)&&a.preventDefault()}}function k(){b.settings.swipeEasing&&(clearInterval(p),p=setInterval(function(){return b.isInitialized?void clearInterval(p):o.x||o.y?.01>u(o.x)&&.01>u(o.y)?void clearInterval(p):void(d(30*o.x,30*o.y),o.x*=.8,o.y*=.8):void clearInterval(p)},10))}if(E.supportsTouch||E.supportsIePointer){var l=b.element,m={},n=0,o={},p=null;E.supportsTouch?(b.event.bind(l,"touchstart",h),b.event.bind(l,"touchmove",j),b.event.bind(l,"touchend",k)):E.supportsIePointer&&(window.PointerEvent?(b.event.bind(l,"pointerdown",h),b.event.bind(l,"pointermove",j),b.event.bind(l,"pointerup",k)):window.MSPointerEvent&&(b.event.bind(l,"MSPointerDown",h),b.event.bind(l,"MSPointerMove",j),b.event.bind(l,"MSPointerUp",k)))}}},H=function(d,e){var f=this;if(void 0===e&&(e={}),"string"==typeof d&&(d=document.querySelector(d)),!d||!d.nodeName)throw new Error("no element is specified to initialize PerfectScrollbar");for(var g in this.element=d,d.classList.add(z.main),this.settings=F(),e)this.settings[g]=e[g];this.containerWidth=null,this.containerHeight=null,this.contentWidth=null,this.contentHeight=null;var h=function(){return d.classList.add(z.state.focus)},i=function(){return d.classList.remove(z.state.focus)};this.isRtl="rtl"===a(d).direction,!0===this.isRtl&&d.classList.add(z.rtl),this.isNegativeScroll=function(){var a=d.scrollLeft,b=null;return d.scrollLeft=-1,b=0>d.scrollLeft,d.scrollLeft=a,b}(),this.negativeScrollAdjustment=this.isNegativeScroll?d.scrollWidth-d.clientWidth:0,this.event=new D,this.ownerDocument=d.ownerDocument||document,this.scrollbarXRail=c(z.element.rail("x")),d.appendChild(this.scrollbarXRail),this.scrollbarX=c(z.element.thumb("x")),this.scrollbarXRail.appendChild(this.scrollbarX),this.scrollbarX.setAttribute("tabindex",0),this.event.bind(this.scrollbarX,"focus",h),this.event.bind(this.scrollbarX,"blur",i),this.scrollbarXActive=null,this.scrollbarXWidth=null,this.scrollbarXLeft=null;var j=a(this.scrollbarXRail);this.scrollbarXBottom=parseInt(j.bottom,10),isNaN(this.scrollbarXBottom)?(this.isScrollbarXUsingBottom=!1,this.scrollbarXTop=n(j.top)):this.isScrollbarXUsingBottom=!0,this.railBorderXWidth=n(j.borderLeftWidth)+n(j.borderRightWidth),b(this.scrollbarXRail,{display:"block"}),this.railXMarginWidth=n(j.marginLeft)+n(j.marginRight),b(this.scrollbarXRail,{display:""}),this.railXWidth=null,this.railXRatio=null,this.scrollbarYRail=c(z.element.rail("y")),d.appendChild(this.scrollbarYRail),this.scrollbarY=c(z.element.thumb("y")),this.scrollbarYRail.appendChild(this.scrollbarY),this.scrollbarY.setAttribute("tabindex",0),this.event.bind(this.scrollbarY,"focus",h),this.event.bind(this.scrollbarY,"blur",i),this.scrollbarYActive=null,this.scrollbarYHeight=null,this.scrollbarYTop=null;var k=a(this.scrollbarYRail);this.scrollbarYRight=parseInt(k.right,10),isNaN(this.scrollbarYRight)?(this.isScrollbarYUsingRight=!1,this.scrollbarYLeft=n(k.left)):this.isScrollbarYUsingRight=!0,this.scrollbarYOuterWidth=this.isRtl?p(this.scrollbarY):null,this.railBorderYWidth=n(k.borderTopWidth)+n(k.borderBottomWidth),b(this.scrollbarYRail,{display:"block"}),this.railYMarginHeight=n(k.marginTop)+n(k.marginBottom),b(this.scrollbarYRail,{display:""}),this.railYHeight=null,this.railYRatio=null,this.reach={x:0>=d.scrollLeft?"start":d.scrollLeft>=this.contentWidth-this.containerWidth?"end":null,y:0>=d.scrollTop?"start":d.scrollTop>=this.contentHeight-this.containerHeight?"end":null},this.isAlive=!0,this.settings.handlers.forEach(function(a){return G[a](f)}),this.lastScrollTop=v(d.scrollTop),this.lastScrollLeft=d.scrollLeft,this.event.bind(this.element,"scroll",function(a){return f.onScroll(a)}),q(this)};return H.prototype.update=function(){this.isAlive&&(// Recalcuate negative scrollLeft adjustment
// Recalculate rail margins
// Hide scrollbars not to affect scrollWidth and scrollHeight
this.negativeScrollAdjustment=this.isNegativeScroll?this.element.scrollWidth-this.element.clientWidth:0,b(this.scrollbarXRail,{display:"block"}),b(this.scrollbarYRail,{display:"block"}),this.railXMarginWidth=n(a(this.scrollbarXRail).marginLeft)+n(a(this.scrollbarXRail).marginRight),this.railYMarginHeight=n(a(this.scrollbarYRail).marginTop)+n(a(this.scrollbarYRail).marginBottom),b(this.scrollbarXRail,{display:"none"}),b(this.scrollbarYRail,{display:"none"}),q(this),l(this,"top",0,!1,!0),l(this,"left",0,!1,!0),b(this.scrollbarXRail,{display:""}),b(this.scrollbarYRail,{display:""}))},H.prototype.onScroll=function(){this.isAlive&&(q(this),l(this,"top",this.element.scrollTop-this.lastScrollTop),l(this,"left",this.element.scrollLeft-this.lastScrollLeft),this.lastScrollTop=v(this.element.scrollTop),this.lastScrollLeft=this.element.scrollLeft)},H.prototype.destroy=function(){this.isAlive&&(// unset elements
this.event.unbindAll(),e(this.scrollbarX),e(this.scrollbarY),e(this.scrollbarXRail),e(this.scrollbarYRail),this.removePsClasses(),this.element=null,this.scrollbarX=null,this.scrollbarY=null,this.scrollbarXRail=null,this.scrollbarYRail=null,this.isAlive=!1)},H.prototype.removePsClasses=function(){this.element.className=this.element.className.split(" ").filter(function(a){return!a.match(/^ps([-_].+|)$/)}).join(" ")},H});

!function(t,n){"object"==typeof exports&&"object"==typeof module?module.exports=n():"function"==typeof define&&define.amd?define([],n):"object"==typeof exports?exports.Scrollbar=n():t.Scrollbar=n()}(this,(function(){return function(t){var n={};function e(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,e),o.l=!0,o.exports}return e.m=t,e.c=n,e.d=function(t,n,r){e.o(t,n)||Object.defineProperty(t,n,{enumerable:!0,get:r})},e.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},e.t=function(t,n){if(1&n&&(t=e(t)),8&n)return t;if(4&n&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(e.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&n&&"string"!=typeof t)for(var o in t)e.d(r,o,function(n){return t[n]}.bind(null,o));return r},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},e.p="",e(e.s=58)}([function(t,n,e){var r=e(25)("wks"),o=e(16),i=e(2).Symbol,u="function"==typeof i;(t.exports=function(t){return r[t]||(r[t]=u&&i[t]||(u?i:o)("Symbol."+t))}).store=r},function(t,n){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},function(t,n){var e=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=e)},function(t,n){var e=t.exports={version:"2.6.9"};"number"==typeof __e&&(__e=e)},function(t,n,e){t.exports=!e(13)((function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a}))},function(t,n,e){var r=e(2),o=e(3),i=e(11),u=e(6),c=e(10),s=function(t,n,e){var a,f,l,p,h=t&s.F,d=t&s.G,v=t&s.S,y=t&s.P,m=t&s.B,g=d?r:v?r[n]||(r[n]={}):(r[n]||{}).prototype,b=d?o:o[n]||(o[n]={}),x=b.prototype||(b.prototype={});for(a in d&&(e=n),e)l=((f=!h&&g&&void 0!==g[a])?g:e)[a],p=m&&f?c(l,r):y&&"function"==typeof l?c(Function.call,l):l,g&&u(g,a,l,t&s.U),b[a]!=l&&i(b,a,p),y&&x[a]!=l&&(x[a]=l)};r.core=o,s.F=1,s.G=2,s.S=4,s.P=8,s.B=16,s.W=32,s.U=64,s.R=128,t.exports=s},function(t,n,e){var r=e(2),o=e(11),i=e(9),u=e(16)("src"),c=e(60),s=(""+c).split("toString");e(3).inspectSource=function(t){return c.call(t)},(t.exports=function(t,n,e,c){var a="function"==typeof e;a&&(i(e,"name")||o(e,"name",n)),t[n]!==e&&(a&&(i(e,u)||o(e,u,t[n]?""+t[n]:s.join(String(n)))),t===r?t[n]=e:c?t[n]?t[n]=e:o(t,n,e):(delete t[n],o(t,n,e)))})(Function.prototype,"toString",(function(){return"function"==typeof this&&this[u]||c.call(this)}))},function(t,n,e){var r=e(8),o=e(41),i=e(43),u=Object.defineProperty;n.f=e(4)?Object.defineProperty:function(t,n,e){if(r(t),n=i(n,!0),r(e),o)try{return u(t,n,e)}catch(t){}if("get"in e||"set"in e)throw TypeError("Accessors not supported!");return"value"in e&&(t[n]=e.value),t}},function(t,n,e){var r=e(1);t.exports=function(t){if(!r(t))throw TypeError(t+" is not an object!");return t}},function(t,n){var e={}.hasOwnProperty;t.exports=function(t,n){return e.call(t,n)}},function(t,n,e){var r=e(44);t.exports=function(t,n,e){if(r(t),void 0===n)return t;switch(e){case 1:return function(e){return t.call(n,e)};case 2:return function(e,r){return t.call(n,e,r)};case 3:return function(e,r,o){return t.call(n,e,r,o)}}return function(){return t.apply(n,arguments)}}},function(t,n,e){var r=e(7),o=e(17);t.exports=e(4)?function(t,n,e){return r.f(t,n,o(1,e))}:function(t,n,e){return t[n]=e,t}},function(t,n,e){var r=e(1);t.exports=function(t,n){if(!r(t)||t._t!==n)throw TypeError("Incompatible receiver, "+n+" required!");return t}},function(t,n){t.exports=function(t){try{return!!t()}catch(t){return!0}}},function(t,n){t.exports={}},function(t,n,e){var r=e(10),o=e(49),i=e(50),u=e(8),c=e(19),s=e(51),a={},f={};(n=t.exports=function(t,n,e,l,p){var h,d,v,y,m=p?function(){return t}:s(t),g=r(e,l,n?2:1),b=0;if("function"!=typeof m)throw TypeError(t+" is not iterable!");if(i(m)){for(h=c(t.length);h>b;b++)if((y=n?g(u(d=t[b])[0],d[1]):g(t[b]))===a||y===f)return y}else for(v=m.call(t);!(d=v.next()).done;)if((y=o(v,g,d.value,n))===a||y===f)return y}).BREAK=a,n.RETURN=f},function(t,n){var e=0,r=Math.random();t.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++e+r).toString(36))}},function(t,n){t.exports=function(t,n){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:n}}},function(t,n,e){var r=e(31),o=e(28);t.exports=function(t){return r(o(t))}},function(t,n,e){var r=e(27),o=Math.min;t.exports=function(t){return t>0?o(r(t),9007199254740991):0}},function(t,n,e){var r=e(28);t.exports=function(t){return Object(r(t))}},function(t,n,e){var r=e(16)("meta"),o=e(1),i=e(9),u=e(7).f,c=0,s=Object.isExtensible||function(){return!0},a=!e(13)((function(){return s(Object.preventExtensions({}))})),f=function(t){u(t,r,{value:{i:"O"+ ++c,w:{}}})},l=t.exports={KEY:r,NEED:!1,fastKey:function(t,n){if(!o(t))return"symbol"==typeof t?t:("string"==typeof t?"S":"P")+t;if(!i(t,r)){if(!s(t))return"F";if(!n)return"E";f(t)}return t[r].i},getWeak:function(t,n){if(!i(t,r)){if(!s(t))return!0;if(!n)return!1;f(t)}return t[r].w},onFreeze:function(t){return a&&l.NEED&&s(t)&&!i(t,r)&&f(t),t}}},function(t,n,e){"use strict";var r=e(23),o={};o[e(0)("toStringTag")]="z",o+""!="[object z]"&&e(6)(Object.prototype,"toString",(function(){return"[object "+r(this)+"]"}),!0)},function(t,n,e){var r=e(24),o=e(0)("toStringTag"),i="Arguments"==r(function(){return arguments}());t.exports=function(t){var n,e,u;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(e=function(t,n){try{return t[n]}catch(t){}}(n=Object(t),o))?e:i?r(n):"Object"==(u=r(n))&&"function"==typeof n.callee?"Arguments":u}},function(t,n){var e={}.toString;t.exports=function(t){return e.call(t).slice(8,-1)}},function(t,n,e){var r=e(3),o=e(2),i=o["__core-js_shared__"]||(o["__core-js_shared__"]={});(t.exports=function(t,n){return i[t]||(i[t]=void 0!==n?n:{})})("versions",[]).push({version:r.version,mode:e(40)?"pure":"global",copyright:"© 2019 Denis Pushkarev (zloirock.ru)"})},function(t,n,e){"use strict";var r=e(61)(!0);e(29)(String,"String",(function(t){this._t=String(t),this._i=0}),(function(){var t,n=this._t,e=this._i;return e>=n.length?{value:void 0,done:!0}:(t=r(n,e),this._i+=t.length,{value:t,done:!1})}))},function(t,n){var e=Math.ceil,r=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?r:e)(t)}},function(t,n){t.exports=function(t){if(null==t)throw TypeError("Can't call method on  "+t);return t}},function(t,n,e){"use strict";var r=e(40),o=e(5),i=e(6),u=e(11),c=e(14),s=e(62),a=e(33),f=e(68),l=e(0)("iterator"),p=!([].keys&&"next"in[].keys()),h=function(){return this};t.exports=function(t,n,e,d,v,y,m){s(e,n,d);var g,b,x,_=function(t){if(!p&&t in O)return O[t];switch(t){case"keys":case"values":return function(){return new e(this,t)}}return function(){return new e(this,t)}},w=n+" Iterator",E="values"==v,S=!1,O=t.prototype,T=O[l]||O["@@iterator"]||v&&O[v],A=T||_(v),M=v?E?_("entries"):A:void 0,P="Array"==n&&O.entries||T;if(P&&(x=f(P.call(new t)))!==Object.prototype&&x.next&&(a(x,w,!0),r||"function"==typeof x[l]||u(x,l,h)),E&&T&&"values"!==T.name&&(S=!0,A=function(){return T.call(this)}),r&&!m||!p&&!S&&O[l]||u(O,l,A),c[n]=A,c[w]=h,v)if(g={values:E?A:_("values"),keys:y?A:_("keys"),entries:M},m)for(b in g)b in O||i(O,b,g[b]);else o(o.P+o.F*(p||S),n,g);return g}},function(t,n,e){var r=e(64),o=e(46);t.exports=Object.keys||function(t){return r(t,o)}},function(t,n,e){var r=e(24);t.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return"String"==r(t)?t.split(""):Object(t)}},function(t,n,e){var r=e(25)("keys"),o=e(16);t.exports=function(t){return r[t]||(r[t]=o(t))}},function(t,n,e){var r=e(7).f,o=e(9),i=e(0)("toStringTag");t.exports=function(t,n,e){t&&!o(t=e?t:t.prototype,i)&&r(t,i,{configurable:!0,value:n})}},function(t,n,e){for(var r=e(69),o=e(30),i=e(6),u=e(2),c=e(11),s=e(14),a=e(0),f=a("iterator"),l=a("toStringTag"),p=s.Array,h={CSSRuleList:!0,CSSStyleDeclaration:!1,CSSValueList:!1,ClientRectList:!1,DOMRectList:!1,DOMStringList:!1,DOMTokenList:!0,DataTransferItemList:!1,FileList:!1,HTMLAllCollection:!1,HTMLCollection:!1,HTMLFormElement:!1,HTMLSelectElement:!1,MediaList:!0,MimeTypeArray:!1,NamedNodeMap:!1,NodeList:!0,PaintRequestList:!1,Plugin:!1,PluginArray:!1,SVGLengthList:!1,SVGNumberList:!1,SVGPathSegList:!1,SVGPointList:!1,SVGStringList:!1,SVGTransformList:!1,SourceBufferList:!1,StyleSheetList:!0,TextTrackCueList:!1,TextTrackList:!1,TouchList:!1},d=o(h),v=0;v<d.length;v++){var y,m=d[v],g=h[m],b=u[m],x=b&&b.prototype;if(x&&(x[f]||c(x,f,p),x[l]||c(x,l,m),s[m]=p,g))for(y in r)x[y]||i(x,y,r[y],!0)}},function(t,n,e){var r=e(6);t.exports=function(t,n,e){for(var o in n)r(t,o,n[o],e);return t}},function(t,n){t.exports=function(t,n,e,r){if(!(t instanceof n)||void 0!==r&&r in t)throw TypeError(e+": incorrect invocation!");return t}},function(t,n,e){"use strict";var r=e(2),o=e(5),i=e(6),u=e(35),c=e(21),s=e(15),a=e(36),f=e(1),l=e(13),p=e(52),h=e(33),d=e(73);t.exports=function(t,n,e,v,y,m){var g=r[t],b=g,x=y?"set":"add",_=b&&b.prototype,w={},E=function(t){var n=_[t];i(_,t,"delete"==t||"has"==t?function(t){return!(m&&!f(t))&&n.call(this,0===t?0:t)}:"get"==t?function(t){return m&&!f(t)?void 0:n.call(this,0===t?0:t)}:"add"==t?function(t){return n.call(this,0===t?0:t),this}:function(t,e){return n.call(this,0===t?0:t,e),this})};if("function"==typeof b&&(m||_.forEach&&!l((function(){(new b).entries().next()})))){var S=new b,O=S[x](m?{}:-0,1)!=S,T=l((function(){S.has(1)})),A=p((function(t){new b(t)})),M=!m&&l((function(){for(var t=new b,n=5;n--;)t[x](n,n);return!t.has(-0)}));A||((b=n((function(n,e){a(n,b,t);var r=d(new g,n,b);return null!=e&&s(e,y,r[x],r),r}))).prototype=_,_.constructor=b),(T||M)&&(E("delete"),E("has"),y&&E("get")),(M||O)&&E(x),m&&_.clear&&delete _.clear}else b=v.getConstructor(n,t,y,x),u(b.prototype,e),c.NEED=!0;return h(b,t),w[t]=b,o(o.G+o.W+o.F*(b!=g),w),m||v.setStrong(b,t,y),b}},function(t,n,e){"use strict";var r=e(5);t.exports=function(t){r(r.S,t,{of:function(){for(var t=arguments.length,n=new Array(t);t--;)n[t]=arguments[t];return new this(n)}})}},function(t,n,e){"use strict";var r=e(5),o=e(44),i=e(10),u=e(15);t.exports=function(t){r(r.S,t,{from:function(t){var n,e,r,c,s=arguments[1];return o(this),(n=void 0!==s)&&o(s),null==t?new this:(e=[],n?(r=0,c=i(s,arguments[2],2),u(t,!1,(function(t){e.push(c(t,r++))}))):u(t,!1,e.push,e),new this(e))}})}},function(t,n){t.exports=!1},function(t,n,e){t.exports=!e(4)&&!e(13)((function(){return 7!=Object.defineProperty(e(42)("div"),"a",{get:function(){return 7}}).a}))},function(t,n,e){var r=e(1),o=e(2).document,i=r(o)&&r(o.createElement);t.exports=function(t){return i?o.createElement(t):{}}},function(t,n,e){var r=e(1);t.exports=function(t,n){if(!r(t))return t;var e,o;if(n&&"function"==typeof(e=t.toString)&&!r(o=e.call(t)))return o;if("function"==typeof(e=t.valueOf)&&!r(o=e.call(t)))return o;if(!n&&"function"==typeof(e=t.toString)&&!r(o=e.call(t)))return o;throw TypeError("Can't convert object to primitive value")}},function(t,n){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},function(t,n,e){var r=e(8),o=e(63),i=e(46),u=e(32)("IE_PROTO"),c=function(){},s=function(){var t,n=e(42)("iframe"),r=i.length;for(n.style.display="none",e(67).appendChild(n),n.src="javascript:",(t=n.contentWindow.document).open(),t.write("<script>document.F=Object<\/script>"),t.close(),s=t.F;r--;)delete s.prototype[i[r]];return s()};t.exports=Object.create||function(t,n){var e;return null!==t?(c.prototype=r(t),e=new c,c.prototype=null,e[u]=t):e=s(),void 0===n?e:o(e,n)}},function(t,n){t.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},function(t,n){t.exports=function(t,n){return{value:n,done:!!t}}},function(t,n,e){"use strict";var r=e(7).f,o=e(45),i=e(35),u=e(10),c=e(36),s=e(15),a=e(29),f=e(47),l=e(72),p=e(4),h=e(21).fastKey,d=e(12),v=p?"_s":"size",y=function(t,n){var e,r=h(n);if("F"!==r)return t._i[r];for(e=t._f;e;e=e.n)if(e.k==n)return e};t.exports={getConstructor:function(t,n,e,a){var f=t((function(t,r){c(t,f,n,"_i"),t._t=n,t._i=o(null),t._f=void 0,t._l=void 0,t[v]=0,null!=r&&s(r,e,t[a],t)}));return i(f.prototype,{clear:function(){for(var t=d(this,n),e=t._i,r=t._f;r;r=r.n)r.r=!0,r.p&&(r.p=r.p.n=void 0),delete e[r.i];t._f=t._l=void 0,t[v]=0},delete:function(t){var e=d(this,n),r=y(e,t);if(r){var o=r.n,i=r.p;delete e._i[r.i],r.r=!0,i&&(i.n=o),o&&(o.p=i),e._f==r&&(e._f=o),e._l==r&&(e._l=i),e[v]--}return!!r},forEach:function(t){d(this,n);for(var e,r=u(t,arguments.length>1?arguments[1]:void 0,3);e=e?e.n:this._f;)for(r(e.v,e.k,this);e&&e.r;)e=e.p},has:function(t){return!!y(d(this,n),t)}}),p&&r(f.prototype,"size",{get:function(){return d(this,n)[v]}}),f},def:function(t,n,e){var r,o,i=y(t,n);return i?i.v=e:(t._l=i={i:o=h(n,!0),k:n,v:e,p:r=t._l,n:void 0,r:!1},t._f||(t._f=i),r&&(r.n=i),t[v]++,"F"!==o&&(t._i[o]=i)),t},getEntry:y,setStrong:function(t,n,e){a(t,n,(function(t,e){this._t=d(t,n),this._k=e,this._l=void 0}),(function(){for(var t=this._k,n=this._l;n&&n.r;)n=n.p;return this._t&&(this._l=n=n?n.n:this._t._f)?f(0,"keys"==t?n.k:"values"==t?n.v:[n.k,n.v]):(this._t=void 0,f(1))}),e?"entries":"values",!e,!0),l(n)}}},function(t,n,e){var r=e(8);t.exports=function(t,n,e,o){try{return o?n(r(e)[0],e[1]):n(e)}catch(n){var i=t.return;throw void 0!==i&&r(i.call(t)),n}}},function(t,n,e){var r=e(14),o=e(0)("iterator"),i=Array.prototype;t.exports=function(t){return void 0!==t&&(r.Array===t||i[o]===t)}},function(t,n,e){var r=e(23),o=e(0)("iterator"),i=e(14);t.exports=e(3).getIteratorMethod=function(t){if(null!=t)return t[o]||t["@@iterator"]||i[r(t)]}},function(t,n,e){var r=e(0)("iterator"),o=!1;try{var i=[7][r]();i.return=function(){o=!0},Array.from(i,(function(){throw 2}))}catch(t){}t.exports=function(t,n){if(!n&&!o)return!1;var e=!1;try{var i=[7],u=i[r]();u.next=function(){return{done:e=!0}},i[r]=function(){return u},t(i)}catch(t){}return e}},function(t,n){n.f={}.propertyIsEnumerable},function(t,n,e){var r=e(23),o=e(77);t.exports=function(t){return function(){if(r(this)!=t)throw TypeError(t+"#toJSON isn't generic");return o(this)}}},function(t,n,e){var r=e(10),o=e(31),i=e(20),u=e(19),c=e(87);t.exports=function(t,n){var e=1==t,s=2==t,a=3==t,f=4==t,l=6==t,p=5==t||l,h=n||c;return function(n,c,d){for(var v,y,m=i(n),g=o(m),b=r(c,d,3),x=u(g.length),_=0,w=e?h(n,x):s?h(n,0):void 0;x>_;_++)if((p||_ in g)&&(y=b(v=g[_],_,m),t))if(e)w[_]=y;else if(y)switch(t){case 3:return!0;case 5:return v;case 6:return _;case 2:w.push(v)}else if(f)return!1;return l?-1:a||f?f:w}}},function(t,n,e){"use strict";var r=e(4),o=e(30),i=e(90),u=e(53),c=e(20),s=e(31),a=Object.assign;t.exports=!a||e(13)((function(){var t={},n={},e=Symbol(),r="abcdefghijklmnopqrst";return t[e]=7,r.split("").forEach((function(t){n[t]=t})),7!=a({},t)[e]||Object.keys(a({},n)).join("")!=r}))?function(t,n){for(var e=c(t),a=arguments.length,f=1,l=i.f,p=u.f;a>f;)for(var h,d=s(arguments[f++]),v=l?o(d).concat(l(d)):o(d),y=v.length,m=0;y>m;)h=v[m++],r&&!p.call(d,h)||(e[h]=d[h]);return e}:a},function(t,n,e){"use strict";(function(t){var e="object"==typeof t&&t&&t.Object===Object&&t;n.a=e}).call(this,e(99))},function(t,n,e){t.exports=e(100)},function(t,n,e){e(22),e(26),e(34),e(71),e(76),e(78),e(79),t.exports=e(3).Map},function(t,n,e){t.exports=e(25)("native-function-to-string",Function.toString)},function(t,n,e){var r=e(27),o=e(28);t.exports=function(t){return function(n,e){var i,u,c=String(o(n)),s=r(e),a=c.length;return s<0||s>=a?t?"":void 0:(i=c.charCodeAt(s))<55296||i>56319||s+1===a||(u=c.charCodeAt(s+1))<56320||u>57343?t?c.charAt(s):i:t?c.slice(s,s+2):u-56320+(i-55296<<10)+65536}}},function(t,n,e){"use strict";var r=e(45),o=e(17),i=e(33),u={};e(11)(u,e(0)("iterator"),(function(){return this})),t.exports=function(t,n,e){t.prototype=r(u,{next:o(1,e)}),i(t,n+" Iterator")}},function(t,n,e){var r=e(7),o=e(8),i=e(30);t.exports=e(4)?Object.defineProperties:function(t,n){o(t);for(var e,u=i(n),c=u.length,s=0;c>s;)r.f(t,e=u[s++],n[e]);return t}},function(t,n,e){var r=e(9),o=e(18),i=e(65)(!1),u=e(32)("IE_PROTO");t.exports=function(t,n){var e,c=o(t),s=0,a=[];for(e in c)e!=u&&r(c,e)&&a.push(e);for(;n.length>s;)r(c,e=n[s++])&&(~i(a,e)||a.push(e));return a}},function(t,n,e){var r=e(18),o=e(19),i=e(66);t.exports=function(t){return function(n,e,u){var c,s=r(n),a=o(s.length),f=i(u,a);if(t&&e!=e){for(;a>f;)if((c=s[f++])!=c)return!0}else for(;a>f;f++)if((t||f in s)&&s[f]===e)return t||f||0;return!t&&-1}}},function(t,n,e){var r=e(27),o=Math.max,i=Math.min;t.exports=function(t,n){return(t=r(t))<0?o(t+n,0):i(t,n)}},function(t,n,e){var r=e(2).document;t.exports=r&&r.documentElement},function(t,n,e){var r=e(9),o=e(20),i=e(32)("IE_PROTO"),u=Object.prototype;t.exports=Object.getPrototypeOf||function(t){return t=o(t),r(t,i)?t[i]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?u:null}},function(t,n,e){"use strict";var r=e(70),o=e(47),i=e(14),u=e(18);t.exports=e(29)(Array,"Array",(function(t,n){this._t=u(t),this._i=0,this._k=n}),(function(){var t=this._t,n=this._k,e=this._i++;return!t||e>=t.length?(this._t=void 0,o(1)):o(0,"keys"==n?e:"values"==n?t[e]:[e,t[e]])}),"values"),i.Arguments=i.Array,r("keys"),r("values"),r("entries")},function(t,n,e){var r=e(0)("unscopables"),o=Array.prototype;null==o[r]&&e(11)(o,r,{}),t.exports=function(t){o[r][t]=!0}},function(t,n,e){"use strict";var r=e(48),o=e(12);t.exports=e(37)("Map",(function(t){return function(){return t(this,arguments.length>0?arguments[0]:void 0)}}),{get:function(t){var n=r.getEntry(o(this,"Map"),t);return n&&n.v},set:function(t,n){return r.def(o(this,"Map"),0===t?0:t,n)}},r,!0)},function(t,n,e){"use strict";var r=e(2),o=e(7),i=e(4),u=e(0)("species");t.exports=function(t){var n=r[t];i&&n&&!n[u]&&o.f(n,u,{configurable:!0,get:function(){return this}})}},function(t,n,e){var r=e(1),o=e(74).set;t.exports=function(t,n,e){var i,u=n.constructor;return u!==e&&"function"==typeof u&&(i=u.prototype)!==e.prototype&&r(i)&&o&&o(t,i),t}},function(t,n,e){var r=e(1),o=e(8),i=function(t,n){if(o(t),!r(n)&&null!==n)throw TypeError(n+": can't set as prototype!")};t.exports={set:Object.setPrototypeOf||("__proto__"in{}?function(t,n,r){try{(r=e(10)(Function.call,e(75).f(Object.prototype,"__proto__").set,2))(t,[]),n=!(t instanceof Array)}catch(t){n=!0}return function(t,e){return i(t,e),n?t.__proto__=e:r(t,e),t}}({},!1):void 0),check:i}},function(t,n,e){var r=e(53),o=e(17),i=e(18),u=e(43),c=e(9),s=e(41),a=Object.getOwnPropertyDescriptor;n.f=e(4)?a:function(t,n){if(t=i(t),n=u(n,!0),s)try{return a(t,n)}catch(t){}if(c(t,n))return o(!r.f.call(t,n),t[n])}},function(t,n,e){var r=e(5);r(r.P+r.R,"Map",{toJSON:e(54)("Map")})},function(t,n,e){var r=e(15);t.exports=function(t,n){var e=[];return r(t,!1,e.push,e,n),e}},function(t,n,e){e(38)("Map")},function(t,n,e){e(39)("Map")},function(t,n,e){e(22),e(26),e(34),e(81),e(82),e(83),e(84),t.exports=e(3).Set},function(t,n,e){"use strict";var r=e(48),o=e(12);t.exports=e(37)("Set",(function(t){return function(){return t(this,arguments.length>0?arguments[0]:void 0)}}),{add:function(t){return r.def(o(this,"Set"),t=0===t?0:t,t)}},r)},function(t,n,e){var r=e(5);r(r.P+r.R,"Set",{toJSON:e(54)("Set")})},function(t,n,e){e(38)("Set")},function(t,n,e){e(39)("Set")},function(t,n,e){e(22),e(34),e(86),e(92),e(93),t.exports=e(3).WeakMap},function(t,n,e){"use strict";var r,o=e(2),i=e(55)(0),u=e(6),c=e(21),s=e(56),a=e(91),f=e(1),l=e(12),p=e(12),h=!o.ActiveXObject&&"ActiveXObject"in o,d=c.getWeak,v=Object.isExtensible,y=a.ufstore,m=function(t){return function(){return t(this,arguments.length>0?arguments[0]:void 0)}},g={get:function(t){if(f(t)){var n=d(t);return!0===n?y(l(this,"WeakMap")).get(t):n?n[this._i]:void 0}},set:function(t,n){return a.def(l(this,"WeakMap"),t,n)}},b=t.exports=e(37)("WeakMap",m,g,a,!0,!0);p&&h&&(s((r=a.getConstructor(m,"WeakMap")).prototype,g),c.NEED=!0,i(["delete","has","get","set"],(function(t){var n=b.prototype,e=n[t];u(n,t,(function(n,o){if(f(n)&&!v(n)){this._f||(this._f=new r);var i=this._f[t](n,o);return"set"==t?this:i}return e.call(this,n,o)}))})))},function(t,n,e){var r=e(88);t.exports=function(t,n){return new(r(t))(n)}},function(t,n,e){var r=e(1),o=e(89),i=e(0)("species");t.exports=function(t){var n;return o(t)&&("function"!=typeof(n=t.constructor)||n!==Array&&!o(n.prototype)||(n=void 0),r(n)&&null===(n=n[i])&&(n=void 0)),void 0===n?Array:n}},function(t,n,e){var r=e(24);t.exports=Array.isArray||function(t){return"Array"==r(t)}},function(t,n){n.f=Object.getOwnPropertySymbols},function(t,n,e){"use strict";var r=e(35),o=e(21).getWeak,i=e(8),u=e(1),c=e(36),s=e(15),a=e(55),f=e(9),l=e(12),p=a(5),h=a(6),d=0,v=function(t){return t._l||(t._l=new y)},y=function(){this.a=[]},m=function(t,n){return p(t.a,(function(t){return t[0]===n}))};y.prototype={get:function(t){var n=m(this,t);if(n)return n[1]},has:function(t){return!!m(this,t)},set:function(t,n){var e=m(this,t);e?e[1]=n:this.a.push([t,n])},delete:function(t){var n=h(this.a,(function(n){return n[0]===t}));return~n&&this.a.splice(n,1),!!~n}},t.exports={getConstructor:function(t,n,e,i){var a=t((function(t,r){c(t,a,n,"_i"),t._t=n,t._i=d++,t._l=void 0,null!=r&&s(r,e,t[i],t)}));return r(a.prototype,{delete:function(t){if(!u(t))return!1;var e=o(t);return!0===e?v(l(this,n)).delete(t):e&&f(e,this._i)&&delete e[this._i]},has:function(t){if(!u(t))return!1;var e=o(t);return!0===e?v(l(this,n)).has(t):e&&f(e,this._i)}}),a},def:function(t,n,e){var r=o(i(n),!0);return!0===r?v(t).set(n,e):r[t._i]=e,t},ufstore:v}},function(t,n,e){e(38)("WeakMap")},function(t,n,e){e(39)("WeakMap")},function(t,n,e){e(26),e(95),t.exports=e(3).Array.from},function(t,n,e){"use strict";var r=e(10),o=e(5),i=e(20),u=e(49),c=e(50),s=e(19),a=e(96),f=e(51);o(o.S+o.F*!e(52)((function(t){Array.from(t)})),"Array",{from:function(t){var n,e,o,l,p=i(t),h="function"==typeof this?this:Array,d=arguments.length,v=d>1?arguments[1]:void 0,y=void 0!==v,m=0,g=f(p);if(y&&(v=r(v,d>2?arguments[2]:void 0,2)),null==g||h==Array&&c(g))for(e=new h(n=s(p.length));n>m;m++)a(e,m,y?v(p[m],m):p[m]);else for(l=g.call(p),e=new h;!(o=l.next()).done;m++)a(e,m,y?u(l,v,[o.value,m],!0):o.value);return e.length=m,e}})},function(t,n,e){"use strict";var r=e(7),o=e(17);t.exports=function(t,n,e){n in t?r.f(t,n,o(0,e)):t[n]=e}},function(t,n,e){e(98),t.exports=e(3).Object.assign},function(t,n,e){var r=e(5);r(r.S+r.F,"Object",{assign:e(56)})},function(t,n){var e;e=function(){return this}();try{e=e||new Function("return this")()}catch(t){"object"==typeof window&&(e=window)}t.exports=e},function(t,n,e){"use strict";e.r(n);var r={};e.r(r),e.d(r,"keyboardHandler",(function(){return et})),e.d(r,"mouseHandler",(function(){return rt})),e.d(r,"resizeHandler",(function(){return ot})),e.d(r,"selectHandler",(function(){return it})),e.d(r,"touchHandler",(function(){return ut})),e.d(r,"wheelHandler",(function(){return ct}));
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var o=function(t,n){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,n){t.__proto__=n}||function(t,n){for(var e in n)n.hasOwnProperty(e)&&(t[e]=n[e])})(t,n)},i=function(){return(i=Object.assign||function(t){for(var n,e=1,r=arguments.length;e<r;e++)for(var o in n=arguments[e])Object.prototype.hasOwnProperty.call(n,o)&&(t[o]=n[o]);return t}).apply(this,arguments)};function u(t,n,e,r){var o,i=arguments.length,u=i<3?n:null===r?r=Object.getOwnPropertyDescriptor(n,e):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)u=Reflect.decorate(t,n,e,r);else for(var c=t.length-1;c>=0;c--)(o=t[c])&&(u=(i<3?o(u):i>3?o(n,e,u):o(n,e))||u);return i>3&&u&&Object.defineProperty(n,e,u),u}e(59),e(80),e(85),e(94),e(97);var c=function(t){var n=typeof t;return null!=t&&("object"==n||"function"==n)},s=e(57),a="object"==typeof self&&self&&self.Object===Object&&self,f=s.a||a||Function("return this")(),l=f.Symbol,p=Object.prototype,h=p.hasOwnProperty,d=p.toString,v=l?l.toStringTag:void 0,y=Object.prototype.toString,m=l?l.toStringTag:void 0,g=function(t){return null==t?void 0===t?"[object Undefined]":"[object Null]":m&&m in Object(t)?function(t){var n=h.call(t,v),e=t[v];try{t[v]=void 0;var r=!0}catch(t){}var o=d.call(t);return r&&(n?t[v]=e:delete t[v]),o}(t):function(t){return y.call(t)}(t)},b=/^\s+|\s+$/g,x=/^[-+]0x[0-9a-f]+$/i,_=/^0b[01]+$/i,w=/^0o[0-7]+$/i,E=parseInt,S=function(t){if("number"==typeof t)return t;if(function(t){return"symbol"==typeof t||function(t){return null!=t&&"object"==typeof t}(t)&&"[object Symbol]"==g(t)}(t))return NaN;if(c(t)){var n="function"==typeof t.valueOf?t.valueOf():t;t=c(n)?n+"":n}if("string"!=typeof t)return 0===t?t:+t;t=t.replace(b,"");var e=_.test(t);return e||w.test(t)?E(t.slice(2),e?2:8):x.test(t)?NaN:+t},O=function(t,n,e){return void 0===e&&(e=n,n=void 0),void 0!==e&&(e=(e=S(e))==e?e:0),void 0!==n&&(n=(n=S(n))==n?n:0),function(t,n,e){return t==t&&(void 0!==e&&(t=t<=e?t:e),void 0!==n&&(t=t>=n?t:n)),t}(S(t),n,e)};function T(t,n){return void 0===t&&(t=-1/0),void 0===n&&(n=1/0),function(e,r){var o="_"+r;Object.defineProperty(e,r,{get:function(){return this[o]},set:function(e){Object.defineProperty(this,o,{value:O(e,t,n),enumerable:!1,writable:!0,configurable:!0})},enumerable:!0,configurable:!0})}}function A(t,n){var e="_"+n;Object.defineProperty(t,n,{get:function(){return this[e]},set:function(t){Object.defineProperty(this,e,{value:!!t,enumerable:!1,writable:!0,configurable:!0})},enumerable:!0,configurable:!0})}var M=function(){return f.Date.now()},P=Math.max,j=Math.min,k=function(t,n,e){var r,o,i,u,s,a,f=0,l=!1,p=!1,h=!0;if("function"!=typeof t)throw new TypeError("Expected a function");function d(n){var e=r,i=o;return r=o=void 0,f=n,u=t.apply(i,e)}function v(t){var e=t-a;return void 0===a||e>=n||e<0||p&&t-f>=i}function y(){var t=M();if(v(t))return m(t);s=setTimeout(y,function(t){var e=n-(t-a);return p?j(e,i-(t-f)):e}(t))}function m(t){return s=void 0,h&&r?d(t):(r=o=void 0,u)}function g(){var t=M(),e=v(t);if(r=arguments,o=this,a=t,e){if(void 0===s)return function(t){return f=t,s=setTimeout(y,n),l?d(t):u}(a);if(p)return clearTimeout(s),s=setTimeout(y,n),d(a)}return void 0===s&&(s=setTimeout(y,n)),u}return n=S(n)||0,c(e)&&(l=!!e.leading,i=(p="maxWait"in e)?P(S(e.maxWait)||0,n):i,h="trailing"in e?!!e.trailing:h),g.cancel=function(){void 0!==s&&clearTimeout(s),f=0,r=a=o=s=void 0},g.flush=function(){return void 0===s?u:m(M())},g};function D(){for(var t=[],n=0;n<arguments.length;n++)t[n]=arguments[n];return function(n,e,r){var o=r.value;return{get:function(){return this.hasOwnProperty(e)||Object.defineProperty(this,e,{value:k.apply(void 0,function(){for(var t=0,n=0,e=arguments.length;n<e;n++)t+=arguments[n].length;var r=Array(t),o=0;for(n=0;n<e;n++)for(var i=arguments[n],u=0,c=i.length;u<c;u++,o++)r[o]=i[u];return r}([o],t))}),this[e]}}}}var L,N=function(){function t(t){var n=this;void 0===t&&(t={}),this.damping=.1,this.thumbMinSize=20,this.renderByPixels=!0,this.alwaysShowTracks=!1,this.continuousScrolling=!0,this.delegateTo=null,this.plugins={},Object.keys(t).forEach((function(e){n[e]=t[e]}))}return Object.defineProperty(t.prototype,"wheelEventTarget",{get:function(){return this.delegateTo},set:function(t){console.warn("[smooth-scrollbar]: `options.wheelEventTarget` is deprecated and will be removed in the future, use `options.delegateTo` instead."),this.delegateTo=t},enumerable:!0,configurable:!0}),u([T(0,1)],t.prototype,"damping",void 0),u([T(0,1/0)],t.prototype,"thumbMinSize",void 0),u([A],t.prototype,"renderByPixels",void 0),u([A],t.prototype,"alwaysShowTracks",void 0),u([A],t.prototype,"continuousScrolling",void 0),t}(),z=new WeakMap;function C(){if(void 0!==L)return L;var t=!1;try{var n=function(){},e=Object.defineProperty({},"passive",{get:function(){t=!0}});window.addEventListener("testPassive",n,e),window.removeEventListener("testPassive",n,e)}catch(t){}return L=!!t&&{passive:!1}}function R(t){var n=z.get(t)||[];return z.set(t,n),function(t,e,r){function o(t){t.defaultPrevented||r(t)}e.split(/\s+/g).forEach((function(e){n.push({elem:t,eventName:e,handler:o}),t.addEventListener(e,o,C())}))}}function F(t){var n=function(t){return t.touches?t.touches[t.touches.length-1]:t}(t);return{x:n.clientX,y:n.clientY}}function I(t,n){return void 0===n&&(n=[]),n.some((function(n){return t===n}))}var W=["webkit","moz","ms","o"],H=new RegExp("^-(?!(?:"+W.join("|")+")-)");function B(t,n){n=function(t){var n={};return Object.keys(t).forEach((function(e){if(H.test(e)){var r=t[e];e=e.replace(/^-/,""),n[e]=r,W.forEach((function(t){n["-"+t+"-"+e]=r}))}else n[e]=t[e]})),n}(n),Object.keys(n).forEach((function(e){var r=e.replace(/^-/,"").replace(/-([a-z])/g,(function(t,n){return n.toUpperCase()}));t.style[r]=n[e]}))}var G,X=function(){function t(t){this.updateTime=Date.now(),this.delta={x:0,y:0},this.velocity={x:0,y:0},this.lastPosition={x:0,y:0},this.lastPosition=F(t)}return t.prototype.update=function(t){var n=this.velocity,e=this.updateTime,r=this.lastPosition,o=Date.now(),i=F(t),u={x:-(i.x-r.x),y:-(i.y-r.y)},c=o-e||16,s=u.x/c*16,a=u.y/c*16;n.x=.9*s+.1*n.x,n.y=.9*a+.1*n.y,this.delta=u,this.updateTime=o,this.lastPosition=i},t}(),V=function(){function t(){this._touchList={}}return Object.defineProperty(t.prototype,"_primitiveValue",{get:function(){return{x:0,y:0}},enumerable:!0,configurable:!0}),t.prototype.isActive=function(){return void 0!==this._activeTouchID},t.prototype.getDelta=function(){var t=this._getActiveTracker();return t?i({},t.delta):this._primitiveValue},t.prototype.getVelocity=function(){var t=this._getActiveTracker();return t?i({},t.velocity):this._primitiveValue},t.prototype.track=function(t){var n=this,e=t.targetTouches;return Array.from(e).forEach((function(t){n._add(t)})),this._touchList},t.prototype.update=function(t){var n=this,e=t.touches,r=t.changedTouches;return Array.from(e).forEach((function(t){n._renew(t)})),this._setActiveID(r),this._touchList},t.prototype.release=function(t){var n=this;delete this._activeTouchID,Array.from(t.changedTouches).forEach((function(t){n._delete(t)}))},t.prototype._add=function(t){if(!this._has(t)){var n=new X(t);this._touchList[t.identifier]=n}},t.prototype._renew=function(t){this._has(t)&&this._touchList[t.identifier].update(t)},t.prototype._delete=function(t){delete this._touchList[t.identifier]},t.prototype._has=function(t){return this._touchList.hasOwnProperty(t.identifier)},t.prototype._setActiveID=function(t){this._activeTouchID=t[t.length-1].identifier},t.prototype._getActiveTracker=function(){return this._touchList[this._activeTouchID]},t}();!function(t){t.X="x",t.Y="y"}(G||(G={}));var U=function(){function t(t,n){void 0===n&&(n=0),this._direction=t,this._minSize=n,this.element=document.createElement("div"),this.displaySize=0,this.realSize=0,this.offset=0,this.element.className="scrollbar-thumb scrollbar-thumb-"+t}return t.prototype.attachTo=function(t){t.appendChild(this.element)},t.prototype.update=function(t,n,e){this.realSize=Math.min(n/e,1)*n,this.displaySize=Math.max(this.realSize,this._minSize),this.offset=t/e*(n+(this.realSize-this.displaySize)),B(this.element,this._getStyle())},t.prototype._getStyle=function(){switch(this._direction){case G.X:return{width:this.displaySize+"px","-transform":"translate3d("+this.offset+"px, 0, 0)"};case G.Y:return{height:this.displaySize+"px","-transform":"translate3d(0, "+this.offset+"px, 0)"};default:return null}},t}(),Y=function(){function t(t,n){void 0===n&&(n=0),this.element=document.createElement("div"),this._isShown=!1,this.element.className="scrollbar-track scrollbar-track-"+t,this.thumb=new U(t,n),this.thumb.attachTo(this.element)}return t.prototype.attachTo=function(t){t.appendChild(this.element)},t.prototype.show=function(){this._isShown||(this._isShown=!0,this.element.classList.add("show"))},t.prototype.hide=function(){this._isShown&&(this._isShown=!1,this.element.classList.remove("show"))},t.prototype.update=function(t,n,e){B(this.element,{display:e<=n?"none":"block"}),this.thumb.update(t,n,e)},t}(),q=function(){function t(t){this._scrollbar=t;var n=t.options.thumbMinSize;this.xAxis=new Y(G.X,n),this.yAxis=new Y(G.Y,n),this.xAxis.attachTo(t.containerEl),this.yAxis.attachTo(t.containerEl),t.options.alwaysShowTracks&&(this.xAxis.show(),this.yAxis.show())}return t.prototype.update=function(){var t=this._scrollbar,n=t.size,e=t.offset;this.xAxis.update(e.x,n.container.width,n.content.width),this.yAxis.update(e.y,n.container.height,n.content.height)},t.prototype.autoHideOnIdle=function(){this._scrollbar.options.alwaysShowTracks||(this.xAxis.hide(),this.yAxis.hide())},u([D(300)],t.prototype,"autoHideOnIdle",null),t}(),K=new WeakMap;function $(t){return Math.pow(t-1,3)+1}var J,Q,Z,tt=function(){function t(t,n){var e=this.constructor;this.scrollbar=t,this.name=e.pluginName,this.options=i(i({},e.defaultOptions),n)}return t.prototype.onInit=function(){},t.prototype.onDestroy=function(){},t.prototype.onUpdate=function(){},t.prototype.onRender=function(t){},t.prototype.transformDelta=function(t,n){return i({},t)},t.pluginName="",t.defaultOptions={},t}(),nt={order:new Set,constructors:{}};function et(t){var n=R(t),e=t.containerEl;n(e,"keydown",(function(n){var r=document.activeElement;if((r===e||e.contains(r))&&!function(t){return!("INPUT"!==t.tagName&&"SELECT"!==t.tagName&&"TEXTAREA"!==t.tagName&&!t.isContentEditable)&&!t.disabled}(r)){var o=function(t,n){var e=t.size,r=t.limit,o=t.offset;switch(n){case J.TAB:return function(t){requestAnimationFrame((function(){t.scrollIntoView(document.activeElement,{offsetTop:t.size.container.height/2,onlyScrollIfNeeded:!0})}))}(t);case J.SPACE:return[0,200];case J.PAGE_UP:return[0,40-e.container.height];case J.PAGE_DOWN:return[0,e.container.height-40];case J.END:return[0,r.y-o.y];case J.HOME:return[0,-o.y];case J.LEFT:return[-40,0];case J.UP:return[0,-40];case J.RIGHT:return[40,0];case J.DOWN:return[0,40];default:return null}}(t,n.keyCode||n.which);if(o){var i=o[0],u=o[1];t.addTransformableMomentum(i,u,n,(function(e){e?n.preventDefault():(t.containerEl.blur(),t.parent&&t.parent.containerEl.focus())}))}}}))}function rt(t){var n,e,r,o,i,u=R(t),c=t.containerEl,s=t.track,a=s.xAxis,f=s.yAxis;function l(n,e){var r=t.size;return n===Q.X?e/(r.container.width+(a.thumb.realSize-a.thumb.displaySize))*r.content.width:n===Q.Y?e/(r.container.height+(f.thumb.realSize-f.thumb.displaySize))*r.content.height:0}function p(t){return I(t,[a.element,a.thumb.element])?Q.X:I(t,[f.element,f.thumb.element])?Q.Y:void 0}u(c,"click",(function(n){if(!e&&I(n.target,[a.element,f.element])){var r=n.target,o=p(r),i=r.getBoundingClientRect(),u=F(n),c=t.offset,s=t.limit;if(o===Q.X){var h=u.x-i.left-a.thumb.displaySize/2;t.setMomentum(O(l(o,h)-c.x,-c.x,s.x-c.x),0)}o===Q.Y&&(h=u.y-i.top-f.thumb.displaySize/2,t.setMomentum(0,O(l(o,h)-c.y,-c.y,s.y-c.y)))}})),u(c,"mousedown",(function(e){if(I(e.target,[a.thumb.element,f.thumb.element])){n=!0;var u=e.target,s=F(e),l=u.getBoundingClientRect();o=p(u),r={x:s.x-l.left,y:s.y-l.top},i=c.getBoundingClientRect(),B(t.containerEl,{"-user-select":"none"})}})),u(window,"mousemove",(function(u){if(n){e=!0;var c=t.offset,s=F(u);if(o===Q.X){var a=s.x-r.x-i.left;t.setPosition(l(o,a),c.y)}o===Q.Y&&(a=s.y-r.y-i.top,t.setPosition(c.x,l(o,a)))}})),u(window,"mouseup blur",(function(){n=e=!1,B(t.containerEl,{"-user-select":""})}))}function ot(t){R(t)(window,"resize",k(t.update.bind(t),300))}function it(t){var n,e=R(t),r=t.containerEl,o=t.contentEl,i=t.offset,u=t.limit,c=!1;e(window,"mousemove",(function(e){c&&(cancelAnimationFrame(n),function e(r){var o=r.x,c=r.y;(o||c)&&(t.setMomentum(O(i.x+o,0,u.x)-i.x,O(i.y+c,0,u.y)-i.y),n=requestAnimationFrame((function(){e({x:o,y:c})})))}(function(t,n){var e=t.bounding,r=e.top,o=e.right,i=e.bottom,u=e.left,c=F(n),s=c.x,a=c.y,f={x:0,y:0};return 0===s&&0===a||(s>o-20?f.x=s-o+20:s<u+20&&(f.x=s-u-20),a>i-20?f.y=a-i+20:a<r+20&&(f.y=a-r-20),f.x*=2,f.y*=2),f}(t,e)))})),e(o,"selectstart",(function(t){t.stopPropagation(),cancelAnimationFrame(n),c=!0})),e(window,"mouseup blur",(function(){cancelAnimationFrame(n),c=!1})),e(r,"scroll",(function(t){t.preventDefault(),r.scrollTop=r.scrollLeft=0}))}function ut(t){var n,e=/Android/.test(navigator.userAgent)?3:2,r=t.options.delegateTo||t.containerEl,o=new V,i=R(t),u=0;i(r,"touchstart",(function(e){o.track(e),t.setMomentum(0,0),0===u&&(n=t.options.damping,t.options.damping=Math.max(n,.5)),u++})),i(r,"touchmove",(function(n){if(!Z||Z===t){o.update(n);var e=o.getDelta(),r=e.x,i=e.y;t.addTransformableMomentum(r,i,n,(function(e){e&&n.cancelable&&(n.preventDefault(),Z=t)}))}})),i(r,"touchcancel touchend",(function(r){var i=o.getVelocity(),c={x:0,y:0};Object.keys(i).forEach((function(t){var r=i[t]/n;c[t]=Math.abs(r)<50?0:r*e})),t.addTransformableMomentum(c.x,c.y,r),0==--u&&(t.options.damping=n),o.release(r),Z=null}))}function ct(t){R(t)(t.options.delegateTo||t.containerEl,"onwheel"in window||document.implementation.hasFeature("Events.wheel","3.0")?"wheel":"mousewheel",(function(n){var e=function(t){if("deltaX"in t){var n=ft(t.deltaMode);return{x:t.deltaX/st.STANDARD*n,y:t.deltaY/st.STANDARD*n}}return"wheelDeltaX"in t?{x:t.wheelDeltaX/st.OTHERS,y:t.wheelDeltaY/st.OTHERS}:{x:0,y:t.wheelDelta/st.OTHERS}}(n),r=e.x,o=e.y;t.addTransformableMomentum(r,o,n,(function(t){t&&n.preventDefault()}))}))}!function(t){t[t.TAB=9]="TAB",t[t.SPACE=32]="SPACE",t[t.PAGE_UP=33]="PAGE_UP",t[t.PAGE_DOWN=34]="PAGE_DOWN",t[t.END=35]="END",t[t.HOME=36]="HOME",t[t.LEFT=37]="LEFT",t[t.UP=38]="UP",t[t.RIGHT=39]="RIGHT",t[t.DOWN=40]="DOWN"}(J||(J={})),function(t){t[t.X=0]="X",t[t.Y=1]="Y"}(Q||(Q={}));var st={STANDARD:1,OTHERS:-3},at=[1,28,500],ft=function(t){return at[t]||at[0]},lt=new Map,pt=function(){function t(t,n){var e=this;this.offset={x:0,y:0},this.limit={x:1/0,y:1/0},this.bounding={top:0,right:0,bottom:0,left:0},this._plugins=[],this._momentum={x:0,y:0},this._listeners=new Set,this.containerEl=t;var r=this.contentEl=document.createElement("div");this.options=new N(n),t.setAttribute("data-scrollbar","true"),t.setAttribute("tabindex","-1"),B(t,{overflow:"hidden",outline:"none"}),window.navigator.msPointerEnabled&&(t.style.msTouchAction="none"),r.className="scroll-content",Array.from(t.childNodes).forEach((function(t){r.appendChild(t)})),t.appendChild(r),this.track=new q(this),this.size=this.getSize(),this._plugins=function(t,n){return Array.from(nt.order).filter((function(t){return!1!==n[t]})).map((function(e){var r=new(0,nt.constructors[e])(t,n[e]);return n[e]=r.options,r}))}(this,this.options.plugins);var o=t.scrollLeft,i=t.scrollTop;t.scrollLeft=t.scrollTop=0,this.setPosition(o,i,{withoutCallbacks:!0});var u=window,c=u.MutationObserver||u.WebKitMutationObserver||u.MozMutationObserver;"function"==typeof c&&(this._observer=new c((function(){e.update()})),this._observer.observe(r,{subtree:!0,childList:!0})),lt.set(t,this),requestAnimationFrame((function(){e._init()}))}return Object.defineProperty(t.prototype,"parent",{get:function(){for(var t=this.containerEl.parentElement;t;){var n=lt.get(t);if(n)return n;t=t.parentElement}return null},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"scrollTop",{get:function(){return this.offset.y},set:function(t){this.setPosition(this.scrollLeft,t)},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"scrollLeft",{get:function(){return this.offset.x},set:function(t){this.setPosition(t,this.scrollTop)},enumerable:!0,configurable:!0}),t.prototype.getSize=function(){return function(t){var n=t.containerEl,e=t.contentEl;return{container:{width:n.clientWidth,height:n.clientHeight},content:{width:e.offsetWidth-e.clientWidth+e.scrollWidth,height:e.offsetHeight-e.clientHeight+e.scrollHeight}}}(this)},t.prototype.update=function(){!function(t){var n=t.getSize(),e={x:Math.max(n.content.width-n.container.width,0),y:Math.max(n.content.height-n.container.height,0)},r=t.containerEl.getBoundingClientRect(),o={top:Math.max(r.top,0),right:Math.min(r.right,window.innerWidth),bottom:Math.min(r.bottom,window.innerHeight),left:Math.max(r.left,0)};t.size=n,t.limit=e,t.bounding=o,t.track.update(),t.setPosition()}(this),this._plugins.forEach((function(t){t.onUpdate()}))},t.prototype.isVisible=function(t){return function(t,n){var e=t.bounding,r=n.getBoundingClientRect(),o=Math.max(e.top,r.top),i=Math.max(e.left,r.left),u=Math.min(e.right,r.right);return o<Math.min(e.bottom,r.bottom)&&i<u}(this,t)},t.prototype.setPosition=function(t,n,e){var r=this;void 0===t&&(t=this.offset.x),void 0===n&&(n=this.offset.y),void 0===e&&(e={});var o=function(t,n,e){var r=t.options,o=t.offset,u=t.limit,c=t.track,s=t.contentEl;return r.renderByPixels&&(n=Math.round(n),e=Math.round(e)),n=O(n,0,u.x),e=O(e,0,u.y),n!==o.x&&c.xAxis.show(),e!==o.y&&c.yAxis.show(),r.alwaysShowTracks||c.autoHideOnIdle(),n===o.x&&e===o.y?null:(o.x=n,o.y=e,B(s,{"-transform":"translate3d("+-n+"px, "+-e+"px, 0)"}),c.update(),{offset:i({},o),limit:i({},u)})}(this,t,n);o&&!e.withoutCallbacks&&this._listeners.forEach((function(t){t.call(r,o)}))},t.prototype.scrollTo=function(t,n,e,r){void 0===t&&(t=this.offset.x),void 0===n&&(n=this.offset.y),void 0===e&&(e=0),void 0===r&&(r={}),function(t,n,e,r,o){void 0===r&&(r=0);var i=void 0===o?{}:o,u=i.easing,c=void 0===u?$:u,s=i.callback,a=t.options,f=t.offset,l=t.limit;a.renderByPixels&&(n=Math.round(n),e=Math.round(e));var p=f.x,h=f.y,d=O(n,0,l.x)-p,v=O(e,0,l.y)-h,y=Date.now();cancelAnimationFrame(K.get(t)),function n(){var e=Date.now()-y,o=r?c(Math.min(e/r,1)):1;if(t.setPosition(p+d*o,h+v*o),e>=r)"function"==typeof s&&s.call(t);else{var i=requestAnimationFrame(n);K.set(t,i)}}()}(this,t,n,e,r)},t.prototype.scrollIntoView=function(t,n){void 0===n&&(n={}),function(t,n,e){var r=void 0===e?{}:e,o=r.alignToTop,i=void 0===o||o,u=r.onlyScrollIfNeeded,c=void 0!==u&&u,s=r.offsetTop,a=void 0===s?0:s,f=r.offsetLeft,l=void 0===f?0:f,p=r.offsetBottom,h=void 0===p?0:p,d=t.containerEl,v=t.bounding,y=t.offset,m=t.limit;if(n&&d.contains(n)){var g=n.getBoundingClientRect();if(!c||!t.isVisible(n)){var b=i?g.top-v.top-a:g.bottom-v.bottom+h;t.setMomentum(g.left-v.left-l,O(b,-y.y,m.y-y.y))}}}(this,t,n)},t.prototype.addListener=function(t){if("function"!=typeof t)throw new TypeError("[smooth-scrollbar] scrolling listener should be a function");this._listeners.add(t)},t.prototype.removeListener=function(t){this._listeners.delete(t)},t.prototype.addTransformableMomentum=function(t,n,e,r){this._updateDebounced();var o=this._plugins.reduce((function(t,n){return n.transformDelta(t,e)||t}),{x:t,y:n}),i=!this._shouldPropagateMomentum(o.x,o.y);i&&this.addMomentum(o.x,o.y),r&&r.call(this,i)},t.prototype.addMomentum=function(t,n){this.setMomentum(this._momentum.x+t,this._momentum.y+n)},t.prototype.setMomentum=function(t,n){0===this.limit.x&&(t=0),0===this.limit.y&&(n=0),this.options.renderByPixels&&(t=Math.round(t),n=Math.round(n)),this._momentum.x=t,this._momentum.y=n},t.prototype.updatePluginOptions=function(t,n){this._plugins.forEach((function(e){e.name===t&&Object.assign(e.options,n)}))},t.prototype.destroy=function(){var t=this.containerEl,n=this.contentEl;!function(t){var n=z.get(t);n&&(n.forEach((function(t){var n=t.elem,e=t.eventName,r=t.handler;n.removeEventListener(e,r,C())})),z.delete(t))}(this),this._listeners.clear(),this.setMomentum(0,0),cancelAnimationFrame(this._renderID),this._observer&&this._observer.disconnect(),lt.delete(this.containerEl);for(var e=Array.from(n.childNodes);t.firstChild;)t.removeChild(t.firstChild);e.forEach((function(n){t.appendChild(n)})),B(t,{overflow:""}),t.scrollTop=this.scrollTop,t.scrollLeft=this.scrollLeft,this._plugins.forEach((function(t){t.onDestroy()})),this._plugins.length=0},t.prototype._init=function(){var t=this;this.update(),Object.keys(r).forEach((function(n){r[n](t)})),this._plugins.forEach((function(t){t.onInit()})),this._render()},t.prototype._updateDebounced=function(){this.update()},t.prototype._shouldPropagateMomentum=function(t,n){void 0===t&&(t=0),void 0===n&&(n=0);var e=this.options,r=this.offset,o=this.limit;if(!e.continuousScrolling)return!1;0===o.x&&0===o.y&&this._updateDebounced();var i=O(t+r.x,0,o.x),u=O(n+r.y,0,o.y),c=!0;return(c=(c=c&&i===r.x)&&u===r.y)&&(r.x===o.x||0===r.x||r.y===o.y||0===r.y)},t.prototype._render=function(){var t=this._momentum;if(t.x||t.y){var n=this._nextTick("x"),e=this._nextTick("y");t.x=n.momentum,t.y=e.momentum,this.setPosition(n.position,e.position)}var r=i({},this._momentum);this._plugins.forEach((function(t){t.onRender(r)})),this._renderID=requestAnimationFrame(this._render.bind(this))},t.prototype._nextTick=function(t){var n=this.options,e=this.offset,r=this._momentum,o=e[t],i=r[t];if(Math.abs(i)<=.1)return{momentum:0,position:o+i};var u=i*(1-n.damping);return n.renderByPixels&&(u|=0),{momentum:u,position:o+i-u}},u([D(100,{leading:!0})],t.prototype,"_updateDebounced",null),t}(),ht="smooth-scrollbar-style",dt=!1;function vt(){if(!dt&&"undefined"!=typeof window){var t=document.createElement("style");t.id=ht,t.textContent="\n[data-scrollbar] {\n  display: block;\n  position: relative;\n}\n\n.scroll-content {\n  -webkit-transform: translate3d(0, 0, 0);\n          transform: translate3d(0, 0, 0);\n}\n\n.scrollbar-track {\n  position: absolute;\n  opacity: 0;\n  z-index: 1;\n  background: rgba(222, 222, 222, .75);\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  -webkit-transition: opacity 0.5s 0.5s ease-out;\n          transition: opacity 0.5s 0.5s ease-out;\n}\n.scrollbar-track.show,\n.scrollbar-track:hover {\n  opacity: 1;\n  -webkit-transition-delay: 0s;\n          transition-delay: 0s;\n}\n\n.scrollbar-track-x {\n  bottom: 0;\n  left: 0;\n  width: 100%;\n  height: 8px;\n}\n.scrollbar-track-y {\n  top: 0;\n  right: 0;\n  width: 8px;\n  height: 100%;\n}\n.scrollbar-thumb {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 8px;\n  height: 8px;\n  background: rgba(0, 0, 0, .5);\n  border-radius: 4px;\n}\n",document.head&&document.head.appendChild(t),dt=!0}}e.d(n,"ScrollbarPlugin",(function(){return tt}));
/*!
 * cast `I.Scrollbar` to `Scrollbar` to avoid error
 *
 * `I.Scrollbar` is not assignable to `Scrollbar`:
 *     "privateProp" is missing in `I.Scrollbar`
 *
 * @see https://github.com/Microsoft/TypeScript/issues/2672
 */
var yt=function(t){function n(){return null!==t&&t.apply(this,arguments)||this}return function(t,n){function e(){this.constructor=t}o(t,n),t.prototype=null===n?Object.create(n):(e.prototype=n.prototype,new e)}(n,t),n.init=function(t,n){if(!t||1!==t.nodeType)throw new TypeError("expect element to be DOM Element, but got "+t);return vt(),lt.has(t)?lt.get(t):new pt(t,n)},n.initAll=function(t){return Array.from(document.querySelectorAll("[data-scrollbar]"),(function(e){return n.init(e,t)}))},n.has=function(t){return lt.has(t)},n.get=function(t){return lt.get(t)},n.getAll=function(){return Array.from(lt.values())},n.destroy=function(t){var n=lt.get(t);n&&n.destroy()},n.destroyAll=function(){lt.forEach((function(t){t.destroy()}))},n.use=function(){for(var t=[],n=0;n<arguments.length;n++)t[n]=arguments[n];return function(){for(var t=[],n=0;n<arguments.length;n++)t[n]=arguments[n];t.forEach((function(t){var n=t.pluginName;if(!n)throw new TypeError("plugin name is required");nt.order.add(n),nt.constructors[n]=t}))}.apply(void 0,t)},n.attachStyle=function(){return vt()},n.detachStyle=function(){return function(){if(dt&&"undefined"!=typeof window){var t=document.getElementById(ht);t&&t.parentNode&&(t.parentNode.removeChild(t),dt=!1)}}()},n.version="8.5.3",n.ScrollbarPlugin=tt,n}(pt);n.default=yt}]).default}));

! function(t, e) {
  "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : (t = "undefined" != typeof globalThis ? globalThis : t || self).jsVectorMap = e()
}(this, (function() {
  "use strict";
  Element.prototype.matches || (Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector || function(t) {
    for (var e = (this.document || this.ownerDocument).querySelectorAll(t), i = e.length; --i >= 0 && e.item(i) !== this;);
    return i > -1
  }), Object.assign || Object.defineProperty(Object, "assign", {
    enumerable: !1,
    configurable: !0,
    writable: !0,
    value: function(t) {
      if (null == t) throw new TypeError("Cannot convert first argument to object");
      for (var e = Object(t), i = 1; i < arguments.length; i++) {
        var s = arguments[i];
        if (null != s) {
          s = Object(s);
          for (var a = Object.keys(Object(s)), r = 0, n = a.length; r < n; r++) {
            var o = a[r],
              h = Object.getOwnPropertyDescriptor(s, o);
            void 0 !== h && h.enumerable && (e[o] = s[o])
          }
        }
      }
      return e
    }
  });
  var t = {},
    e = 1,
    i = function(i, s, a, r) {
      void 0 === r && (r = {}), t["jvm:" + s + "::" + e++] = {
        selector: i,
        handler: a
      }, i.addEventListener(s, a, r)
    },
    s = function(e, i, s) {
      var a = i.split(":")[1];
      e.removeEventListener(a, s), delete t[i]
    },
    a = function() {
      return t
    },
    r = function() {
      function t(t) {
        return t instanceof Element ? (this.selector = t, this) : (this.selector = document.querySelector(t), this)
      }
      var e = t.prototype;
      return e.on = function(t, e, s) {
        return void 0 === s && (s = {}), i(this.selector, t, e, s), this
      }, e.delegate = function(t, e, i) {
        for (var s in e = e.split(" ")) this.on(e[s], (function(e) {
          var s = e.target;
          s.matches(t) && i.call(s, e)
        }))
      }, e.css = function(t) {
        for (var e in t) this.selector.style[e] = t[e];
        return this
      }, e.text = function(t) {
        return t ? (this.selector.textContent = t, this) : this.selector.textContent
      }, e.attr = function(t, e) {
        return t && e ? (this.selector.setAttribute(t, e), this) : this.selector.getAttribute(t)
      }, e.addClass = function(t) {
        return this.selector.classList ? (this.selector.classList.add(t), this) : (-1 == this.selector.className.split(" ").indexOf(t) && (this.selector.className += " " + t), this)
      }, e.append = function(t) {
        return this.selector.appendChild(t), this
      }, e.show = function() {
        this.css({
          display: "block"
        })
      }, e.hide = function() {
        this.css({
          display: "none"
        })
      }, e.height = function() {
        return this.selector.offsetHeight
      }, e.width = function() {
        return this.selector.offsetWidth
      }, t
    }(),
    n = function(t) {
      return function(t) {
        return !!t && "object" == typeof t
      }(t) && ! function(t) {
        var e = Object.prototype.toString.call(t);
        return "[object RegExp]" === e || "[object Date]" === e || function(t) {
          return t.$$typeof === o
        }(t)
      }(t)
    };
  var o = "function" == typeof Symbol && Symbol.for ? Symbol.for("react.element") : 60103;

  function h(t, e) {
    return !1 !== e.clone && e.isMergeableObject(t) ? d((i = t, Array.isArray(i) ? [] : {}), t, e) : t;
    var i
  }

  function l(t, e, i) {
    return t.concat(e).map((function(t) {
      return h(t, i)
    }))
  }

  function c(t) {
    return Object.keys(t).concat(function(t) {
      return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(t).filter((function(e) {
        return t.propertyIsEnumerable(e)
      })) : []
    }(t))
  }

  function u(t, e) {
    try {
      return e in t
    } catch (t) {
      return !1
    }
  }

  function p(t, e, i) {
    var s = {};
    return i.isMergeableObject(t) && c(t).forEach((function(e) {
      s[e] = h(t[e], i)
    })), c(e).forEach((function(a) {
      (function(t, e) {
        return u(t, e) && !(Object.hasOwnProperty.call(t, e) && Object.propertyIsEnumerable.call(t, e))
      })(t, a) || (u(t, a) && i.isMergeableObject(e[a]) ? s[a] = function(t, e) {
        if (!e.customMerge) return d;
        var i = e.customMerge(t);
        return "function" == typeof i ? i : d
      }(a, i)(t[a], e[a], i) : s[a] = h(e[a], i))
    })), s
  }
  var d = function(t, e, i) {
      (i = i || {}).arrayMerge = i.arrayMerge || l, i.isMergeableObject = i.isMergeableObject || n, i.cloneUnlessOtherwiseSpecified = h;
      var s = Array.isArray(e);
      return s === Array.isArray(t) ? s ? i.arrayMerge(t, e, i) : p(t, e, i) : h(e, i)
    },
    f = {
      isImageUrl: function(t) {
        return /\.(jpg|gif|png)$/.test(t)
      },
      createElement: function(t, e, i, s) {
        void 0 === s && (s = !1);
        var a = document.createElement(t);
        return i && (a[s ? "innerHTML" : "textContent"] = i), e && (a.className = e), a
      },
      removeElement: function(t) {
        t.parentNode.removeChild(t)
      },
      $: function(t) {
        return new r(t)
      },
      hyphenate: function(t) {
        return t.replace(/[\w]([A-Z])/g, (function(t) {
          return t[0] + "-" + t[1]
        })).toLowerCase()
      },
      isFunc: function(t) {
        return "function" == typeof t
      },
      isObj: function(t) {
        return "object" == typeof t
      },
      isStr: function(t) {
        return "string" == typeof t
      },
      isArr: function(t) {
        return Array.isArray(t)
      },
      merge: function(t, e) {
        return Object.assign(t, e)
      },
      mergeDeeply: function(t, e) {
        return d(t, e)
      },
      keys: function(t) {
        return Object.keys(t)
      }
    };

  function m(t, e) {
    t.prototype = Object.create(e.prototype), t.prototype.constructor = t, g(t, e)
  }

  function g(t, e) {
    return (g = Object.setPrototypeOf || function(t, e) {
      return t.__proto__ = e, t
    })(t, e)
  }
  var v = function() {
      function t(t, e) {
        this._name = t, this.node = this.createElement(t), e && this.set(e)
      }
      var e = t.prototype;
      return e.createElement = function(t) {
        return document.createElementNS("http://www.w3.org/2000/svg", t)
      }, e.addClass = function(t) {
        this.node.setAttribute("class", t)
      }, e.getBBox = function() {
        return this.node.getBBox()
      }, e.set = function(t, e) {
        if (f.isObj(t))
          for (var i in t) this.applyAttr(i, t[i]);
        else this.applyAttr(t, e)
      }, e.get = function(t) {
        return this.style.initial[t]
      }, e.applyAttr = function(t, e) {
        this.node.setAttribute(f.hyphenate(t), e)
      }, e.remove = function() {
        this.node.parentNode.removeChild(this.node)
      }, t
    }(),
    y = function(t) {
      function e(e, i, s) {
        var a;
        return void 0 === s && (s = {}), (a = t.call(this, e, i) || this).isHovered = !1, a.isSelected = !1, a.style = s, a.style.current = {}, a.updateStyle(), a
      }
      m(e, t);
      var i = e.prototype;
      return i.setStyle = function(t, e) {
        var i;
        f.isObj(t) ? f.merge(this.style.current, t) : f.merge(this.style.current, ((i = {})[t] = e, i));
        this.updateStyle()
      }, i.updateStyle = function() {
        var t = {};
        f.merge(t, this.style.initial), f.merge(t, this.style.current), this.isHovered && f.merge(t, this.style.hover), this.isSelected && (f.merge(t, this.style.selected), this.isHovered && f.merge(t, this.style.selectedHover)), this.set(t)
      }, e
    }(v),
    b = function(t) {
      function e(e, i) {
        return t.call(this, "text", e, i) || this
      }
      return m(e, t), e.prototype.applyAttr = function(e, i) {
        "text" === e ? this.node.textContent = i : t.prototype.applyAttr.call(this, e, i)
      }, e
    }(y),
    S = function(t) {
      function e(e, i) {
        return t.call(this, "image", e, i) || this
      }
      return m(e, t), e.prototype.applyAttr = function(e, i) {
        var s;
        "image" === e ? (f.isObj(i) ? (s = i.url, this.offset = i.offset || [0, 0]) : (s = i, this.offset = [0, 0]), this.node.setAttributeNS("http://www.w3.org/1999/xlink", "href", s), this.width = 23, this.height = 23, this.applyAttr("width", this.width), this.applyAttr("height", this.height), this.applyAttr("x", this.cx - this.width / 2 + this.offset[0]), this.applyAttr("y", this.cy - this.height / 2 + this.offset[1])) : "cx" == e ? (this.cx = i, this.width && this.applyAttr("x", i - this.width / 2 + this.offset[0])) : "cy" == e ? (this.cy = i, this.height && this.applyAttr("y", i - this.height / 2 + this.offset[1])) : t.prototype.applyAttr.apply(this, arguments)
      }, e
    }(y),
    w = function(t) {
      function e(e) {
        var i;
        return (i = t.call(this, "svg") || this)._container = e, i._defsElement = new v("defs"), i._rootElement = new v("g", {
          id: "jvm-regions-group"
        }), i.node.appendChild(i._defsElement.node), i.node.appendChild(i._rootElement.node), i._container.append(i.node), i
      }
      m(e, t);
      var i = e.prototype;
      return i.setSize = function(t, e) {
        this.node.setAttribute("width", t), this.node.setAttribute("height", e)
      }, i.applyTransformParams = function(t, e, i) {
        this._rootElement.node.setAttribute("transform", "scale(" + t + ") translate(" + e + ", " + i + ")")
      }, i.createPath = function(t, e) {
        var i = new y("path", t, e);
        return i.node.setAttribute("fill-rule", "evenodd"), this.add(i)
      }, i.createCircle = function(t, e, i) {
        var s = new y("circle", t, e);
        return this.add(s, i)
      }, i.createLine = function(t, e, i) {
        var s = new y("line", t, e);
        return this.add(s, i)
      }, i.createText = function(t, e, i) {
        var s = new b(t, e);
        return this.add(s, i)
      }, i.createImage = function(t, e, i) {
        var s = new S(t, e);
        return this.add(s, i)
      }, i.createGroup = function(t) {
        var e = new v("g");
        return this.node.appendChild(e.node), t && (e.node.id = t), e.canvas = this, e
      }, i.add = function(t, e) {
        return (e = e || this._rootElement).node.appendChild(t.node), t
      }, e
    }(v);

  function k(t, e, i) {
    var s = f.$(e),
      a = -1 === s.attr("class").indexOf("jvm-region") ? "marker" : "region",
      r = "region" === a ? s.attr("data-code") : s.attr("data-index"),
      n = a + ":select";
    return i && (n = a + ".tooltip:show"), {
      event: n,
      type: a,
      code: r,
      element: "region" === a ? t.regions[r].element : t.markers[r].element,
      tooltipText: "region" === a ? t.mapData.paths[r].name || "" : t.markers[r].config.name || ""
    }
  }
  var x = function() {
      function t() {}
      var e = t.prototype;
      return e.getLabelText = function(t, e) {
        if (e) {
          if (f.isFunc(e.render)) {
            var i = [];
            return this.config.marker && i.push(this.config.marker), i.push(t), e.render.apply(this, i)
          }
          return t
        }
      }, e.getLabelOffsets = function(t, e) {
        return f.isFunc(e.offsets) ? e.offsets(t) : f.isArr(e.offsets) ? e.offsets[t] : [0, 0]
      }, e.setStyle = function(t, e) {
        this.shape.setStyle(t, e)
      }, e.remove = function() {
        this.shape.remove(), this.label && this.label.remove()
      }, e.hover = function(t) {
        this._setStatus("isHovered", t)
      }, e.select = function(t) {
        this._setStatus("isSelected", t)
      }, e._setStatus = function(t, e) {
        this.shape[t] = e, this.shape.updateStyle(), this[t] = e, this.label && (this.label[t] = e, this.label.updateStyle())
      }, t
    }(),
    M = function(t) {
      function e(e) {
        var i, s = e.map,
          a = e.code,
          r = e.path,
          n = e.style,
          o = e.label,
          h = e.labelStyle,
          l = e.labelsGroup;
        (i = t.call(this) || this).config = arguments[0], i.canvas = s.canvas, i.map = s, i.shape = i.canvas.createPath({
          d: r,
          dataCode: a
        }, n), i.shape.addClass("jvm-region jvm-element");
        var c = i.shape.getBBox(),
          u = i.getLabelText(a, o);
        if (o && u) {
          var p = i.getLabelOffsets(a);
          i.labelX = c.x + c.width / 2 + p[0], i.labelY = c.y + c.height / 2 + p[1], i.label = i.canvas.createText({
            text: u,
            textAnchor: "middle",
            alignmentBaseline: "central",
            dataCode: a,
            x: i.labelX,
            y: i.labelY
          }, h, l), i.label.addClass("jvm-region jvm-element")
        }
        return i
      }
      return m(e, t), e.prototype.updateLabelPosition = function() {
        this.label && this.label.set({
          x: this.labelX * this.map.scale + this.map.transX * this.map.scale,
          y: this.labelY * this.map.scale + this.map.transY * this.map.scale
        })
      }, e
    }(x);
  var _ = function(t) {
    function e(e) {
      var i, s = e.index,
        a = e.map,
        r = e.style,
        n = e.x1,
        o = e.y1,
        h = e.x2,
        l = e.y2,
        c = e.group;
      return (i = t.call(this) || this).shape = a.canvas.createLine({
        x1: n,
        y1: o,
        x2: h,
        y2: l,
        dataIndex: s
      }, r, c), i.shape.addClass("jvm-line"), i
    }
    return m(e, t), e
  }(x);

  function j(t, e) {
    return t.toLowerCase() + ":to:" + e.toLowerCase()
  }
  var E = function(t) {
    function e(e) {
      var i, s = e.index,
        a = e.style,
        r = e.label,
        n = e.cx,
        o = e.cy,
        h = e.map,
        l = e.group;
      return (i = t.call(this) || this)._map = h, i._isImage = !!a.initial.image, i.config = arguments[0], i.shape = h.canvas[i._isImage ? "createImage" : "createCircle"]({
        dataIndex: s,
        cx: n,
        cy: o
      }, i._getStyle(), l), i.shape.addClass("jvm-marker jvm-element"), i._isImage && i.updateLabelPosition(), r && i._createLabel(i.config), i
    }
    m(e, t);
    var i = e.prototype;
    return i.updateLabelPosition = function() {
      this.label && this.label.set({
        x: this._labelX * this._map.scale + this._offsets[0] + this._map.transX * this._map.scale + 5 + (this._isImage ? (this.shape.width || 0) / 2 : this.shape.node.r.baseVal.value),
        y: this._labelY * this._map.scale + this._map.transY * this._map.scale + this._offsets[1]
      })
    }, i._createLabel = function(t) {
      var e = t.index,
        i = t.map,
        s = t.label,
        a = t.labelsGroup,
        r = t.cx,
        n = t.cy,
        o = t.marker,
        h = t.isRecentlyCreated,
        l = this.getLabelText(e, s);
      this._labelX = r / i.scale - i.transX, this._labelY = n / i.scale - i.transY, this._offsets = h && o.offsets ? o.offsets : this.getLabelOffsets(e, s), this.label = i.canvas.createText({
        text: l,
        dataIndex: e,
        x: this._labelX,
        y: this._labelY,
        dy: "0.6ex"
      }, i.params.markerLabelStyle, a), this.label.addClass("jvm-marker jvm-element"), h && this.updateLabelPosition()
    }, i._getStyle = function() {
      var t = {};
      return this._isImage ? t.initial = {
        image: this.config.style.initial.image
      } : t = this.config.style, t
    }, e
  }(x);
  var O = function() {
      function t(t) {
        void 0 === t && (t = {}), this._options = t, this._map = this._options.map, this._series = this._options.series, this._body = f.createElement("div", "jvm-legend"), this._options.cssClass && this._body.setAttribute("class", this._options.cssClass), t.vertical ? this._map.legendVertical.appendChild(this._body) : this._map.legendHorizontal.appendChild(this._body), this.render()
      }
      return t.prototype.render = function() {
        var t, e, i, s = this._series.scale.getTicks(),
          a = f.createElement("div", "jvm-legend-inner");
        if (this._body.innderHTML = "", this._options.title) {
          var r = f.createElement("div", "jvm-legend-title", this._options.title);
          this._body.appendChild(r)
        }
        this._body.appendChild(a);
        for (var n = 0; n < s.length; n++) {
          switch (t = f.createElement("div", "jvm-legend-tick"), e = f.createElement("div", "jvm-legend-tick-sample"), this._series.config.attribute) {
            case "fill":
              f.isImageUrl(s[n].value) ? e.style.background = "url(" + s[n].value + ")" : e.style.background = s[n].value;
              break;
            case "stroke":
              e.style.background = s[n].value;
              break;
            case "image":
              e.style.background = "url(" + (f.isObj(s[n].value) ? s[n].value.url : s[n].value) + ") no-repeat center center", e.style.backgroundSize = "cover"
          }
          t.appendChild(e), i = s[n].label, this._options.labelRender && (i = this._options.labelRender(i));
          var o = f.createElement("div", "jvm-legend-tick-text", i);
          t.appendChild(o), a.appendChild(t)
        }
      }, t
    }(),
    C = function() {
      function t(t) {
        this._scale = t
      }
      var e = t.prototype;
      return e.getValue = function(t) {
        return this._scale[t]
      }, e.getTicks = function() {
        var t = [];
        for (var e in this._scale) t.push({
          label: e,
          value: this._scale[e]
        });
        return t
      }, t
    }(),
    X = function() {
      function t(t, e, i) {
        void 0 === t && (t = {}), this._map = i, this._elements = e, this._values = t.values || {}, this.config = t, this.config.attribute = t.attribute || "fill", t.attributes && this.setAttributes(t.attributes), f.isObj(t.scale) && (this.scale = new C(t.scale)), this.config.legend && (this.legend = new O(f.merge({
          map: this._map,
          series: this
        }, this.config.legend))), this.setValues(this._values)
      }
      var e = t.prototype;
      return e.setValues = function(t) {
        var e = {};
        for (var i in t) t[i] && (e[i] = this.scale.getValue(t[i]));
        this.setAttributes(e)
      }, e.setAttributes = function(t) {
        for (var e in t) this._elements[e] && this._elements[e].element.setStyle(this.config.attribute, t[e])
      }, e.clear = function() {
        var t, e = {};
        for (t in this._values) this._elements[t] && (e[t] = this._elements[t].element.shape.style.initial[this.config.attribute]);
        this.setAttributes(e), this._values = {}
      }, t
    }();
  var Y = {
    mill: function(t, e, i) {
      return {
        x: this.radius * (e - i) * this.radDeg,
        y: -this.radius * Math.log(Math.tan((45 + .4 * t) * this.radDeg)) / .8
      }
    },
    merc: function(t, e, i) {
      return {
        x: this.radius * (e - i) * this.radDeg,
        y: -this.radius * Math.log(Math.tan(Math.PI / 4 + t * Math.PI / 360))
      }
    },
    aea: function(t, e, i) {
      var s = i * this.radDeg,
        a = 29.5 * this.radDeg,
        r = 45.5 * this.radDeg,
        n = t * this.radDeg,
        o = e * this.radDeg,
        h = (Math.sin(a) + Math.sin(r)) / 2,
        l = Math.cos(a) * Math.cos(a) + 2 * h * Math.sin(a),
        c = h * (o - s),
        u = Math.sqrt(l - 2 * h * Math.sin(n)) / h,
        p = Math.sqrt(l - 2 * h * Math.sin(0)) / h;
      return {
        x: u * Math.sin(c) * this.radius,
        y: -(p - u * Math.cos(c)) * this.radius
      }
    },
    lcc: function(t, e, i) {
      var s = i * this.radDeg,
        a = e * this.radDeg,
        r = 33 * this.radDeg,
        n = 45 * this.radDeg,
        o = t * this.radDeg,
        h = Math.log(Math.cos(r) * (1 / Math.cos(n))) / Math.log(Math.tan(Math.PI / 4 + n / 2) * (1 / Math.tan(Math.PI / 4 + r / 2))),
        l = Math.cos(r) * Math.pow(Math.tan(Math.PI / 4 + r / 2), h) / h,
        c = l * Math.pow(1 / Math.tan(Math.PI / 4 + o / 2), h),
        u = l * Math.pow(1 / Math.tan(Math.PI / 4 + 0), h);
      return {
        x: c * Math.sin(h * (a - s)) * this.radius,
        y: -(u - c * Math.cos(h * (a - s))) * this.radius
      }
    }
  };
  Y.degRad = 180 / Math.PI, Y.radDeg = Math.PI / 180, Y.radius = 6381372;
  var L = function() {
    function t(t, e) {
      var i = t.scale,
        s = t.values;
      this._scale = i, this._values = s, this._fromColor = this.hexToRgb(i[0]), this._toColor = this.hexToRgb(i[1]), this._map = e, this.setMinMaxValues(s), this.visualize()
    }
    var e = t.prototype;
    return e.setMinMaxValues = function(t) {
      for (var e in this.min = Number.MAX_VALUE, this.max = 0, t)(e = parseFloat(t[e])) > this.max && (this.max = e), e < this.min && (this.min = e)
    }, e.visualize = function() {
      var t, e = {};
      for (var i in this._values) t = parseFloat(this._values[i]), isNaN(t) || (e[i] = this.getValue(t));
      this.setAttributes(e)
    }, e.setAttributes = function(t) {
      for (var e in t) this._map.regions[e] && this._map.regions[e].element.setStyle("fill", t[e])
    }, e.getValue = function(t) {
      for (var e, i = "#", s = 0; s < 3; s++) i += (1 === (e = Math.round(this._fromColor[s] + (this._toColor[s] - this._fromColor[s]) * ((t - this.min) / (this.max - this.min))).toString(16)).length ? "0" : "") + e;
      return i
    }, e.hexToRgb = function(t) {
      var e = 0,
        i = 0,
        s = 0;
      return 4 == t.length ? (e = "0x" + t[1] + t[1], i = "0x" + t[2] + t[2], s = "0x" + t[3] + t[3]) : 7 == t.length && (e = "0x" + t[1] + t[2], i = "0x" + t[3] + t[4], s = "0x" + t[5] + t[6]), [parseInt(e), parseInt(i), parseInt(s)]
    }, t
  }();
  var T = Object.freeze({
      __proto__: null,
      handleContainerEvents: function() {
        var t, e, i = this,
          s = !1,
          a = this;
        this.params.draggable && (this.container.on("mousemove", (function(i) {
          return s && (a.transX -= (t - i.pageX) / a.scale, a.transY -= (e - i.pageY) / a.scale, a.applyTransform(), t = i.pageX, e = i.pageY), !1
        })).on("mousedown", (function(i) {
          return s = !0, t = i.pageX, e = i.pageY, !1
        })), f.$("body").on("mouseup", (function() {
          s = !1
        }))), this.params.zoomOnScroll && this.container.on("wheel", (function(t) {
          var e = 0;
          e = (t.deltaY || -t.wheelDelta || t.detail) >> 10 || 1, e *= 75;
          var s = i.container.selector.getBoundingClientRect(),
            r = t.pageX - s.left - window.pageXOffset,
            n = t.pageY - s.top - window.pageYOffset,
            o = Math.pow(1 + a.params.zoomOnScrollSpeed / 1e3, -1.5 * e);
          a.tooltip && a.tooltip.hide(), a.setScale(a.scale * o, r, n)
        }), {
          passive: !0
        })
      },
      handleElementEvents: function() {
        var t = this;
        this.container.delegate(".jvm-element", "mouseover mouseout", (function(e) {
          var i = k(t, this, !0),
            s = t.params.showTooltip;
          "mouseover" === e.type ? e.defaultPrevented || (i.element.hover(!0), s && (t.tooltip.text(i.tooltipText), t.tooltip.show(), t.emit(i.event, [t.tooltip, i.code]))) : (i.element.hover(!1), s && t.tooltip.hide())
        })), this.container.delegate(".jvm-element", "mouseup", (function(e) {
          var i = k(t, this);
          if ("region" === i.type && t.params.regionsSelectable || "marker" === i.type && t.params.markersSelectable && !e.defaultPrevented) {
            var s = i.element;
            t.params[i.type + "sSelectableOne"] && t.clearSelected(i.type + "s"), i.element.isSelected ? s.select(!1) : s.select(!0), t.emit(i.event, [i.code, s.isSelected, t.getSelected(i.type + "s")])
          }
        }))
      },
      handleZoomButtons: function() {
        var t = this,
          e = this,
          s = f.createElement("div", "jvm-zoom-btn jvm-zoomin", "&#43;", !0),
          a = f.createElement("div", "jvm-zoom-btn jvm-zoomout", "&#x2212", !0);
        this.container.append(s).append(a), i(s, "click", (function() {
          t.setScale(e.scale * e.params.zoomStep, e.width / 2, e.height / 2, !1, e.params.zoomAnimate)
        })), i(a, "click", (function() {
          t.setScale(e.scale / e.params.zoomStep, e.width / 2, e.height / 2, !1, e.params.zoomAnimate)
        }))
      },
      bindContainerTouchEvents: function() {
        var t, e, i, s, a, r, n, o = this,
          h = function(h) {
            var l, c, u, p, d = h.touches;
            if ("touchstart" == h.type && (n = 0), 1 == d.length) 1 == n && (u = o.transX, p = o.transY, o.transX -= (i - d[0].pageX) / o.scale, o.transY -= (s - d[0].pageY) / o.scale, o.tooltip.hide(), o.applyTransform(), u == o.transX && p == o.transY || h.preventDefault()), i = d[0].pageX, s = d[0].pageY;
            else if (2 == d.length)
              if (2 == n) c = Math.sqrt(Math.pow(d[0].pageX - d[1].pageX, 2) + Math.pow(d[0].pageY - d[1].pageY, 2)) / e, o.setScale(t * c, a, r), o.tooltip.hide(), h.preventDefault();
              else {
                var f = o.container.selector.getBoundingClientRect();
                l = {
                  top: f.top + window.scrollY,
                  left: f.left + window.scrollX
                }, a = d[0].pageX > d[1].pageX ? d[1].pageX + (d[0].pageX - d[1].pageX) / 2 : d[0].pageX + (d[1].pageX - d[0].pageX) / 2, r = d[0].pageY > d[1].pageY ? d[1].pageY + (d[0].pageY - d[1].pageY) / 2 : d[0].pageY + (d[1].pageY - d[0].pageY) / 2, a -= l.left, r -= l.top, t = o.scale, e = Math.sqrt(Math.pow(d[0].pageX - d[1].pageX, 2) + Math.pow(d[0].pageY - d[1].pageY, 2))
              } n = d.length
          };
        this.container.on("touchstart", h).on("touchmove", h)
      },
      createRegions: function() {
        var t, e;
        for (t in this.regionLabelsGroup = this.regionLabelsGroup || this.canvas.createGroup("jvm-regions-labels-group"), this.mapData.paths) e = new M({
          map: this,
          code: t,
          path: this.mapData.paths[t].path,
          style: f.merge({}, this.params.regionStyle),
          labelStyle: this.params.regionLabelStyle,
          labelsGroup: this.regionLabelsGroup,
          label: this.params.labels && this.params.labels.regions
        }), this.regions[t] = {
          config: this.mapData.paths[t],
          element: e
        }
      },
      createLines: function(t, e, i) {
        var s = this;
        void 0 === i && (i = !1);
        var a, r = !1,
          n = !1;
        for (var o in this.linesGroup = this.linesGroup || this.canvas.createGroup("jvm-lines-group"), t) {
          var h = t[o];
          for (var l in e) {
            var c = i ? e[l].config : e[l];
            c.name === h.from && (r = this.getMarkerPosition(c)), c.name === h.to && (n = this.getMarkerPosition(c))
          }!1 !== r && !1 !== n && (a = new _({
            index: o,
            map: this,
            style: f.mergeDeeply({
              initial: this.params.lineStyle
            }, {
              initial: h.style || {}
            }),
            x1: r.x,
            y1: r.y,
            x2: n.x,
            y2: n.y,
            group: this.linesGroup
          }), i && Object.keys(this.lines).forEach((function(e) {
            e === j(t[0].from, t[0].to) && s.lines[e].element.remove()
          })), this.lines[j(h.from, h.to)] = {
            element: a,
            config: h
          })
        }
      },
      createMarkers: function(t, e) {
        var i, s, a, r, n = this;
        for (var o in void 0 === t && (t = {}), void 0 === e && (e = !1), this.markersGroup = this.markersGroup || this.canvas.createGroup("jvm-markers-group"), this.markerLabelsGroup = this.markerLabelsGroup || this.canvas.createGroup("jvm-markers-labels-group"), t) {
          if (i = t[o], a = this.getMarkerPosition(i), r = i.coords.join(":"), e) {
            if (f.keys(this.markers).filter((function(t) {
                return n.markers[t]._uid === r
              })).length) continue;
            o = f.keys(this.markers).length
          }!1 !== a && (s = new E({
            index: o,
            map: this,
            style: f.mergeDeeply(this.params.markerStyle, {
              initial: i.style || {}
            }),
            label: this.params.labels && this.params.labels.markers,
            labelsGroup: this.markerLabelsGroup,
            cx: a.x,
            cy: a.y,
            group: this.markersGroup,
            marker: i,
            isRecentlyCreated: e
          }), this.markers[o] && this.removeMarkers([o]), this.markers[o] = {
            _uid: r,
            config: i,
            element: s
          })
        }
      },
      createTooltip: function() {
        var t = this,
          e = f.createElement("div", "jvm-tooltip");
        this.tooltip = f.$(document.body.appendChild(e)), this.container.on("mousemove", (function(i) {
          if ("block" === t.tooltip.selector.style.display) {
            var s = t.container.selector.querySelector("#jvm-regions-group").getBoundingClientRect(),
              a = e.getBoundingClientRect(),
              r = a.height,
              n = a.width,
              o = i.clientY <= s.top + r + 5,
              h = i.pageY - r - 5,
              l = i.pageX - n - 5;
            o && (h += r + 5, l -= 10), i.clientX < s.left + n + 5 && (l = i.pageX + 5 + 2, o && (l += 10)), t.tooltip.css({
              top: h + "px",
              left: l + "px"
            })
          }
        }))
      },
      createSeries: function() {
        for (var t in this.series = {
            markers: [],
            regions: []
          }, this.params.series)
          for (var e = 0; e < this.params.series[t].length; e++) this.series[t][e] = new X(this.params.series[t][e], this[t], this)
      },
      applyTransform: function() {
        var t, e, i, s;
        this.defaultWidth * this.scale <= this.width ? (t = (this.width - this.defaultWidth * this.scale) / (2 * this.scale), i = (this.width - this.defaultWidth * this.scale) / (2 * this.scale)) : (t = 0, i = (this.width - this.defaultWidth * this.scale) / this.scale), this.defaultHeight * this.scale <= this.height ? (e = (this.height - this.defaultHeight * this.scale) / (2 * this.scale), s = (this.height - this.defaultHeight * this.scale) / (2 * this.scale)) : (e = 0, s = (this.height - this.defaultHeight * this.scale) / this.scale), this.transY > e ? this.transY = e : this.transY < s && (this.transY = s), this.transX > t ? this.transX = t : this.transX < i && (this.transX = i), this.canvas.applyTransformParams(this.scale, this.transX, this.transY), this.markers && this.repositionMarkers(), this.lines && this.repositionLines(), this.repositionLabels()
      },
      setFocus: function(t) {
        var e = this;
        void 0 === t && (t = {});
        var i, s = [];
        if (t.region ? s.push(t.region) : t.regions && (s = t.regions), s.length) return s.forEach((function(t) {
          if (e.regions[t]) {
            var s = e.regions[t].element.shape.getBBox();
            s && (i = void 0 === i ? s : {
              x: Math.min(i.x, s.x),
              y: Math.min(i.y, s.y),
              width: Math.max(i.x + i.width, s.x + s.width) - Math.min(i.x, s.x),
              height: Math.max(i.y + i.height, s.y + s.height) - Math.min(i.y, s.y)
            })
          }
        })), this.setScale(Math.min(this.width / i.width, this.height / i.height), -(i.x + i.width / 2), -(i.y + i.height / 2), !0, t.animate);
        if (t.coords) {
          var a = this.coordsToPoint(t.coords[0], t.coords[1]),
            r = this.transX - a.x / this.scale,
            n = this.transY - a.y / this.scale;
          return this.setScale(t.scale * this.baseScale, r, n, !0, t.animate)
        }
      },
      resize: function() {
        var t = this.baseScale;
        this.width / this.height > this.defaultWidth / this.defaultHeight ? (this.baseScale = this.height / this.defaultHeight, this.baseTransX = Math.abs(this.width - this.defaultWidth * this.baseScale) / (2 * this.baseScale)) : (this.baseScale = this.width / this.defaultWidth, this.baseTransY = Math.abs(this.height - this.defaultHeight * this.baseScale) / (2 * this.baseScale)), this.scale *= this.baseScale / t, this.transX *= this.baseScale / t, this.transY *= this.baseScale / t
      },
      setScale: function(t, e, i, s, a) {
        var r, n, o, h, l, c, u, p, d, f, m = this,
          g = 0,
          v = Math.abs(Math.round(60 * (t - this.scale) / Math.max(t, this.scale)));
        t > this.params.zoomMax * this.baseScale ? t = this.params.zoomMax * this.baseScale : t < this.params.zoomMin * this.baseScale && (t = this.params.zoomMin * this.baseScale), void 0 !== e && void 0 !== i && (r = t / this.scale, s ? (d = e + this.defaultWidth * (this.width / (this.defaultWidth * t)) / 2, f = i + this.defaultHeight * (this.height / (this.defaultHeight * t)) / 2) : (d = this.transX - (r - 1) / t * e, f = this.transY - (r - 1) / t * i)), a && v > 0 ? (o = this.scale, h = (t - o) / v, l = this.transX * this.scale, u = this.transY * this.scale, c = (d * t - l) / v, p = (f * t - u) / v, n = setInterval((function() {
          g += 1, m.scale = o + h * g, m.transX = (l + c * g) / m.scale, m.transY = (u + p * g) / m.scale, m.applyTransform(), g == v && (clearInterval(n), m.emit("viewport:changed", [m.scale, m.transX, m.transY]))
        }), 10)) : (this.transX = d, this.transY = f, this.scale = t, this.applyTransform(), this.emit("viewport:changed", [this.scale, this.transX, this.transY]))
      },
      updateSize: function() {
        this.width = this.container.width(), this.height = this.container.height(), this.resize(), this.canvas.setSize(this.width, this.height), this.applyTransform()
      },
      coordsToPoint: function(t, e) {
        var i, s, a, r = z.maps[this.params.map].projection,
          n = r.centralMeridian;
        return i = Y[r.type](t, e, n), !!(s = this.getInsetForPoint(i.x, i.y)) && (a = s.bbox, i.x = (i.x - a[0].x) / (a[1].x - a[0].x) * s.width * this.scale, i.y = (i.y - a[0].y) / (a[1].y - a[0].y) * s.height * this.scale, {
          x: i.x + this.transX * this.scale + s.left * this.scale,
          y: i.y + this.transY * this.scale + s.top * this.scale
        })
      },
      getInsetForPoint: function(t, e) {
        var i, s, a = z.maps[this.params.map].insets;
        for (i = 0; i < a.length; i++)
          if (t > (s = a[i].bbox)[0].x && t < s[1].x && e > s[0].y && e < s[1].y) return a[i]
      },
      getMarkerPosition: function(t) {
        var e = t.coords;
        return z.maps[this.params.map].projection ? this.coordsToPoint.apply(this, e) : {
          x: e[0] * this.scale + this.transX * this.scale,
          y: e[1] * this.scale + this.transY * this.scale
        }
      },
      repositionLines: function() {
        var t = !1,
          e = !1;
        for (var i in this.lines) {
          for (var s in this.markers) {
            var a = this.markers[s];
            a.config.name === this.lines[i].config.from && (t = this.getMarkerPosition(a.config)), a.config.name === this.lines[i].config.to && (e = this.getMarkerPosition(a.config))
          }!1 !== t && !1 !== e && this.lines[i].element.setStyle({
            x1: t.x,
            y1: t.y,
            x2: e.x,
            y2: e.y
          })
        }
      },
      repositionMarkers: function() {
        var t;
        for (var e in this.markers) !1 !== (t = this.getMarkerPosition(this.markers[e].config)) && this.markers[e].element.setStyle({
          cx: t.x,
          cy: t.y
        })
      },
      repositionLabels: function() {
        var t = this.params.labels;
        if (t) {
          if (t.regions)
            for (var e in this.regions) this.regions[e].element.updateLabelPosition();
          if (t.markers)
            for (var i in this.markers) this.markers[i].element.updateLabelPosition()
        }
      },
      visualizeData: function(t) {
        f.isObj(t) && (this.dataVisualization = new L(t, this))
      }
    }),
    A = {
      onViewportChange: "viewport:changed",
      onRegionSelected: "region:select",
      onMarkerSelected: "marker:select",
      onRegionTooltipShow: "region.tooltip:show",
      onMarkerTooltipShow: "marker.tooltip:show",
      onLoaded: "map:loaded"
    },
    z = function() {
      function t(e) {
        if (void 0 === e && (e = {}), this.params = f.mergeDeeply(t.defaults, e), !t.maps[this.params.map]) throw new Error("Attempt to use map which was not loaded: " + e.map);
        this.mapData = t.maps[this.params.map], this.regions = {}, this.markers = {}, this.lines = {}, this.defaultWidth = this.mapData.width, this.defaultHeight = this.mapData.height, this.height = 0, this.width = 0, this.scale = 1, this.baseScale = 1, this.transX = 0, this.transY = 0, this.baseTransX = 0, this.baseTransY = 0, this.selector = e.selector, "loading" !== window.document.readyState ? this.init(e.selector) : window.addEventListener("DOMContentLoaded", this.init.bind(this, e.selector))
      }
      var e = t.prototype;
      return e.init = function(t) {
        var e = this.params;
        this.container = f.$(t).addClass("jvm-container"), this.canvas = new w(this.container, this.width, this.height), this.setBackgroundColor(e.backgroundColor), this.handleContainerEvents(), this.createRegions(), this.updateSize(), this.createLines(e.lines || {}, e.markers || {}), this.createMarkers(e.markers), this.handleElementEvents(), this.repositionLabels(), e.showTooltip && this.createTooltip(), e.zoomButtons && this.handleZoomButtons(), e.selectedRegions && this.setSelected("regions", e.selectedRegions), e.selectedMarkers && this.setSelected("markers", e.selectedMarkers), e.focusOn && this.setFocus(e.focusOn), e.visualizeData && this.visualizeData(e.visualizeData), e.bindTouchEvents && ("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch) && this.bindContainerTouchEvents(), e.series && (this.container.append(this.legendHorizontal = f.createElement("div", "jvm-series-container jvm-series-h")).append(this.legendVertical = f.createElement("div", "jvm-series-container jvm-series-v")), this.createSeries()), this.emit("map:loaded", [this])
      }, e.emit = function(t, e) {
        for (var i in A) A[i] === t && f.isFunc(this.params[i]) && this.params[i].apply(this, e)
      }, e.setBackgroundColor = function(t) {
        this.container.css({
          backgroundColor: t
        })
      }, e.getSelected = function(t) {
        var e, i = [];
        for (e in this[t]) this[t][e].element.isSelected && i.push(e);
        return i
      }, e.clearSelected = function(t) {
        var e = this;
        this.getSelected(t).forEach((function(i) {
          e[t][i].element.select(!1)
        }))
      }, e.setSelected = function(t, e) {
        var i = this;
        e.forEach((function(e) {
          i[t][e] && i[t][e].element.select(!0)
        }))
      }, e.getSelectedRegions = function() {
        return this.getSelected("regions")
      }, e.clearSelectedRegions = function() {
        var t = this;
        this.getSelected("regions").forEach((function(e) {
          t.regions[e].element.select(!1)
        }))
      }, e.getSelectedMarkers = function() {
        return this.getSelected("markers")
      }, e.clearSelectedMarkers = function() {
        var t = this;
        this.getSelected("markers").forEach((function(e) {
          t.markers[e].element.select(!1)
        }))
      }, e.addMarker = function(t) {
        console.warn("`addMarker` method is depreacted, please use `addMarkers` instead."), this.createMarkers([t], !0)
      }, e.addMarkers = function(t) {
        this.createMarkers(t, !0)
      }, e.removeMarkers = function(t) {
        var e = this;
        t || (t = Object.keys(this.markers)), t.forEach((function(t) {
          e.markers[t].element.remove(), delete e.markers[t]
        }))
      }, e.addLine = function(t, e, i) {
        void 0 === i && (i = {}), this.createLines([{
          from: t,
          to: e,
          style: i
        }], this.markers, !0)
      }, e.reset = function() {
        for (var t in this.series)
          for (var e = 0; e < this.series[t].length; e++) this.series[t][e].clear();
        this.legendHorizontal && (f.removeElement(this.legendHorizontal), this.legendHorizontal = null), this.legendVertical && (f.removeElement(this.legendVertical), this.legendVertical = null), this.scale = this.baseScale, this.transX = this.baseTransX, this.transY = this.baseTransY, this.applyTransform(), this.clearSelectedMarkers(), this.clearSelectedRegions(), this.removeMarkers()
      }, e.destroy = function(t) {
        var e = this;
        void 0 === t && (t = !0);
        var i = a(),
          r = this.tooltip.selector,
          n = Object.keys;
        f.removeElement(r), n(i).forEach((function(t) {
          s(i[t].selector, t, i[t].handler)
        })), t && n(this).forEach((function(t) {
          try {
            delete e[t]
          } catch (t) {}
        }))
      }, e.extend = function(e, i) {
        t.prototype[e] = i
      }, e.getUtils = function() {
        return f
      }, t
    }();
  z.maps = {}, z.defaults = {
    map: "world",
    backgroundColor: "tranparent",
    draggable: !0,
    zoomButtons: !0,
    zoomOnScroll: !0,
    zoomOnScrollSpeed: 3,
    zoomMax: 12,
    zoomMin: 1,
    zoomAnimate: !0,
    showTooltip: !0,
    zoomStep: 1.5,
    bindTouchEvents: !0,
    lineStyle: {
      stroke: "#808080",
      strokeWidth: 1,
      strokeLinecap: "round"
    },
    markersSelectable: !1,
    markersSelectableOne: !1,
    markerStyle: {
      initial: {
        r: 7,
        fill: "#374151",
        fillOpacity: 1,
        stroke: "#FFF",
        strokeWidth: 5,
        strokeOpacity: .5
      },
      hover: {
        fill: "#3cc0ff",
        cursor: "pointer"
      },
      selected: {
        fill: "blue"
      },
      selectedHover: {}
    },
    markerLabelStyle: {
      initial: {
        fontFamily: "Verdana",
        fontSize: 12,
        fontWeight: 500,
        cursor: "default",
        fill: "#374151"
      },
      hover: {
        cursor: "pointer"
      },
      selected: {},
      selectedHover: {}
    },
    regionsSelectable: !1,
    regionsSelectableOne: !1,
    regionStyle: {
      initial: {
        fill: "#dee2e8",
        fillOpacity: 1,
        stroke: "none",
        strokeWidth: 0
      },
      hover: {
        fillOpacity: .7,
        cursor: "pointer"
      },
      selected: {
        fill: "#9ca3af"
      },
      selectedHover: {}
    },
    regionLabelStyle: {
      initial: {
        fontFamily: "Verdana",
        fontSize: "12",
        fontWeight: "bold",
        cursor: "default",
        fill: "#35373e"
      },
      hover: {
        cursor: "pointer"
      }
    }
  }, Object.assign(z.prototype, T);
  var P = function() {
    function t(t) {
      if (void 0 === t && (t = {}), !t.selector) throw new Error("Selector is not given.");
      return new z(t)
    }
    return t.prototype.addMap = function(t, e) {
      z.maps[t] = e
    }, t
  }();
  return window.jsVectorMap = P
}));


jsVectorMap.prototype.addMap("world", {
  insets: [{
    width: 900,
    top: 0,
    left: 0,
    height: 440.70631074413296,
    bbox: [{
      y: -12671671.123330014,
      x: -20004297.151525836
    }, {
      y: 6930392.025135122,
      x: 20026572.39474939
    }]
  }],
  paths: {
    BD: {
      path: "M651.84,230.21l-0.6,-2.0l-1.36,-1.71l-2.31,-0.11l-0.41,0.48l0.2,0.94l-0.53,0.99l-0.72,-0.36l-0.68,0.35l-1.2,-0.36l-0.37,-2.0l-0.81,-1.86l0.39,-1.46l-0.22,-0.47l-1.14,-0.53l0.29,-0.5l1.48,-0.94l0.03,-0.65l-1.55,-1.22l0.55,-1.14l1.61,0.94l1.04,0.15l0.18,1.54l0.34,0.35l5.64,0.63l-0.84,1.64l-1.22,0.34l-0.77,1.51l0.07,0.47l1.37,1.37l0.67,-0.19l0.42,-1.39l1.21,3.84l-0.03,1.21l-0.33,-0.15l-0.4,0.28Z",
      name: "Bangladesh"
    },
    BE: {
      path: "M429.29,144.05l1.91,0.24l2.1,-0.63l2.63,1.99l-0.21,1.66l-0.69,0.4l-0.18,1.2l-1.66,-1.13l-1.39,0.15l-2.73,-2.7l-1.17,-0.18l-0.16,-0.52l1.54,-0.5Z",
      name: "Belgium"
    },
    BF: {
      path: "M421.42,247.64l-0.11,0.95l0.34,1.16l1.4,1.71l0.07,1.1l0.32,0.37l2.55,0.51l-0.04,1.28l-0.38,0.53l-1.07,0.21l-0.72,1.18l-0.63,0.21l-3.22,-0.25l-0.94,0.39l-5.4,-0.05l-0.39,0.38l0.16,2.73l-1.23,-0.43l-1.17,0.1l-0.89,0.57l-2.27,-1.72l-0.13,-1.11l0.61,-0.96l0.02,-0.93l1.87,-1.98l0.44,-1.81l0.43,-0.39l1.28,0.26l1.05,-0.52l0.47,-0.73l1.84,-1.09l0.55,-0.83l2.2,-1.0l1.15,-0.3l0.72,0.45l1.13,-0.01Z",
      name: "Burkina Faso"
    },
    BG: {
      path: "M491.65,168.18l-0.86,0.88l-0.91,2.17l0.48,1.34l-1.6,-0.24l-2.55,0.95l-0.28,1.51l-1.8,0.22l-2.0,-1.0l-1.92,0.79l-1.42,-0.07l-0.15,-1.63l-1.05,-0.97l0.0,-0.8l1.2,-1.57l0.01,-0.56l-1.14,-1.23l-0.05,-0.94l0.88,0.97l0.88,-0.2l1.91,0.47l3.68,0.16l1.42,-0.81l2.72,-0.66l2.55,1.24Z",
      name: "Bulgaria"
    },
    BA: {
      path: "M463.49,163.65l2.1,0.5l1.72,-0.03l1.52,0.68l-0.36,0.78l0.08,0.45l1.04,1.02l-0.25,0.98l-1.81,1.15l-0.38,1.38l-1.67,-0.87l-0.89,-1.2l-2.11,-1.83l-1.63,-2.22l0.23,-0.57l0.48,0.38l0.55,-0.06l0.43,-0.51l0.94,-0.06Z",
      name: "Bosnia and Herz."
    },
    BN: {
      path: "M707.48,273.58l0.68,-0.65l1.41,-0.91l-0.15,1.63l-0.81,-0.05l-0.61,0.58l-0.53,-0.6Z",
      name: "Brunei"
    },
    BO: {
      path: "M263.83,340.69l-3.09,-0.23l-0.38,0.23l-0.7,1.52l-1.31,-1.53l-3.28,-0.64l-2.37,2.4l-1.31,0.26l-0.88,-3.26l-1.3,-2.86l0.74,-2.37l-0.13,-0.43l-1.2,-1.01l-0.37,-1.89l-1.08,-1.55l1.45,-2.56l-0.96,-2.33l0.47,-1.06l-0.34,-0.73l0.91,-1.32l0.16,-3.84l0.5,-1.18l-1.81,-3.41l2.46,0.07l0.8,-0.85l3.4,-1.91l2.66,-0.35l-0.19,1.38l0.3,1.07l-0.05,1.97l2.72,2.27l2.88,0.49l0.89,0.86l1.79,0.58l0.98,0.7l1.71,0.05l1.17,0.61l0.6,2.7l-0.7,0.54l0.96,2.99l0.37,0.28l4.3,0.1l-0.25,1.2l0.27,1.02l1.43,0.9l0.5,1.35l-0.41,1.86l-0.65,1.08l0.12,1.35l-2.69,-1.65l-2.4,-0.03l-4.36,0.76l-1.49,2.5l-0.11,1.52l-0.75,2.37Z",
      name: "Bolivia"
    },
    JP: {
      path: "M781.12,166.87l1.81,0.68l1.62,-0.97l0.39,2.42l-3.35,0.75l-2.23,2.88l-3.63,-1.9l-0.56,0.2l-1.26,3.05l-2.16,0.03l-0.29,-2.51l1.08,-2.03l2.45,-0.16l0.37,-0.33l1.25,-5.94l2.47,2.71l2.03,1.12ZM773.56,187.34l-0.91,2.22l0.37,1.52l-1.14,1.75l-3.02,1.26l-4.58,0.27l-3.34,3.01l-1.25,-0.8l-0.09,-1.9l-0.46,-0.38l-4.35,0.62l-3.0,1.32l-2.85,0.05l-0.37,0.27l0.13,0.44l2.32,1.89l-1.54,4.34l-1.26,0.9l-0.79,-0.7l0.56,-2.27l-0.21,-0.45l-1.47,-0.75l-0.74,-1.4l2.12,-0.84l1.26,-1.7l2.45,-1.42l1.83,-1.91l4.78,-0.81l2.6,0.57l0.44,-0.21l2.39,-4.66l1.29,1.06l0.5,0.01l5.1,-4.02l1.69,-3.73l-0.38,-3.4l0.9,-1.61l2.14,-0.44l1.23,3.72l-0.07,2.18l-2.23,2.84l-0.04,3.16ZM757.78,196.26l0.19,0.56l-1.01,1.21l-1.16,-0.68l-1.28,0.65l-0.69,1.45l-1.02,-0.5l0.01,-0.93l1.14,-1.38l1.57,0.14l0.85,-0.98l1.4,0.46Z",
      name: "Japan"
    },
    BI: {
      path: "M495.45,295.49l-1.08,-2.99l1.14,-0.11l0.64,-1.19l0.76,0.09l0.65,1.83l-2.1,2.36Z",
      name: "Burundi"
    },
    BJ: {
      path: "M429.57,255.75l-0.05,0.8l0.5,1.34l-0.42,0.86l0.17,0.79l-1.81,2.12l-0.57,1.76l-0.08,5.42l-1.41,0.2l-0.48,-1.36l0.11,-5.71l-0.52,-0.7l-0.2,-1.35l-1.48,-1.48l0.21,-0.9l0.89,-0.43l0.42,-0.92l1.27,-0.36l1.22,-1.34l0.61,-0.0l1.62,1.24Z",
      name: "Benin"
    },
    BT: {
      path: "M650.32,213.86l0.84,0.71l-0.12,1.1l-3.76,-0.11l-1.57,0.4l-1.93,-0.87l1.48,-1.96l1.13,-0.57l1.63,0.57l1.33,0.08l0.99,0.65Z",
      name: "Bhutan"
    },
    JM: {
      path: "M228.38,239.28l-0.8,0.4l-2.26,-1.06l0.84,-0.23l2.14,0.3l1.17,0.56l-1.08,0.03Z",
      name: "Jamaica"
    },
    BW: {
      path: "M483.92,330.07l2.27,4.01l2.83,2.86l0.96,0.31l0.78,2.43l2.13,0.61l1.02,0.76l-3.0,1.64l-2.32,2.02l-1.54,2.69l-1.52,0.45l-0.64,1.94l-1.34,0.52l-1.85,-0.12l-1.21,-0.74l-1.35,-0.3l-1.22,0.62l-0.75,1.37l-2.31,1.9l-1.4,0.21l-0.35,-0.59l0.16,-1.75l-1.48,-2.54l-0.62,-0.43l-0.0,-7.1l2.08,-0.08l0.39,-0.4l0.07,-8.9l5.19,-0.93l0.8,0.89l0.51,0.07l1.5,-0.95l2.21,-0.49Z",
      name: "Botswana"
    },
    BR: {
      path: "M259.98,275.05l3.24,0.7l0.65,-0.53l4.55,-1.32l1.08,-1.06l-0.02,-0.63l0.55,-0.05l0.28,0.28l-0.26,0.87l0.22,0.48l0.73,0.32l0.4,0.81l-0.62,0.86l-0.4,2.13l0.82,2.56l1.69,1.43l1.43,0.2l3.17,-1.68l3.18,0.3l0.65,-0.75l-0.27,-0.92l1.9,-0.09l2.39,0.99l1.06,-0.61l0.84,0.78l1.2,-0.18l1.18,-1.06l0.84,-1.94l1.36,-2.11l0.37,-0.05l1.89,5.45l1.33,0.59l0.05,1.28l-1.77,1.94l0.02,0.56l1.02,0.87l4.07,0.36l0.08,2.16l0.66,0.29l1.74,-1.5l6.97,2.32l1.02,1.22l-0.35,1.18l0.49,0.5l2.81,-0.74l4.77,1.3l3.75,-0.08l3.57,2.0l3.29,2.86l1.93,0.72l2.12,0.12l0.71,0.62l1.21,4.51l-0.95,3.98l-4.72,5.06l-1.64,2.92l-1.72,2.05l-0.8,0.3l-0.72,2.03l0.18,4.75l-0.94,5.53l-0.81,1.13l-0.43,3.36l-2.55,3.5l-0.4,2.51l-1.86,1.04l-0.67,1.53l-2.54,0.01l-3.94,1.01l-1.83,1.2l-2.87,0.82l-3.03,2.19l-2.2,2.83l-0.36,2.0l0.4,1.58l-0.44,2.6l-0.51,1.2l-1.77,1.54l-2.75,4.78l-3.83,3.42l-1.24,2.74l-1.18,1.15l-0.36,-0.83l0.95,-1.14l0.01,-0.5l-1.52,-1.97l-4.56,-3.32l-1.03,-0.0l-2.38,-2.02l-0.81,-0.0l5.34,-5.45l3.77,-2.58l0.22,-2.46l-1.35,-1.81l-0.91,0.07l0.58,-2.33l0.01,-1.54l-1.11,-0.83l-1.75,0.3l-0.44,-3.11l-0.52,-0.95l-1.88,-0.88l-1.24,0.47l-2.17,-0.41l0.15,-3.21l-0.62,-1.34l0.66,-0.73l-0.22,-1.34l0.66,-1.13l0.44,-2.04l-0.61,-1.83l-1.4,-0.86l-0.2,-0.75l0.34,-1.39l-0.38,-0.5l-4.52,-0.1l-0.72,-2.22l0.59,-0.42l-0.03,-1.1l-0.5,-0.87l-0.32,-1.7l-1.45,-0.76l-1.63,-0.02l-1.05,-0.72l-1.6,-0.48l-1.13,-0.99l-2.69,-0.4l-2.47,-2.06l0.13,-4.35l-0.45,-0.45l-3.46,0.5l-3.44,1.94l-0.6,0.74l-2.9,-0.17l-1.47,0.42l-0.72,-0.18l0.15,-3.52l-0.63,-0.34l-1.94,1.41l-1.87,-0.06l-0.83,-1.18l-1.37,-0.26l0.21,-1.01l-1.35,-1.49l-0.88,-1.91l0.56,-0.6l-0.0,-0.81l1.29,-0.62l0.22,-0.43l-0.22,-1.19l0.61,-0.91l0.15,-0.99l2.65,-1.58l1.99,-0.47l0.42,-0.36l2.06,0.11l0.42,-0.33l1.19,-8.0l-0.41,-1.56l-1.1,-1.0l0.01,-1.33l1.91,-0.42l0.08,-0.96l-0.33,-0.43l-1.14,-0.2l-0.02,-0.83l4.47,0.05l0.82,-0.67l0.82,1.81l0.8,0.07l1.15,1.1l2.26,-0.05l0.71,-0.83l2.78,-0.96l0.48,-1.13l1.6,-0.64l0.24,-0.47l-0.48,-0.82l-1.83,-0.19l-0.36,-3.22Z",
      name: "Brazil"
    },
    BS: {
      path: "M226.4,223.87l-0.48,-1.15l-0.84,-0.75l0.36,-1.11l0.95,1.95l0.01,1.06ZM225.56,216.43l-1.87,0.29l-0.04,-0.22l0.74,-0.14l1.17,0.06Z",
      name: "Bahamas"
    },
    BY: {
      path: "M493.84,128.32l0.29,0.7l0.49,0.23l1.19,-0.38l2.09,0.72l0.19,1.26l-0.45,1.24l1.57,2.26l0.89,0.59l0.17,0.81l1.58,0.56l0.4,0.5l-0.53,0.41l-1.87,-0.11l-0.73,0.38l-0.13,0.52l1.04,2.74l-1.91,0.26l-0.89,0.99l-0.11,1.18l-2.73,-0.04l-0.53,-0.62l-0.52,-0.08l-0.75,0.46l-0.91,-0.42l-1.92,-0.07l-2.75,-0.79l-2.6,-0.28l-2.0,0.07l-1.5,0.92l-0.67,0.07l-0.08,-1.22l-0.59,-1.19l1.36,-0.88l0.01,-1.35l-0.7,-1.41l-0.07,-1.0l2.16,-0.02l2.72,-1.3l0.75,-2.04l1.91,-1.04l0.2,-0.41l-0.19,-1.25l3.8,-1.78l2.3,0.77Z",
      name: "Belarus"
    },
    BZ: {
      path: "M198.03,244.38l0.1,-4.49l0.69,-0.06l0.74,-1.3l0.34,0.28l-0.4,1.3l0.17,0.58l-0.34,2.25l-1.3,1.42Z",
      name: "Belize"
    },
    RU: {
      path: "M491.55,115.25l2.55,-1.85l-0.01,-0.65l-2.2,-1.5l7.32,-6.76l1.03,-2.11l-0.13,-0.49l-3.46,-2.52l0.86,-2.7l-2.11,-2.81l1.56,-3.67l-2.77,-4.52l2.15,-2.99l-0.08,-0.55l-3.65,-2.73l0.3,-2.54l1.81,-0.37l4.26,-1.77l2.42,-1.45l4.06,2.61l6.79,1.04l9.34,4.85l1.78,1.88l0.14,2.46l-2.55,2.02l-3.9,1.06l-11.07,-3.14l-2.06,0.53l-0.13,0.7l3.94,2.94l0.31,5.86l0.26,0.36l5.14,2.24l0.58,-0.29l0.32,-1.94l-1.35,-1.78l1.13,-1.09l6.13,2.42l2.11,-0.98l0.18,-0.56l-1.51,-2.67l5.41,-3.76l2.07,0.22l2.26,1.41l0.57,-0.16l1.46,-2.87l-0.05,-0.44l-1.92,-2.32l1.12,-2.32l-1.32,-2.27l5.87,1.16l1.04,1.75l-2.59,0.43l-0.33,0.4l0.02,2.36l2.46,1.83l3.87,-0.91l0.86,-2.8l13.69,-5.65l0.99,0.11l-1.92,2.06l0.23,0.67l3.11,0.45l2.0,-1.48l4.56,-0.12l3.64,-1.73l2.65,2.44l0.56,-0.01l2.85,-2.88l-0.01,-0.57l-2.35,-2.29l0.9,-1.01l7.14,1.3l3.41,1.36l9.05,4.97l0.51,-0.11l1.67,-2.27l-0.05,-0.53l-2.43,-2.21l-0.06,-0.78l-0.34,-0.36l-2.52,-0.36l0.64,-1.93l-1.32,-3.46l-0.06,-1.21l4.48,-4.06l1.69,-4.29l1.6,-0.81l6.23,1.18l0.44,2.21l-2.29,3.64l0.06,0.5l1.47,1.39l0.76,3.0l-0.56,6.03l2.69,2.82l-0.96,2.57l-4.86,5.95l0.23,0.64l2.86,0.61l0.42,-0.17l0.93,-1.4l2.64,-1.03l0.87,-2.24l2.09,-1.96l0.07,-0.5l-1.36,-2.28l1.09,-2.69l-0.32,-0.55l-2.47,-0.33l-0.5,-2.06l1.94,-4.38l-0.06,-0.42l-2.96,-3.4l4.12,-2.88l0.16,-0.4l-0.51,-2.93l0.54,-0.05l1.13,2.25l-0.96,4.35l0.27,0.47l2.68,0.84l0.5,-0.51l-1.02,-2.99l3.79,-1.66l5.01,-0.24l4.53,2.61l0.48,-0.06l0.07,-0.48l-2.18,-3.82l-0.23,-4.67l3.98,-0.9l5.97,0.21l5.49,-0.64l0.27,-0.65l-1.83,-2.31l2.56,-2.9l2.87,-0.17l4.8,-2.47l6.54,-0.67l1.03,-1.42l6.25,-0.45l2.32,1.11l5.53,-2.7l4.5,0.08l0.39,-0.28l0.66,-2.15l2.26,-2.12l5.69,-2.11l3.21,1.29l-2.46,0.94l-0.25,0.42l0.34,0.35l5.41,0.77l0.61,2.33l0.58,0.25l2.2,-1.22l7.13,0.07l5.51,2.47l1.79,1.72l-0.53,2.24l-9.16,4.15l-1.97,1.52l0.16,0.71l6.77,1.91l2.16,-0.78l1.13,2.74l0.67,0.11l1.01,-1.15l3.81,-0.73l7.7,0.77l0.54,1.99l0.36,0.29l10.47,0.71l0.43,-0.38l0.13,-3.23l4.87,0.78l3.95,-0.02l3.83,2.4l1.03,2.71l-1.35,1.79l0.02,0.5l3.15,3.64l4.07,1.96l0.53,-0.18l2.23,-4.47l3.95,1.93l4.16,-1.21l4.73,1.39l2.05,-1.26l3.94,0.62l0.43,-0.55l-1.68,-4.02l2.89,-1.8l22.31,3.03l2.16,2.75l6.55,3.51l10.29,-0.81l4.82,0.73l1.85,1.66l-0.29,3.08l0.25,0.41l3.08,1.26l3.56,-0.88l4.35,-0.11l4.8,0.87l4.57,-0.47l4.23,3.79l0.43,0.07l3.1,-1.4l0.16,-0.6l-1.88,-2.62l0.85,-1.52l7.71,1.21l5.22,-0.26l7.09,2.09l9.59,5.22l6.35,4.11l-0.2,2.38l1.88,1.41l0.6,-0.42l-0.48,-2.53l6.15,0.57l4.4,3.51l-1.97,1.43l-4.0,0.41l-0.36,0.39l-0.06,3.79l-0.74,0.62l-2.07,-0.11l-1.91,-1.39l-3.14,-1.11l-0.78,-1.85l-2.72,-0.68l-2.63,0.49l-1.04,-1.1l0.46,-1.31l-0.5,-0.51l-3.0,0.98l-0.22,0.58l0.99,1.7l-1.21,1.48l-3.04,1.68l-3.12,-0.28l-0.4,0.23l0.09,0.46l2.2,2.09l1.46,3.2l1.15,1.1l0.24,1.33l-0.42,0.67l-4.63,-0.77l-6.96,2.9l-2.19,0.44l-7.6,5.06l-0.84,1.45l-3.61,-2.37l-6.24,2.82l-0.94,-1.15l-0.53,-0.08l-2.28,1.52l-3.2,-0.49l-0.44,0.27l-0.78,2.37l-3.05,3.78l0.09,1.47l0.29,0.36l2.54,0.72l-0.29,4.53l-1.97,0.11l-0.35,0.26l-1.07,2.94l0.8,1.45l-3.91,1.58l-1.05,3.95l-3.48,0.77l-0.3,0.3l-0.72,3.29l-3.09,2.65l-0.7,-1.74l-2.44,-12.44l1.16,-4.71l2.04,-2.06l0.22,-1.64l3.8,-0.86l4.46,-4.61l4.28,-3.81l4.48,-3.01l2.17,-5.63l-0.42,-0.54l-3.04,0.33l-1.77,3.31l-5.86,3.86l-1.86,-4.25l-0.45,-0.23l-6.46,1.3l-6.47,6.44l-0.01,0.55l1.58,1.74l-8.24,1.17l0.15,-2.2l-0.34,-0.42l-3.89,-0.56l-3.25,1.81l-7.62,-0.62l-8.45,1.19l-17.71,15.41l0.22,0.7l3.74,0.41l1.36,2.17l2.43,0.76l1.88,-1.68l2.4,0.2l3.4,3.54l0.08,2.6l-1.95,3.42l-0.21,3.9l-1.1,5.06l-3.71,4.54l-0.87,2.21l-8.29,8.89l-3.19,1.7l-1.32,0.03l-1.45,-1.36l-0.49,-0.04l-2.27,1.5l0.41,-3.65l-0.59,-2.47l1.75,-0.89l2.91,0.53l0.42,-0.2l1.68,-3.03l0.87,-3.46l0.97,-1.18l1.32,-2.88l-0.45,-0.56l-4.14,0.95l-2.19,1.25l-3.41,-0.0l-1.06,-2.93l-2.97,-2.3l-4.28,-1.06l-1.75,-5.07l-2.66,-5.01l-2.29,-1.29l-3.75,-1.01l-3.44,0.08l-3.18,0.62l-2.24,1.77l0.05,0.66l1.18,0.69l0.02,1.43l-1.33,1.05l-2.26,3.51l-0.04,1.43l-3.16,1.84l-2.82,-1.16l-3.01,0.23l-1.35,-1.07l-1.5,-0.35l-3.9,2.31l-3.22,0.52l-2.27,0.79l-3.05,-0.51l-2.21,0.03l-1.48,-1.6l-2.6,-1.63l-2.63,-0.43l-5.46,1.01l-3.23,-1.25l-0.72,-2.57l-5.2,-1.24l-2.75,-1.36l-0.5,0.12l-2.59,3.45l0.84,2.1l-2.06,1.93l-3.41,-0.77l-2.42,-0.12l-1.83,-1.54l-2.53,-0.05l-2.42,-0.98l-3.86,1.57l-4.72,2.78l-3.3,0.75l-1.55,-1.92l-3.0,0.41l-1.11,-1.33l-1.62,-0.59l-1.31,-1.94l-1.38,-0.6l-3.7,0.79l-3.31,-1.83l-0.51,0.11l-0.99,1.29l-5.29,-8.05l-2.96,-2.48l0.65,-0.77l0.01,-0.51l-0.5,-0.11l-6.2,3.21l-1.84,0.15l0.15,-1.39l-0.26,-0.42l-3.22,-1.17l-2.46,0.7l-0.69,-3.16l-0.32,-0.31l-4.5,-0.75l-2.47,1.47l-6.19,1.27l-1.29,0.86l-9.51,1.3l-1.15,1.17l-0.03,0.53l1.47,1.9l-1.89,0.69l-0.22,0.56l0.31,0.6l-2.11,1.44l0.03,0.68l3.75,2.12l-0.39,0.98l-3.23,-0.13l-0.86,0.86l-3.09,-1.59l-3.97,0.07l-2.66,1.35l-8.32,-3.56l-4.07,0.06l-5.39,3.68l-0.39,2.0l-2.03,-1.5l-0.59,0.13l-2.0,3.59l0.57,0.93l-1.28,2.16l0.06,0.48l2.13,2.17l1.95,0.04l1.37,1.82l-0.23,1.46l0.25,0.43l0.83,0.33l-0.8,1.31l-2.49,0.62l-2.49,3.2l0.0,0.49l2.17,2.78l-0.15,2.18l2.5,3.24l-1.58,1.59l-0.7,-0.13l-1.63,-1.72l-2.29,-0.84l-0.94,-1.31l-2.34,-0.63l-1.48,0.4l-0.43,-0.47l-3.51,-1.48l-5.76,-1.01l-0.45,0.19l-2.89,-2.34l-2.9,-1.2l-1.53,-1.29l1.29,-0.43l2.08,-2.61l-0.05,-0.55l-0.89,-0.79l3.05,-1.06l0.27,-0.42l-0.07,-0.69l-0.49,-0.35l-1.73,0.39l0.04,-0.68l1.04,-0.72l2.66,-0.48l0.4,-1.32l-0.5,-1.6l0.92,-1.54l0.03,-1.17l-0.29,-0.37l-3.69,-1.06l-1.41,0.02l-1.42,-1.41l-2.19,0.38l-2.77,-1.01l-0.03,-0.59l-0.89,-1.43l-2.0,-0.32l-0.11,-0.54l0.49,-0.53l0.01,-0.53l-1.6,-1.9l-3.58,0.02l-0.88,0.73l-0.46,-0.07l-1.0,-2.79l2.22,-0.02l0.97,-0.74l0.07,-0.57l-0.9,-1.04l-1.35,-0.48l-0.11,-0.7l-0.95,-0.58l-1.38,-1.99l0.46,-0.98l-0.51,-1.96l-2.45,-0.84l-1.21,0.3l-0.46,-0.76l-2.46,-0.83l-0.72,-1.87l-0.21,-1.69l-0.99,-0.85l0.85,-1.17l-0.7,-3.21l1.66,-1.97l-0.16,-0.79ZM749.2,170.72l-0.6,0.4l-0.13,0.16l-0.01,-0.51l0.74,-0.05ZM874.85,67.94l-5.63,0.48l-0.26,-0.84l3.15,-1.89l1.94,0.01l3.19,1.16l-2.39,1.09ZM797.39,48.49l-2.0,1.36l-3.8,-0.42l-4.25,-1.8l0.35,-0.97l9.69,1.83ZM783.67,46.12l-1.63,3.09l-8.98,-0.13l-4.09,1.14l-4.54,-2.97l1.16,-3.01l3.05,-0.89l6.5,0.22l8.54,2.56ZM778.2,134.98l-0.56,-0.9l0.27,-0.12l0.29,1.01ZM778.34,135.48l0.94,3.53l-0.05,3.38l1.05,3.39l2.18,5.0l-2.89,-0.83l-0.49,0.26l-1.54,4.65l2.42,3.5l-0.04,1.13l-1.24,-1.24l-0.61,0.06l-1.09,1.61l-0.28,-1.61l0.27,-3.1l-0.28,-3.4l0.58,-2.47l0.11,-4.39l-1.46,-3.36l0.21,-4.32l2.15,-1.46l0.07,-0.34ZM771.95,56.61l1.76,-1.42l2.89,-0.42l3.28,1.71l0.14,0.6l-3.27,0.03l-4.81,-0.5ZM683.76,31.09l-13.01,1.93l4.03,-6.35l1.82,-0.56l1.73,0.34l5.99,2.98l-0.56,1.66ZM670.85,27.93l-5.08,0.64l-6.86,-1.57l-3.99,-2.05l-2.1,-4.16l-2.6,-0.87l5.72,-3.5l5.2,-1.28l4.69,2.85l5.59,5.4l-0.56,4.53ZM564.15,68.94l-0.64,0.17l-7.85,-0.57l-0.86,-2.04l-4.28,-1.17l-0.28,-1.94l2.27,-0.89l0.25,-0.39l-0.08,-2.38l4.81,-3.97l-0.15,-0.7l-1.47,-0.38l5.3,-3.81l0.15,-0.44l-0.58,-1.94l5.28,-2.51l8.21,-3.27l8.28,-0.96l4.35,-1.94l4.6,-0.64l1.36,1.61l-1.34,1.28l-16.43,4.94l-7.97,4.88l-7.74,9.63l0.66,4.14l4.16,3.27ZM548.81,18.48l-5.5,1.18l-0.58,1.02l-2.59,0.84l-2.13,-1.07l1.12,-1.42l-0.3,-0.65l-2.33,-0.07l1.68,-0.36l3.47,-0.06l0.42,1.29l0.66,0.16l1.38,-1.34l2.15,-0.88l2.94,1.01l-0.39,0.36ZM477.37,133.15l-4.08,0.05l-2.56,-0.32l0.33,-0.87l3.17,-1.03l3.24,0.96l-0.09,1.23Z",
      name: "Russia"
    },
    RW: {
      path: "M497.0,288.25l0.71,1.01l-0.11,1.09l-1.63,0.03l-1.04,1.39l-0.83,-0.11l0.51,-1.2l0.08,-1.34l0.42,-0.41l0.7,0.14l1.19,-0.61Z",
      name: "Rwanda"
    },
    RS: {
      path: "M469.4,163.99l0.42,-0.5l-0.01,-0.52l-1.15,-1.63l1.43,-0.62l1.33,0.12l1.17,1.06l0.46,1.13l1.34,0.64l0.35,1.35l1.46,0.9l0.76,-0.29l0.2,0.69l-0.48,0.78l0.22,1.12l1.05,1.22l-0.77,0.8l-0.37,1.52l-1.21,0.08l0.24,-0.64l-0.39,-0.54l-2.08,-1.64l-0.9,0.05l-0.48,0.94l-2.12,-1.37l0.53,-1.6l-1.11,-1.37l0.51,-1.1l-0.41,-0.57Z",
      name: "Serbia"
    },
    LT: {
      path: "M486.93,129.3l0.17,1.12l-1.81,0.98l-0.72,2.02l-2.47,1.18l-2.1,-0.02l-0.73,-1.05l-1.06,-0.3l-0.09,-1.87l-3.56,-1.13l-0.43,-2.36l2.48,-0.94l4.12,0.22l2.25,-0.31l0.52,0.69l1.24,0.21l2.19,1.56Z",
      name: "Lithuania"
    },
    LU: {
      path: "M436.08,149.45l-0.48,-0.07l0.3,-1.28l0.27,0.4l-0.09,0.96Z",
      name: "Luxembourg"
    },
    LR: {
      path: "M399.36,265.97l0.18,1.54l-0.48,0.99l0.08,0.47l2.47,1.8l-0.33,2.8l-2.65,-1.13l-5.78,-4.61l0.58,-1.32l2.1,-2.33l0.86,-0.22l0.77,1.14l-0.14,0.85l0.59,0.87l1.0,0.14l0.76,-0.99Z",
      name: "Liberia"
    },
    RO: {
      path: "M487.53,154.23l0.6,0.24l2.87,3.98l-0.17,2.69l0.45,1.42l1.32,0.81l1.35,-0.42l0.76,0.36l0.02,0.31l-0.83,0.45l-0.59,-0.22l-0.54,0.3l-0.62,3.3l-1.0,-0.22l-2.07,-1.13l-2.95,0.71l-1.25,0.76l-3.51,-0.15l-1.89,-0.47l-0.87,0.16l-0.82,-1.3l0.29,-0.26l-0.06,-0.64l-1.09,-0.34l-0.56,0.5l-1.05,-0.64l-0.39,-1.39l-1.36,-0.65l-0.35,-1.0l-0.83,-0.75l1.54,-0.54l2.66,-4.21l2.4,-1.24l2.96,0.34l1.48,0.73l0.79,-0.45l1.78,-0.3l0.75,-0.74l0.79,0.0Z",
      name: "Romania"
    },
    GW: {
      path: "M386.23,253.6l-0.29,0.84l0.15,0.6l-2.21,0.59l-0.86,0.96l-1.04,-0.83l-1.09,-0.23l-0.54,-1.06l-0.66,-0.49l2.41,-0.48l4.13,0.1Z",
      name: "Guinea-Bissau"
    },
    GT: {
      path: "M195.08,249.77l-2.48,-0.37l-1.03,-0.45l-1.14,-0.89l0.3,-0.99l-0.24,-0.68l0.96,-1.66l2.98,-0.01l0.4,-0.37l-0.19,-1.28l-1.67,-1.4l0.51,-0.4l0.0,-1.05l3.85,0.02l-0.21,4.53l0.4,0.43l1.46,0.38l-1.48,0.98l-0.35,0.7l0.12,0.57l-2.2,1.96Z",
      name: "Guatemala"
    },
    GR: {
      path: "M487.07,174.59l-0.59,1.43l-0.37,0.21l-2.84,-0.35l-3.03,0.77l-0.18,0.68l1.28,1.23l-0.61,0.23l-1.14,0.0l-1.2,-1.39l-0.63,0.03l-0.53,1.01l0.56,1.76l1.03,1.19l-0.56,0.38l-0.05,0.62l2.52,2.12l0.02,0.87l-1.78,-0.59l-0.48,0.56l0.5,1.0l-1.07,0.2l-0.3,0.53l0.75,2.01l-0.98,0.02l-1.84,-1.12l-1.37,-4.2l-2.21,-2.95l-0.11,-0.56l1.04,-1.28l0.2,-0.95l0.85,-0.66l0.03,-0.46l1.32,-0.21l1.01,-0.64l1.22,0.05l0.65,-0.56l2.26,-0.0l1.82,-0.75l1.85,1.0l2.28,-0.28l0.35,-0.39l0.01,-0.77l0.34,0.22ZM480.49,192.16l0.58,0.4l-0.68,-0.12l0.11,-0.28ZM482.52,192.82l2.51,0.06l0.24,0.32l-1.99,0.13l-0.77,-0.51Z",
      name: "Greece"
    },
    GQ: {
      path: "M448.79,279.62l0.02,2.22l-4.09,0.0l0.69,-2.27l3.38,0.05Z",
      name: "Eq. Guinea"
    },
    GY: {
      path: "M277.42,270.07l-0.32,1.83l-1.32,0.57l-0.23,0.46l-0.28,2.0l1.11,1.82l0.83,0.19l0.32,1.25l1.13,1.62l-1.21,-0.19l-1.08,0.71l-1.77,0.5l-0.44,0.46l-0.86,-0.09l-1.32,-1.01l-0.77,-2.27l0.36,-1.9l0.68,-1.23l-0.57,-1.17l-0.74,-0.43l0.12,-1.16l-0.9,-0.69l-1.1,0.09l-1.31,-1.48l0.53,-0.72l-0.04,-0.84l1.99,-0.86l0.05,-0.59l-0.71,-0.78l0.14,-0.57l1.66,-1.24l1.36,0.77l1.41,1.49l0.06,1.15l0.37,0.38l0.8,0.05l2.06,1.86Z",
      name: "Guyana"
    },
    GE: {
      path: "M521.71,168.93l5.29,0.89l4.07,2.01l1.41,-0.44l2.07,0.56l0.68,1.1l1.07,0.55l-0.12,0.59l0.98,1.29l-1.01,-0.13l-1.81,-0.83l-0.94,0.47l-3.23,0.43l-2.29,-1.39l-2.33,0.05l0.21,-0.97l-0.76,-2.26l-1.45,-1.12l-1.43,-0.39l-0.41,-0.42Z",
      name: "Georgia"
    },
    GB: {
      path: "M412.61,118.72l-2.19,3.22l-0.0,0.45l5.13,-0.3l-0.53,2.37l-2.2,3.12l0.29,0.63l2.37,0.21l2.33,4.3l1.76,0.69l2.2,5.12l2.94,0.77l-0.23,1.62l-1.15,0.88l-0.1,0.52l0.82,1.42l-1.86,1.43l-3.3,-0.02l-4.12,0.87l-1.04,-0.58l-0.47,0.06l-1.51,1.41l-2.12,-0.34l-1.86,1.18l-0.6,-0.29l3.19,-3.0l2.16,-0.69l0.28,-0.41l-0.34,-0.36l-3.73,-0.53l-0.4,-0.76l2.2,-0.87l0.17,-0.61l-1.26,-1.67l0.36,-1.7l3.38,0.28l0.43,-0.33l0.37,-1.99l-1.79,-2.49l-3.11,-0.72l-0.38,-0.59l0.79,-1.35l-0.04,-0.46l-0.82,-0.97l-0.61,0.01l-0.68,0.84l-0.1,-2.34l-1.23,-1.88l0.85,-3.47l1.77,-2.68l1.85,0.26l2.17,-0.22ZM406.26,132.86l-1.01,1.77l-1.57,-0.59l-1.16,0.01l0.37,-1.54l-0.39,-1.39l1.45,-0.1l2.3,1.84Z",
      name: "United Kingdom"
    },
    GA: {
      path: "M453.24,279.52l-0.08,0.98l0.7,1.29l2.36,0.24l-0.98,2.63l1.18,1.79l0.25,1.78l-0.29,1.52l-0.6,0.93l-1.84,-0.09l-1.23,-1.11l-0.66,0.23l-0.15,0.84l-1.42,0.26l-1.02,0.7l-0.11,0.52l0.77,1.35l-1.34,0.97l-3.94,-4.3l-1.44,-2.45l0.06,-0.6l0.54,-0.81l1.05,-3.46l4.17,-0.07l0.4,-0.4l-0.02,-2.66l2.39,0.21l1.25,-0.27Z",
      name: "Gabon"
    },
    GN: {
      path: "M391.8,254.11l0.47,0.8l1.11,-0.32l0.98,0.7l1.07,0.2l2.26,-1.22l0.64,0.44l1.13,1.56l-0.48,1.4l0.8,0.3l-0.08,0.48l0.46,0.68l-0.35,1.36l1.05,2.61l-1.0,0.69l0.03,1.41l-0.72,-0.06l-1.08,1.0l-0.24,-0.27l0.07,-1.11l-1.05,-1.54l-1.79,0.21l-0.35,-2.01l-1.6,-2.18l-2.0,-0.0l-1.31,0.54l-1.95,2.18l-1.86,-2.19l-1.2,-0.78l-0.3,-1.11l-0.8,-0.85l0.65,-0.72l0.81,-0.03l1.64,-0.8l0.23,-1.87l2.67,0.64l0.89,-0.3l1.21,0.15Z",
      name: "Guinea"
    },
    GM: {
      path: "M379.31,251.39l0.1,-0.35l2.43,-0.07l0.74,-0.61l0.51,-0.03l0.77,0.49l-1.03,-0.3l-1.87,0.9l-1.65,-0.04ZM384.03,250.91l0.91,0.05l0.75,-0.24l-0.59,0.31l-1.08,-0.13Z",
      name: "Gambia"
    },
    GL: {
      path: "M353.02,1.2l14.69,4.67l-3.68,1.89l-22.97,0.86l-0.36,0.27l0.12,0.43l1.55,1.18l8.79,-0.66l7.48,2.07l4.86,-1.77l1.66,1.73l-2.53,3.19l-0.01,0.48l0.46,0.15l6.35,-2.2l12.06,-2.31l7.24,1.13l1.09,1.99l-9.79,4.01l-1.44,1.32l-7.87,0.98l-0.35,0.41l0.38,0.38l5.07,0.24l-2.53,3.58l-2.07,3.81l0.08,6.05l2.57,3.11l-3.22,0.2l-4.12,1.66l-0.05,0.72l4.45,2.65l0.51,3.75l-2.3,0.4l-0.25,0.64l2.79,3.69l-4.82,0.31l-0.36,0.29l0.16,0.44l2.62,1.8l-0.59,1.22l-3.3,0.7l-3.45,0.01l-0.29,0.68l3.03,3.12l0.02,1.34l-4.4,-1.73l-1.72,1.35l0.15,0.66l3.31,1.15l3.13,2.71l0.81,3.16l-3.85,0.75l-4.89,-4.26l-0.47,-0.03l-0.17,0.44l0.79,2.86l-2.71,2.21l-0.13,0.44l0.37,0.27l8.73,0.34l-12.32,6.64l-7.24,1.48l-2.94,0.08l-2.69,1.75l-3.43,4.41l-5.24,2.84l-1.73,0.18l-7.12,2.1l-2.15,2.52l-0.13,2.99l-1.19,2.45l-4.01,3.09l-0.14,0.44l0.97,2.9l-2.28,6.48l-3.1,0.2l-3.83,-3.07l-4.86,-0.02l-2.25,-1.93l-1.7,-3.79l-4.3,-4.84l-1.21,-2.49l-0.44,-3.8l-3.32,-3.63l0.84,-2.86l-1.56,-1.7l2.28,-4.6l3.83,-1.74l1.03,-1.96l0.52,-3.47l-0.59,-0.41l-4.17,2.21l-2.07,0.58l-2.72,-1.28l-0.15,-2.71l0.85,-2.09l2.01,-0.06l5.06,1.2l0.46,-0.23l-0.14,-0.49l-6.54,-4.47l-2.67,0.55l-1.58,-0.86l2.56,-4.01l-0.03,-0.48l-1.5,-1.74l-4.98,-8.5l-3.13,-1.96l0.03,-1.88l-0.24,-0.37l-6.85,-3.02l-5.36,-0.38l-12.7,0.58l-2.78,-1.57l-3.66,-2.77l5.73,-1.45l5.0,-0.28l0.38,-0.38l-0.35,-0.41l-10.67,-1.38l-5.3,-2.06l0.25,-1.54l18.41,-5.26l1.22,-2.27l-0.25,-0.55l-6.14,-1.86l1.68,-1.77l8.55,-4.03l3.59,-0.63l0.3,-0.54l-0.88,-2.27l5.47,-1.47l7.65,-0.95l7.55,-0.05l3.04,1.85l6.48,-3.27l5.81,2.22l3.56,0.5l5.16,1.94l0.5,-0.21l-0.17,-0.52l-5.71,-3.13l0.28,-2.13l8.12,-3.6l8.7,0.28l3.35,-2.34l8.71,-0.6l19.93,0.8Z",
      name: "Greenland"
    },
    KW: {
      path: "M540.81,207.91l0.37,0.86l-0.17,0.76l0.6,1.53l-0.95,0.04l-0.82,-1.28l-1.57,-0.18l1.31,-1.88l1.22,0.17Z",
      name: "Kuwait"
    },
    GH: {
      path: "M420.53,257.51l-0.01,0.72l0.96,1.2l0.24,3.73l0.59,0.95l-0.51,2.1l0.19,1.41l1.02,2.21l-6.97,2.84l-1.8,-0.57l0.04,-0.89l-1.02,-2.04l0.61,-2.65l1.07,-2.32l-0.96,-6.47l5.01,0.07l0.94,-0.39l0.61,0.11Z",
      name: "Ghana"
    },
    OM: {
      path: "M568.09,230.93l-0.91,1.67l-1.22,0.04l-0.6,0.76l-0.41,1.51l0.27,1.58l-1.16,0.05l-1.56,0.97l-0.76,1.74l-1.62,0.05l-0.98,0.65l-0.17,1.15l-0.89,0.52l-1.49,-0.18l-2.4,0.94l-2.47,-5.4l7.35,-2.71l1.67,-5.23l-1.12,-2.09l0.05,-0.83l0.67,-1.0l0.07,-1.05l0.9,-0.42l-0.05,-2.07l0.7,-0.01l1.0,1.62l1.51,1.08l3.3,0.84l1.73,2.29l0.81,0.37l-1.23,2.35l-0.99,0.79Z",
      name: "Oman"
    },
    _2: {
      path: "M531.15,258.94l1.51,0.12l5.13,-0.95l5.3,-1.48l-0.01,4.4l-2.67,3.39l-1.85,0.01l-8.04,-2.94l-2.55,-3.17l1.12,-1.71l2.04,2.34Z",
      name: "Somaliland"
    },
    _1: {
      path: "M472.77,172.64l-1.08,-1.29l0.96,-0.77l0.29,-0.83l1.98,1.64l-0.36,0.67l-1.79,0.58Z",
      name: "Kosovo"
    },
    _0: {
      path: "M504.91,192.87l0.34,0.01l0.27,-0.07l-0.29,0.26l-0.31,-0.2Z",
      name: "N. Cyprus"
    },
    JO: {
      path: "M518.64,201.38l-5.14,1.56l-0.19,0.65l2.16,2.39l-0.89,1.14l-1.71,0.34l-1.71,1.8l-2.34,-0.37l1.21,-4.32l0.56,-4.07l2.8,0.94l4.46,-2.71l0.79,2.66Z",
      name: "Jordan"
    },
    HR: {
      path: "M455.59,162.84l1.09,0.07l-0.82,0.94l-0.27,-1.01ZM456.96,162.92l0.62,-0.41l1.73,0.45l0.42,-0.4l-0.01,-0.59l0.86,-0.52l0.2,-1.05l1.63,-0.68l2.57,1.68l2.07,0.6l0.87,-0.31l1.05,1.57l-0.52,0.63l-1.05,-0.56l-1.68,0.04l-2.1,-0.5l-1.29,0.06l-0.57,0.49l-0.59,-0.47l-0.62,0.16l-0.46,1.7l1.79,2.42l2.79,2.75l-1.18,-0.87l-2.21,-0.87l-1.67,-1.78l0.13,-0.63l-1.05,-1.19l-0.32,-1.27l-1.42,-0.43Z",
      name: "Croatia"
    },
    HT: {
      path: "M237.05,238.38l-1.16,0.43l-0.91,-0.55l0.05,-0.2l2.02,0.31ZM237.53,238.43l1.06,0.12l-0.05,0.01l-1.01,-0.12ZM239.25,238.45l0.79,-0.51l0.06,-0.62l-1.02,-1.0l0.02,-0.82l-0.3,-0.4l-0.93,-0.32l3.16,0.45l0.02,1.84l-0.48,0.34l-0.08,0.58l0.54,0.72l-1.78,-0.26Z",
      name: "Haiti"
    },
    HU: {
      path: "M462.08,157.89l0.65,-1.59l-0.09,-0.44l0.64,-0.0l0.39,-0.34l0.1,-0.69l1.75,0.87l2.32,-0.37l0.43,-0.66l3.49,-0.78l0.69,-0.78l0.57,-0.14l2.57,0.93l0.67,-0.23l1.03,0.65l0.08,0.37l-1.42,0.71l-2.59,4.14l-1.8,0.53l-1.68,-0.1l-2.74,1.23l-1.85,-0.54l-2.54,-1.66l-0.66,-1.1Z",
      name: "Hungary"
    },
    HN: {
      path: "M199.6,249.52l-1.7,-1.21l0.06,-0.94l3.04,-2.14l2.37,0.28l1.27,-0.09l1.1,-0.52l1.3,0.28l1.14,-0.25l1.38,0.37l2.23,1.37l-2.36,0.93l-1.23,-0.39l-0.88,1.3l-1.28,0.99l-0.98,-0.22l-0.42,0.52l-0.96,0.05l-0.36,0.41l0.04,0.88l-0.52,0.6l-0.3,0.04l-0.3,-0.55l-0.66,-0.31l0.11,-0.67l-0.48,-0.65l-0.87,-0.26l-0.73,0.2Z",
      name: "Honduras"
    },
    PR: {
      path: "M256.17,238.73l-0.26,0.27l-2.83,0.05l-0.07,-0.55l1.95,-0.1l1.22,0.33Z",
      name: "Puerto Rico"
    },
    PS: {
      path: "M509.21,203.07l0.1,-0.06l-0.02,0.03l-0.09,0.03ZM509.36,202.91l-0.02,-0.63l-0.33,-0.16l0.31,-1.09l0.24,0.1l-0.2,1.78Z",
      name: "Palestine"
    },
    PT: {
      path: "M401.84,187.38l-0.64,0.47l-1.13,-0.35l-0.91,0.17l0.28,-1.78l-0.24,-1.78l-1.25,-0.56l-0.45,-0.84l0.17,-1.66l1.01,-1.18l0.69,-2.92l-0.04,-1.39l-0.59,-1.9l1.3,-0.85l0.84,1.35l3.1,-0.3l0.46,0.99l-1.05,0.94l-0.03,2.16l-0.41,0.57l-0.08,1.1l-0.79,0.18l-0.26,0.59l0.91,1.6l-0.63,1.75l0.76,1.09l-1.1,1.52l0.07,1.05Z",
      name: "Portugal"
    },
    PY: {
      path: "M274.9,336.12l0.74,1.52l-0.16,3.45l0.32,0.41l2.64,0.5l1.11,-0.47l1.4,0.59l0.36,0.6l0.53,3.42l1.27,0.4l0.98,-0.38l0.51,0.27l-0.0,1.18l-1.21,5.32l-2.09,1.9l-1.8,0.4l-4.71,-0.98l2.2,-3.63l-0.32,-1.5l-2.78,-1.28l-3.03,-1.94l-2.07,-0.44l-4.34,-4.06l0.91,-2.9l0.08,-1.42l1.07,-2.04l4.13,-0.72l2.18,0.03l2.05,1.17l0.03,0.59Z",
      name: "Paraguay"
    },
    PA: {
      path: "M213.8,263.68l0.26,-1.52l-0.36,-0.26l-0.01,-0.49l0.44,-0.1l0.93,1.4l1.26,0.03l0.77,0.49l1.38,-0.23l2.51,-1.11l0.86,-0.72l3.45,0.85l1.4,1.18l0.41,1.74l-0.21,0.34l-0.53,-0.12l-0.47,0.29l-0.16,0.6l-0.68,-1.28l0.45,-0.49l-0.19,-0.66l-0.47,-0.13l-0.54,-0.84l-1.5,-0.75l-1.1,0.16l-0.75,0.99l-1.62,0.84l-0.18,0.96l0.85,0.97l-0.58,0.45l-0.69,0.08l-0.34,-1.18l-1.27,0.03l-0.71,-1.05l-2.59,-0.46Z",
      name: "Panama"
    },
    PG: {
      path: "M808.58,298.86l2.54,2.56l-0.13,0.26l-0.33,0.12l-0.87,-0.78l-1.22,-2.16ZM801.41,293.04l0.5,0.29l0.26,0.27l-0.49,-0.35l-0.27,-0.21ZM803.17,294.58l0.59,0.5l0.08,1.06l-0.29,-0.91l-0.38,-0.65ZM796.68,298.41l0.52,0.75l1.43,-0.19l2.27,-1.81l-0.01,-1.43l1.12,0.16l-0.04,1.1l-0.7,1.28l-1.12,0.18l-0.62,0.79l-2.46,1.11l-1.17,-0.0l-3.08,-1.25l3.41,0.0l0.45,-0.68ZM789.15,303.55l2.31,1.8l1.59,2.61l1.34,0.13l-0.06,0.66l0.31,0.43l1.06,0.24l0.06,0.65l2.25,1.05l-1.22,0.13l-0.72,-0.63l-4.56,-0.65l-3.22,-2.87l-1.49,-2.34l-3.27,-1.1l-2.38,0.72l-1.59,0.86l-0.2,0.42l0.27,1.55l-1.55,0.68l-1.36,-0.4l-2.21,-0.09l-0.08,-15.41l8.39,2.93l2.95,2.4l0.6,1.64l4.02,1.49l0.31,0.68l-1.76,0.21l-0.33,0.52l0.55,1.68Z",
      name: "Papua New Guinea"
    },
    PE: {
      path: "M244.96,295.21l-1.26,-0.07l-0.57,0.42l-1.93,0.45l-2.98,1.75l-0.36,1.36l-0.58,0.8l0.12,1.37l-1.24,0.59l-0.22,1.22l-0.62,0.84l1.04,2.27l1.28,1.44l-0.41,0.84l0.32,0.57l1.48,0.13l1.16,1.37l2.21,0.07l1.63,-1.08l-0.13,3.02l0.3,0.4l1.14,0.29l1.31,-0.34l1.9,3.59l-0.48,0.85l-0.17,3.85l-0.94,1.59l0.35,0.75l-0.47,1.07l0.98,1.97l-2.1,3.82l-0.98,0.5l-2.17,-1.28l-0.39,-1.16l-4.95,-2.58l-4.46,-2.79l-1.84,-1.51l-0.91,-1.84l0.3,-0.96l-2.11,-3.33l-4.82,-9.68l-1.04,-1.2l-0.87,-1.94l-3.4,-2.48l0.58,-1.18l-1.13,-2.23l0.66,-1.49l1.45,-1.15l-0.6,0.98l0.07,0.92l0.47,0.36l1.74,0.03l0.97,1.17l0.54,0.07l1.42,-1.03l0.6,-1.84l1.42,-2.02l3.04,-1.04l2.73,-2.62l0.86,-1.74l-0.1,-1.87l1.44,1.02l0.9,1.25l1.06,0.59l1.7,2.73l1.86,0.31l1.45,-0.61l0.96,0.39l1.36,-0.19l1.45,0.89l-1.4,2.21l0.31,0.61l0.59,0.05l0.47,0.5Z",
      name: "Peru"
    },
    PK: {
      path: "M615.09,192.34l-1.83,1.81l-2.6,0.39l-3.73,-0.68l-1.58,1.33l-0.09,0.42l1.77,4.39l1.7,1.23l-1.69,1.27l-0.12,2.14l-2.33,2.64l-1.6,2.8l-2.46,2.67l-3.03,-0.07l-2.76,2.83l0.05,0.6l1.5,1.11l0.26,1.9l1.44,1.5l0.37,1.68l-5.01,-0.01l-1.78,1.7l-1.42,-0.52l-0.76,-1.87l-2.27,-2.15l-11.61,0.86l0.71,-2.34l3.43,-1.32l0.25,-0.44l-0.21,-1.24l-1.2,-0.65l-0.28,-2.46l-2.29,-1.14l-1.28,-1.94l2.82,0.94l2.62,-0.38l1.42,0.33l0.76,-0.56l1.71,0.19l3.25,-1.14l0.27,-0.36l0.08,-2.19l1.18,-1.32l1.68,0.0l0.58,-0.82l1.6,-0.3l1.19,0.16l0.98,-0.78l0.02,-1.88l0.93,-1.47l1.48,-0.66l0.19,-0.55l-0.66,-1.25l2.04,-0.11l0.69,-1.01l-0.02,-1.16l1.11,-1.06l-0.17,-1.78l-0.49,-1.03l1.15,-0.98l5.42,-0.91l2.6,-0.82l1.6,1.16l0.97,2.34l3.45,0.97Z",
      name: "Pakistan"
    },
    PH: {
      path: "M737.01,263.84l0.39,2.97l-0.44,1.18l-0.55,-1.53l-0.67,-0.14l-1.17,1.28l0.65,2.09l-0.42,0.69l-2.48,-1.23l-0.57,-1.49l0.65,-1.03l-0.1,-0.54l-1.59,-1.19l-0.56,0.08l-0.65,0.87l-1.23,0.0l-1.58,0.97l0.83,-1.8l2.56,-1.42l0.65,0.84l0.45,0.13l1.9,-0.69l0.56,-1.11l1.5,-0.06l0.38,-0.43l-0.09,-1.19l1.21,0.71l0.36,2.02ZM733.59,256.58l0.05,0.75l0.08,0.26l-0.8,-0.42l-0.18,-0.71l0.85,0.12ZM734.08,256.1l-0.12,-1.12l-1.0,-1.27l1.36,0.03l0.53,0.73l0.51,2.04l-1.27,-0.4ZM733.76,257.68l0.38,0.98l-0.32,0.15l-0.07,-1.13ZM724.65,238.43l1.46,0.7l0.72,-0.31l-0.32,1.17l0.79,1.71l-0.57,1.84l-1.53,1.04l-0.39,2.25l0.56,2.04l1.63,0.57l1.16,-0.27l2.71,1.23l-0.19,1.08l0.76,0.84l-0.08,0.36l-1.4,-0.9l-0.88,-1.27l-0.66,0.0l-0.38,0.55l-1.6,-1.31l-2.15,0.36l-0.87,-0.39l0.07,-0.61l0.66,-0.55l-0.01,-0.62l-0.75,-0.59l-0.72,0.44l-0.74,-0.87l-0.39,-2.49l0.32,0.27l0.66,-0.28l0.26,-3.97l0.7,-2.02l1.14,0.0ZM731.03,258.87l-0.88,0.85l-1.19,1.94l-1.05,-1.19l0.93,-1.1l0.32,-1.47l0.52,-0.06l-0.27,1.15l0.22,0.45l0.49,-0.12l1.0,-1.32l-0.08,0.85ZM726.83,255.78l0.83,0.38l1.17,-0.0l-0.02,0.48l-2.0,1.4l0.03,-2.26ZM724.81,252.09l-0.38,1.27l-1.42,-1.95l1.2,0.05l0.6,0.63ZM716.55,261.82l1.1,-0.95l0.03,-0.03l-0.28,0.36l-0.85,0.61ZM719.22,259.06l0.04,-0.06l0.8,-1.53l0.16,0.75l-1.0,0.84Z",
      name: "Philippines"
    },
    PL: {
      path: "M468.44,149.42l-1.11,-1.54l-1.86,-0.33l-0.48,-1.05l-1.72,-0.37l-0.65,0.69l-0.72,-0.36l0.11,-0.61l-0.33,-0.46l-1.75,-0.27l-1.04,-0.93l-0.94,-1.94l0.16,-1.22l-0.62,-1.8l-0.78,-1.07l0.57,-1.04l-0.48,-1.43l1.41,-0.83l6.91,-2.71l2.14,0.5l0.52,0.91l5.51,0.44l4.55,-0.05l1.07,0.31l0.48,0.84l0.15,1.58l0.65,1.2l-0.01,0.99l-1.27,0.58l-0.19,0.54l0.73,1.48l0.08,1.55l1.2,2.76l-0.17,0.58l-1.23,0.44l-2.27,2.72l0.18,0.95l-1.97,-1.03l-1.98,0.4l-1.36,-0.28l-1.24,0.58l-1.07,-0.97l-1.16,0.24Z",
      name: "Poland"
    },
    ZM: {
      path: "M481.47,313.3l0.39,0.31l2.52,0.14l0.99,1.17l2.01,0.35l1.4,-0.64l0.69,1.17l1.78,0.33l1.84,2.35l2.23,0.18l0.4,-0.43l-0.21,-2.74l-0.62,-0.3l-0.48,0.32l-1.98,-1.17l0.72,-5.29l-0.51,-1.18l0.57,-1.3l3.68,-0.62l0.26,0.63l1.21,0.63l0.9,-0.22l2.16,0.67l1.33,0.71l1.07,1.02l0.56,1.87l-0.88,2.7l0.43,2.09l-0.73,0.87l-0.76,2.37l0.59,0.68l-6.6,1.83l-0.29,0.44l0.19,1.45l-1.68,0.35l-1.43,1.02l-0.38,0.87l-0.87,0.26l-3.48,3.69l-4.16,-0.53l-1.52,-1.0l-1.77,-0.13l-1.83,0.52l-3.04,-3.4l0.11,-7.59l4.82,0.03l0.39,-0.49l-0.18,-0.76l0.33,-0.83l-0.4,-1.36l0.24,-1.05Z",
      name: "Zambia"
    },
    EH: {
      path: "M384.42,230.28l0.25,-0.79l1.06,-1.29l0.8,-3.51l3.38,-2.78l0.7,-1.81l0.06,4.84l-1.98,0.2l-0.94,1.59l0.39,3.56l-3.7,-0.01ZM392.01,218.1l0.7,-1.8l1.77,-0.24l2.09,0.34l0.95,-0.62l1.28,-0.07l-0.0,2.51l-6.79,-0.12Z",
      name: "W. Sahara"
    },
    EE: {
      path: "M485.71,115.04l2.64,0.6l2.56,0.11l-1.6,1.91l0.61,3.54l-0.81,0.87l-1.78,-0.01l-3.22,-1.76l-1.8,0.45l0.21,-1.53l-0.58,-0.41l-0.69,0.34l-1.26,-1.03l-0.17,-1.63l2.83,-0.92l3.05,-0.52Z",
      name: "Estonia"
    },
    EG: {
      path: "M492.06,205.03l1.46,0.42l2.95,-1.64l2.04,-0.21l1.53,0.3l0.59,1.19l0.69,0.04l0.41,-0.64l1.81,0.58l1.95,0.16l1.04,-0.51l1.42,4.08l-2.03,4.54l-1.66,-1.77l-1.76,-3.85l-0.64,-0.12l-0.36,0.67l1.04,2.88l3.44,6.95l1.78,3.04l2.03,2.65l-0.36,0.53l0.23,2.01l2.7,2.19l-28.41,0.0l0.0,-18.96l-0.73,-2.2l0.59,-1.56l-0.32,-1.26l0.68,-0.99l3.06,-0.04l4.82,1.52Z",
      name: "Egypt"
    },
    ZA: {
      path: "M467.14,373.21l-0.13,-1.96l-0.68,-1.56l0.7,-0.68l-0.13,-2.33l-4.56,-8.19l0.77,-0.86l0.6,0.45l0.69,1.31l2.83,0.72l1.5,-0.26l2.24,-1.39l0.19,-9.55l1.35,2.3l-0.21,1.5l0.61,1.2l0.4,0.19l1.79,-0.27l2.6,-2.07l0.69,-1.32l0.96,-0.48l2.19,1.04l2.04,0.13l1.77,-0.65l0.85,-2.12l1.38,-0.33l1.59,-2.76l2.15,-1.89l3.41,-1.87l2.0,0.45l1.02,-0.28l0.99,0.2l1.75,5.29l-0.38,3.25l-0.81,-0.23l-1.0,0.46l-0.87,1.68l-0.05,1.16l1.97,1.84l1.47,-0.29l0.69,-1.18l1.09,0.01l-0.76,3.69l-0.58,1.09l-2.2,1.79l-3.17,4.76l-2.8,2.83l-3.57,2.88l-2.53,1.05l-1.22,0.14l-0.51,0.7l-1.18,-0.32l-1.39,0.5l-2.59,-0.52l-1.61,0.33l-1.18,-0.11l-2.55,1.1l-2.1,0.44l-1.6,1.07l-0.85,0.05l-0.93,-0.89l-0.93,-0.15l-0.97,-1.13l-0.25,0.05ZM491.45,364.19l0.62,-0.93l1.48,-0.59l1.18,-2.19l-0.07,-0.49l-1.99,-1.69l-1.66,0.56l-1.43,1.14l-1.34,1.73l0.02,0.51l1.88,2.11l1.31,-0.16Z",
      name: "South Africa"
    },
    EC: {
      path: "M231.86,285.53l0.29,1.59l-0.69,1.45l-2.61,2.51l-3.13,1.11l-1.53,2.18l-0.49,1.68l-1.0,0.73l-1.02,-1.11l-1.78,-0.16l0.67,-1.15l-0.24,-0.86l1.25,-2.13l-0.54,-1.09l-0.67,-0.08l-0.72,0.87l-0.87,-0.64l0.35,-0.69l-0.36,-1.96l0.81,-0.51l0.45,-1.51l0.92,-1.57l-0.07,-0.97l2.65,-1.33l2.75,1.35l0.77,1.05l2.12,0.35l0.76,-0.32l1.96,1.21Z",
      name: "Ecuador"
    },
    AL: {
      path: "M470.32,171.8l0.74,0.03l0.92,0.89l-0.17,1.95l0.36,1.28l1.01,0.82l-1.82,2.83l-0.19,-0.61l-1.25,-0.89l-0.18,-1.2l0.53,-2.82l-0.54,-1.47l0.6,-0.83Z",
      name: "Albania"
    },
    AO: {
      path: "M461.55,300.03l1.26,3.15l1.94,2.36l2.47,-0.53l1.25,0.32l0.44,-0.18l0.93,-1.92l1.31,-0.08l0.41,-0.44l0.47,-0.0l-0.1,0.41l0.39,0.49l2.65,-0.02l0.03,1.19l0.48,1.01l-0.34,1.52l0.18,1.55l0.83,1.04l-0.13,2.85l0.54,0.39l3.96,-0.41l-0.1,1.79l0.39,1.05l-0.24,1.43l-4.7,-0.03l-0.4,0.39l-0.12,8.13l2.92,3.49l-3.83,0.88l-5.89,-0.36l-1.88,-1.24l-10.47,0.22l-1.3,-1.01l-1.85,-0.16l-2.4,0.77l-0.15,-1.06l0.33,-2.16l1.0,-3.45l1.35,-3.2l2.24,-2.8l0.33,-2.06l-0.13,-1.53l-0.8,-1.08l-1.21,-2.87l0.87,-1.62l-1.27,-4.12l-1.17,-1.53l2.47,-0.63l7.03,0.03ZM451.71,298.87l-0.47,-1.25l1.25,-1.11l0.32,0.3l-0.99,1.03l-0.12,1.03Z",
      name: "Angola"
    },
    KZ: {
      path: "M552.8,172.89l0.46,-1.27l-0.48,-1.05l-2.96,-1.19l-1.06,-2.58l-1.37,-0.87l-0.03,-0.3l1.95,0.23l0.45,-0.38l0.08,-1.96l1.75,-0.41l2.1,0.45l0.48,-0.33l0.45,-3.04l-0.45,-2.09l-0.41,-0.31l-2.42,0.15l-2.36,-0.73l-2.87,1.37l-2.17,0.61l-0.85,-0.34l0.13,-1.61l-1.6,-2.12l-2.02,-0.08l-1.78,-1.82l1.29,-2.18l-0.57,-0.95l1.62,-2.91l2.21,1.63l0.63,-0.27l0.29,-2.22l4.92,-3.43l3.71,-0.08l8.4,3.6l2.92,-1.36l3.77,-0.06l3.11,1.66l0.51,-0.11l0.6,-0.81l3.31,0.13l0.39,-0.25l0.63,-1.57l-0.17,-0.5l-3.5,-1.98l1.87,-1.27l-0.13,-1.03l1.98,-0.72l0.18,-0.62l-1.59,-2.06l0.81,-0.82l9.23,-1.18l1.33,-0.88l6.18,-1.26l2.26,-1.42l4.08,0.68l0.73,3.33l0.51,0.3l2.48,-0.8l2.79,1.02l-0.17,1.56l0.43,0.44l2.55,-0.24l4.89,-2.53l0.03,0.32l3.15,2.61l5.56,8.47l0.65,0.02l1.12,-1.46l3.15,1.74l3.76,-0.78l1.15,0.49l1.14,1.8l1.84,0.76l0.99,1.29l3.35,-0.25l1.02,1.52l-1.6,1.81l-1.93,0.28l-0.34,0.38l-0.11,3.05l-1.13,1.16l-4.75,-1.0l-0.46,0.27l-1.76,5.47l-1.1,0.59l-4.91,1.23l-0.27,0.54l2.1,4.97l-1.37,0.63l-0.23,0.41l0.13,1.13l-0.88,-0.25l-1.42,-1.13l-7.89,-0.4l-0.92,0.31l-3.73,-1.22l-1.42,0.63l-0.53,1.66l-3.72,-0.94l-1.85,0.43l-0.76,1.4l-4.65,2.62l-1.13,2.08l-0.44,0.01l-0.92,-1.4l-2.87,-0.09l-0.45,-2.14l-0.38,-0.32l-0.8,-0.01l0.0,-2.96l-3.0,-2.22l-7.31,0.58l-2.35,-2.68l-6.71,-3.69l-6.45,1.83l-0.29,0.39l0.1,10.85l-0.7,0.08l-1.62,-2.17l-1.83,-0.96l-3.11,0.59l-0.64,0.51Z",
      name: "Kazakhstan"
    },
    ET: {
      path: "M516.04,247.79l1.1,0.84l1.63,-0.45l0.68,0.47l1.63,0.03l2.01,0.94l1.73,1.66l1.64,2.07l-1.52,2.04l0.16,1.72l0.39,0.38l2.05,0.0l-0.36,1.03l2.86,3.58l8.32,3.08l1.31,0.02l-6.32,6.75l-3.1,0.11l-2.36,1.77l-1.47,0.04l-0.86,0.79l-1.38,-0.0l-1.32,-0.81l-2.29,1.05l-0.76,0.98l-3.29,-0.41l-3.07,-2.07l-1.8,-0.07l-0.62,-0.6l0.0,-1.24l-0.28,-0.38l-1.15,-0.37l-1.4,-2.59l-1.19,-0.68l-0.47,-1.0l-1.27,-1.23l-1.16,-0.22l0.43,-0.72l1.45,-0.28l0.41,-0.95l-0.03,-2.21l0.68,-2.44l1.05,-0.63l1.43,-3.06l1.57,-1.37l1.02,-2.51l0.35,-1.88l2.52,0.46l0.44,-0.24l0.58,-1.43Z",
      name: "Ethiopia"
    },
    ZW: {
      path: "M498.91,341.09l-1.11,-0.22l-0.92,0.28l-2.09,-0.44l-1.5,-1.11l-1.89,-0.43l-0.62,-1.4l-0.01,-0.84l-0.3,-0.38l-0.97,-0.25l-2.71,-2.74l-1.92,-3.32l3.83,0.45l3.73,-3.82l1.08,-0.44l0.26,-0.77l1.25,-0.9l1.41,-0.26l0.5,0.89l1.99,-0.05l1.72,1.17l1.11,0.17l1.05,0.66l0.01,2.99l-0.59,3.76l0.38,0.86l-0.23,1.23l-0.39,0.35l-0.63,1.81l-2.43,2.75Z",
      name: "Zimbabwe"
    },
    ES: {
      path: "M416.0,169.21l1.07,1.17l4.61,1.38l1.06,-0.57l2.6,1.26l2.71,-0.3l0.09,1.12l-2.14,1.8l-3.11,0.61l-0.31,0.31l-0.2,0.89l-1.54,1.69l-0.97,2.4l0.84,1.74l-1.32,1.27l-0.48,1.68l-1.88,0.65l-1.66,2.07l-5.36,-0.01l-1.79,1.08l-0.89,0.98l-0.88,-0.17l-0.79,-0.82l-0.68,-1.59l-2.37,-0.63l-0.11,-0.5l1.21,-1.82l-0.77,-1.13l0.61,-1.68l-0.76,-1.62l0.87,-0.49l0.09,-1.25l0.42,-0.6l0.03,-2.11l0.99,-0.69l0.13,-0.5l-1.03,-1.73l-1.46,-0.11l-0.61,0.38l-1.06,0.0l-0.52,-1.23l-0.53,-0.21l-1.32,0.67l-0.01,-1.49l-0.75,-0.96l3.03,-1.88l2.99,0.53l3.32,-0.02l2.63,0.51l6.01,-0.06Z",
      name: "Spain"
    },
    ER: {
      path: "M520.38,246.23l3.42,2.43l3.5,3.77l0.84,0.54l-0.95,-0.01l-3.51,-3.89l-2.33,-1.15l-1.73,-0.07l-0.91,-0.51l-1.26,0.51l-1.34,-1.02l-0.61,0.17l-0.66,1.61l-2.35,-0.43l-0.17,-0.67l1.29,-5.29l0.61,-0.61l1.95,-0.53l0.87,-1.01l1.17,2.41l0.68,2.33l1.49,1.43Z",
      name: "Eritrea"
    },
    ME: {
      path: "M468.91,172.53l-1.22,-1.02l0.47,-1.81l0.89,-0.72l2.26,1.51l-0.5,0.57l-0.75,-0.27l-1.14,1.73Z",
      name: "Montenegro"
    },
    MD: {
      path: "M488.41,153.73l1.4,-0.27l1.72,0.93l1.07,0.15l0.85,0.65l-0.14,0.84l0.96,0.85l1.12,2.47l-1.15,-0.07l-0.66,-0.41l-0.52,0.25l-0.09,0.86l-1.08,1.89l-0.27,-0.86l0.25,-1.34l-0.16,-1.6l-3.29,-4.34Z",
      name: "Moldova"
    },
    MG: {
      path: "M545.91,319.14l0.4,3.03l0.62,1.21l-0.21,1.02l-0.57,-0.8l-0.69,-0.01l-0.47,0.76l0.41,2.12l-0.18,0.87l-0.73,0.78l-0.15,2.14l-4.71,15.2l-1.06,2.88l-3.92,1.64l-3.12,-1.49l-0.6,-1.21l-0.19,-2.4l-0.86,-2.05l-0.21,-1.77l0.38,-1.62l1.21,-0.75l0.01,-0.76l1.19,-2.04l0.23,-1.66l-1.06,-2.99l-0.19,-2.21l0.81,-1.33l0.32,-1.46l4.63,-1.22l3.44,-3.0l0.85,-1.4l-0.08,-0.7l0.78,-0.04l1.38,-1.77l0.13,-1.64l0.45,-0.61l1.16,1.69l0.59,1.6Z",
      name: "Madagascar"
    },
    MA: {
      path: "M378.78,230.02l0.06,-0.59l0.92,-0.73l0.82,-1.37l-0.09,-1.04l0.79,-1.7l1.31,-1.58l0.96,-0.59l0.66,-1.55l0.09,-1.47l0.81,-1.48l1.72,-1.07l1.55,-2.69l1.16,-0.96l2.44,-0.39l1.94,-1.82l1.31,-0.78l2.09,-2.28l-0.51,-3.65l1.24,-3.7l1.5,-1.75l4.46,-2.57l2.37,-4.47l1.44,0.01l1.68,1.21l2.32,-0.19l3.47,0.65l0.8,1.54l0.16,1.71l0.86,2.96l0.56,0.59l-0.26,0.61l-3.05,0.44l-1.26,1.05l-1.33,0.22l-0.33,0.37l-0.09,1.78l-2.68,1.0l-1.07,1.42l-4.47,1.13l-4.04,2.01l-0.54,4.64l-1.15,0.06l-0.92,0.61l-1.96,-0.35l-2.42,0.54l-0.74,1.9l-0.86,0.4l-1.14,3.26l-3.53,3.01l-0.8,3.55l-0.96,1.1l-0.29,0.82l-4.95,0.18Z",
      name: "Morocco"
    },
    UZ: {
      path: "M598.64,172.75l-1.63,1.52l0.06,0.64l1.85,1.12l1.97,-0.64l2.21,1.17l-2.52,1.68l-2.59,-0.22l-0.18,-0.41l0.46,-1.23l-0.45,-0.53l-3.35,0.69l-2.1,3.51l-1.87,-0.12l-1.03,1.51l0.22,0.55l1.64,0.62l0.46,1.83l-1.19,2.49l-2.66,-0.53l0.05,-1.36l-0.26,-0.39l-3.3,-1.23l-2.56,-1.4l-4.4,-3.34l-1.34,-3.14l-1.08,-0.6l-2.58,0.13l-0.69,-0.44l-0.47,-2.52l-3.37,-1.6l-0.43,0.05l-2.07,1.72l-2.1,1.01l-0.21,0.47l0.28,1.01l-1.91,0.03l-0.09,-10.5l5.99,-1.7l6.19,3.54l2.71,2.84l7.05,-0.67l2.71,2.01l-0.17,2.81l0.39,0.42l0.9,0.02l0.44,2.14l0.38,0.32l2.94,0.09l0.95,1.42l1.28,-0.24l1.05,-2.04l4.43,-2.5Z",
      name: "Uzbekistan"
    },
    MM: {
      path: "M673.9,230.21l-1.97,1.57l-0.57,0.96l-1.4,0.6l-1.36,1.05l-1.99,0.36l-1.08,2.66l-0.91,0.4l-0.19,0.55l1.21,2.27l2.52,3.43l-0.79,1.91l-0.74,0.41l-0.17,0.52l0.65,1.37l1.61,1.95l0.25,2.58l0.9,2.13l-1.92,3.57l0.68,-2.25l-0.81,-1.74l0.19,-2.65l-1.05,-1.53l-1.24,-6.17l-1.12,-2.26l-0.6,-0.13l-4.34,3.02l-2.39,-0.65l0.77,-2.84l-0.52,-2.61l-1.91,-2.96l0.25,-0.75l-0.29,-0.51l-1.33,-0.3l-1.61,-1.93l-0.1,-1.3l0.82,-0.24l0.04,-1.64l1.02,-0.52l0.21,-0.45l-0.23,-0.95l0.54,-0.96l0.08,-2.22l1.46,0.45l0.47,-0.2l1.12,-2.19l0.16,-1.35l1.33,-2.16l-0.0,-1.52l2.89,-1.66l1.63,0.44l0.5,-0.44l-0.17,-1.4l0.64,-0.36l0.08,-1.04l0.77,-0.11l0.71,1.35l1.06,0.69l-0.03,3.86l-2.38,2.37l-0.3,3.15l0.46,0.43l2.28,-0.38l0.51,2.08l1.47,0.67l-0.6,1.8l0.19,0.48l2.97,1.48l1.64,-0.55l0.02,0.32Z",
      name: "Myanmar"
    },
    ML: {
      path: "M392.61,254.08l-0.19,-2.37l-0.99,-0.87l-0.44,-1.3l-0.09,-1.28l0.81,-0.58l0.35,-1.24l2.37,0.65l1.31,-0.47l0.86,0.15l0.66,-0.56l9.83,-0.04l0.38,-0.28l0.56,-1.8l-0.44,-0.65l-2.35,-21.95l3.27,-0.04l16.7,11.38l0.74,1.31l2.5,1.09l0.02,1.38l0.44,0.39l2.34,-0.21l0.01,5.38l-1.28,1.61l-0.26,1.49l-5.31,0.57l-1.07,0.92l-2.9,0.1l-0.86,-0.48l-1.38,0.36l-2.4,1.08l-0.6,0.87l-1.85,1.09l-0.43,0.7l-0.79,0.39l-1.44,-0.21l-0.81,0.84l-0.34,1.64l-1.91,2.02l-0.06,1.03l-0.67,1.22l0.13,1.16l-0.97,0.39l-0.23,-0.64l-0.52,-0.24l-1.35,0.4l-0.34,0.55l-2.69,-0.28l-0.37,-0.35l-0.02,-0.9l-0.65,-0.35l0.45,-0.64l-0.03,-0.53l-2.12,-2.44l-0.76,-0.01l-2.0,1.16l-0.78,-0.15l-0.8,-0.67l-1.21,0.23Z",
      name: "Mali"
    },
    MN: {
      path: "M676.61,146.48l3.81,1.68l5.67,-1.0l2.37,0.41l2.34,1.5l1.79,1.75l2.29,-0.03l3.12,0.52l2.47,-0.81l3.41,-0.59l3.53,-2.21l1.25,0.29l1.53,1.13l2.27,-0.21l-2.66,5.01l0.64,1.68l0.47,0.21l1.32,-0.38l2.38,0.48l2.02,-1.11l1.76,0.89l2.06,2.02l-0.13,0.53l-1.72,-0.29l-3.77,0.46l-1.88,0.99l-1.76,1.99l-3.71,1.17l-2.45,1.6l-3.83,-0.87l-0.41,0.17l-1.31,1.99l1.04,2.24l-1.52,0.9l-1.74,1.57l-2.79,1.02l-3.78,0.13l-4.05,1.05l-2.77,1.52l-1.16,-0.85l-2.94,0.0l-3.62,-1.79l-2.58,-0.49l-3.4,0.41l-5.12,-0.67l-2.63,0.06l-1.31,-1.6l-1.4,-3.0l-1.48,-0.33l-3.13,-1.94l-6.16,-0.93l-0.71,-1.06l0.86,-3.82l-1.93,-2.71l-3.5,-1.18l-1.95,-1.58l-0.5,-1.72l2.34,-0.52l4.75,-2.8l3.62,-1.47l2.18,0.97l2.46,0.05l1.81,1.53l2.46,0.12l3.95,0.71l2.43,-2.28l0.08,-0.48l-0.9,-1.72l2.24,-2.98l2.62,1.27l4.94,1.17l0.43,2.24Z",
      name: "Mongolia"
    },
    MK: {
      path: "M472.8,173.98l0.49,-0.71l3.57,-0.71l1.0,0.77l0.13,1.45l-0.65,0.53l-1.15,-0.05l-1.12,0.67l-1.39,0.22l-0.79,-0.55l-0.29,-1.03l0.19,-0.6Z",
      name: "Macedonia"
    },
    MW: {
      path: "M505.5,309.31l0.85,1.95l0.15,2.86l-0.69,1.65l0.71,1.8l0.06,1.28l0.49,0.64l0.07,1.06l0.4,0.55l0.8,-0.23l0.55,0.61l0.69,-0.21l0.34,0.6l0.19,2.94l-1.04,0.62l-0.54,1.25l-1.11,-1.08l-0.16,-1.56l0.51,-1.31l-0.32,-1.3l-0.99,-0.65l-0.82,0.12l-2.36,-1.64l0.63,-1.96l0.82,-1.18l-0.46,-2.01l0.9,-2.86l-0.94,-2.51l0.96,0.18l0.29,0.4Z",
      name: "Malawi"
    },
    MR: {
      path: "M407.36,220.66l-2.58,0.03l-0.39,0.44l2.42,22.56l0.36,0.43l-0.39,1.24l-9.75,0.04l-0.56,0.53l-0.91,-0.11l-1.27,0.45l-1.61,-0.66l-0.97,0.03l-0.36,0.29l-0.38,1.35l-0.42,0.23l-2.93,-3.4l-2.96,-1.52l-1.62,-0.03l-1.27,0.54l-1.12,-0.2l-0.65,0.4l-0.08,-0.49l0.68,-1.29l0.31,-2.43l-0.57,-3.91l0.23,-1.21l-0.69,-1.5l-1.15,-1.02l0.25,-0.39l9.58,0.02l0.4,-0.45l-0.46,-3.68l0.47,-1.04l2.12,-0.21l0.36,-0.4l-0.08,-6.4l7.81,0.13l0.41,-0.4l0.01,-3.31l7.76,5.35Z",
      name: "Mauritania"
    },
    UG: {
      path: "M498.55,276.32l0.7,-0.46l1.65,0.5l1.96,-0.57l1.7,0.01l1.45,-0.98l0.91,1.33l1.33,3.95l-2.57,4.03l-1.46,-0.4l-2.54,0.91l-1.37,1.61l-0.01,0.81l-2.42,-0.01l-2.26,1.01l-0.17,-1.59l0.58,-1.04l0.14,-1.94l1.37,-2.28l1.78,-1.58l-0.17,-0.65l-0.72,-0.24l0.13,-2.43Z",
      name: "Uganda"
    },
    MY: {
      path: "M717.47,273.46l-1.39,0.65l-2.12,-0.41l-2.88,-0.0l-0.38,0.28l-0.84,2.75l-0.99,0.96l-1.21,3.29l-1.73,0.45l-2.45,-0.68l-1.39,0.31l-1.33,1.15l-1.59,-0.14l-1.41,0.44l-1.44,-1.19l-0.18,-0.73l1.34,0.53l1.93,-0.47l0.75,-2.22l4.02,-1.03l2.75,-3.21l0.82,0.94l0.64,-0.05l0.4,-0.65l0.96,0.06l0.42,-0.36l0.24,-2.68l1.81,-1.64l1.21,-1.86l0.63,-0.01l1.07,1.05l0.34,1.28l3.44,1.35l-0.06,0.35l-1.37,0.1l-0.35,0.54l0.32,0.88ZM673.68,269.59l0.17,1.09l0.47,0.33l1.65,-0.3l0.87,-0.94l1.61,1.52l0.98,1.56l-0.12,2.81l0.41,2.29l0.95,0.9l0.88,2.44l-1.27,0.12l-5.1,-3.67l-0.34,-1.29l-1.37,-1.59l-0.33,-1.97l-0.88,-1.4l0.25,-1.68l-0.46,-1.05l1.63,0.84Z",
      name: "Malaysia"
    },
    MX: {
      path: "M133.12,200.41l0.2,0.47l9.63,3.33l6.96,-0.02l0.4,-0.4l0.0,-0.74l3.77,0.0l3.55,2.93l1.39,2.83l1.52,1.04l2.08,0.82l0.47,-0.14l1.46,-2.0l1.73,-0.04l1.59,0.98l2.05,3.35l1.47,1.56l1.26,3.14l2.18,1.02l2.26,0.58l-1.18,3.72l-0.42,5.04l1.79,4.89l1.62,1.89l0.61,1.52l1.2,1.42l2.55,0.66l1.37,1.1l7.54,-1.89l1.86,-1.3l1.14,-4.3l4.1,-1.21l3.57,-0.11l0.32,0.3l-0.06,0.94l-1.26,1.45l-0.67,1.71l0.38,0.7l-0.72,2.27l-0.49,-0.3l-1.0,0.08l-1.0,1.39l-0.47,-0.11l-0.53,0.47l-4.26,-0.02l-0.4,0.4l-0.0,1.06l-1.1,0.26l0.1,0.44l1.82,1.44l0.56,0.91l-3.19,0.21l-1.21,2.09l0.24,0.72l-0.2,0.44l-2.24,-2.18l-1.45,-0.93l-2.22,-0.69l-1.52,0.22l-3.07,1.16l-10.55,-3.85l-2.86,-1.96l-3.78,-0.92l-1.08,-1.19l-2.62,-1.43l-1.18,-1.54l-0.38,-0.81l0.66,-0.63l-0.18,-0.53l0.52,-0.76l0.01,-0.91l-2.0,-3.82l-2.21,-2.63l-2.53,-2.09l-1.19,-1.62l-2.2,-1.17l-0.3,-0.43l0.34,-1.48l-0.21,-0.45l-1.23,-0.6l-1.36,-1.2l-0.59,-1.78l-1.54,-0.47l-2.44,-2.55l-0.16,-0.9l-1.33,-2.03l-0.84,-1.99l-0.16,-1.33l-1.81,-1.1l-0.97,0.05l-1.31,-0.7l-0.57,0.22l-0.4,1.12l0.72,3.77l3.51,3.89l0.28,0.78l0.53,0.26l0.41,1.43l1.33,1.73l1.58,1.41l0.8,2.39l1.43,2.41l0.13,1.32l0.37,0.36l1.04,0.08l1.67,2.28l-0.85,0.76l-0.66,-1.51l-1.68,-1.54l-2.91,-1.87l0.06,-1.82l-0.54,-1.68l-2.91,-2.03l-0.55,0.09l-1.95,-1.1l-0.88,-0.94l0.68,-0.08l0.93,-1.01l0.08,-1.78l-1.93,-1.94l-1.46,-0.77l-3.75,-7.56l4.88,-0.42Z",
      name: "Mexico"
    },
    VU: {
      path: "M839.04,322.8l0.22,1.14l-0.44,0.03l-0.2,-1.45l0.42,0.27Z",
      name: "Vanuatu"
    },
    FR: {
      path: "M444.48,172.62l-0.64,1.78l-0.58,-0.31l-0.49,-1.72l0.4,-0.89l1.0,-0.72l0.3,1.85ZM429.64,147.1l1.78,1.58l1.46,-0.13l2.1,1.42l1.35,0.27l1.23,0.83l3.04,0.5l-1.03,1.85l-0.3,2.12l-0.41,0.32l-0.95,-0.24l-0.5,0.43l0.06,0.61l-1.81,1.92l-0.04,1.42l0.55,0.38l0.88,-0.36l0.61,0.97l-0.03,1.0l0.57,0.91l-0.75,1.09l0.65,2.39l1.27,0.57l-0.18,0.82l-2.01,1.53l-4.77,-0.8l-3.82,1.0l-0.53,1.85l-2.49,0.34l-2.71,-1.31l-1.16,0.57l-4.31,-1.29l-0.72,-0.86l1.19,-1.78l0.39,-6.45l-2.58,-3.3l-1.9,-1.66l-3.72,-1.23l-0.19,-1.72l2.81,-0.61l4.12,0.81l0.47,-0.48l-0.6,-2.77l1.94,0.95l5.83,-2.54l0.92,-2.74l1.6,-0.49l0.24,0.78l1.36,0.33l1.05,1.19ZM289.01,278.39l-0.81,0.8l-0.78,0.12l-0.5,-0.66l-0.56,-0.1l-0.91,0.6l-0.46,-0.22l1.09,-2.96l-0.96,-1.77l-0.17,-1.49l1.07,-1.77l2.32,0.75l2.51,2.01l0.3,0.74l-2.14,3.96Z",
      name: "France"
    },
    FI: {
      path: "M492.17,76.39l-0.23,3.5l3.52,2.63l-2.08,2.88l-0.02,0.44l2.8,4.56l-1.59,3.31l2.16,3.24l-0.94,2.39l0.14,0.47l3.44,2.51l-0.77,1.62l-7.52,6.95l-4.5,0.31l-4.38,1.37l-3.8,0.74l-1.44,-1.96l-2.17,-1.11l0.5,-3.66l-1.16,-3.33l1.09,-2.08l2.21,-2.42l5.67,-4.32l1.64,-0.83l0.21,-0.42l-0.46,-2.02l-3.38,-1.89l-0.75,-1.43l-0.22,-6.74l-6.79,-4.8l0.8,-0.62l2.54,2.12l3.46,-0.12l3.0,0.96l2.51,-2.11l1.17,-3.08l3.55,-1.38l2.76,1.53l-0.95,2.79Z",
      name: "Finland"
    },
    FJ: {
      path: "M871.53,326.34l-2.8,1.05l-0.08,-0.23l2.97,-1.21l-0.1,0.39ZM867.58,329.25l0.43,0.37l-0.27,0.88l-1.24,0.28l-1.04,-0.24l-0.14,-0.66l0.63,-0.58l0.92,0.26l0.7,-0.31Z",
      name: "Fiji"
    },
    FK: {
      path: "M274.36,425.85l1.44,1.08l-0.47,0.73l-3.0,0.89l-0.96,-1.0l-0.52,-0.05l-1.83,1.29l-0.73,-0.88l2.46,-1.64l1.93,0.76l1.67,-1.19Z",
      name: "Falkland Is."
    },
    NI: {
      path: "M202.33,252.67l0.81,-0.18l1.03,-1.02l-0.04,-0.88l0.68,-0.0l0.63,-0.54l0.97,0.22l1.53,-1.26l0.58,-0.99l1.17,0.34l2.41,-0.94l0.13,1.32l-0.81,1.94l0.1,2.74l-0.36,0.37l-0.11,1.75l-0.47,0.81l0.18,1.14l-1.73,-0.85l-0.71,0.27l-1.47,-0.6l-0.52,0.16l-4.01,-3.81Z",
      name: "Nicaragua"
    },
    NL: {
      path: "M430.31,143.39l0.6,-0.5l2.13,-4.8l3.2,-1.33l1.74,0.08l0.33,0.8l-0.59,2.92l-0.5,0.99l-1.26,0.0l-0.4,0.45l0.33,2.7l-2.2,-1.78l-2.62,0.58l-0.75,-0.11Z",
      name: "Netherlands"
    },
    NO: {
      path: "M491.44,67.41l6.8,2.89l-2.29,0.86l-0.15,0.65l2.33,2.38l-4.98,1.79l0.84,-2.45l-0.18,-0.48l-3.55,-1.8l-3.89,1.52l-1.42,3.38l-2.12,1.72l-2.64,-1.0l-3.11,0.21l-2.66,-2.22l-0.5,-0.01l-1.41,1.1l-1.44,0.17l-0.35,0.35l-0.32,2.47l-4.32,-0.64l-0.44,0.29l-0.58,2.11l-2.45,0.2l-4.15,7.68l-3.88,5.76l0.78,1.62l-0.64,1.16l-2.24,-0.06l-0.38,0.24l-1.66,3.89l0.15,5.17l1.57,2.04l-0.78,4.16l-2.02,2.48l-0.85,1.63l-1.3,-1.75l-0.58,-0.07l-4.87,4.19l-3.1,0.79l-3.16,-1.7l-0.85,-3.77l-0.77,-8.55l2.14,-2.31l6.55,-3.27l5.02,-4.17l10.63,-13.84l10.98,-8.7l5.35,-1.91l4.34,0.12l3.69,-3.64l4.49,0.19l4.37,-0.89ZM484.55,20.04l4.26,1.75l-3.1,2.55l-7.1,0.65l-7.08,-0.9l-0.37,-1.31l-0.37,-0.29l-3.44,-0.1l-2.08,-2.0l6.87,-1.44l3.9,1.31l2.39,-1.64l6.13,1.4ZM481.69,33.93l-4.45,1.74l-3.54,-0.99l1.12,-0.9l0.05,-0.58l-1.06,-1.22l4.22,-0.89l1.09,1.97l2.57,0.87ZM466.44,24.04l7.43,3.77l-5.41,1.86l-1.58,4.08l-2.26,1.2l-1.12,4.11l-2.61,0.18l-4.79,-2.86l1.84,-1.54l-0.1,-0.68l-3.69,-1.53l-4.77,-4.51l-1.73,-3.89l6.11,-1.82l1.54,1.92l3.57,-0.08l1.2,-1.96l3.32,-0.18l3.05,1.92Z",
      name: "Norway"
    },
    NA: {
      path: "M474.26,330.66l-0.97,0.04l-0.38,0.4l-0.07,8.9l-2.09,0.08l-0.39,0.4l-0.0,17.42l-1.98,1.23l-1.17,0.17l-2.44,-0.66l-0.48,-1.13l-0.99,-0.74l-0.54,0.05l-0.9,1.01l-1.53,-1.68l-0.93,-1.88l-1.99,-8.56l-0.06,-3.12l-0.33,-1.52l-2.3,-3.34l-1.91,-4.83l-1.96,-2.43l-0.12,-1.57l2.33,-0.79l1.43,0.07l1.81,1.13l10.23,-0.25l1.84,1.23l5.87,0.35ZM474.66,330.64l6.51,-1.6l1.9,0.39l-1.69,0.4l-1.31,0.83l-1.12,-0.94l-4.29,0.92Z",
      name: "Namibia"
    },
    NC: {
      path: "M838.78,341.24l-0.33,0.22l-2.9,-1.75l-3.26,-3.37l1.65,0.83l4.85,4.07Z",
      name: "New Caledonia"
    },
    NE: {
      path: "M454.75,226.53l1.33,1.37l0.48,0.07l1.27,-0.7l0.53,3.52l0.94,0.83l0.17,0.92l0.81,0.69l-0.44,0.95l-0.96,5.26l-0.13,3.22l-3.04,2.31l-1.22,3.57l1.02,1.24l-0.0,1.46l0.39,0.4l1.13,0.04l-0.9,1.25l-1.47,-2.42l-0.86,-0.29l-2.09,1.37l-1.74,-0.67l-1.45,-0.17l-0.85,0.35l-1.36,-0.07l-1.64,1.09l-1.06,0.05l-2.94,-1.28l-1.44,0.59l-1.01,-0.03l-0.97,-0.94l-2.7,-0.98l-2.69,0.3l-0.87,0.64l-0.47,1.6l-0.75,1.16l-0.12,1.53l-1.57,-1.1l-1.31,0.24l0.03,-0.81l-0.32,-0.41l-2.59,-0.52l-0.15,-1.16l-1.35,-1.6l-0.29,-1.0l0.13,-0.84l1.29,-0.08l1.08,-0.92l3.31,-0.22l2.22,-0.41l0.32,-0.34l0.2,-1.47l1.39,-1.88l-0.01,-5.66l3.36,-1.12l7.24,-5.12l8.42,-4.92l3.69,1.06Z",
      name: "Niger"
    },
    NG: {
      path: "M456.32,253.89l0.64,0.65l-0.28,1.04l-2.11,2.01l-2.03,5.18l-1.37,1.16l-1.15,3.18l-1.33,0.66l-1.46,-0.97l-1.21,0.16l-1.38,1.36l-0.91,0.24l-1.79,4.06l-2.33,0.81l-1.11,-0.07l-0.86,0.5l-1.71,-0.05l-1.19,-1.39l-0.89,-1.89l-1.77,-1.66l-3.95,-0.08l0.07,-5.21l0.42,-1.43l1.95,-2.3l-0.14,-0.91l0.43,-1.18l-0.53,-1.41l0.25,-2.92l0.72,-1.07l0.32,-1.34l0.46,-0.39l2.47,-0.28l2.34,0.89l1.15,1.02l1.28,0.04l1.22,-0.58l3.03,1.27l1.49,-0.14l1.36,-1.0l1.33,0.07l0.82,-0.35l3.45,0.8l1.82,-1.32l1.84,2.67l0.66,0.16Z",
      name: "Nigeria"
    },
    NZ: {
      path: "M857.8,379.65l1.86,3.12l0.44,0.18l0.3,-0.38l0.03,-1.23l0.38,0.27l0.57,2.31l2.02,0.94l1.81,0.27l1.57,-1.06l0.7,0.18l-1.15,3.59l-1.98,0.11l-0.74,1.2l0.2,1.11l-2.42,3.98l-1.49,0.92l-1.04,-0.85l1.21,-2.05l-0.81,-2.01l-2.63,-1.25l0.04,-0.57l1.82,-1.19l0.43,-2.34l-0.16,-2.03l-0.95,-1.82l-0.06,-0.72l-3.11,-3.64l-0.79,-1.52l1.56,1.45l1.76,0.66l0.65,2.34ZM853.83,393.59l0.57,1.24l0.59,0.16l1.42,-0.97l0.46,0.79l0.0,1.03l-2.47,3.48l-1.26,1.2l-0.06,0.5l0.55,0.87l-1.41,0.07l-2.33,1.38l-2.03,5.02l-3.02,2.16l-2.06,-0.06l-1.71,-1.04l-2.47,-0.2l-0.27,-0.73l1.22,-2.1l3.05,-2.94l1.62,-0.59l4.02,-2.82l1.57,-1.67l1.07,-2.16l0.88,-0.7l0.48,-1.75l1.24,-0.97l0.35,0.79Z",
      name: "New Zealand"
    },
    NP: {
      path: "M641.14,213.62l0.01,3.19l-1.74,0.04l-4.8,-0.86l-1.58,-1.39l-3.37,-0.34l-7.65,-3.7l0.8,-2.09l2.33,-1.7l1.77,0.75l2.49,1.76l1.38,0.41l0.99,1.35l1.9,0.52l1.99,1.17l5.49,0.9Z",
      name: "Nepal"
    },
    CI: {
      path: "M407.4,259.27l0.86,0.42l0.56,0.9l1.13,0.53l1.19,-0.61l0.97,-0.08l1.42,0.54l0.6,3.24l-1.03,2.08l-0.65,2.84l1.06,2.33l-0.06,0.53l-2.54,-0.47l-1.66,0.03l-3.06,0.46l-4.11,1.6l0.32,-3.06l-1.18,-1.31l-1.32,-0.66l0.42,-0.85l-0.2,-1.4l0.5,-0.67l0.01,-1.59l0.84,-0.32l0.26,-0.5l-1.15,-3.01l0.12,-0.5l0.51,-0.25l0.66,0.31l1.93,0.02l0.67,-0.71l0.71,-0.14l0.25,0.69l0.57,0.22l1.4,-0.61Z",
      name: "Côte d'Ivoire"
    },
    CH: {
      path: "M444.62,156.35l-0.29,0.87l0.18,0.53l1.13,0.58l1.0,0.1l-0.1,0.65l-0.79,0.38l-1.72,-0.37l-0.45,0.23l-0.45,1.04l-0.75,0.06l-0.84,-0.4l-1.32,1.0l-0.96,0.12l-0.88,-0.55l-0.81,-1.3l-0.49,-0.16l-0.63,0.26l0.02,-0.65l1.71,-1.66l0.1,-0.56l0.93,0.08l0.58,-0.46l1.99,0.02l0.66,-0.61l2.19,0.79Z",
      name: "Switzerland"
    },
    CO: {
      path: "M242.07,254.93l-1.7,0.59l-0.59,1.18l-1.7,1.69l-0.38,1.93l-0.67,1.43l0.31,0.57l1.03,0.13l0.25,0.9l0.57,0.64l-0.04,2.34l1.64,1.42l3.16,-0.24l1.26,0.28l1.67,2.06l0.41,0.13l4.09,-0.39l0.45,0.22l-0.92,1.95l-0.2,1.8l0.52,1.83l0.75,1.05l-1.12,1.1l0.07,0.63l0.84,0.51l0.74,1.29l-0.39,-0.45l-0.59,-0.01l-0.71,0.74l-4.71,-0.05l-0.4,0.41l0.03,1.57l0.33,0.39l1.11,0.2l-1.68,0.4l-0.29,0.38l-0.01,1.82l1.16,1.14l0.34,1.25l-1.05,7.05l-1.04,-0.87l1.26,-1.99l-0.13,-0.56l-2.18,-1.23l-1.38,0.2l-1.14,-0.38l-1.27,0.61l-1.55,-0.26l-1.38,-2.46l-1.23,-0.75l-0.85,-1.2l-1.67,-1.19l-0.86,0.13l-2.11,-1.32l-1.01,0.31l-1.8,-0.29l-0.52,-0.91l-3.09,-1.68l0.77,-0.52l-0.1,-1.12l0.41,-0.64l1.34,-0.32l2.0,-2.88l-0.11,-0.57l-0.66,-0.43l0.39,-1.38l-0.52,-2.1l0.49,-0.83l-0.4,-2.13l-0.97,-1.35l0.17,-0.66l0.86,-0.08l0.47,-0.75l-0.46,-1.63l1.41,-0.07l1.8,-1.69l0.93,-0.24l0.3,-0.38l0.45,-2.76l1.22,-1.0l1.44,-0.04l0.45,-0.5l1.91,0.12l2.93,-1.84l1.15,-1.14l0.91,0.46l-0.25,0.45Z",
      name: "Colombia"
    },
    CN: {
      path: "M740.23,148.97l4.57,1.3l2.8,2.17l0.98,2.9l0.38,0.27l3.8,0.0l2.32,-1.28l3.29,-0.75l-0.96,2.09l-1.02,1.28l-0.85,3.4l-1.52,2.73l-2.76,-0.5l-2.4,1.13l-0.21,0.45l0.64,2.57l-0.32,3.2l-0.94,0.06l-0.37,0.89l-0.91,-1.01l-0.64,0.07l-0.92,1.57l-3.73,1.25l-0.26,0.48l0.26,1.06l-1.5,-0.08l-1.09,-0.86l-0.56,0.06l-1.67,2.06l-2.7,1.56l-2.03,1.88l-3.4,0.83l-1.93,1.4l-1.15,0.34l0.33,-0.7l-0.41,-0.89l1.79,-1.79l0.02,-0.54l-1.32,-1.56l-0.48,-0.1l-2.24,1.09l-2.83,2.06l-1.51,1.83l-2.28,0.13l-1.55,1.49l-0.04,0.5l1.32,1.97l2.0,0.58l0.31,1.35l1.98,0.84l3.0,-1.96l2.0,1.02l1.49,0.11l0.22,0.83l-3.37,0.86l-1.12,1.48l-2.5,1.52l-1.29,1.99l0.14,0.56l2.57,1.48l0.97,2.7l3.17,4.63l-0.03,1.66l-1.35,0.65l-0.2,0.51l0.6,1.47l1.4,0.91l-0.89,3.82l-1.43,0.38l-3.85,6.44l-2.27,3.11l-6.78,4.57l-2.73,0.29l-1.45,1.04l-0.62,-0.61l-0.55,-0.01l-1.36,1.25l-3.39,1.27l-2.61,0.4l-1.1,2.79l-0.81,0.09l-0.49,-1.42l0.5,-0.85l-0.25,-0.59l-3.36,-0.84l-1.3,0.4l-2.31,-0.62l-0.94,-0.84l0.33,-1.28l-0.3,-0.49l-2.19,-0.46l-1.13,-0.93l-0.47,-0.02l-2.06,1.36l-4.29,0.28l-2.76,1.05l-0.28,0.43l0.32,2.53l-0.59,-0.03l-0.19,-1.34l-0.55,-0.34l-1.68,0.7l-2.46,-1.23l0.62,-1.87l-0.26,-0.51l-1.37,-0.44l-0.54,-2.22l-0.45,-0.3l-2.13,0.35l0.24,-2.48l2.39,-2.4l0.03,-4.31l-1.19,-0.92l-0.78,-1.49l-0.41,-0.21l-1.41,0.19l-1.98,-0.3l0.46,-1.07l-1.17,-1.7l-0.55,-0.11l-1.63,1.05l-2.25,-0.57l-2.89,1.73l-2.25,1.98l-1.75,0.29l-1.17,-0.71l-3.31,-0.65l-1.48,0.79l-1.04,1.27l-0.12,-1.17l-0.54,-0.34l-1.44,0.54l-5.55,-0.86l-1.98,-1.16l-1.89,-0.54l-0.99,-1.35l-1.34,-0.37l-2.55,-1.79l-2.01,-0.84l-1.21,0.56l-5.57,-3.45l-0.53,-2.31l1.19,0.25l0.48,-0.37l0.08,-1.42l-0.98,-1.56l0.15,-2.44l-2.69,-3.32l-4.12,-1.23l-0.67,-2.0l-1.92,-1.48l-0.38,-0.7l-0.51,-3.01l-1.52,-0.66l-0.7,0.13l-0.48,-2.05l0.55,-0.51l-0.09,-0.82l2.03,-1.19l1.6,-0.54l2.56,0.38l0.42,-0.22l0.85,-1.7l3.0,-0.33l1.1,-1.26l4.05,-1.77l0.39,-0.91l-0.17,-1.44l1.45,-0.67l0.2,-0.52l-2.07,-4.9l4.51,-1.12l1.37,-0.73l1.89,-5.51l4.98,0.86l1.51,-1.7l0.11,-2.87l1.99,-0.38l1.83,-2.06l0.49,-0.13l0.68,2.08l2.23,1.77l3.44,1.16l1.55,2.29l-0.92,3.49l0.96,1.67l6.54,1.13l2.95,1.87l1.47,0.35l1.06,2.62l1.53,1.91l3.05,0.08l5.14,0.67l3.37,-0.41l2.36,0.43l3.65,1.8l3.06,0.04l1.45,0.88l2.87,-1.59l3.95,-1.02l3.83,-0.14l3.06,-1.14l1.77,-1.6l1.72,-1.01l0.17,-0.49l-1.1,-2.05l1.02,-1.54l4.02,0.8l2.45,-1.61l3.76,-1.19l1.96,-2.13l1.63,-0.83l3.51,-0.4l1.92,0.34l0.46,-0.3l0.17,-1.5l-2.27,-2.22l-2.11,-1.09l-2.18,1.11l-2.32,-0.47l-1.29,0.32l-0.4,-0.82l2.73,-5.16l3.02,1.06l3.53,-2.06l0.18,-1.68l2.16,-3.35l1.49,-1.35l-0.03,-1.85l-1.07,-0.85l1.54,-1.26l2.98,-0.59l3.23,-0.09l3.64,0.99l2.04,1.16l3.29,6.71l0.92,3.19ZM696.92,237.31l-1.87,1.08l-1.63,-0.64l-0.06,-1.79l1.03,-0.98l2.58,-0.69l1.16,0.05l0.3,0.54l-0.98,1.06l-0.53,1.37Z",
      name: "China"
    },
    CM: {
      path: "M457.92,257.49l1.05,1.91l-1.4,0.16l-1.05,-0.23l-0.45,0.22l-0.54,1.19l0.08,0.45l1.48,1.47l1.05,0.45l1.01,2.46l-1.52,2.99l-0.68,0.68l-0.13,3.69l2.38,3.84l1.09,0.8l0.24,2.48l-3.67,-1.14l-11.27,-0.13l0.23,-1.79l-0.98,-1.66l-1.19,-0.54l-0.44,-0.97l-0.6,-0.42l1.71,-4.27l0.75,-0.13l1.38,-1.36l0.65,-0.03l1.71,0.99l1.93,-1.12l1.14,-3.18l1.38,-1.17l2.0,-5.14l2.17,-2.13l0.3,-1.64l-0.86,-0.88l0.03,-0.33l0.94,1.28l0.07,3.22Z",
      name: "Cameroon"
    },
    CL: {
      path: "M246.5,429.18l-3.14,1.83l-0.57,3.16l-0.64,0.05l-2.68,-1.06l-2.82,-2.33l-3.04,-1.89l-0.69,-1.85l0.63,-2.14l-1.21,-2.11l-0.31,-5.37l1.01,-2.91l2.57,-2.38l-0.18,-0.68l-3.16,-0.77l2.05,-2.47l0.77,-4.65l2.32,0.9l0.54,-0.29l1.31,-6.31l-0.22,-0.44l-1.68,-0.8l-0.56,0.28l-0.7,3.36l-0.81,-0.22l1.56,-9.41l1.15,-2.24l-0.71,-2.82l-0.18,-2.84l1.01,-0.33l3.26,-9.14l1.07,-4.22l-0.56,-4.21l0.74,-2.34l-0.29,-3.27l1.46,-3.34l2.04,-16.59l-0.66,-7.76l1.03,-0.53l0.54,-0.9l0.79,1.14l0.32,1.78l1.25,1.16l-0.69,2.55l1.33,2.9l0.97,3.59l0.46,0.29l1.5,-0.3l0.11,0.23l-0.76,2.44l-2.57,1.23l-0.23,0.37l0.08,4.33l-0.46,0.77l0.56,1.21l-1.58,1.51l-1.68,2.62l-0.89,2.47l0.2,2.7l-1.48,2.73l1.12,5.09l0.64,0.61l-0.01,2.29l-1.38,2.68l0.01,2.4l-1.89,2.04l0.02,2.75l0.69,2.57l-1.43,1.13l-1.26,5.68l0.39,3.51l-0.97,0.89l0.58,3.5l1.02,1.14l-0.65,1.02l0.15,0.57l1.0,0.53l0.16,0.69l-1.03,0.85l0.26,1.75l-0.89,4.03l-1.31,2.66l0.24,1.75l-0.71,1.83l-1.99,1.7l0.3,3.67l0.88,1.19l1.58,0.01l0.01,2.21l1.04,1.95l5.98,0.63ZM248.69,430.79l0.0,7.33l0.4,0.4l3.52,0.05l-0.44,0.75l-1.94,0.98l-2.49,-0.37l-1.88,-1.06l-2.55,-0.49l-5.59,-3.71l-2.38,-2.63l4.1,2.48l3.32,1.23l0.45,-0.12l1.29,-1.57l0.83,-2.32l2.05,-1.24l1.31,0.29Z",
      name: "Chile"
    },
    CA: {
      path: "M280.06,145.6l-1.67,2.88l0.07,0.49l0.5,0.04l1.46,-0.98l1.0,0.42l-0.56,0.72l0.17,0.62l2.22,0.89l1.35,-0.71l1.95,0.78l-0.66,2.01l0.5,0.51l1.32,-0.42l0.98,3.17l-0.91,2.41l-0.8,0.08l-1.23,-0.45l0.47,-2.25l-0.89,-0.83l-0.48,0.06l-2.78,2.63l-0.34,-0.02l1.02,-0.85l-0.14,-0.69l-2.4,-0.77l-7.4,0.08l-0.17,-0.41l1.3,-0.94l0.02,-0.64l-0.73,-0.58l1.85,-1.74l2.57,-5.16l1.47,-1.79l1.99,-1.05l0.46,0.06l-1.53,2.45ZM68.32,74.16l4.13,0.95l4.02,2.14l2.61,0.4l2.47,-1.89l2.88,-1.31l3.85,0.48l3.71,-1.94l3.82,-1.04l1.56,1.68l0.49,0.08l1.87,-1.04l0.65,-1.98l1.24,0.35l4.16,3.94l0.54,0.01l2.75,-2.49l0.26,2.59l0.49,0.35l3.08,-0.73l1.04,-1.27l2.73,0.23l3.83,1.86l5.86,1.61l3.47,0.75l2.44,-0.26l2.73,1.78l-2.98,1.81l-0.19,0.41l0.31,0.32l4.53,0.92l6.87,-0.5l2.0,-0.69l2.49,2.39l0.53,0.02l2.72,-2.16l-0.02,-0.64l-2.16,-1.54l1.15,-1.06l4.83,-0.61l1.84,0.95l2.48,2.31l3.01,-0.23l4.55,1.92l3.85,-0.67l3.61,0.1l0.41,-0.44l-0.25,-2.36l1.79,-0.61l3.49,1.32l-0.01,3.77l0.31,0.39l0.45,-0.22l1.48,-3.16l1.74,0.1l0.41,-0.3l1.13,-4.37l-2.78,-3.11l-2.8,-1.74l0.19,-4.64l2.71,-3.07l2.98,0.67l2.41,1.95l3.19,4.8l-1.99,1.97l0.21,0.68l4.33,0.84l-0.01,4.15l0.25,0.37l0.44,-0.09l3.07,-3.15l2.54,2.39l-0.61,3.33l2.42,2.88l0.61,0.0l2.61,-3.08l1.88,-3.82l0.17,-4.58l6.72,0.94l3.13,2.04l0.13,1.82l-1.76,2.19l-0.01,0.49l1.66,2.16l-0.26,1.71l-4.68,2.8l-3.28,0.61l-2.47,-1.2l-0.55,0.23l-0.73,2.04l-2.38,3.43l-0.74,1.77l-2.74,2.57l-3.44,0.25l-2.21,1.78l-0.28,2.53l-2.82,0.55l-3.12,3.22l-2.72,4.31l-1.03,3.17l-0.14,4.31l0.33,0.41l3.44,0.57l2.24,5.95l0.45,0.23l3.4,-0.69l4.52,1.51l2.43,1.31l1.91,1.73l3.1,0.96l2.62,1.46l6.6,0.54l-0.35,2.74l0.81,3.53l1.81,3.78l3.83,3.3l0.45,0.04l2.1,-1.28l1.37,-3.69l-1.31,-5.38l-1.45,-1.58l3.57,-1.47l2.84,-2.46l1.52,-2.8l-0.25,-2.55l-1.7,-3.07l-2.85,-2.61l2.8,-3.95l-1.08,-3.37l-0.79,-5.67l1.36,-0.7l6.76,1.41l2.12,-0.96l5.12,3.36l1.05,1.61l4.08,0.26l-0.06,2.87l0.83,4.7l0.3,0.32l2.16,0.54l1.73,2.06l0.5,0.09l3.63,-2.03l2.52,-4.19l1.26,-1.32l7.6,11.72l-0.92,2.04l0.16,0.51l3.3,1.97l2.22,1.98l4.1,0.98l1.43,0.99l0.95,2.79l2.1,0.68l0.84,1.08l0.17,3.45l-3.37,2.26l-4.22,1.24l-3.06,2.63l-4.06,0.51l-5.35,-0.69l-6.39,0.2l-2.3,2.41l-3.26,1.51l-6.47,7.15l-0.06,0.48l0.44,0.19l2.13,-0.52l4.17,-4.24l5.12,-2.62l3.52,-0.3l1.69,1.21l-2.12,2.21l0.81,3.47l1.02,2.61l3.47,1.6l4.14,-0.45l2.15,-2.8l0.26,1.48l1.14,0.8l-2.56,1.69l-5.5,1.82l-2.54,1.27l-2.74,2.15l-1.4,-0.16l-0.07,-2.01l4.14,-2.44l0.18,-0.45l-0.39,-0.29l-6.63,0.45l-1.39,-1.49l-0.14,-4.43l-1.11,-0.91l-1.82,0.39l-0.66,-0.66l-0.6,0.03l-1.91,2.39l-0.82,2.52l-0.8,1.27l-1.67,0.56l-0.46,0.76l-8.31,0.07l-1.21,0.62l-2.35,1.97l-0.71,-0.14l-1.37,0.96l-1.12,-0.48l-4.74,1.26l-0.9,1.17l0.21,0.62l1.73,0.3l-1.81,0.31l-1.85,0.81l-2.11,-0.13l-2.95,1.78l-0.69,-0.09l1.39,-2.1l1.73,-1.21l0.1,-2.29l1.16,-1.99l0.49,0.53l2.03,0.42l1.2,-1.16l0.02,-0.47l-2.66,-3.51l-2.28,-0.61l-5.64,-0.71l-0.4,-0.57l-0.79,0.13l0.2,-0.41l-0.22,-0.55l-0.68,-0.26l0.19,-1.26l-0.78,-0.73l0.31,-0.64l-0.29,-0.57l-2.6,-0.44l-0.75,-1.63l-0.94,-0.66l-4.31,-0.65l-1.13,1.19l-1.48,0.59l-0.85,1.06l-2.83,-0.76l-2.09,0.39l-2.39,-0.97l-4.24,-0.7l-0.57,-0.4l-0.41,-1.63l-0.4,-0.3l-0.85,0.02l-0.39,0.4l-0.01,0.85l-69.13,-0.01l-6.51,-4.52l-4.5,-1.38l-1.26,-2.66l0.33,-1.93l-0.23,-0.43l-3.01,-1.35l-0.55,-2.77l-2.89,-2.38l-0.04,-1.45l1.39,-1.83l-0.28,-2.55l-4.16,-2.2l-4.07,-6.6l-4.02,-3.22l-1.3,-1.88l-0.5,-0.13l-2.51,1.21l-2.23,1.87l-3.85,-3.88l-2.44,-1.04l-2.22,-0.13l0.03,-37.49ZM260.37,148.65l3.04,0.76l2.26,1.2l-3.78,-0.95l-1.53,-1.01ZM249.4,3.81l6.68,0.49l5.32,0.79l4.26,1.57l-0.07,1.1l-5.85,2.53l-6.02,1.21l-2.39,1.39l-0.18,0.45l0.39,0.29l4.01,-0.02l-4.65,2.82l-4.2,1.74l-4.19,4.59l-5.03,0.92l-1.67,1.15l-7.47,0.59l-0.37,0.37l0.32,0.42l2.41,0.49l-0.81,0.47l-0.12,0.59l1.83,2.41l-2.02,1.59l-3.81,1.51l-1.32,2.16l-3.38,1.53l-0.22,0.48l0.35,1.19l0.4,0.29l3.88,-0.18l0.03,0.61l-6.33,2.95l-6.41,-1.4l-7.43,0.79l-3.72,-0.62l-4.4,-0.25l-0.23,-1.83l4.29,-1.11l0.28,-0.51l-1.1,-3.45l1.0,-0.25l6.58,2.28l0.47,-0.16l-0.05,-0.49l-3.41,-3.45l-3.58,-0.98l1.48,-1.55l4.34,-1.29l0.97,-2.19l-0.16,-0.48l-3.42,-2.13l-0.81,-2.26l6.2,0.22l2.24,0.58l3.91,-2.1l0.2,-0.43l-0.35,-0.32l-5.64,-0.67l-8.73,0.36l-4.26,-1.9l-2.12,-2.4l-2.78,-1.66l-0.41,-1.52l3.31,-1.03l2.93,-0.2l4.91,-0.99l3.7,-2.27l2.87,0.3l2.62,1.67l0.56,-0.14l1.82,-3.2l3.13,-0.94l4.44,-0.69l7.53,-0.26l1.48,0.67l7.19,-1.06l10.8,0.79ZM203.85,57.54l0.01,0.42l1.97,2.97l0.68,-0.02l2.24,-3.72l5.95,-1.86l4.01,4.64l-0.35,2.91l0.5,0.43l4.95,-1.36l2.32,-1.8l5.31,2.28l3.27,2.11l0.3,1.84l0.48,0.33l4.42,-0.99l2.64,2.87l5.97,1.77l2.06,1.72l2.11,3.71l-4.19,1.86l-0.01,0.73l5.9,2.83l3.94,0.94l3.78,3.95l3.46,0.25l-0.63,2.37l-4.11,4.47l-2.76,-1.56l-3.9,-3.94l-3.59,0.41l-0.33,0.34l-0.19,2.72l2.63,2.38l3.42,1.89l0.94,0.97l1.55,3.75l-0.7,2.29l-2.74,-0.92l-6.25,-3.15l-0.51,0.13l0.05,0.52l6.07,5.69l0.18,0.59l-6.09,-1.39l-5.31,-2.24l-2.63,-1.66l0.6,-0.77l-0.12,-0.6l-7.39,-4.01l-0.59,0.37l0.03,0.79l-6.73,0.6l-1.69,-1.1l1.36,-2.46l4.51,-0.07l5.15,-0.52l0.31,-0.6l-0.74,-1.3l0.78,-1.84l3.21,-4.05l-0.67,-2.35l-1.11,-1.6l-3.84,-2.1l-4.35,-1.28l0.91,-0.63l0.06,-0.61l-2.65,-2.75l-2.34,-0.36l-1.89,-1.46l-0.53,0.03l-1.24,1.23l-4.36,0.55l-9.04,-0.99l-9.26,-1.98l-1.6,-1.22l2.22,-1.77l0.13,-0.44l-0.38,-0.27l-3.22,-0.02l-0.72,-4.25l1.83,-4.04l2.42,-1.85l5.5,-1.1l-1.39,2.35ZM261.19,159.33l2.07,0.61l1.44,-0.04l-1.15,0.63l-2.94,-1.23l-0.4,-0.68l0.36,-0.37l0.61,1.07ZM230.83,84.39l-2.37,0.18l-0.49,-1.63l0.93,-2.09l1.94,-0.51l1.62,0.99l0.02,1.52l-1.66,1.54ZM229.43,58.25l0.11,0.65l-4.87,-0.21l-2.72,0.62l-3.1,-2.57l0.08,-1.26l0.86,-0.23l5.57,0.51l4.08,2.5ZM222.0,105.02l-0.72,1.49l-0.63,-0.19l-0.48,-0.84l0.81,-0.99l0.65,0.05l0.37,0.46ZM183.74,38.32l2.9,1.7l4.79,-0.01l1.84,1.46l-0.49,1.68l0.23,0.48l2.82,1.14l1.76,1.26l7.01,0.65l4.1,-1.1l5.03,-0.43l3.93,0.35l2.48,1.77l0.46,1.7l-1.3,1.1l-3.56,1.01l-3.23,-0.59l-7.17,0.76l-5.09,0.09l-3.99,-0.6l-6.42,-1.54l-0.79,-2.51l-0.3,-2.49l-2.64,-2.5l-5.32,-0.72l-2.52,-1.4l0.68,-1.57l4.78,0.31ZM207.38,91.35l0.4,1.56l0.56,0.26l1.06,-0.52l1.32,0.96l5.42,2.57l0.2,1.68l0.46,0.35l1.68,-0.28l1.15,0.85l-1.55,0.87l-3.61,-0.88l-1.32,-1.69l-0.57,-0.06l-2.45,2.1l-3.12,1.79l-0.7,-1.87l-0.42,-0.26l-2.16,0.24l1.39,-1.39l0.32,-3.14l0.76,-3.35l1.18,0.22ZM215.49,102.6l-2.67,1.95l-1.4,-0.07l-0.3,-0.58l1.53,-1.48l2.84,0.18ZM202.7,24.12l2.53,1.59l-2.87,1.4l-4.53,4.05l-4.25,0.38l-5.03,-0.68l-2.45,-2.04l0.03,-1.62l1.82,-1.37l0.14,-0.45l-0.38,-0.27l-4.45,0.04l-2.59,-1.76l-1.41,-2.29l1.57,-2.32l1.62,-1.66l2.44,-0.39l0.25,-0.65l-0.6,-0.74l4.86,-0.25l3.24,3.11l8.16,2.3l1.9,3.61ZM187.47,59.2l-2.76,3.49l-2.38,-0.15l-1.44,-3.84l0.04,-2.2l1.19,-1.88l2.3,-1.23l5.07,0.17l4.11,1.02l-3.24,3.72l-2.88,0.89ZM186.07,48.79l-1.08,1.53l-3.34,-0.34l-2.56,-1.1l1.03,-1.75l3.25,-1.23l1.95,1.58l0.75,1.3ZM185.71,35.32l-5.3,-0.2l-0.32,-0.71l4.31,0.07l1.3,0.84ZM180.68,32.48l-3.34,1.0l-1.79,-1.1l-0.98,-1.87l-0.15,-1.73l4.1,0.53l2.67,1.7l-0.51,1.47ZM180.9,76.31l-1.1,1.08l-3.13,-1.23l-2.12,0.43l-2.71,-1.57l1.72,-1.09l1.55,-1.72l3.81,1.9l1.98,2.2ZM169.74,54.87l2.96,0.97l4.17,-0.57l0.41,0.88l-2.14,2.11l0.09,0.64l3.55,1.92l-0.4,3.72l-3.79,1.65l-2.17,-0.35l-1.72,-1.74l-6.02,-3.5l0.03,-0.85l4.68,0.54l0.4,-0.21l-0.05,-0.45l-2.48,-2.81l2.46,-1.95ZM174.45,40.74l1.37,1.73l0.07,2.44l-1.05,3.45l-3.79,0.47l-2.32,-0.69l0.05,-2.64l-0.44,-0.41l-3.68,0.35l-0.12,-3.1l2.45,0.1l3.67,-1.73l3.41,0.29l0.37,-0.26ZM170.05,31.55l0.67,1.56l-3.33,-0.49l-4.22,-1.77l-4.35,-0.16l1.4,-0.94l-0.06,-0.7l-2.81,-1.23l-0.12,-1.39l4.39,0.68l6.62,1.98l1.81,2.47ZM134.5,58.13l-1.02,1.82l0.45,0.58l5.4,-1.39l3.33,2.29l0.49,-0.03l2.6,-2.23l1.94,1.32l2.0,4.5l0.7,0.06l1.3,-2.29l-1.63,-4.46l1.69,-0.54l2.31,0.71l2.65,1.81l2.49,7.92l8.48,4.27l-0.19,1.35l-3.79,0.33l-0.26,0.67l1.4,1.49l-0.58,1.1l-4.23,-0.64l-4.43,-1.19l-3.0,0.28l-4.66,1.47l-10.52,1.04l-1.43,-2.02l-3.42,-1.2l-2.21,0.43l-2.51,-2.86l4.84,-1.05l3.6,0.19l3.27,-0.78l0.31,-0.39l-0.31,-0.39l-4.84,-1.06l-8.79,0.27l-0.85,-1.07l5.26,-1.66l0.27,-0.45l-0.4,-0.34l-3.8,0.06l-3.81,-1.06l1.81,-3.01l1.66,-1.79l6.48,-2.81l1.97,0.71ZM158.7,56.61l-1.7,2.44l-3.2,-2.75l0.37,-0.3l3.11,-0.18l1.42,0.79ZM149.61,42.73l1.01,1.89l0.5,0.18l2.14,-0.82l2.23,0.19l0.36,2.04l-1.33,2.09l-8.28,0.76l-6.35,2.15l-3.41,0.1l-0.19,-0.96l4.9,-2.08l0.23,-0.46l-0.41,-0.31l-11.25,0.59l-2.89,-0.74l3.04,-4.44l2.14,-1.32l6.81,1.69l4.58,3.06l4.37,0.39l0.36,-0.63l-3.36,-4.6l1.85,-1.53l2.18,0.51l0.77,2.26ZM144.76,34.41l-4.36,1.44l-3.0,-1.4l1.46,-1.24l3.47,-0.52l2.96,0.71l-0.52,1.01ZM145.13,29.83l-1.9,0.66l-3.67,-0.0l2.27,-1.61l3.3,0.95ZM118.92,65.79l-6.03,2.02l-1.33,-1.9l-5.38,-2.28l2.59,-5.05l2.16,-3.14l-0.02,-0.48l-1.97,-2.41l7.64,-0.7l3.6,1.02l6.3,0.27l4.42,2.95l-2.53,0.98l-6.24,3.43l-3.1,3.28l-0.11,2.01ZM129.54,35.53l-0.28,3.37l-1.72,1.62l-2.33,0.28l-4.61,2.19l-3.86,0.76l-2.64,-0.87l3.72,-3.4l5.01,-3.34l3.72,0.07l3.0,-0.67ZM111.09,152.69l-0.67,0.24l-3.85,-1.37l-0.83,-1.17l-2.12,-1.07l-0.66,-1.02l-2.4,-0.55l-0.74,-1.71l6.02,1.45l2.0,2.55l2.52,1.39l0.73,1.27ZM87.8,134.64l0.89,0.29l1.86,-0.21l-0.65,3.34l1.69,2.33l-1.31,-1.33l-0.99,-1.62l-1.17,-0.98l-0.33,-1.82Z",
      name: "Canada"
    },
    CG: {
      path: "M466.72,276.48l-0.1,1.03l-1.25,2.97l-0.19,3.62l-0.46,1.78l-0.23,0.63l-1.61,1.19l-1.21,1.39l-1.09,2.43l0.04,2.09l-3.25,3.24l-0.5,-0.24l-0.5,-0.83l-1.36,-0.02l-0.98,0.89l-1.68,-0.99l-1.54,1.24l-1.52,-1.96l1.57,-1.14l0.11,-0.52l-0.77,-1.35l2.1,-0.66l0.39,-0.73l1.05,0.82l2.21,0.11l1.12,-1.37l0.37,-1.81l-0.27,-2.09l-1.13,-1.5l1.0,-2.69l-0.13,-0.45l-0.92,-0.58l-1.6,0.17l-0.51,-0.94l0.1,-0.61l2.75,0.09l3.97,1.24l0.51,-0.33l0.17,-1.28l1.24,-2.21l1.28,-1.14l2.76,0.49Z",
      name: "Congo"
    },
    CF: {
      path: "M461.16,278.2l-0.26,-1.19l-1.09,-0.77l-0.84,-1.17l-0.29,-1.0l-1.04,-1.15l0.08,-3.43l0.58,-0.49l1.16,-2.35l1.85,-0.17l0.61,-0.62l0.97,0.58l3.15,-0.96l2.48,-1.92l0.02,-0.96l2.81,0.02l2.36,-1.17l1.93,-2.85l1.16,-0.93l1.11,-0.3l0.27,0.86l1.34,1.47l-0.39,2.01l0.3,1.01l4.01,2.75l0.17,0.93l2.63,2.31l0.6,1.44l2.08,1.4l-3.84,-0.21l-1.94,0.88l-1.23,-0.49l-2.67,1.2l-1.29,-0.18l-0.51,0.36l-0.6,1.22l-3.35,-0.65l-1.57,-0.91l-2.42,-0.83l-1.45,0.91l-0.97,1.27l-0.26,1.56l-3.22,-0.43l-1.49,1.33l-0.94,1.62Z",
      name: "Central African Rep."
    },
    CD: {
      path: "M487.01,272.38l2.34,-0.14l1.35,1.84l1.34,0.45l0.86,-0.39l1.21,0.12l1.07,-0.41l0.54,0.89l2.04,1.54l-0.14,2.72l0.7,0.54l-1.38,1.13l-1.53,2.54l-0.17,2.05l-0.59,1.08l-0.02,1.72l-0.72,0.84l-0.66,3.01l0.63,1.32l-0.44,4.26l0.64,1.47l-0.37,1.22l0.86,1.8l1.53,1.41l0.3,1.26l0.44,0.5l-4.08,0.75l-0.92,1.81l0.51,1.34l-0.74,5.43l0.17,0.38l2.45,1.46l0.54,-0.1l0.12,1.62l-1.28,-0.01l-1.85,-2.35l-1.94,-0.45l-0.48,-1.13l-0.55,-0.2l-1.41,0.74l-1.71,-0.3l-1.01,-1.18l-2.49,-0.19l-0.44,-0.77l-1.98,-0.21l-2.88,0.36l0.11,-2.41l-0.85,-1.13l-0.16,-1.36l0.32,-1.73l-0.46,-0.89l-0.04,-1.49l-0.4,-0.39l-2.53,0.02l0.1,-0.41l-0.39,-0.49l-1.28,0.01l-0.43,0.45l-1.62,0.32l-0.83,1.79l-1.09,-0.28l-2.4,0.52l-1.37,-1.91l-1.3,-3.3l-0.38,-0.27l-7.39,-0.03l-2.46,0.42l0.5,-0.45l0.37,-1.47l0.66,-0.38l0.92,0.08l0.73,-0.82l0.87,0.02l0.31,0.68l1.4,0.36l3.59,-3.63l0.01,-2.23l1.02,-2.29l2.69,-2.39l0.43,-0.99l0.49,-1.96l0.17,-3.51l1.25,-2.95l0.36,-3.14l0.86,-1.13l1.1,-0.66l3.57,1.73l3.65,0.73l0.46,-0.21l0.8,-1.46l1.24,0.19l2.61,-1.17l0.81,0.44l1.04,-0.03l0.59,-0.66l0.7,-0.16l1.81,0.25Z",
      name: "Dem. Rep. Congo"
    },
    CZ: {
      path: "M458.46,144.88l1.22,1.01l1.47,0.23l0.13,0.93l1.36,0.68l0.54,-0.2l0.24,-0.55l1.15,0.25l0.53,1.09l1.68,0.18l0.6,0.84l-1.04,0.73l-0.96,1.28l-1.6,0.17l-0.55,0.56l-1.04,-0.46l-1.05,0.15l-2.12,-0.96l-1.05,0.34l-1.2,1.12l-1.56,-0.87l-2.57,-2.1l-0.53,-1.88l4.7,-2.52l0.71,0.26l0.9,-0.28Z",
      name: "Czech Rep."
    },
    CY: {
      path: "M504.36,193.47l0.43,0.28l-1.28,0.57l-0.92,-0.28l-0.24,-0.46l2.01,-0.13Z",
      name: "Cyprus"
    },
    CR: {
      path: "M211.34,258.05l0.48,0.99l1.6,1.6l-0.54,0.45l0.29,1.42l-0.25,1.19l-1.09,-0.59l-0.05,-1.25l-2.46,-1.42l-0.28,-0.77l-0.66,-0.45l-0.45,-0.0l-0.11,1.04l-1.32,-0.95l0.31,-1.3l-0.36,-0.6l0.31,-0.27l1.42,0.58l1.29,-0.14l0.56,0.56l0.74,0.17l0.55,-0.27Z",
      name: "Costa Rica"
    },
    CU: {
      path: "M221.21,227.25l1.27,1.02l2.19,-0.28l4.43,3.33l2.08,0.43l-0.1,0.38l0.36,0.5l1.75,0.1l1.48,0.84l-3.11,0.51l-4.15,-0.03l0.77,-0.67l-0.04,-0.64l-1.2,-0.74l-1.49,-0.16l-0.7,-0.61l-0.56,-1.4l-0.4,-0.25l-1.34,0.1l-2.2,-0.66l-0.88,-0.58l-3.18,-0.4l-0.27,-0.16l0.58,-0.74l-0.36,-0.29l-2.72,-0.05l-1.7,1.29l-0.91,0.03l-0.61,0.69l-1.01,0.22l1.11,-1.29l1.01,-0.52l3.69,-1.01l3.98,0.21l2.21,0.84Z",
      name: "Cuba"
    },
    SZ: {
      path: "M500.35,351.36l0.5,2.04l-0.38,0.89l-1.05,0.21l-1.23,-1.2l-0.02,-0.64l0.83,-1.57l1.34,0.27Z",
      name: "Swaziland"
    },
    SY: {
      path: "M511.0,199.79l0.05,-1.33l0.54,-1.36l1.28,-0.99l0.13,-0.45l-0.41,-1.11l-1.14,-0.36l-0.19,-1.74l0.52,-1.0l1.29,-1.21l0.2,-1.18l0.59,0.23l2.62,-0.76l1.36,0.52l2.06,-0.01l2.95,-1.08l3.25,-0.26l-0.67,0.94l-1.28,0.66l-0.21,0.4l0.23,2.01l-0.88,3.19l-10.15,5.73l-2.15,-0.85Z",
      name: "Syria"
    },
    KG: {
      path: "M621.35,172.32l-3.87,1.69l-0.96,1.18l-3.04,0.34l-1.13,1.86l-2.36,-0.35l-1.99,0.63l-2.39,1.4l0.06,0.95l-0.4,0.37l-4.52,0.43l-3.02,-0.93l-2.37,0.17l0.11,-0.79l2.32,0.42l1.13,-0.88l1.99,0.2l3.21,-2.14l-0.03,-0.69l-2.97,-1.57l-1.94,0.65l-1.22,-0.74l1.71,-1.58l-0.12,-0.67l-0.36,-0.15l0.32,-0.77l1.36,-0.35l4.02,1.02l0.49,-0.3l0.35,-1.59l1.09,-0.48l3.42,1.22l1.11,-0.31l7.64,0.39l1.16,1.0l1.23,0.39Z",
      name: "Kyrgyzstan"
    },
    KE: {
      path: "M506.26,284.69l1.87,-2.56l0.93,-2.15l-1.38,-4.08l-1.06,-1.6l2.82,-2.75l0.79,0.26l0.12,1.41l0.86,0.83l1.9,0.11l3.28,2.13l3.57,0.44l1.05,-1.12l1.96,-0.9l0.82,0.68l1.16,0.09l-1.78,2.45l0.03,9.12l1.3,1.94l-1.37,0.78l-0.67,1.03l-1.08,0.46l-0.34,1.67l-0.81,1.07l-0.45,1.55l-0.68,0.56l-3.2,-2.23l-0.35,-1.58l-8.86,-4.98l0.14,-1.6l-0.57,-1.04Z",
      name: "Kenya"
    },
    SS: {
      path: "M481.71,263.34l1.07,-0.72l1.2,-3.18l1.36,-0.26l1.61,1.99l0.87,0.34l1.1,-0.41l1.5,0.07l0.57,0.53l2.49,0.0l0.44,-0.63l1.07,-0.4l0.45,-0.84l0.59,-0.33l1.9,1.33l1.6,-0.2l2.83,-3.33l-0.32,-2.21l1.59,-0.52l-0.24,1.6l0.3,1.83l1.35,1.18l0.2,1.87l0.35,0.41l0.02,1.53l-0.23,0.47l-1.42,0.25l-0.85,1.44l0.3,0.6l1.4,0.16l1.11,1.08l0.59,1.13l1.03,0.53l1.28,2.36l-4.41,3.98l-1.74,0.01l-1.89,0.55l-1.47,-0.52l-1.15,0.57l-2.96,-2.62l-1.3,0.49l-1.06,-0.15l-0.79,0.39l-0.82,-0.22l-1.8,-2.7l-1.91,-1.1l-0.66,-1.5l-2.62,-2.32l-0.18,-0.94l-2.37,-1.6Z",
      name: "S. Sudan"
    },
    SR: {
      path: "M283.12,270.19l2.1,0.53l-1.08,1.95l0.2,1.72l0.93,1.49l-0.59,2.03l-0.43,0.71l-1.12,-0.42l-1.32,0.22l-0.93,-0.2l-0.46,0.26l-0.25,0.73l0.33,0.7l-0.89,-0.13l-1.39,-1.97l-0.31,-1.34l-0.97,-0.31l-0.89,-1.47l0.35,-1.61l1.45,-0.82l0.33,-1.87l2.61,0.44l0.57,-0.47l1.75,-0.16Z",
      name: "Suriname"
    },
    KH: {
      path: "M689.52,249.39l0.49,1.45l-0.28,2.74l-4.0,1.86l-0.16,0.6l0.68,0.95l-2.06,0.17l-2.05,0.97l-1.82,-0.32l-2.12,-3.7l-0.55,-2.85l1.4,-1.85l3.02,-0.45l2.23,0.35l2.01,0.98l0.51,-0.14l0.95,-1.48l1.74,0.74Z",
      name: "Cambodia"
    },
    SV: {
      path: "M195.8,250.13l1.4,-1.19l2.24,1.45l0.98,-0.27l0.44,0.2l-0.27,1.05l-1.14,-0.03l-3.64,-1.21Z",
      name: "El Salvador"
    },
    SK: {
      path: "M476.82,151.17l-1.14,1.9l-2.73,-0.92l-0.82,0.2l-0.74,0.8l-3.46,0.73l-0.47,0.69l-1.76,0.33l-1.88,-1.0l-0.18,-0.81l0.38,-0.75l1.87,-0.32l1.74,-1.89l0.83,0.16l0.79,-0.34l1.51,1.04l1.34,-0.63l1.25,0.3l1.65,-0.42l1.81,0.95Z",
      name: "Slovakia"
    },
    KR: {
      path: "M737.51,185.84l0.98,-0.1l0.87,-1.17l2.69,-0.32l0.33,-0.29l1.76,2.79l0.58,1.76l0.02,3.12l-0.8,1.32l-2.21,0.55l-1.93,1.13l-1.8,0.19l-0.2,-1.1l0.43,-2.28l-0.95,-2.56l1.43,-0.37l0.23,-0.62l-1.43,-2.06Z",
      name: "Korea"
    },
    SI: {
      path: "M456.18,162.07l-0.51,-1.32l0.18,-1.05l1.69,0.2l1.42,-0.71l2.09,-0.07l0.62,-0.51l0.21,0.47l-1.61,0.67l-0.44,1.34l-0.66,0.24l-0.26,0.82l-1.22,-0.49l-0.84,0.46l-0.69,-0.04Z",
      name: "Slovenia"
    },
    KP: {
      path: "M736.77,185.16l-0.92,-0.42l-0.88,0.62l-1.21,-0.88l0.96,-1.15l0.59,-2.59l-0.46,-0.74l-2.09,-0.77l1.64,-1.52l2.72,-1.58l1.58,-1.91l1.11,0.78l2.17,0.11l0.41,-0.5l-0.3,-1.22l3.52,-1.18l0.94,-1.4l0.98,1.08l-2.19,2.18l0.01,2.14l-1.06,0.54l-1.41,1.4l-1.7,0.52l-1.25,1.09l-0.14,1.98l0.94,0.45l1.15,1.04l-0.13,0.26l-2.6,0.29l-1.13,1.29l-1.22,0.08Z",
      name: "Dem. Rep. Korea"
    },
    SO: {
      path: "M525.13,288.48l-1.13,-1.57l-0.03,-8.86l2.66,-3.38l1.67,-0.13l2.13,-1.69l3.41,-0.23l7.08,-7.55l2.91,-3.69l0.08,-4.82l2.98,-0.67l1.24,-0.86l0.45,-0.0l-0.2,3.0l-1.21,3.62l-2.73,5.97l-2.13,3.65l-5.03,6.16l-8.56,6.4l-2.78,3.08l-0.8,1.56Z",
      name: "Somalia"
    },
    SN: {
      path: "M390.09,248.21l0.12,1.55l0.49,1.46l0.96,0.82l0.05,1.28l-1.26,-0.19l-0.75,0.33l-1.84,-0.61l-5.84,-0.13l-2.54,0.51l-0.22,-1.03l1.77,0.04l2.01,-0.91l1.03,0.48l1.09,0.04l1.29,-0.62l0.14,-0.58l-0.51,-0.74l-1.81,0.25l-1.13,-0.63l-0.79,0.04l-0.72,0.61l-2.31,0.06l-0.92,-1.77l-0.81,-0.64l0.64,-0.35l2.46,-3.74l1.04,0.19l1.38,-0.56l1.19,-0.02l2.72,1.37l3.03,3.48Z",
      name: "Senegal"
    },
    SL: {
      path: "M394.46,264.11l-1.73,1.98l-0.58,1.33l-2.07,-1.06l-1.22,-1.26l-0.65,-2.39l1.16,-0.96l0.67,-1.17l1.21,-0.52l1.66,0.0l1.03,1.64l0.52,2.41Z",
      name: "Sierra Leone"
    },
    SB: {
      path: "M826.69,311.6l-0.61,0.09l-0.2,-0.33l0.37,0.15l0.44,0.09ZM824.18,307.38l-0.26,-0.3l-0.31,-0.91l0.03,0.0l0.54,1.21ZM823.04,309.33l-1.66,-0.22l-0.2,-0.52l1.16,0.28l0.69,0.46ZM819.28,304.68l1.14,0.65l0.02,0.03l-0.81,-0.44l-0.35,-0.23Z",
      name: "Solomon Is."
    },
    SA: {
      path: "M537.53,210.34l2.0,0.24l0.9,1.32l1.49,-0.06l0.87,2.08l1.29,0.76l0.51,0.99l1.56,1.03l-0.1,1.9l0.32,0.9l1.58,2.47l0.76,0.53l0.7,-0.04l1.68,4.23l7.53,1.33l0.51,-0.29l0.77,1.25l-1.55,4.87l-7.29,2.52l-7.3,1.03l-2.34,1.17l-1.88,2.74l-0.76,0.28l-0.82,-0.78l-0.91,0.12l-2.88,-0.51l-3.51,0.25l-0.86,-0.56l-0.57,0.15l-0.66,1.27l0.16,1.11l-0.43,0.32l-0.93,-1.4l-0.33,-1.16l-1.23,-0.88l-1.27,-2.06l-0.78,-2.22l-1.73,-1.79l-1.14,-0.48l-1.54,-2.31l-0.21,-3.41l-1.44,-2.93l-1.27,-1.16l-1.33,-0.57l-1.31,-3.37l-0.77,-0.67l-0.97,-1.97l-2.8,-4.03l-1.06,-0.17l0.37,-1.96l0.2,-0.72l2.74,0.3l1.08,-0.84l0.6,-0.94l1.74,-0.35l0.65,-1.03l0.71,-0.4l0.1,-0.62l-2.06,-2.28l4.39,-1.22l0.48,-0.37l2.77,0.69l3.66,1.9l7.03,5.5l4.87,0.3Z",
      name: "Saudi Arabia"
    },
    SE: {
      path: "M480.22,89.3l-4.03,1.17l-2.43,2.86l0.26,2.57l-8.77,6.64l-1.78,5.79l1.78,2.68l2.22,1.96l-2.07,3.77l-2.72,1.13l-0.95,6.04l-1.29,3.01l-2.74,-0.31l-0.4,0.22l-1.31,2.59l-2.34,0.13l-0.75,-3.09l-2.08,-4.03l-1.83,-4.96l1.0,-1.93l2.14,-2.7l0.83,-4.45l-1.6,-2.17l-0.15,-4.94l1.48,-3.39l2.58,-0.15l0.87,-1.59l-0.78,-1.57l3.76,-5.59l4.04,-7.48l2.17,0.01l0.39,-0.29l0.57,-2.07l4.37,0.64l0.46,-0.34l0.33,-2.56l1.1,-0.13l6.94,4.87l0.06,6.32l0.66,1.36Z",
      name: "Sweden"
    },
    SD: {
      path: "M505.98,259.4l-0.34,-0.77l-1.17,-0.9l-0.26,-1.61l0.29,-1.81l-0.34,-0.46l-1.16,-0.17l-0.54,0.59l-1.23,0.11l-0.28,0.65l0.53,0.65l0.17,1.22l-2.44,3.0l-0.96,0.19l-2.39,-1.4l-0.95,0.52l-0.38,0.78l-1.11,0.41l-0.29,0.5l-1.94,0.0l-0.54,-0.52l-1.81,-0.09l-0.95,0.4l-2.45,-2.35l-2.07,0.54l-0.73,1.26l-0.6,2.1l-1.25,0.58l-0.75,-0.62l0.27,-2.65l-1.48,-1.78l-0.22,-1.48l-0.92,-0.96l-0.02,-1.29l-0.57,-1.16l-0.68,-0.16l0.69,-1.29l-0.18,-1.14l0.65,-0.62l0.03,-0.55l-0.36,-0.41l1.55,-2.97l1.91,0.16l0.43,-0.4l-0.1,-10.94l2.49,-0.01l0.4,-0.4l-0.0,-4.82l29.02,0.0l0.64,2.04l-0.49,0.66l0.36,2.69l0.93,3.16l2.12,1.55l-0.89,1.04l-1.72,0.39l-0.98,0.9l-1.43,5.65l0.24,1.15l-0.38,2.06l-0.96,2.38l-1.53,1.31l-1.32,2.91l-1.22,0.86l-0.37,1.34Z",
      name: "Sudan"
    },
    DO: {
      path: "M241.8,239.2l0.05,-0.65l-0.46,-0.73l0.42,-0.44l0.19,-1.0l-0.09,-1.53l1.66,0.01l1.99,0.63l0.33,0.67l1.28,0.19l0.33,0.76l1.0,0.08l0.8,0.62l-0.45,0.51l-1.13,-0.47l-1.88,-0.01l-1.27,0.59l-0.75,-0.55l-1.01,0.54l-0.79,1.4l-0.23,-0.61Z",
      name: "Dominican Rep."
    },
    DJ: {
      path: "M528.43,256.18l-0.45,0.66l-0.58,-0.25l-1.51,0.13l-0.18,-1.01l1.45,-1.95l0.83,0.17l0.77,-0.44l0.2,1.0l-1.2,0.51l-0.06,0.7l0.73,0.47Z",
      name: "Djibouti"
    },
    DK: {
      path: "M452.28,129.07l-1.19,2.24l-2.13,-1.6l-0.23,-0.95l2.98,-0.95l0.57,1.26ZM447.74,126.31l-0.26,0.57l-0.88,-0.07l-1.8,2.53l0.48,1.69l-1.09,0.36l-1.61,-0.39l-0.89,-1.69l-0.07,-3.43l0.96,-1.73l2.02,-0.2l1.09,-1.07l1.33,-0.67l-0.05,1.06l-0.73,1.41l0.3,1.0l1.2,0.64Z",
      name: "Denmark"
    },
    DE: {
      path: "M453.14,155.55l-0.55,-0.36l-1.2,-0.1l-1.87,0.57l-2.13,-0.13l-0.56,0.63l-0.86,-0.6l-0.96,0.09l-2.57,-0.93l-0.85,0.67l-1.47,-0.02l0.24,-1.75l1.23,-2.14l-0.28,-0.59l-3.52,-0.58l-0.92,-0.66l0.12,-1.2l-0.48,-0.88l0.27,-2.17l-0.37,-3.03l1.41,-0.22l0.63,-1.26l0.66,-3.19l-0.41,-1.18l0.26,-0.39l1.66,-0.15l0.33,0.54l0.62,0.07l1.7,-1.69l-0.54,-3.02l1.37,0.33l1.31,-0.37l0.31,1.18l2.25,0.71l-0.02,0.92l0.5,0.4l2.55,-0.65l1.34,-0.87l2.57,1.24l1.06,0.98l0.48,1.44l-0.57,0.74l-0.0,0.48l0.87,1.15l0.57,1.64l-0.14,1.29l0.82,1.7l-1.5,-0.07l-0.56,0.57l-4.47,2.15l-0.22,0.54l0.68,2.26l2.58,2.16l-0.66,1.11l-0.79,0.36l-0.23,0.43l0.32,1.87Z",
      name: "Germany"
    },
    YE: {
      path: "M528.27,246.72l0.26,-0.42l-0.22,-1.01l0.19,-1.5l0.92,-0.69l-0.07,-1.35l0.39,-0.75l1.01,0.47l3.34,-0.27l3.76,0.41l0.95,0.81l1.36,-0.58l1.74,-2.62l2.18,-1.09l6.86,-0.94l2.48,5.41l-1.64,0.76l-0.56,1.9l-6.23,2.16l-2.29,1.8l-1.93,0.05l-1.41,1.02l-4.24,0.74l-1.72,1.49l-3.28,0.19l-0.52,-1.18l0.02,-1.51l-1.34,-3.29Z",
      name: "Yemen"
    },
    AT: {
      path: "M462.89,152.8l0.04,2.25l-1.07,0.0l-0.33,0.63l0.36,0.51l-1.04,2.13l-2.02,0.07l-1.33,0.7l-5.29,-0.99l-0.47,-0.93l-0.44,-0.21l-2.47,0.55l-0.42,0.51l-3.18,-0.81l0.43,-0.91l1.12,0.78l0.6,-0.17l0.25,-0.58l1.93,0.12l1.86,-0.56l1.0,0.08l0.68,0.57l0.62,-0.15l0.26,-0.77l-0.3,-1.78l0.8,-0.44l0.68,-1.15l1.52,0.85l0.47,-0.06l1.34,-1.25l0.64,-0.17l1.81,0.92l1.28,-0.11l0.7,0.37Z",
      name: "Austria"
    },
    DZ: {
      path: "M441.46,188.44l-0.32,1.07l0.39,2.64l-0.54,2.16l-1.58,1.82l0.37,2.39l1.91,1.55l0.18,0.8l1.42,1.03l1.84,7.23l0.12,1.16l-0.57,5.0l0.2,1.51l-0.87,0.99l-0.02,0.51l1.41,1.86l0.14,1.2l0.89,1.48l0.5,0.16l0.98,-0.41l1.73,1.08l0.82,1.23l-8.22,4.81l-7.23,5.11l-3.43,1.13l-2.3,0.21l-0.28,-1.59l-2.56,-1.09l-0.67,-1.25l-26.12,-17.86l0.01,-3.47l3.77,-1.88l2.44,-0.41l2.12,-0.75l1.08,-1.42l2.81,-1.05l0.35,-2.08l1.33,-0.29l1.04,-0.94l3.47,-0.69l0.46,-1.08l-0.1,-0.45l-0.58,-0.52l-0.82,-2.81l-0.19,-1.83l-0.78,-1.49l2.03,-1.31l2.63,-0.48l1.7,-1.22l2.31,-0.84l8.24,-0.73l1.49,0.38l2.28,-1.1l2.46,-0.02l0.92,0.6l1.35,-0.05Z",
      name: "Algeria"
    },
    US: {
      path: "M892.72,99.2l1.31,0.53l1.41,-0.37l1.89,0.98l1.89,0.42l-1.32,0.58l-2.9,-1.53l-2.08,0.22l-0.26,-0.15l0.07,-0.67ZM183.22,150.47l0.37,1.47l1.12,0.85l4.23,0.7l2.39,0.98l2.17,-0.38l1.85,0.5l-1.55,0.65l-3.49,2.61l-0.16,0.77l0.5,0.39l2.33,-0.61l1.77,1.02l5.15,-2.4l-0.31,0.65l0.25,0.56l1.36,0.38l1.71,1.16l4.7,-0.88l0.67,0.85l1.31,0.21l0.58,0.58l-1.34,0.17l-2.18,-0.32l-3.6,0.89l-2.71,3.25l0.35,0.9l0.59,-0.0l0.55,-0.6l-1.36,4.65l0.29,3.09l0.67,1.58l0.61,0.45l1.77,-0.44l1.6,-1.96l0.14,-2.21l-0.82,-1.96l0.11,-1.13l1.19,-2.37l0.44,-0.33l0.48,0.75l0.4,-0.29l0.4,-1.37l0.6,-0.47l0.24,-0.8l1.69,0.49l1.65,1.08l-0.03,2.37l-1.27,1.13l-0.0,1.13l0.87,0.36l1.66,-1.29l0.5,0.17l0.5,2.6l-2.49,3.75l0.17,0.61l1.54,0.62l1.48,0.17l1.92,-0.44l4.72,-2.15l2.16,-1.8l-0.05,-1.24l0.75,-0.22l3.92,0.36l2.12,-1.05l0.21,-0.4l-0.28,-1.48l3.27,-2.4l8.32,-0.02l0.56,-0.82l1.9,-0.77l0.93,-1.51l0.74,-2.37l1.58,-1.98l0.92,0.62l1.47,-0.47l0.8,0.66l-0.0,4.09l1.96,2.6l-2.34,1.31l-5.37,2.09l-1.83,2.72l0.02,1.79l0.83,1.59l0.54,0.23l-6.19,0.94l-2.2,0.89l-0.23,0.48l0.45,0.29l2.99,-0.46l-2.19,0.56l-1.13,0.0l-0.15,-0.32l-0.48,0.08l-0.76,0.82l0.22,0.67l0.32,0.06l-0.41,1.62l-1.27,1.58l-1.48,-1.07l-0.49,-0.04l-0.16,0.46l0.52,1.58l0.61,0.59l0.03,0.79l-0.95,1.38l-1.21,-1.22l-0.27,-2.27l-0.35,-0.35l-0.42,0.25l-0.48,1.27l0.33,1.41l-0.97,-0.27l-0.48,0.24l0.18,0.5l1.52,0.83l0.1,2.52l0.79,0.51l0.52,3.42l-1.42,1.88l-2.47,0.8l-1.71,1.66l-1.31,0.25l-1.27,1.03l-0.43,0.99l-2.69,1.78l-2.64,3.03l-0.45,2.12l0.45,2.08l0.85,2.38l1.09,1.9l0.04,1.2l1.16,3.06l-0.18,2.69l-0.55,1.43l-0.47,0.21l-0.89,-0.23l-0.49,-1.18l-0.87,-0.56l-2.75,-5.16l0.48,-1.68l-0.72,-1.78l-2.01,-2.38l-1.12,-0.53l-2.72,1.18l-1.47,-1.35l-1.57,-0.68l-2.99,0.31l-2.17,-0.3l-2.0,0.19l-1.15,0.46l-0.19,0.58l0.39,0.63l0.14,1.34l-0.84,-0.2l-0.84,0.46l-1.58,-0.07l-2.08,-1.44l-2.09,0.33l-1.91,-0.62l-3.73,0.84l-2.39,2.07l-2.54,1.22l-1.45,1.41l-0.61,1.38l0.34,3.71l-0.29,0.02l-3.5,-1.33l-1.25,-3.11l-1.44,-1.5l-2.24,-3.56l-1.76,-1.09l-2.27,-0.01l-1.71,2.07l-1.76,-0.69l-1.16,-0.74l-1.52,-2.98l-3.93,-3.16l-4.34,-0.0l-0.4,0.4l-0.0,0.74l-6.5,0.02l-9.02,-3.14l-0.34,-0.71l-5.7,0.49l-0.43,-1.29l-1.62,-1.61l-1.14,-0.38l-0.55,-0.88l-1.28,-0.13l-1.01,-0.77l-2.22,-0.27l-0.43,-0.3l-0.36,-1.58l-2.4,-2.83l-2.01,-3.85l-0.06,-0.9l-2.92,-3.26l-0.33,-2.29l-1.3,-1.66l0.52,-2.37l-0.09,-2.57l-0.78,-2.3l0.95,-2.82l0.61,-5.68l-0.47,-4.27l-1.46,-4.08l3.19,0.79l1.26,2.83l0.69,0.08l0.69,-1.14l-1.1,-4.79l68.76,-0.0l0.4,-0.4l0.14,-0.86ZM32.44,67.52l1.73,1.97l0.55,0.05l0.99,-0.79l3.65,0.24l-0.09,0.62l0.32,0.45l3.83,0.77l2.61,-0.43l5.19,1.4l4.84,0.43l1.89,0.57l3.42,-0.7l6.14,1.87l-0.03,38.06l0.38,0.4l2.39,0.11l2.31,0.98l3.9,3.99l0.55,0.04l2.4,-2.03l2.16,-1.04l1.2,1.71l3.95,3.14l4.09,6.63l4.2,2.29l0.06,1.83l-1.02,1.23l-1.16,-1.08l-2.04,-1.03l-0.67,-2.89l-3.28,-3.03l-1.65,-3.57l-6.35,-0.32l-2.82,-1.01l-5.26,-3.85l-6.77,-2.04l-3.53,0.3l-4.81,-1.69l-3.25,-1.63l-2.78,0.8l-0.28,0.46l0.44,2.21l-3.91,0.96l-2.26,1.27l-2.3,0.65l-0.27,-1.65l1.05,-3.42l2.49,-1.09l0.16,-0.6l-0.69,-0.96l-0.55,-0.1l-3.19,2.12l-1.78,2.56l-3.55,2.61l-0.04,0.61l1.56,1.52l-2.07,2.29l-5.11,2.57l-0.77,1.66l-3.76,1.77l-0.92,1.73l-2.69,1.38l-1.81,-0.22l-6.95,3.32l-3.97,0.91l4.85,-2.5l2.59,-1.86l3.26,-0.52l1.19,-1.4l3.42,-2.1l2.59,-2.27l0.42,-2.68l1.23,-2.1l-0.04,-0.46l-0.45,-0.11l-2.68,1.03l-0.63,-0.49l-0.53,0.03l-1.05,1.04l-1.36,-1.54l-0.66,0.08l-0.32,0.62l-0.58,-1.14l-0.56,-0.16l-2.41,1.42l-1.07,-0.0l-0.17,-1.75l0.3,-1.71l-1.61,-1.33l-3.41,0.59l-1.96,-1.63l-1.57,-0.84l-0.15,-2.21l-1.7,-1.43l0.82,-1.88l1.99,-2.12l0.88,-1.92l1.71,-0.24l2.04,0.51l1.87,-1.77l1.91,0.25l1.91,-1.23l0.17,-0.43l-0.47,-1.82l-1.07,-0.7l1.39,-1.17l0.12,-0.45l-0.39,-0.26l-1.65,0.07l-2.66,0.88l-0.75,0.78l-1.92,-0.8l-3.46,0.44l-3.44,-0.91l-1.06,-1.61l-2.65,-1.99l2.91,-1.43l5.5,-2.0l1.52,0.0l-0.26,1.62l0.41,0.46l5.29,-0.16l0.3,-0.65l-2.03,-2.59l-3.14,-1.68l-1.79,-2.12l-2.4,-1.83l-3.09,-1.24l1.04,-1.69l4.23,-0.14l3.36,-2.07l0.73,-2.27l2.39,-1.99l2.42,-0.52l4.65,-1.97l2.46,0.23l3.71,-2.35l3.5,0.89ZM37.6,123.41l-2.25,1.23l-0.95,-0.69l-0.29,-1.24l3.21,-1.63l1.42,0.21l0.67,0.7l-1.8,1.42ZM31.06,234.03l0.98,0.47l0.74,0.87l-1.77,1.07l-0.44,-1.53l0.49,-0.89ZM29.34,232.07l0.18,0.05l0.08,0.05l-0.16,0.03l-0.11,-0.14ZM25.16,230.17l0.05,-0.03l0.18,0.22l-0.13,-0.01l-0.1,-0.18ZM5.89,113.26l-1.08,0.41l-2.21,-1.12l1.53,-0.4l1.62,0.28l0.14,0.83Z",
      name: "United States"
    },
    LV: {
      path: "M489.16,122.85l0.96,0.66l0.22,1.65l0.68,1.76l-3.65,1.7l-2.23,-1.58l-1.29,-0.26l-0.68,-0.77l-2.42,0.34l-4.16,-0.23l-2.47,0.9l0.06,-1.98l1.13,-2.06l1.95,-1.02l2.12,2.58l2.01,-0.07l0.38,-0.33l0.44,-2.52l1.76,-0.53l3.06,1.7l2.15,0.07Z",
      name: "Latvia"
    },
    UY: {
      path: "M286.85,372.74l-0.92,1.5l-2.59,1.44l-1.69,-0.52l-1.42,0.26l-2.39,-1.19l-1.52,0.08l-1.27,-1.3l0.16,-1.5l0.56,-0.79l-0.02,-2.73l1.21,-4.74l1.19,-0.21l2.37,2.0l1.08,0.03l4.36,3.17l1.22,1.6l-0.96,1.5l0.61,1.4Z",
      name: "Uruguay"
    },
    LB: {
      path: "M510.37,198.01l-0.88,0.51l1.82,-3.54l0.62,0.08l0.22,0.61l-1.13,0.88l-0.65,1.47Z",
      name: "Lebanon"
    },
    LA: {
      path: "M689.54,248.53l-1.76,-0.74l-0.49,0.15l-0.94,1.46l-1.32,-0.64l0.62,-0.98l0.11,-2.17l-2.04,-2.42l-0.25,-2.65l-1.9,-2.1l-2.15,-0.31l-0.78,0.91l-1.12,0.06l-1.05,-0.4l-2.06,1.2l-0.04,-1.59l0.61,-2.68l-0.36,-0.49l-1.35,-0.1l-0.11,-1.23l-0.96,-0.88l1.96,-1.89l0.39,0.36l1.33,0.07l0.42,-0.45l-0.34,-2.66l0.7,-0.21l1.28,1.81l1.11,2.35l0.36,0.23l2.82,0.02l0.71,1.67l-1.39,0.65l-0.72,0.93l0.13,0.6l2.91,1.51l3.6,5.25l1.88,1.78l0.56,1.62l-0.35,1.96Z",
      name: "Lao PDR"
    },
    TW: {
      path: "M724.01,226.68l-0.74,1.48l-0.9,-1.52l-0.25,-1.74l1.38,-2.44l1.73,-1.74l0.64,0.44l-1.85,5.52Z",
      name: "Taiwan"
    },
    TT: {
      path: "M266.64,259.32l0.28,-1.16l1.13,-0.22l-0.06,1.2l-1.35,0.18Z",
      name: "Trinidad and Tobago"
    },
    TR: {
      path: "M513.21,175.47l3.64,1.17l3.05,-0.44l2.1,0.26l3.11,-1.56l2.46,-0.13l2.19,1.33l0.33,0.82l-0.22,1.33l0.25,0.44l2.28,1.13l-1.17,0.57l-0.21,0.45l0.75,3.2l-0.41,1.16l1.13,1.92l-0.55,0.22l-0.9,-0.67l-2.91,-0.37l-1.24,0.46l-4.23,0.41l-2.81,1.05l-1.91,0.01l-1.52,-0.53l-2.58,0.75l-0.66,-0.45l-0.62,0.3l-0.12,1.45l-0.89,0.84l-0.47,-0.67l0.79,-1.3l-0.41,-0.2l-1.43,0.23l-2.0,-0.63l-2.02,1.65l-3.51,0.3l-2.13,-1.53l-2.7,-0.1l-0.86,1.24l-1.38,0.27l-2.29,-1.44l-2.71,-0.01l-1.37,-2.65l-1.68,-1.52l1.07,-1.99l-0.09,-0.49l-1.27,-1.12l2.37,-2.41l3.7,-0.11l1.28,-2.24l4.49,0.37l3.21,-1.97l2.81,-0.82l3.99,-0.06l4.29,2.07ZM488.79,176.72l-1.72,1.31l-0.5,-0.88l1.37,-2.57l-0.7,-0.85l1.7,-0.63l1.8,0.34l0.46,1.17l1.76,0.78l-2.87,0.32l-1.3,1.01Z",
      name: "Turkey"
    },
    LK: {
      path: "M624.16,268.99l-1.82,0.48l-0.99,-1.67l-0.42,-3.46l0.95,-3.43l1.21,0.98l2.26,4.19l-0.34,2.33l-0.85,0.58Z",
      name: "Sri Lanka"
    },
    TN: {
      path: "M448.1,188.24l-1.0,1.27l-0.02,1.32l0.84,0.88l-0.28,2.09l-1.53,1.32l-0.12,0.42l0.48,1.54l1.42,0.32l0.53,1.11l0.9,0.52l-0.11,1.67l-3.54,2.64l-0.1,2.38l-0.58,0.3l-0.96,-4.45l-1.54,-1.25l-0.16,-0.78l-1.92,-1.56l-0.18,-1.76l1.51,-1.62l0.59,-2.34l-0.38,-2.78l0.42,-1.21l2.45,-1.05l1.29,0.26l-0.06,1.11l0.58,0.38l1.47,-0.73Z",
      name: "Tunisia"
    },
    TL: {
      path: "M734.55,307.93l-0.1,-0.97l4.5,-0.86l-2.82,1.28l-1.59,0.55Z",
      name: "Timor-Leste"
    },
    TM: {
      path: "M553.03,173.76l-0.04,0.34l-0.09,-0.22l0.13,-0.12ZM555.87,172.66l0.45,-0.1l1.48,0.74l2.06,2.43l4.07,-0.18l0.38,-0.51l-0.32,-1.19l1.92,-0.94l1.91,-1.59l2.94,1.39l0.43,2.47l1.19,0.67l2.58,-0.13l0.62,0.4l1.32,3.12l4.54,3.44l2.67,1.45l3.06,1.14l-0.04,1.05l-1.33,-0.75l-0.59,0.19l-0.32,0.84l-2.2,0.81l-0.46,2.13l-1.21,0.74l-1.91,0.42l-0.73,1.33l-1.56,0.31l-2.22,-0.94l-0.2,-2.17l-0.38,-0.36l-1.73,-0.09l-2.76,-2.46l-2.14,-0.4l-2.84,-1.48l-1.78,-0.27l-1.24,0.53l-1.57,-0.08l-2.0,1.69l-1.7,0.43l-0.36,-1.58l0.36,-2.98l-0.22,-0.4l-1.65,-0.84l0.54,-1.69l-0.34,-0.52l-1.22,-0.13l0.36,-1.64l2.22,0.59l2.2,-0.95l0.12,-0.65l-1.77,-1.74l-0.66,-1.57Z",
      name: "Turkmenistan"
    },
    TJ: {
      path: "M597.75,178.82l-2.54,-0.44l-0.47,0.34l-0.24,1.7l0.43,0.45l2.64,-0.22l3.18,0.95l4.39,-0.41l0.56,2.37l0.52,0.29l0.67,-0.24l1.11,0.49l0.21,2.13l-3.76,-0.21l-1.8,1.32l-1.76,0.74l-0.61,-0.58l0.21,-2.23l-0.64,-0.49l-0.07,-0.93l-1.36,-0.66l-0.45,0.07l-1.08,1.01l-0.55,1.48l-1.31,-0.05l-0.95,1.16l-0.9,-0.35l-1.86,0.74l1.26,-2.83l-0.54,-2.17l-1.67,-0.82l0.33,-0.66l2.18,-0.04l1.19,-1.63l0.76,-1.79l2.43,-0.5l-0.26,1.0l0.73,1.05Z",
      name: "Tajikistan"
    },
    LS: {
      path: "M491.06,363.48l-0.49,0.15l-1.49,-1.67l1.1,-1.43l2.19,-1.44l1.51,1.27l-0.98,1.82l-1.23,0.38l-0.62,0.93Z",
      name: "Lesotho"
    },
    TH: {
      path: "M670.27,255.86l-1.41,3.87l0.15,2.0l0.38,0.36l1.38,0.07l0.9,2.04l0.55,2.34l1.4,1.44l1.61,0.38l0.96,0.97l-0.5,0.64l-1.1,0.2l-0.34,-1.18l-2.04,-1.1l-0.63,0.23l-0.63,-0.62l-0.48,-1.3l-2.56,-2.63l-0.73,0.41l0.95,-3.89l2.16,-4.22ZM670.67,254.77l-0.92,-2.18l-0.26,-2.61l-2.14,-3.06l0.71,-0.49l0.89,-2.59l-3.61,-5.45l0.87,-0.51l1.05,-2.58l1.74,-0.18l2.6,-1.59l0.76,0.56l0.13,1.39l0.37,0.36l1.23,0.09l-0.51,2.28l0.05,2.42l0.6,0.34l2.43,-1.42l0.77,0.39l1.47,-0.07l0.71,-0.88l1.48,0.14l1.71,1.88l0.25,2.65l1.92,2.11l-0.1,1.89l-0.61,0.86l-2.22,-0.33l-3.5,0.64l-1.6,2.12l0.36,2.58l-1.51,-0.79l-1.84,-0.01l0.28,-1.52l-0.4,-0.47l-2.21,0.01l-0.4,0.37l-0.19,2.74l-0.34,0.93Z",
      name: "Thailand"
    },
    TF: {
      path: "M596.68,420.38l-3.2,0.18l-0.05,-1.26l0.39,-1.41l1.3,0.78l2.08,0.35l-0.52,1.36Z",
      name: "Fr. S. Antarctic Lands"
    },
    TG: {
      path: "M422.7,257.63l-0.09,1.23l1.53,1.52l0.08,1.09l0.5,0.65l-0.11,5.62l0.49,1.47l-1.31,0.35l-1.02,-2.13l-0.18,-1.12l0.53,-2.19l-0.63,-1.16l-0.22,-3.68l-1.01,-1.4l0.07,-0.28l1.37,0.03Z",
      name: "Togo"
    },
    TD: {
      path: "M480.25,235.49l0.12,9.57l-2.1,0.05l-1.14,1.89l-0.69,1.63l0.34,0.73l-0.66,0.91l0.24,0.89l-0.86,1.95l0.45,0.5l0.6,-0.1l0.34,0.64l0.03,1.38l0.9,1.04l-1.45,0.43l-1.27,1.03l-1.83,2.76l-2.16,1.07l-2.31,-0.15l-0.86,0.25l-0.26,0.49l0.17,0.61l-2.11,1.68l-2.85,0.87l-1.09,-0.57l-0.73,0.66l-1.12,0.1l-1.1,-3.12l-1.25,-0.64l-1.22,-1.22l0.29,-0.64l3.01,0.04l0.35,-0.6l-1.3,-2.2l-0.08,-3.31l-0.97,-1.66l0.22,-1.04l-0.38,-0.48l-1.22,-0.04l0.0,-1.25l-0.98,-1.07l0.96,-3.01l3.25,-2.65l0.13,-3.33l0.95,-5.18l0.52,-1.07l-0.1,-0.48l-0.91,-0.78l-0.2,-0.96l-0.8,-0.58l-0.55,-3.65l2.1,-1.2l19.57,9.83Z",
      name: "Chad"
    },
    LY: {
      path: "M483.48,203.15l-0.75,1.1l0.29,1.39l-0.6,1.83l0.73,2.14l0.0,24.12l-2.48,0.01l-0.41,0.85l-19.41,-9.76l-4.41,2.28l-1.37,-1.33l-3.82,-1.1l-1.14,-1.65l-1.98,-1.23l-1.22,0.32l-0.66,-1.11l-0.17,-1.26l-1.28,-1.69l0.87,-1.19l-0.07,-4.34l0.43,-2.27l-0.86,-3.45l1.13,-0.76l0.22,-1.16l-0.2,-1.03l3.48,-2.61l0.29,-1.94l2.45,0.8l1.18,-0.21l1.98,0.44l3.15,1.18l1.37,2.54l5.72,1.67l2.64,1.35l1.61,-0.72l1.29,-1.34l-0.44,-2.34l0.66,-1.13l1.67,-1.21l1.57,-0.35l3.14,0.53l1.08,1.28l3.99,0.78l0.36,0.54Z",
      name: "Libya"
    },
    AE: {
      path: "M550.76,223.97l1.88,-0.4l3.84,0.02l4.78,-4.75l0.19,0.36l0.26,1.58l-0.81,0.01l-0.39,0.35l-0.08,2.04l-0.81,0.63l-0.01,0.96l-0.66,0.99l-0.39,1.41l-7.08,-1.25l-0.7,-1.96Z",
      name: "United Arab Emirates"
    },
    VE: {
      path: "M240.68,256.69l0.53,0.75l-0.02,1.06l-1.07,1.78l0.95,2.0l0.42,0.22l1.4,-0.44l0.56,-1.83l-0.77,-1.17l-0.1,-1.47l2.82,-0.93l0.26,-0.49l-0.28,-0.96l0.3,-0.28l0.66,1.31l1.96,0.26l1.4,1.22l0.08,0.68l0.39,0.35l4.81,-0.22l1.49,1.11l1.92,0.31l1.67,-0.84l0.22,-0.6l3.44,-0.14l-0.17,0.55l0.86,1.19l2.19,0.35l1.67,1.1l0.37,1.86l0.41,0.32l1.55,0.17l-1.66,1.35l-0.22,0.92l0.65,0.97l-1.67,0.54l-0.3,0.4l0.04,0.99l-0.56,0.57l-0.01,0.55l1.85,2.27l-0.66,0.69l-4.47,1.29l-0.72,0.54l-3.69,-0.9l-0.71,0.27l-0.02,0.7l0.91,0.53l-0.08,1.54l0.35,1.58l0.35,0.31l1.66,0.17l-1.3,0.52l-0.48,1.13l-2.68,0.91l-0.6,0.77l-1.57,0.13l-1.17,-1.13l-0.8,-2.52l-1.25,-1.26l1.02,-1.23l-1.29,-2.95l0.18,-1.62l1.0,-2.21l-0.2,-0.49l-1.14,-0.46l-4.02,0.36l-1.82,-2.1l-1.57,-0.33l-2.99,0.22l-1.06,-0.97l0.25,-1.23l-0.2,-1.01l-0.59,-0.69l-0.29,-1.06l-1.08,-0.39l0.78,-2.79l1.9,-2.11Z",
      name: "Venezuela"
    },
    AF: {
      path: "M600.7,188.88l-1.57,1.3l-0.1,0.48l0.8,2.31l-1.09,1.04l-0.03,1.27l-0.48,0.71l-2.16,-0.08l-0.37,0.59l0.78,1.48l-1.38,0.69l-1.06,1.69l0.06,1.7l-0.65,0.52l-0.91,-0.21l-1.91,0.36l-0.48,0.77l-1.88,0.13l-1.4,1.56l-0.18,2.32l-2.91,1.02l-1.65,-0.23l-0.71,0.55l-1.41,-0.3l-2.41,0.39l-3.52,-1.17l1.96,-2.35l-0.21,-1.78l-0.3,-0.34l-1.63,-0.4l-0.19,-1.58l-0.75,-2.03l0.95,-1.36l-0.19,-0.6l-0.73,-0.28l1.47,-4.8l2.14,0.9l2.12,-0.36l0.74,-1.34l1.77,-0.39l1.54,-0.92l0.63,-2.31l1.87,-0.5l0.49,-0.81l0.94,0.56l2.13,0.11l2.55,0.92l1.95,-0.83l0.65,0.43l0.56,-0.13l0.69,-1.12l1.57,-0.08l0.72,-1.66l0.79,-0.74l0.8,0.39l-0.17,0.56l0.71,0.58l-0.08,2.39l1.11,0.95ZM601.37,188.71l1.73,-0.71l1.43,-1.18l4.03,0.35l-2.23,0.74l-4.95,0.8Z",
      name: "Afghanistan"
    },
    IQ: {
      path: "M530.82,187.47l0.79,0.66l1.26,-0.28l1.46,3.08l1.63,0.94l0.14,1.23l-1.22,1.05l-0.53,2.52l1.73,2.67l3.12,1.62l1.15,1.88l-0.38,1.85l0.39,0.48l0.41,-0.0l0.02,1.07l0.76,0.94l-2.47,-0.1l-1.71,2.44l-4.31,-0.2l-7.02,-5.48l-3.73,-1.94l-2.88,-0.73l-0.85,-2.87l5.45,-3.02l0.95,-3.43l-0.19,-1.96l1.27,-0.7l1.22,-1.7l0.87,-0.36l2.69,0.34Z",
      name: "Iraq"
    },
    IS: {
      path: "M384.14,88.06l-0.37,2.61l2.54,2.51l-2.9,2.75l-9.19,3.4l-9.25,-1.66l1.7,-1.22l-0.1,-0.7l-4.05,-1.47l2.96,-0.53l0.33,-0.43l-0.11,-1.2l-0.33,-0.36l-4.67,-0.85l1.28,-2.04l3.45,-0.56l3.77,2.72l0.44,0.02l3.64,-2.16l3.3,1.08l3.98,-2.16l3.58,0.26Z",
      name: "Iceland"
    },
    IR: {
      path: "M533.43,187.16l-1.27,-2.15l0.42,-0.98l-0.71,-3.04l1.03,-0.5l0.33,0.83l1.26,1.35l2.05,0.51l1.11,-0.16l2.89,-2.11l0.62,-0.14l0.39,0.46l-0.72,1.2l0.06,0.49l1.56,1.53l0.65,0.04l0.67,1.81l2.56,0.83l1.87,1.48l3.69,0.49l3.91,-0.76l0.47,-0.73l2.17,-0.6l1.66,-1.54l1.51,0.08l1.18,-0.53l1.59,0.24l2.83,1.48l1.88,0.3l2.77,2.47l1.77,0.18l0.18,1.99l-1.68,5.49l0.24,0.5l0.61,0.23l-0.82,1.48l0.8,2.18l0.19,1.71l0.3,0.34l1.63,0.4l0.15,1.32l-2.15,2.35l-0.01,0.53l2.21,3.03l2.34,1.24l0.06,2.14l1.24,0.72l0.11,0.69l-3.31,1.27l-1.08,3.03l-9.68,-1.68l-0.99,-3.05l-1.43,-0.73l-2.17,0.46l-2.47,1.26l-2.83,-0.82l-2.46,-2.02l-2.41,-0.8l-3.42,-6.06l-0.48,-0.2l-1.18,0.39l-1.44,-0.82l-0.5,0.08l-0.65,0.74l-0.97,-1.01l-0.02,-1.31l-0.71,-0.39l0.26,-1.81l-1.29,-2.11l-3.13,-1.63l-1.58,-2.43l0.5,-1.9l1.31,-1.26l-0.19,-1.66l-1.74,-1.1l-1.57,-3.3Z",
      name: "Iran"
    },
    AM: {
      path: "M536.99,182.33l-0.28,0.03l-1.23,-2.13l-0.93,0.01l-0.62,-0.66l-0.69,-0.07l-0.96,-0.81l-1.56,-0.62l0.19,-1.12l-0.26,-0.79l2.72,-0.36l1.09,1.01l-0.17,0.92l1.02,0.78l-0.47,0.62l0.08,0.56l2.04,1.23l0.04,1.4Z",
      name: "Armenia"
    },
    IT: {
      path: "M451.59,158.63l3.48,0.94l-0.21,1.17l0.3,0.83l-1.49,-0.24l-2.04,1.1l-0.21,0.39l0.13,1.45l-0.25,1.12l0.82,1.57l2.39,1.63l1.31,2.54l2.79,2.43l2.05,0.08l0.21,0.23l-0.39,0.33l0.09,0.67l4.05,1.97l2.17,1.76l-0.16,0.36l-1.17,-1.08l-2.18,-0.49l-0.44,0.2l-1.05,1.91l0.14,0.54l1.57,0.95l-0.19,0.98l-1.06,0.33l-1.25,2.34l-0.37,0.08l0.0,-0.33l1.0,-2.45l-1.73,-3.17l-1.12,-0.51l-0.88,-1.33l-1.51,-0.51l-1.27,-1.25l-1.75,-0.18l-4.12,-3.21l-1.62,-1.65l-1.03,-3.19l-3.53,-1.36l-1.3,0.51l-1.69,1.41l0.16,-0.72l-0.28,-0.47l-1.14,-0.33l-0.53,-1.96l0.72,-0.78l0.04,-0.48l-0.65,-1.17l0.8,0.39l1.4,-0.23l1.11,-0.84l0.52,0.35l1.19,-0.1l0.75,-1.2l1.53,0.33l1.36,-0.56l0.35,-1.14l1.08,0.32l0.68,-0.64l1.98,-0.44l0.42,0.82ZM459.19,184.75l-0.65,1.65l0.32,1.05l-0.31,0.89l-1.5,-0.85l-4.5,-1.67l0.19,-0.82l2.67,0.23l3.78,-0.48ZM443.93,176.05l1.18,1.66l-0.3,3.32l-1.06,-0.01l-0.77,0.73l-0.53,-0.44l-0.1,-3.37l-0.39,-1.22l1.04,0.01l0.92,-0.68Z",
      name: "Italy"
    },
    VN: {
      path: "M690.56,230.25l-2.7,1.82l-2.09,2.46l-0.63,1.95l4.31,6.45l2.32,1.65l1.43,1.94l1.11,4.59l-0.32,4.24l-1.93,1.54l-2.84,1.61l-2.11,2.15l-2.73,2.06l-0.59,-1.05l0.63,-1.53l-0.13,-0.47l-1.34,-1.04l1.51,-0.71l2.55,-0.18l0.3,-0.63l-0.82,-1.14l4.0,-2.07l0.31,-3.05l-0.57,-1.77l0.42,-2.66l-0.73,-1.97l-1.86,-1.76l-3.63,-5.29l-2.72,-1.46l0.36,-0.47l1.5,-0.64l0.21,-0.52l-0.97,-2.27l-0.37,-0.24l-2.83,-0.02l-2.24,-3.9l0.83,-0.4l4.39,-0.29l2.06,-1.31l1.15,0.89l1.88,0.4l-0.17,1.51l1.35,1.16l1.67,0.45Z",
      name: "Vietnam"
    },
    AR: {
      path: "M249.29,428.93l-2.33,-0.52l-5.83,-0.43l-0.89,-1.66l0.05,-2.37l-0.45,-0.4l-1.43,0.18l-0.67,-0.91l-0.2,-3.13l1.88,-1.47l0.79,-2.04l-0.25,-1.7l1.3,-2.68l0.91,-4.15l-0.22,-1.69l0.85,-0.45l0.2,-0.44l-0.27,-1.16l-0.98,-0.68l0.59,-0.92l-0.05,-0.5l-1.04,-1.07l-0.52,-3.1l0.97,-0.86l-0.42,-3.58l1.2,-5.43l1.38,-0.98l0.16,-0.43l-0.75,-2.79l-0.01,-2.43l1.78,-1.75l0.06,-2.57l1.43,-2.85l0.01,-2.58l-0.69,-0.74l-1.09,-4.52l1.47,-2.7l-0.18,-2.79l0.85,-2.35l1.59,-2.46l1.73,-1.64l0.05,-0.52l-0.6,-0.84l0.44,-0.85l-0.07,-4.19l2.7,-1.44l0.86,-2.75l-0.21,-0.71l1.76,-2.01l2.9,0.57l1.38,1.78l0.68,-0.08l0.87,-1.87l2.39,0.09l4.95,4.77l2.17,0.49l3.0,1.92l2.47,1.0l0.25,0.82l-2.37,3.93l0.23,0.59l5.39,1.16l2.12,-0.44l2.45,-2.16l0.5,-2.38l0.76,-0.31l0.98,1.2l-0.04,1.8l-3.67,2.51l-2.85,2.66l-3.43,3.88l-1.3,5.07l0.01,2.72l-0.54,0.73l-0.36,3.28l3.14,2.64l-0.16,2.11l1.4,1.11l-0.1,1.09l-2.29,3.52l-3.55,1.49l-4.92,0.6l-2.71,-0.29l-0.43,0.51l0.5,1.65l-0.49,2.1l0.38,1.42l-1.19,0.83l-2.36,0.38l-2.3,-1.04l-1.38,0.83l0.41,3.64l1.69,0.91l1.4,-0.71l0.36,0.76l-2.04,0.86l-2.01,1.89l-0.97,4.63l-2.34,0.1l-2.09,1.78l-0.61,2.75l2.46,2.31l2.17,0.63l-0.7,2.32l-2.83,1.73l-1.73,3.86l-2.17,1.22l-1.16,1.67l0.75,3.76l1.04,1.28ZM256.71,438.88l-2.0,0.15l-1.4,-1.22l-3.82,-0.1l-0.0,-5.83l1.6,3.05l3.26,2.07l3.08,0.78l-0.71,1.1Z",
      name: "Argentina"
    },
    AU: {
      path: "M705.8,353.26l0.26,0.04l0.17,-0.47l-0.48,-1.42l0.92,1.11l0.45,0.15l0.27,-0.39l-0.1,-1.56l-1.98,-3.63l1.09,-3.31l-0.24,-1.57l0.34,-0.62l0.38,1.06l0.43,-0.19l0.99,-1.7l1.91,-0.83l1.29,-1.15l1.81,-0.91l0.96,-0.17l0.92,0.26l1.92,-0.95l1.47,-0.28l1.03,-0.8l1.43,0.04l2.78,-0.84l1.36,-1.15l0.71,-1.45l1.41,-1.26l0.3,-2.58l1.27,-1.59l0.78,1.65l0.54,0.19l1.07,-0.51l0.15,-0.6l-0.73,-1.0l0.45,-0.71l0.78,0.39l0.58,-0.3l0.28,-1.82l1.87,-2.14l1.12,-0.39l0.28,-0.58l0.62,0.17l0.53,-0.73l1.87,-0.57l1.65,1.05l1.35,1.48l3.39,0.38l0.43,-0.54l-0.46,-1.23l1.05,-1.79l1.04,-0.61l0.14,-0.55l-0.25,-0.41l0.88,-1.17l1.31,-0.77l1.3,0.27l2.1,-0.48l0.31,-0.4l-0.05,-1.3l-0.92,-0.77l1.48,0.56l1.41,1.07l2.11,0.65l0.81,-0.2l1.4,0.7l1.69,-0.66l0.8,0.19l0.64,-0.33l0.71,0.77l-1.33,1.94l-0.71,0.07l-0.35,0.51l0.24,0.86l-1.52,2.35l0.12,1.05l2.15,1.65l1.97,0.85l3.04,2.36l1.97,0.65l0.55,0.88l2.72,0.85l1.84,-1.1l2.07,-5.97l-0.42,-3.59l0.3,-1.73l0.47,-0.87l-0.31,-0.68l1.09,-3.28l0.46,-0.47l0.4,0.71l0.16,1.51l0.65,0.52l0.16,1.04l0.85,1.21l0.12,2.38l0.9,2.0l0.57,0.18l1.3,-0.78l1.69,1.7l-0.2,1.08l0.53,2.2l0.39,1.3l0.68,0.48l0.6,1.95l-0.19,1.48l0.81,1.76l6.01,3.69l-0.11,0.76l1.38,1.58l0.95,2.77l0.58,0.22l0.72,-0.41l0.8,0.9l0.61,0.01l0.46,2.41l4.81,4.71l0.66,2.02l-0.07,3.31l1.14,2.2l-0.13,2.24l-1.1,3.68l0.03,1.64l-0.47,1.89l-1.05,2.4l-1.9,1.47l-1.72,3.51l-2.38,6.09l-0.24,2.82l-1.14,0.8l-2.85,0.15l-2.31,1.19l-2.51,2.25l-3.09,-1.57l0.3,-1.15l-0.54,-0.47l-1.5,0.63l-2.01,1.94l-7.12,-2.18l-1.48,-1.63l-1.14,-3.74l-1.45,-1.26l-1.81,-0.26l0.56,-1.18l-0.61,-2.1l-0.72,-0.1l-1.14,1.82l-0.9,0.21l0.63,-0.82l0.36,-1.55l0.92,-1.31l-0.13,-2.34l-0.7,-0.22l-2.0,2.34l-1.51,0.93l-0.94,2.01l-1.35,-0.81l-0.02,-1.52l-1.57,-2.04l-1.09,-0.88l0.24,-0.33l-0.14,-0.59l-3.21,-1.69l-1.83,-0.12l-2.54,-1.35l-4.58,0.28l-6.02,1.9l-2.53,-0.13l-2.62,1.41l-2.13,0.63l-1.49,2.6l-3.49,0.31l-2.29,-0.5l-3.48,0.43l-1.6,1.47l-0.81,-0.04l-2.37,1.63l-3.26,-0.1l-3.72,-2.21l0.04,-1.05l1.19,-0.46l0.49,-0.89l0.21,-2.97l-0.28,-1.64l-1.34,-2.86l-0.38,-1.47l0.05,-1.72l-0.95,-1.7l-0.18,-0.97l-1.01,-0.99l-0.29,-1.98l-1.13,-1.75ZM784.92,393.44l2.65,1.02l3.23,-0.96l1.09,0.14l0.15,3.06l-0.85,1.13l-0.17,1.63l-0.87,-0.24l-1.57,1.91l-1.68,-0.18l-1.4,-2.36l-0.37,-2.04l-1.39,-2.51l0.04,-0.8l1.15,0.18Z",
      name: "Australia"
    },
    IL: {
      path: "M507.76,203.05l0.4,-0.78l0.18,0.4l-0.33,1.03l0.52,0.44l0.68,-0.22l-0.86,3.6l-1.16,-3.32l0.59,-0.74l-0.03,-0.41ZM508.73,200.34l0.37,-1.02l0.64,0.0l0.52,-0.51l-0.49,1.53l-0.56,-0.24l-0.48,0.23Z",
      name: "Israel"
    },
    IN: {
      path: "M623.34,207.03l-1.24,1.04l-0.97,2.55l0.22,0.51l8.04,3.87l3.42,0.37l1.57,1.38l4.92,0.88l2.18,-0.04l0.38,-0.3l0.29,-1.24l-0.32,-1.64l0.14,-0.87l0.82,-0.31l0.45,2.48l2.28,1.02l1.77,-0.38l4.14,0.1l0.38,-0.36l0.18,-1.66l-0.5,-0.65l1.37,-0.29l2.25,-1.99l2.7,-1.62l1.93,0.62l1.8,-0.98l0.79,1.14l-0.68,0.91l0.26,0.63l2.42,0.36l0.09,0.47l-0.83,0.75l0.13,1.07l-1.52,-0.29l-3.24,1.86l-0.13,1.78l-1.32,2.14l-0.18,1.39l-0.93,1.82l-1.64,-0.5l-0.52,0.37l-0.09,2.63l-0.56,1.11l0.19,0.81l-0.53,0.27l-1.18,-3.73l-1.08,-0.27l-0.38,0.31l-0.24,1.0l-0.66,-0.66l0.54,-1.06l1.22,-0.34l1.15,-2.25l-0.24,-0.56l-1.57,-0.47l-4.34,-0.28l-0.18,-1.56l-0.35,-0.35l-1.11,-0.12l-1.91,-1.12l-0.56,0.17l-0.88,1.82l0.11,0.49l1.36,1.07l-1.09,0.69l-0.69,1.11l0.18,0.56l1.24,0.57l-0.32,1.54l0.85,1.94l0.36,2.01l-0.22,0.59l-4.58,0.52l-0.33,0.42l0.13,1.8l-1.17,1.36l-3.65,1.81l-2.79,3.03l-4.32,3.28l-0.18,1.27l-4.65,1.79l-0.77,2.16l0.64,5.3l-1.06,2.49l-0.01,3.94l-1.24,0.28l-1.14,1.93l0.39,0.84l-1.68,0.53l-1.04,1.83l-0.65,0.47l-2.06,-2.05l-2.1,-6.02l-2.2,-3.64l-1.05,-4.75l-2.29,-3.57l-1.76,-8.2l0.01,-3.11l-0.49,-2.53l-0.55,-0.29l-3.53,1.52l-1.53,-0.27l-2.86,-2.77l0.85,-0.67l0.08,-0.55l-0.74,-1.03l-2.67,-2.06l1.24,-1.32l5.34,0.01l0.39,-0.49l-0.5,-2.29l-1.42,-1.46l-0.27,-1.93l-1.43,-1.2l2.31,-2.37l3.05,0.06l2.62,-2.85l1.6,-2.81l2.4,-2.73l0.07,-2.04l1.97,-1.48l-0.02,-0.65l-1.93,-1.31l-0.82,-1.78l-0.8,-2.21l0.9,-0.89l3.59,0.65l2.92,-0.42l2.33,-2.19l2.31,2.85l-0.24,2.13l0.99,1.59l-0.05,0.82l-1.34,-0.28l-0.47,0.48l0.7,3.06l2.62,1.99l2.99,1.65Z",
      name: "India"
    },
    TZ: {
      path: "M495.56,296.42l2.8,-3.12l-0.02,-0.81l-0.64,-1.3l0.68,-0.52l0.14,-1.47l-0.76,-1.25l0.31,-0.11l2.26,0.03l-0.51,2.76l0.76,1.3l0.5,0.12l1.05,-0.53l1.19,-0.12l0.61,0.24l1.43,-0.62l0.1,-0.67l-0.71,-0.62l1.57,-1.7l8.65,4.86l0.32,1.53l3.34,2.33l-1.05,2.8l0.13,1.61l1.63,1.12l-0.6,1.76l-0.01,2.33l1.89,4.03l0.57,0.43l-1.46,1.08l-2.61,0.94l-1.43,-0.04l-1.06,0.77l-2.29,0.36l-2.87,-0.68l-0.83,0.07l-0.63,-0.75l-0.31,-2.78l-1.32,-1.35l-3.25,-0.77l-3.96,-1.58l-1.18,-2.41l-0.32,-1.75l-1.76,-1.49l0.42,-1.05l-0.44,-0.89l0.08,-0.96l-0.46,-0.58l0.06,-0.56Z",
      name: "Tanzania"
    },
    AZ: {
      path: "M539.29,175.73l1.33,0.32l1.94,-1.8l2.3,3.34l1.43,0.43l-1.26,0.15l-0.35,0.32l-0.8,3.14l-0.99,0.96l0.05,1.11l-1.26,-1.13l0.7,-1.18l-0.04,-0.47l-0.74,-0.86l-1.48,0.15l-2.34,1.71l-0.03,-1.27l-2.03,-1.35l0.47,-0.62l-0.08,-0.56l-1.03,-0.79l0.29,-0.43l-0.14,-0.58l-1.13,-0.86l1.89,0.68l1.69,0.06l0.37,-0.87l-0.81,-1.37l0.42,0.06l1.63,1.72ZM533.78,180.57l0.61,0.46l0.69,-0.0l0.59,1.15l-0.68,-0.15l-1.21,-1.45Z",
      name: "Azerbaijan"
    },
    IE: {
      path: "M405.08,135.42l0.35,2.06l-1.75,2.78l-4.22,1.88l-2.84,-0.4l1.73,-3.0l-1.18,-3.53l4.6,-3.74l0.32,1.15l-0.49,1.74l0.4,0.51l1.47,-0.04l1.6,0.6Z",
      name: "Ireland"
    },
    ID: {
      path: "M756.47,287.89l0.69,4.01l2.79,1.78l0.51,-0.1l2.04,-2.59l2.71,-1.43l2.05,-0.0l3.9,1.73l2.46,0.45l0.08,15.12l-1.75,-1.54l-2.54,-0.51l-0.88,0.71l-2.32,0.06l0.69,-1.33l1.45,-0.64l0.23,-0.46l-0.65,-2.74l-1.24,-2.21l-5.04,-2.29l-2.09,-0.23l-3.68,-2.27l-0.55,0.13l-0.65,1.07l-0.52,0.12l-0.55,-1.89l-1.21,-0.78l1.84,-0.62l1.72,0.05l0.39,-0.52l-0.21,-0.66l-0.38,-0.28l-3.45,-0.0l-1.13,-1.48l-2.1,-0.43l-0.52,-0.6l2.69,-0.48l1.28,-0.78l3.66,0.94l0.3,0.71ZM757.91,300.34l-0.62,0.82l-0.1,-0.8l0.59,-1.12l0.13,1.1ZM747.38,292.98l0.34,0.72l-1.22,-0.57l-4.68,-0.1l0.27,-0.62l2.78,-0.09l2.52,0.67ZM741.05,285.25l-0.67,-2.88l0.64,-2.01l0.41,0.86l1.21,0.18l0.16,0.7l-0.1,1.68l-0.84,-0.16l-0.46,0.3l-0.34,1.34ZM739.05,293.5l-0.5,0.44l-1.34,-0.36l-0.17,-0.37l1.73,-0.08l0.27,0.36ZM721.45,284.51l-0.19,1.97l2.24,2.23l0.54,0.02l1.27,-1.07l2.75,-0.5l-0.9,1.21l-2.11,0.93l-0.16,0.6l2.22,3.01l-0.3,1.07l1.36,1.74l-2.26,0.85l-0.28,-0.31l0.12,-1.19l-1.64,-1.34l0.17,-2.23l-0.56,-0.39l-1.67,0.76l-0.23,0.39l0.3,6.17l-1.1,0.25l-0.69,-0.47l0.64,-2.21l-0.39,-2.42l-0.39,-0.34l-0.8,-0.01l-0.58,-1.29l0.98,-1.6l0.35,-1.96l1.32,-3.87ZM728.59,296.27l0.38,0.49l-0.02,1.28l-0.88,0.49l-0.53,-0.47l1.04,-1.79ZM729.04,286.98l0.27,-0.05l-0.02,0.13l-0.24,-0.08ZM721.68,284.05l0.16,-0.32l1.89,-1.65l1.83,0.68l3.16,0.35l2.94,-0.1l2.39,-1.66l-1.73,2.13l-1.66,0.43l-2.41,-0.48l-4.17,0.13l-2.39,0.51ZM730.55,310.47l1.11,-1.93l2.03,-0.82l0.08,0.62l-1.45,1.67l-1.77,0.46ZM728.12,305.88l-0.1,0.38l-3.46,0.66l-2.91,-0.27l-0.0,-0.25l1.54,-0.41l1.66,0.73l1.67,-0.19l1.61,-0.65ZM722.9,310.24l-0.64,0.03l-2.26,-1.2l1.11,-0.24l1.78,1.41ZM716.26,305.77l0.88,0.51l1.28,-0.17l0.2,0.35l-4.65,0.73l0.39,-0.67l1.15,-0.02l0.75,-0.73ZM711.66,293.84l-0.38,-0.16l-2.54,1.01l-1.12,-1.44l-1.69,-0.13l-1.16,-0.75l-3.04,0.77l-1.1,-1.15l-3.31,-0.11l-0.35,-3.05l-1.35,-0.95l-1.11,-1.98l-0.33,-2.06l0.27,-2.14l0.9,-1.01l0.37,1.15l2.09,1.49l1.53,-0.48l1.82,0.08l1.38,-1.19l1.0,-0.18l2.28,0.67l2.26,-0.53l1.52,-3.64l1.01,-0.99l0.78,-2.57l4.1,0.3l-1.11,1.77l0.02,0.46l1.7,2.2l-0.23,1.39l2.07,1.71l-2.33,0.42l-0.88,1.9l0.1,2.05l-2.4,1.9l-0.06,2.45l-0.7,2.79ZM692.58,302.03l0.35,0.26l4.8,0.25l0.78,-0.97l4.17,1.09l1.13,1.68l3.69,0.45l2.13,1.04l-1.8,0.6l-2.77,-0.99l-4.8,-0.12l-5.24,-1.41l-1.84,-0.25l-1.11,0.3l-4.26,-0.97l-0.7,-1.14l-1.59,-0.13l1.18,-1.65l2.74,0.13l2.87,1.13l0.26,0.68ZM685.53,299.17l-2.22,0.04l-2.06,-2.03l-3.15,-2.01l-2.93,-3.51l-3.11,-5.33l-2.2,-2.12l-1.64,-4.06l-2.32,-1.69l-1.27,-2.07l-1.96,-1.5l-2.51,-2.65l-0.11,-0.66l4.81,0.53l2.15,2.38l3.31,2.74l2.35,2.66l2.7,0.17l1.95,1.59l1.54,2.17l1.59,0.95l-0.84,1.71l0.15,0.52l1.44,0.87l0.79,0.1l0.4,1.58l0.87,1.4l1.96,0.39l1.0,1.31l-0.6,3.01l-0.09,3.5Z",
      name: "Indonesia"
    },
    UA: {
      path: "M492.5,162.44l1.28,-2.49l1.82,0.19l0.66,-0.23l0.09,-0.71l-0.25,-0.75l-0.79,-0.72l-0.33,-1.21l-0.86,-0.62l-0.02,-1.19l-1.13,-0.86l-1.15,-0.19l-2.04,-1.0l-1.66,0.32l-0.66,0.47l-0.92,-0.0l-0.84,0.78l-2.48,0.7l-1.18,-0.71l-3.07,-0.36l-0.89,0.43l-0.24,-0.55l-1.11,-0.7l0.35,-0.93l1.26,-1.02l-0.54,-1.23l2.04,-2.43l1.4,-0.62l0.25,-1.19l-1.04,-2.39l0.83,-0.13l1.28,-0.84l1.8,-0.07l2.47,0.26l2.86,0.81l1.88,0.06l0.86,0.44l1.04,-0.41l0.77,0.66l2.18,-0.15l0.92,0.3l0.52,-0.34l0.15,-1.53l0.56,-0.54l2.85,-0.05l0.84,-0.72l3.04,-0.18l1.23,1.46l-0.48,0.77l0.21,1.03l0.36,0.32l1.8,0.14l0.93,2.08l3.18,1.15l1.94,-0.45l1.67,1.49l1.4,-0.03l3.35,0.96l0.02,0.54l-0.96,1.59l0.47,1.97l-0.26,0.7l-2.36,0.28l-1.29,0.89l-0.23,1.38l-1.83,0.27l-1.58,0.97l-2.41,0.21l-2.16,1.17l-0.21,0.38l0.34,2.26l1.23,0.75l2.13,-0.08l-0.14,0.31l-2.65,0.53l-3.23,1.69l-0.87,-0.39l0.42,-1.1l-0.25,-0.52l-2.21,-0.73l2.35,-1.06l0.12,-0.65l-0.93,-0.82l-3.62,-0.74l-0.13,-0.89l-0.46,-0.34l-2.61,0.59l-0.91,1.69l-1.71,2.04l-0.86,-0.4l-1.62,0.27Z",
      name: "Ukraine"
    },
    QA: {
      path: "M549.33,221.64l-0.76,-0.23l-0.14,-1.64l0.84,-1.29l0.47,0.52l0.04,1.34l-0.45,1.3Z",
      name: "Qatar"
    },
    MZ: {
      path: "M508.58,318.75l-0.34,-2.57l0.51,-2.05l3.55,0.63l2.5,-0.38l1.02,-0.76l1.49,0.01l2.74,-0.98l1.66,-1.2l0.5,9.24l0.41,1.23l-0.68,1.67l-0.93,1.71l-1.5,1.5l-5.16,2.28l-2.78,2.73l-1.02,0.53l-1.71,1.8l-0.98,0.57l-0.35,2.41l1.16,1.94l0.49,2.17l0.43,0.31l-0.06,2.06l-0.39,1.17l0.5,0.72l-0.25,0.73l-0.92,0.83l-5.12,2.39l-1.22,1.36l0.21,1.13l0.58,0.39l-0.11,0.72l-1.22,-0.01l-0.73,-2.97l0.42,-3.09l-1.78,-5.37l2.49,-2.81l0.69,-1.89l0.44,-0.43l0.28,-1.53l-0.39,-0.93l0.59,-3.65l-0.01,-3.26l-1.49,-1.16l-1.2,-0.22l-1.74,-1.17l-1.92,0.01l-0.29,-2.08l7.06,-1.96l1.28,1.09l0.89,-0.1l0.67,0.44l0.1,0.73l-0.51,1.29l0.19,1.81l1.75,1.83l0.65,-0.13l0.71,-1.65l1.17,-0.86l-0.26,-3.47l-1.05,-1.85l-1.04,-0.94Z",
      name: "Mozambique"
    }
  },
  height: 440.70631074413296,
  width: 900,
  projection: {
    type: "mill",
    centralMeridian: 11.5
  }
});

// world merc

jsVectorMap.prototype.addMap("world_merc", {
  "insets": [{
    "width": 900,
    "top": 0,
    "height": 583.0802520919394,
    "bbox": [{
      "y": -18449355.69035302,
      "x": -20004297.151525836
    }, {
      "y": 7485321.539093307,
      "x": 20026572.394749384
    }],
    "left": 0
  }],
  "paths": {
    "BD": {
      "path": "M651.84,359.63l-0.6,-2.05l-1.36,-1.76l-2.31,-0.11l-0.41,0.48l0.2,0.98l-0.54,1.03l-0.71,-0.37l-0.68,0.36l-1.19,-0.37l-0.37,-2.06l-0.81,-1.92l0.39,-1.52l-0.21,-0.46l-1.16,-0.55l0.3,-0.55l1.48,-0.98l0.03,-0.64l-1.56,-1.27l0.56,-1.2l1.6,0.97l1.04,0.16l0.18,1.62l0.33,0.35l5.65,0.65l-0.86,1.73l-1.21,0.35l-0.77,1.56l0.07,0.46l1.37,1.41l0.68,-0.19l0.42,-1.44l1.21,3.96l-0.03,1.26l-0.32,-0.15l-0.41,0.28Z",
      "name": "Bangladesh"
    },
    "BE": {
      "path": "M429.3,264.88l1.93,0.28l2.07,-0.74l1.41,1.55l1.25,0.86l-0.23,2.13l-0.68,0.42l-0.18,1.46l-1.63,-1.32l-1.4,0.17l-2.72,-3.22l-1.17,-0.21l-0.2,-0.77l1.57,-0.62Z",
      "name": "Belgium"
    },
    "BF": {
      "path": "M421.42,377.38l-0.11,0.96l0.34,1.18l1.4,1.73l0.07,1.11l0.32,0.37l2.56,0.52l-0.04,1.3l-0.38,0.54l-1.07,0.21l-0.73,1.19l-0.63,0.21l-3.22,-0.25l-0.94,0.39l-5.4,-0.05l-0.39,0.38l0.16,2.75l-1.23,-0.43l-1.17,0.1l-0.89,0.57l-2.27,-1.73l-0.13,-1.12l0.61,-0.96l0.01,-0.93l1.87,-2.0l0.44,-1.83l0.43,-0.39l1.28,0.26l1.05,-0.52l0.47,-0.73l1.84,-1.1l0.55,-0.84l2.2,-1.01l1.15,-0.31l0.72,0.46l1.13,-0.01Z",
      "name": "Burkina Faso"
    },
    "BG": {
      "path": "M491.72,293.09l-0.93,1.06l-0.91,2.45l0.52,1.52l-1.65,-0.27l-2.55,1.06l-0.27,1.69l-1.79,0.25l-2.03,-1.11l-1.92,0.88l-1.4,-0.07l-0.15,-1.87l-1.09,-1.09l0.34,-1.71l0.91,-1.02l0.01,-0.52l-1.15,-1.41l-0.06,-1.14l0.44,0.87l0.46,0.21l0.87,-0.23l1.91,0.53l3.68,0.18l1.44,-0.92l2.7,-0.74l1.67,1.16l0.95,0.26Z",
      "name": "Bulgaria"
    },
    "BA": {
      "path": "M463.49,287.91l2.09,0.57l1.72,-0.03l1.56,0.78l-0.4,0.99l1.14,1.61l-0.27,1.19l-1.82,1.31l-0.37,1.54l-1.65,-0.96l-0.89,-1.36l-2.11,-2.07l-1.65,-2.57l0.25,-0.7l0.45,0.41l0.59,-0.06l0.43,-0.59l0.92,-0.06Z",
      "name": "Bosnia and Herz."
    },
    "BN": {
      "path": "M707.48,403.47l0.69,-0.65l1.41,-0.91l-0.15,1.64l-0.81,-0.05l-0.61,0.58l-0.53,-0.6Z",
      "name": "Brunei"
    },
    "BO": {
      "path": "M263.83,471.11l-3.09,-0.24l-0.38,0.24l-0.7,1.56l-1.31,-1.57l-3.28,-0.66l-2.38,2.47l-1.3,0.27l-0.88,-3.36l-1.31,-2.93l0.74,-2.43l-0.12,-0.42l-1.2,-1.03l-0.37,-1.92l-1.09,-1.59l1.46,-2.61l-0.97,-2.36l0.48,-1.07l-0.35,-0.74l0.91,-1.33l0.16,-3.89l0.5,-1.18l-1.81,-3.45l2.46,0.08l0.8,-0.85l3.4,-1.92l2.66,-0.35l-0.19,1.39l0.3,1.07l-0.05,1.98l2.72,2.29l2.88,0.49l0.89,0.87l1.79,0.59l0.98,0.71l1.71,0.05l1.17,0.61l0.6,2.74l-0.7,0.54l0.96,3.03l0.37,0.28l4.3,0.1l-0.25,1.22l0.27,1.03l1.43,0.92l0.5,1.38l-0.41,1.9l-0.65,1.11l0.13,1.37l-2.69,-1.68l-2.4,-0.03l-4.36,0.77l-1.49,2.56l-0.1,1.55l-0.75,2.44Z",
      "name": "Bolivia"
    },
    "JP": {
      "path": "M781.1,291.58l1.81,0.77l1.63,-1.08l0.4,2.83l-3.6,1.02l-1.98,3.05l-3.61,-2.12l-0.58,0.21l-1.27,3.44l-2.14,0.04l-0.3,-2.88l1.09,-2.32l2.44,-0.17l0.37,-0.34l1.26,-6.78l2.45,3.07l2.03,1.27ZM773.56,314.42l-0.92,2.42l0.38,1.64l-1.15,1.91l-3.02,1.35l-4.59,0.3l-3.33,3.22l-1.25,-0.86l-0.09,-2.06l-0.46,-0.38l-4.35,0.67l-3.0,1.42l-2.84,0.06l-0.37,0.26l0.11,0.44l2.34,2.04l-1.55,4.67l-1.25,0.95l-0.8,-0.75l0.56,-2.43l-0.2,-0.44l-1.47,-0.8l-0.77,-1.54l2.14,-0.91l1.27,-1.83l2.45,-1.53l1.83,-2.06l4.77,-0.88l2.6,0.61l0.45,-0.22l2.39,-5.05l1.27,1.14l0.53,0.01l5.1,-4.39l1.68,-4.08l-0.39,-3.75l0.92,-1.82l2.11,-0.49l1.24,4.16l-0.07,2.45l-2.25,3.13l-0.03,3.43ZM757.77,324.02l0.2,0.64l-1.01,1.31l-1.17,-0.72l-1.28,0.7l-0.69,1.54l-1.01,-0.53l0.01,-1.04l1.14,-1.49l1.58,0.15l0.85,-1.05l1.38,0.49Z",
      "name": "Japan"
    },
    "BI": {
      "path": "M495.45,425.39l-1.08,-2.99l1.14,-0.11l0.64,-1.19l0.76,0.09l0.65,1.83l-2.1,2.37Z",
      "name": "Burundi"
    },
    "BJ": {
      "path": "M429.57,385.57l-0.05,0.81l0.5,1.35l-0.42,0.87l0.17,0.79l-1.82,2.14l-0.57,1.77l-0.08,5.44l-1.41,0.2l-0.48,-1.36l0.11,-5.73l-0.52,-0.7l-0.2,-1.35l-1.48,-1.49l0.22,-0.91l0.89,-0.43l0.42,-0.93l1.27,-0.36l1.22,-1.35l0.61,-0.0l1.62,1.25Z",
      "name": "Benin"
    },
    "BT": {
      "path": "M650.32,342.67l0.85,0.75l-0.12,1.18l-3.76,-0.12l-1.57,0.41l-1.93,-0.91l1.49,-2.09l1.12,-0.6l1.62,0.6l1.33,0.09l0.98,0.68Z",
      "name": "Bhutan"
    },
    "JM": {
      "path": "M228.38,368.9l-0.8,0.41l-2.27,-1.09l0.84,-0.25l2.14,0.31l1.18,0.59l-1.09,0.03Z",
      "name": "Jamaica"
    },
    "BW": {
      "path": "M483.92,460.24l2.27,4.08l2.83,2.92l0.96,0.32l0.77,2.5l2.13,0.63l1.04,0.8l-3.01,1.7l-2.32,2.09l-1.54,2.79l-1.52,0.46l-0.64,2.01l-1.34,0.54l-1.84,-0.12l-1.21,-0.77l-1.36,-0.31l-1.22,0.64l-0.75,1.42l-2.31,1.98l-1.39,0.22l-0.36,-0.63l0.16,-1.82l-1.48,-2.63l-0.62,-0.44l-0.0,-7.35l2.08,-0.08l0.38,-0.4l0.07,-9.12l1.56,-0.08l3.63,-0.87l0.8,0.91l0.52,0.07l1.5,-0.97l2.2,-0.5Z",
      "name": "Botswana"
    },
    "BR": {
      "path": "M259.98,404.95l3.24,0.7l0.65,-0.53l4.55,-1.32l1.08,-1.06l-0.02,-0.64l0.55,-0.05l0.28,0.28l-0.26,0.87l0.22,0.48l0.73,0.32l0.4,0.81l-0.62,0.86l-0.4,2.13l0.82,2.56l1.69,1.43l1.43,0.2l3.17,-1.68l3.18,0.3l0.65,-0.75l-0.27,-0.92l1.9,-0.09l2.39,0.99l1.06,-0.61l0.84,0.78l1.2,-0.18l1.18,-1.06l0.84,-1.94l1.36,-2.11l0.37,-0.05l1.89,5.46l1.33,0.59l0.05,1.28l-1.77,1.94l0.02,0.56l1.02,0.87l4.07,0.36l0.08,2.16l0.66,0.29l1.74,-1.5l6.97,2.32l1.02,1.22l-0.35,1.18l0.49,0.5l2.81,-0.74l4.77,1.3l3.75,-0.08l3.57,2.0l3.29,2.86l1.93,0.73l2.12,0.12l0.71,0.62l1.21,4.52l-0.95,4.0l-4.72,5.09l-1.64,2.95l-1.72,2.07l-0.8,0.3l-0.72,2.05l0.18,4.81l-0.94,5.62l-0.81,1.15l-0.43,3.44l-2.55,3.58l-0.4,2.59l-1.86,1.08l-0.67,1.57l-2.54,0.01l-3.94,1.05l-1.83,1.24l-2.87,0.85l-3.03,2.27l-2.2,2.92l-0.36,2.08l0.4,1.64l-0.45,2.73l-0.52,1.26l-1.77,1.62l-2.75,5.05l-3.83,3.63l-1.23,2.92l-1.18,1.22l-0.37,-0.92l0.96,-1.23l0.01,-0.48l-1.52,-2.09l-4.56,-3.52l-1.03,-0.01l-2.38,-2.13l-0.85,0.0l5.38,-5.77l3.77,-2.69l0.21,-2.55l-1.34,-1.86l-0.92,0.07l0.59,-2.44l0.01,-1.59l-1.11,-0.85l-1.75,0.31l-0.44,-3.22l-0.52,-0.97l-1.88,-0.9l-1.24,0.48l-2.17,-0.43l0.15,-3.31l-0.63,-1.37l0.67,-0.74l-0.22,-1.37l0.66,-1.16l0.44,-2.08l-0.61,-1.86l-1.4,-0.87l-0.2,-0.77l0.34,-1.41l-0.38,-0.49l-4.52,-0.1l-0.72,-2.27l0.59,-0.42l-0.03,-1.12l-0.5,-0.87l-0.32,-1.71l-1.45,-0.76l-1.63,-0.02l-1.05,-0.73l-1.6,-0.48l-1.13,-1.0l-2.69,-0.41l-2.47,-2.08l0.13,-4.38l-0.45,-0.45l-3.46,0.5l-3.44,1.95l-0.6,0.74l-2.89,-0.17l-1.47,0.42l-0.72,-0.18l0.15,-3.54l-0.64,-0.34l-1.94,1.42l-1.87,-0.06l-0.83,-1.19l-1.38,-0.27l0.21,-1.01l-1.35,-1.5l-0.88,-1.92l0.56,-0.6l-0.0,-0.81l1.29,-0.62l0.22,-0.43l-0.22,-1.19l0.61,-0.91l0.15,-0.99l2.65,-1.58l1.99,-0.47l0.42,-0.36l2.06,0.11l0.42,-0.33l1.19,-8.0l-0.41,-1.56l-1.1,-1.0l0.01,-1.33l1.91,-0.42l0.08,-0.96l-0.33,-0.43l-1.14,-0.2l-0.02,-0.83l4.47,0.05l0.82,-0.67l0.82,1.81l0.8,0.07l1.15,1.1l2.26,-0.05l0.71,-0.83l2.78,-0.96l0.48,-1.13l1.6,-0.64l0.24,-0.47l-0.48,-0.83l-1.83,-0.19l-0.36,-3.22Z",
      "name": "Brazil"
    },
    "BS": {
      "path": "M227.69,345.88l0.0,-0.01l0.0,0.0l-0.0,0.01ZM226.4,353.1l-0.48,-1.18l-0.85,-0.78l0.36,-1.17l0.95,2.03l0.01,1.1ZM225.65,345.38l-1.96,0.32l-0.04,-0.26l0.74,-0.14l1.26,0.08Z",
      "name": "Bahamas"
    },
    "BY": {
      "path": "M493.82,245.43l0.3,0.93l0.53,0.25l1.16,-0.47l2.08,0.9l0.2,1.73l-0.48,1.43l1.57,2.82l0.93,0.75l0.13,0.97l1.58,0.7l0.48,0.74l-0.6,0.57l-1.85,-0.13l-0.76,0.48l-0.12,0.47l1.08,3.5l-1.96,0.33l-0.87,1.12l-0.12,1.49l-0.67,-0.22l-2.03,0.17l-0.52,-0.75l-0.57,-0.09l-0.72,0.54l-0.9,-0.5l-1.91,-0.08l-2.74,-0.95l-2.61,-0.34l-2.01,0.09l-1.52,1.11l-0.65,0.08l-0.07,-1.5l-0.64,-1.57l1.4,-1.01l0.01,-1.65l-0.7,-1.69l-0.08,-1.37l2.2,-0.03l2.72,-1.61l0.73,-2.54l2.1,-1.69l-0.2,-1.69l3.82,-2.26l2.27,0.97Z",
      "name": "Belarus"
    },
    "BZ": {
      "path": "M198.03,374.09l0.1,-4.57l0.69,-0.06l0.74,-1.32l0.34,0.28l-0.4,1.33l0.17,0.59l-0.34,2.3l-1.3,1.44Z",
      "name": "Belize"
    },
    "RU": {
      "path": "M491.5,228.55l2.65,-2.55l-0.01,-0.58l-2.35,-2.15l7.46,-9.43l1.0,-2.89l-0.09,-0.41l-3.55,-3.64l0.93,-3.78l-2.18,-4.19l1.62,-5.27l-2.85,-6.95l2.24,-4.74l-0.06,-0.43l-3.73,-4.33l0.33,-4.4l1.87,-0.61l4.26,-2.85l2.35,-2.28l3.83,4.05l6.96,1.77l9.34,7.63l1.83,2.99l0.16,4.03l-2.62,3.11l-3.84,1.55l-11.03,-4.69l-2.16,0.81l-0.14,0.63l3.99,4.45l0.31,8.71l5.34,3.55l0.64,-0.27l0.32,-2.78l-1.43,-2.53l1.23,-1.72l5.74,3.47l0.43,-0.01l2.11,-1.42l0.15,-0.48l-1.59,-4.12l5.51,-5.69l1.99,0.31l2.25,2.09l0.65,-0.16l1.46,-4.3l-2.03,-4.0l1.18,-3.78l-1.5,-3.67l5.98,1.86l1.2,3.14l-2.74,0.7l-0.3,0.39l0.02,3.61l2.07,2.45l0.43,0.11l3.87,-1.38l0.85,-4.25l13.69,-8.82l1.16,0.21l-2.17,3.65l0.26,0.59l3.11,0.7l0.4,-0.14l1.68,-2.16l4.51,-0.18l3.61,-2.68l2.61,3.78l0.67,-0.02l2.85,-4.55l-0.0,-0.43l-2.5,-3.89l1.03,-1.89l7.03,2.08l3.39,2.18l9.05,7.85l0.62,-0.13l1.64,-3.95l-2.48,-3.58l-0.07,-1.39l-0.31,-0.37l-2.62,-0.61l0.73,-3.21l-1.33,-5.76l-0.07,-2.28l4.55,-7.04l1.67,-7.53l1.59,-1.44l6.17,2.09l0.48,4.29l-2.34,6.42l1.55,2.76l0.79,5.18l-0.57,9.85l2.73,4.33l-1.02,4.26l-4.88,9.07l0.23,0.57l2.86,0.92l0.49,-0.22l0.94,-2.13l2.83,-1.82l0.65,-3.1l2.12,-3.05l-1.37,-4.06l1.14,-4.42l-0.31,-0.49l-2.47,-0.52l-0.55,-3.59l1.95,-7.61l-3.13,-6.05l4.31,-5.2l-0.45,-5.83l0.53,-0.08l1.2,4.22l-0.98,7.66l0.21,0.4l2.68,1.42l0.58,-0.43l-1.09,-5.45l3.9,-2.98l4.9,-0.41l4.5,4.5l0.49,0.06l0.17,-0.47l-2.21,-6.76l-0.24,-8.85l4.01,-1.66l5.93,0.39l5.54,-1.19l0.28,-0.55l-1.97,-4.64l2.73,-5.9l2.89,-0.36l4.78,-4.84l6.49,-1.33l1.07,-2.85l6.11,-0.9l1.91,2.17l0.58,0.02l5.5,-5.45l4.43,0.17l0.41,-0.34l0.68,-4.62l2.32,-4.63l5.58,-4.48l3.69,3.23l-3.04,2.5l0.14,0.69l5.42,1.64l0.64,5.13l0.7,0.21l2.17,-2.49l6.98,0.14l5.48,5.07l1.92,3.72l-0.59,4.98l-2.66,2.78l-6.56,5.27l-1.96,2.84l0.18,0.6l3.08,1.27l3.68,2.26l0.45,-0.02l1.76,-1.33l1.14,5.11l0.34,0.31l0.41,-0.22l1.03,-2.14l3.75,-1.32l7.65,1.4l0.57,3.81l0.35,0.34l10.47,1.28l0.45,-0.39l0.13,-6.16l4.81,1.41l3.93,-0.03l3.85,4.37l1.1,5.17l-1.42,3.65l3.15,6.24l4.05,3.25l0.63,-0.2l2.24,-7.6l3.55,3.15l0.44,0.06l4.09,-2.03l4.67,2.34l0.49,-0.1l1.68,-2.01l3.85,1.04l0.49,-0.48l-1.76,-7.3l3.0,-3.3l22.19,5.31l2.15,4.74l6.55,5.95l10.36,-1.34l4.76,1.21l1.93,2.89l-0.3,5.24l3.26,2.4l3.66,-1.4l4.3,-0.18l4.84,1.4l4.5,-0.75l4.22,6.04l0.56,0.1l3.1,-2.22l0.13,-0.49l-1.96,-4.39l0.94,-2.74l7.63,1.95l5.23,-0.41l7.05,3.36l9.59,8.27l6.43,6.42l-0.21,3.79l1.82,1.88l0.45,0.06l0.21,-0.41l-0.52,-4.08l6.13,0.86l4.58,5.48l-2.15,2.3l-3.97,0.6l-0.34,0.39l-0.06,5.64l-0.78,0.94l-1.98,-0.15l-1.91,-1.99l-3.16,-1.63l-0.77,-2.69l-2.54,-0.99l-2.81,0.69l-1.11,-1.73l0.5,-2.12l-0.56,-0.45l-3.0,1.46l-0.2,0.51l1.06,2.68l-1.31,2.33l-3.03,2.42l-3.08,-0.41l-0.37,0.63l2.22,3.03l1.47,4.59l1.16,1.53l0.26,2.04l-0.46,1.02l-4.64,-1.05l-6.95,4.01l-2.18,0.6l-7.62,6.88l-0.81,1.88l-3.15,-3.07l-0.49,-0.06l-6.18,3.75l-0.93,-1.52l-0.61,-0.09l-2.26,2.01l-3.15,-0.64l-0.47,0.3l-0.79,3.18l-3.03,4.85l0.09,1.91l0.26,0.36l2.58,0.95l-0.3,6.03l-1.97,0.14l-0.36,0.29l-1.07,3.72l0.87,1.82l-4.01,2.02l-1.04,4.88l-3.49,0.95l-0.29,0.32l-0.73,4.06l-3.07,3.18l-0.71,-2.11l-2.45,-15.41l1.17,-6.06l2.06,-2.67l0.2,-2.12l3.83,-1.13l4.47,-6.06l4.28,-5.09l4.48,-4.07l2.13,-7.67l-0.45,-0.5l-3.36,0.72l-1.47,4.3l-5.81,5.21l-1.86,-5.8l-0.49,-0.26l-6.68,1.94l-6.27,8.55l-0.01,0.46l1.74,2.54l-8.37,1.57l0.16,-3.05l-0.32,-0.41l-3.89,-0.75l-3.3,2.39l-7.61,-0.82l-8.47,1.58l-17.7,19.78l0.24,0.67l3.73,0.52l1.14,2.49l2.65,1.15l0.46,-0.13l1.47,-1.95l2.35,0.24l3.43,4.41l0.08,3.28l-1.96,4.11l-0.21,4.69l-1.11,6.02l-3.72,5.32l-0.87,2.56l-8.3,10.17l-3.18,1.92l-1.29,0.04l-1.45,-1.54l-0.53,-0.05l-2.48,1.84l0.28,-0.27l0.36,-4.08l-0.6,-2.85l1.77,-1.03l2.89,0.6l0.44,-0.22l1.71,-3.57l0.84,-3.92l0.97,-1.37l1.32,-3.37l-0.48,-0.53l-4.14,1.11l-2.19,1.46l-3.38,-0.0l-1.05,-3.43l-2.97,-2.72l-4.29,-1.26l-1.76,-6.1l-2.63,-6.06l-2.3,-1.58l-3.75,-1.25l-3.46,0.09l-3.19,0.77l-2.26,2.18l0.05,0.61l1.21,0.86l0.03,1.88l-1.34,1.28l-2.26,4.23l-0.03,1.71l-3.16,2.2l-2.8,-1.36l-3.02,0.27l-1.18,-1.17l-1.68,-0.52l-3.94,2.75l-3.21,0.62l-2.27,0.93l-3.04,-0.6l-2.21,0.03l-1.47,-1.89l-2.61,-1.95l-2.65,-0.52l-5.44,1.21l-3.23,-1.49l-0.71,-3.08l-5.2,-1.5l-2.75,-1.64l-0.54,0.13l-2.59,4.17l0.89,2.46l-2.1,2.34l-3.38,-0.91l-2.42,-0.14l-1.85,-1.84l-2.51,-0.06l-2.46,-1.17l-3.86,1.89l-4.72,3.31l-3.26,0.87l-1.17,-2.07l-0.41,-0.2l-2.97,0.48l-1.1,-1.58l-1.62,-0.7l-1.31,-2.32l-1.38,-0.72l-3.71,0.94l-3.3,-2.2l-0.56,0.12l-0.97,1.52l-5.27,-9.77l-3.03,-3.13l0.73,-1.08l-0.04,-0.5l-0.5,-0.06l-6.2,3.97l-1.82,0.18l0.16,-1.83l-0.23,-0.4l-3.22,-1.46l-2.47,0.85l-0.7,-4.0l-0.31,-0.32l-4.5,-0.95l-2.52,1.84l-6.18,1.58l-1.3,1.08l-9.51,1.62l-1.15,1.45l-0.03,0.46l1.56,2.48l-1.98,0.89l-0.21,0.52l0.35,0.85l-2.18,1.8l0.03,0.64l3.81,2.6l-0.44,1.31l-3.21,-0.16l-0.87,1.02l-3.08,-1.9l-3.97,0.08l-2.66,1.61l-8.29,-4.28l-4.1,0.06l-5.42,4.44l-0.37,2.36l-2.0,-1.76l-0.63,0.13l-2.0,4.27l0.61,1.02l-1.32,2.63l0.05,0.44l2.13,2.54l1.95,0.05l1.39,2.15l-0.23,1.74l1.12,0.83l-0.86,1.61l-2.49,0.71l-2.49,3.66l0.0,0.45l2.19,3.19l-0.16,2.44l2.54,3.7l-1.62,1.81l-0.67,-0.14l-1.63,-1.93l-2.29,-0.94l-0.94,-1.47l-2.34,-0.71l-1.48,0.44l-0.42,-0.51l-3.52,-1.68l-5.76,-1.14l-0.47,0.2l-2.87,-2.64l-2.9,-1.36l-1.63,-1.56l1.39,-0.52l2.08,-3.01l-0.04,-0.51l-0.98,-1.01l3.14,-1.27l0.25,-0.4l-0.07,-0.8l-0.5,-0.35l-1.72,0.45l0.04,-0.92l1.06,-0.85l2.31,-0.26l0.34,-0.28l0.4,-1.47l-0.51,-1.94l0.95,-1.86l0.01,-1.32l-0.27,-0.37l-3.69,-1.26l-1.41,0.02l-1.42,-1.68l-0.43,-0.12l-1.78,0.57l-2.78,-1.21l-0.01,-0.71l-0.89,-1.73l-2.01,-0.38l-0.13,-0.77l0.53,-1.15l-1.6,-2.31l-3.58,0.03l-0.92,0.88l-0.42,-0.07l-1.05,-3.54l2.29,-0.07l0.97,-0.92l0.06,-0.51l-0.9,-1.27l-1.4,-0.62l-0.06,-0.85l-0.95,-0.73l-1.43,-2.57l0.49,-1.21l-0.25,-2.07l-2.69,-1.38l-1.22,0.37l-0.45,-0.94l-2.46,-1.05l-0.74,-2.46l-0.21,-2.19l-1.07,-1.09l0.93,-1.49l-0.72,-4.29l1.7,-2.67l-0.24,-0.98ZM749.34,295.94l-0.76,0.56l-0.11,0.15l-0.01,-0.65l0.87,-0.06ZM871.96,154.57l2.04,-0.2l3.29,2.04l-0.13,0.64l-2.37,1.7l-5.54,0.79l-0.34,-1.85l3.05,-3.11ZM797.75,123.25l-2.42,3.18l-3.66,-0.78l-4.39,-3.6l0.47,-2.52l10.01,3.72ZM783.79,118.53l-1.81,6.68l-8.92,-0.26l-4.06,2.13l-4.64,-5.86l1.28,-6.57l3.04,-1.79l6.39,0.44l8.71,5.22ZM778.23,253.99l-0.64,-1.28l0.31,-0.17l0.33,1.45ZM778.36,254.55l0.92,4.28l-0.05,4.08l1.05,4.08l2.23,6.09l-2.91,-0.99l-0.51,0.27l-1.54,5.47l2.42,4.01l-0.04,1.39l-1.22,-1.41l-0.65,0.06l-1.07,1.83l-0.29,-1.88l0.28,-3.61l-0.28,-4.01l0.58,-2.92l0.11,-5.24l-1.46,-4.02l0.21,-5.38l2.23,-2.09ZM780.09,139.86l-3.31,0.05l-5.09,-1.07l2.11,-3.11l2.77,-0.74l3.29,3.15l0.23,1.71ZM683.7,87.54l-13.17,4.38l4.34,-15.76l1.75,-1.29l1.59,0.74l6.17,7.25l-0.68,4.69ZM670.82,80.26l-5.03,1.48l-6.76,-3.64l-4.04,-4.98l-1.9,-10.03l-3.29,-2.93l6.28,-10.21l5.0,-3.39l4.63,7.67l5.72,14.22l-0.6,11.8ZM564.4,160.28l-0.92,0.41l-7.78,-0.94l-0.83,-3.41l-4.32,-2.0l-0.33,-3.85l2.54,-1.96l-0.08,-4.42l4.9,-7.29l-0.16,-0.58l-1.86,-0.88l5.7,-7.68l-0.57,-4.44l5.43,-5.07l8.18,-6.55l8.25,-1.96l4.4,-4.05l4.43,-1.3l1.54,3.81l-1.55,3.04l-16.43,9.84l-7.93,9.27l-7.69,17.13l0.59,6.93l4.49,5.95ZM548.68,56.87l-5.47,3.05l-0.54,2.57l-2.49,2.05l-2.33,-2.98l1.37,-4.49l-0.35,-0.52l-4.3,-0.36l3.7,-2.13l3.34,-0.17l0.47,3.78l0.35,0.35l0.42,-0.25l1.41,-3.62l2.04,-2.24l3.21,2.97l-0.81,1.96ZM477.39,251.71l-4.1,0.06l-2.6,-0.41l0.38,-1.28l3.15,-1.29l3.25,1.22l-0.09,1.7Z",
      "name": "Russia"
    },
    "RW": {
      "path": "M497.0,418.15l0.71,1.01l-0.11,1.09l-1.63,0.03l-1.04,1.39l-0.83,-0.11l0.51,-1.2l0.08,-1.34l0.42,-0.41l0.7,0.14l1.19,-0.61Z",
      "name": "Rwanda"
    },
    "RS": {
      "path": "M469.33,288.43l0.49,-1.17l-1.2,-1.97l1.47,-0.73l1.3,0.13l1.18,1.23l0.45,1.29l1.35,0.74l0.34,1.53l1.46,1.02l0.76,-0.3l0.25,0.82l-0.51,0.87l0.22,1.27l1.08,1.41l-0.8,0.94l-0.38,1.72l-1.22,0.09l0.27,-0.81l-2.46,-2.38l-0.93,0.06l-0.47,1.05l-2.15,-1.58l0.57,-1.85l-1.13,-1.51l0.53,-1.32l-0.49,-0.55Z",
      "name": "Serbia"
    },
    "TL": {
      "path": "M734.55,437.87l-0.09,-0.98l4.5,-0.86l-2.82,1.28l-1.59,0.55Z",
      "name": "Timor-Leste"
    },
    "TM": {
      "path": "M553.03,299.38l-0.05,0.44l-0.1,-0.29l0.15,-0.15ZM555.85,298.15l0.46,-0.11l1.47,0.82l2.08,2.72l4.07,-0.21l0.38,-0.49l-0.34,-1.39l1.95,-1.07l1.9,-1.78l2.93,1.56l0.41,2.75l1.21,0.76l2.57,-0.15l0.62,0.45l1.32,3.46l4.54,3.8l2.67,1.6l3.07,1.26l-0.04,1.22l-1.32,-0.81l-0.61,0.19l-0.32,0.93l-2.19,0.86l-0.47,2.34l-1.21,0.81l-1.91,0.45l-0.73,1.44l-1.54,0.33l-2.22,-1.01l-0.2,-2.37l-0.37,-0.37l-1.72,-0.1l-2.76,-2.67l-2.14,-0.44l-2.84,-1.62l-1.78,-0.29l-1.25,0.58l-1.56,-0.09l-2.01,1.85l-1.69,0.47l-0.37,-1.75l0.36,-3.28l-0.2,-0.39l-1.68,-0.94l0.55,-1.92l-0.34,-0.51l-1.23,-0.14l0.38,-1.9l2.23,0.64l2.2,-1.06l0.12,-0.63l-1.77,-1.94l-0.69,-1.85Z",
      "name": "Turkmenistan"
    },
    "TJ": {
      "path": "M597.8,305.02l-0.08,0.09l-2.5,-0.5l-0.48,0.34l-0.24,1.88l0.43,0.45l2.63,-0.24l3.18,1.04l4.38,-0.45l0.56,2.63l0.54,0.29l0.66,-0.26l1.12,0.54l0.21,2.4l-3.76,-0.23l-1.81,1.45l-1.74,0.8l-0.62,-0.64l0.22,-2.47l-0.65,-0.49l-0.04,-1.02l-1.36,-0.73l-0.48,0.07l-1.08,1.11l-0.54,1.62l-1.3,-0.06l-0.96,1.26l-0.91,-0.37l-1.63,0.91l-0.24,-0.12l1.28,-3.1l-0.54,-2.38l-1.69,-0.89l0.36,-0.8l2.18,-0.05l1.19,-1.8l0.76,-1.99l2.44,-0.56l-0.28,1.13l0.36,0.91l0.43,0.25Z",
      "name": "Tajikistan"
    },
    "RO": {
      "path": "M487.52,276.99l0.59,0.28l2.89,4.68l-0.18,3.12l0.45,1.64l1.3,0.9l1.37,-0.47l0.76,0.41l0.03,0.46l-0.83,0.52l-0.57,-0.25l-0.55,0.3l-0.63,3.8l-0.98,-0.24l-2.1,-1.28l-2.95,0.81l-1.25,0.86l-3.49,-0.17l-1.88,-0.53l-0.87,0.17l-0.86,-1.54l0.34,-0.35l-0.05,-0.61l-0.62,-0.44l-0.51,0.04l-0.55,0.55l-1.04,-0.73l-0.17,-1.29l-1.58,-1.05l-0.34,-1.15l-0.92,-0.96l1.63,-0.65l2.66,-4.89l2.39,-1.44l2.93,0.39l1.06,0.83l0.47,0.02l0.79,-0.53l1.77,-0.34l0.76,-0.87l0.76,0.0Z",
      "name": "Romania"
    },
    "GW": {
      "path": "M386.23,383.41l-0.29,0.84l0.15,0.61l-2.21,0.6l-0.86,0.96l-1.04,-0.83l-1.09,-0.23l-0.54,-1.07l-0.66,-0.5l2.41,-0.49l4.13,0.1Z",
      "name": "Guinea-Bissau"
    },
    "GT": {
      "path": "M195.08,379.54l-2.48,-0.37l-1.03,-0.46l-1.14,-0.9l0.3,-1.01l-0.24,-0.68l0.96,-1.69l2.98,-0.01l0.4,-0.37l-0.19,-1.29l-1.68,-1.44l0.53,-0.4l0.0,-1.08l3.85,0.02l-0.21,4.61l0.4,0.43l1.48,0.38l-1.5,1.01l-0.34,0.71l0.12,0.57l-2.2,1.98Z",
      "name": "Guatemala"
    },
    "GR": {
      "path": "M487.09,300.31l-0.62,1.67l-0.37,0.23l-2.84,-0.38l-3.03,0.86l-0.18,0.66l1.34,1.43l-0.67,0.28l-1.12,0.0l-1.2,-1.54l-0.65,0.03l-0.52,1.05l0.56,1.95l1.06,1.34l-0.61,0.46l-0.05,0.59l2.53,2.34l0.02,1.02l-1.77,-0.64l-0.5,0.54l0.53,1.16l-1.1,0.23l-0.3,0.52l0.77,2.24l-0.99,0.02l-1.84,-1.22l-1.37,-4.59l-2.21,-3.25l-0.12,-0.67l1.06,-1.44l0.2,-1.06l0.84,-0.7l0.03,-0.55l1.33,-0.24l1.01,-0.71l1.21,0.06l0.67,-0.62l2.26,-0.01l1.8,-0.83l1.85,1.11l2.28,-0.31l0.35,-0.39l0.01,-0.9l0.35,0.26ZM480.49,319.61l0.67,0.51l-0.8,-0.16l0.13,-0.35ZM482.3,320.35l2.74,0.05l0.29,0.4l-2.04,0.15l-0.32,-0.47l-0.67,-0.13Z",
      "name": "Greece"
    },
    "GQ": {
      "path": "M448.79,409.52l0.02,2.22l-4.09,0.0l0.69,-2.27l3.38,0.05Z",
      "name": "Eq. Guinea"
    },
    "GY": {
      "path": "M277.42,399.96l-0.32,1.83l-1.32,0.57l-0.23,0.46l-0.28,2.01l1.11,1.82l0.83,0.19l0.32,1.25l1.13,1.62l-1.21,-0.19l-1.08,0.71l-1.77,0.5l-0.44,0.46l-0.86,-0.09l-1.32,-1.01l-0.77,-2.27l0.36,-1.91l0.68,-1.23l-0.57,-1.17l-0.74,-0.43l0.12,-1.16l-0.9,-0.69l-1.1,0.09l-1.31,-1.48l0.53,-0.72l-0.04,-0.84l1.99,-0.86l0.05,-0.59l-0.71,-0.78l0.14,-0.57l1.66,-1.24l1.36,0.77l1.41,1.5l0.06,1.15l0.37,0.38l0.8,0.05l2.06,1.87Z",
      "name": "Guyana"
    },
    "GE": {
      "path": "M521.61,293.9l5.38,1.03l3.26,1.57l0.84,0.7l1.39,-0.49l2.05,0.63l0.69,1.25l1.15,0.65l-0.2,0.63l1.05,1.54l-1.06,-0.15l-1.81,-0.93l-0.97,0.52l-3.21,0.48l-2.28,-1.55l-2.37,0.06l0.23,-1.11l-0.75,-2.51l-1.45,-1.26l-1.43,-0.44l-0.53,-0.61Z",
      "name": "Georgia"
    },
    "GB": {
      "path": "M412.72,233.04l-2.32,4.44l0.45,0.57l2.5,-0.63l2.22,0.02l-0.56,3.24l-2.22,4.0l0.31,0.59l2.36,0.26l2.34,5.43l1.76,0.84l2.21,6.35l2.96,0.93l-0.25,2.13l-1.17,1.09l-0.09,0.47l0.87,1.82l-1.92,1.78l-3.29,-0.02l-4.09,1.04l-1.02,-0.68l-0.52,0.07l-1.5,1.67l-2.09,-0.4l-1.88,1.4l-0.67,-0.39l3.29,-3.71l2.15,-0.83l0.25,-0.41l-0.33,-0.35l-3.72,-0.64l-0.47,-1.06l2.27,-1.1l0.17,-0.57l-1.29,-2.09l0.39,-2.22l3.35,0.34l0.44,-0.34l0.37,-2.46l-1.77,-2.98l-3.1,-0.89l-0.43,-0.84l0.8,-2.18l-0.82,-1.22l-0.67,0.01l-0.66,1.02l-0.1,-3.02l-1.24,-2.37l0.87,-4.6l1.78,-3.54l1.83,0.33l2.26,-0.3ZM406.3,251.21l-1.06,2.32l-1.53,-0.71l-1.21,0.0l0.4,-1.97l-0.42,-1.89l1.46,-0.13l2.36,2.36Z",
      "name": "United Kingdom"
    },
    "GA": {
      "path": "M453.24,409.42l-0.08,0.98l0.7,1.29l2.36,0.24l-0.98,2.63l1.18,1.79l0.25,1.78l-0.29,1.52l-0.6,0.93l-1.84,-0.09l-1.23,-1.11l-0.66,0.23l-0.15,0.84l-1.42,0.26l-1.02,0.7l-0.11,0.52l0.77,1.35l-1.34,0.98l-3.94,-4.31l-1.44,-2.45l0.06,-0.6l0.54,-0.81l1.05,-3.46l4.17,-0.07l0.4,-0.4l-0.02,-2.66l2.39,0.21l1.25,-0.27Z",
      "name": "Gabon"
    },
    "GN": {
      "path": "M391.8,383.91l0.47,0.81l1.11,-0.32l0.98,0.71l1.07,0.2l2.26,-1.23l0.63,0.44l1.13,1.58l-0.48,1.41l0.8,0.3l-0.08,0.48l0.46,0.69l-0.35,1.37l1.05,2.63l-1.0,0.69l0.03,1.42l-0.72,-0.06l-1.07,1.01l-0.24,-0.27l0.07,-1.11l-1.05,-1.55l-0.49,-0.14l-1.3,0.36l-0.35,-2.01l-1.6,-2.19l-2.0,-0.0l-1.31,0.54l-1.95,2.19l-1.86,-2.2l-1.2,-0.78l-0.3,-1.12l-0.8,-0.86l0.65,-0.73l0.81,-0.03l1.64,-0.8l0.23,-1.88l2.67,0.64l0.89,-0.31l1.21,0.15Z",
      "name": "Guinea"
    },
    "GM": {
      "path": "M379.31,381.18l0.1,-0.36l2.43,-0.07l0.74,-0.62l0.5,-0.03l0.83,0.53l-1.08,-0.33l-1.87,0.91l-1.65,-0.04ZM384.0,380.68l0.95,0.06l0.76,-0.23l-0.59,0.32l-1.11,-0.15Z",
      "name": "Gambia"
    },
    "GL": {
      "path": "M352.9,3.19l15.35,16.28l-4.35,6.99l-9.4,0.81l-13.48,1.81l-0.32,0.54l1.26,3.26l0.46,0.25l8.67,-1.96l7.39,6.05l0.55,-0.04l4.4,-4.95l1.83,5.61l-2.72,9.68l0.18,0.45l0.48,-0.06l6.34,-6.15l11.94,-6.62l7.14,3.24l1.33,6.85l-10.07,11.17l-1.42,3.42l-7.83,2.5l-0.28,0.42l0.35,0.36l5.33,0.65l-2.8,9.83l-2.03,8.69l0.08,13.63l2.84,7.11l-3.6,0.49l-4.12,3.47l-0.05,0.56l4.54,5.53l0.56,8.17l-2.39,0.81l-0.24,0.53l3.05,7.7l-5.05,0.6l-0.27,0.64l2.78,3.54l-0.72,2.75l-3.27,1.26l-3.42,0.02l-0.35,0.59l3.09,5.7l0.03,2.82l-4.32,-2.99l-0.57,0.13l-1.29,2.22l0.14,0.54l3.3,2.0l3.18,4.75l0.88,5.79l-3.85,1.25l-4.86,-7.12l-0.48,-0.14l-0.24,0.44l0.83,5.08l-2.81,3.81l0.3,0.64l9.17,0.61l-6.07,5.68l-6.74,5.42l-7.2,2.3l-2.98,0.14l-2.66,2.67l-3.44,6.75l-5.23,4.25l-1.73,0.27l-7.11,3.08l-2.15,3.69l-0.09,4.21l-1.22,3.58l-4.03,4.36l0.89,4.48l-2.31,8.95l-3.05,0.26l-3.56,-4.0l-5.12,-0.16l-2.26,-2.64l-1.69,-5.21l-4.31,-6.82l-1.24,-3.62l-0.4,-5.4l-3.39,-5.47l0.87,-4.47l-1.62,-2.41l2.37,-7.41l3.81,-2.67l1.01,-3.01l0.52,-5.6l-0.22,-0.39l-0.45,0.06l-4.16,3.58l-1.99,0.9l-2.73,-2.07l-0.16,-4.72l0.9,-3.66l1.94,-0.09l5.03,1.98l0.47,-0.14l-0.03,-0.49l-6.54,-7.53l-0.47,-0.11l-2.25,1.0l-1.7,-1.6l2.69,-7.67l-1.51,-3.12l-4.99,-15.74l-3.17,-3.76l-0.11,-4.29l-6.93,-6.07l-5.4,-0.76l-12.62,1.16l-2.75,-3.16l-4.1,-6.46l6.13,-3.31l4.96,-0.6l0.35,-0.37l-0.29,-0.42l-10.63,-2.99l-5.42,-4.66l0.32,-4.37l9.32,-6.03l9.34,-6.65l0.97,-5.04l-0.15,-0.39l-6.52,-4.97l2.06,-5.6l8.57,-10.89l3.56,-1.73l0.22,-0.41l-1.01,-7.43l5.7,-4.5l7.58,-2.82l7.37,-0.16l2.62,5.4l0.69,0.04l6.35,-9.67l5.63,6.55l3.58,1.5l5.14,5.66l0.54,0.05l0.1,-0.53l-5.89,-9.52l0.33,-7.89l8.21,-11.86l8.55,0.93l0.41,-0.25l3.12,-7.8l8.58,-2.09l19.79,2.78Z",
      "name": "Greenland"
    },
    "GH": {
      "path": "M420.53,387.35l-0.01,0.72l0.96,1.2l0.24,3.75l0.59,0.95l-0.51,2.1l0.19,1.41l1.02,2.22l-6.97,2.85l-1.8,-0.57l0.04,-0.89l-1.02,-2.04l0.61,-2.66l1.07,-2.33l-0.96,-6.5l5.01,0.07l0.94,-0.39l0.61,0.11Z",
      "name": "Ghana"
    },
    "OM": {
      "path": "M568.09,360.37l-0.91,1.71l-1.22,0.04l-0.59,0.78l-0.41,1.53l0.26,1.63l-1.16,0.05l-1.56,0.99l-0.76,1.78l-1.62,0.05l-0.98,0.66l-0.17,1.17l-0.89,0.53l-1.49,-0.18l-2.4,0.95l-2.48,-5.51l7.35,-2.77l1.67,-5.36l-1.12,-2.14l0.05,-0.87l0.67,-1.04l0.07,-1.08l0.91,-0.43l-0.05,-2.14l0.7,-0.01l1.01,1.68l1.51,1.12l3.3,0.87l1.73,2.37l0.81,0.38l-1.23,2.44l-0.99,0.81ZM561.83,347.23l-0.0,-0.01l0.01,-0.01l-0.0,0.02Z",
      "name": "Oman"
    },
    "TN": {
      "path": "M448.18,315.32l-1.08,1.46l-0.02,1.43l0.84,0.93l-0.29,2.3l-1.65,1.83l0.48,1.65l1.41,0.33l0.53,1.2l0.9,0.55l-0.11,1.83l-3.54,2.81l-0.09,2.52l-0.58,0.32l-0.96,-4.72l-1.54,-1.32l-0.15,-0.82l-1.93,-1.68l-0.19,-1.93l1.52,-1.74l0.59,-2.52l-0.38,-3.0l0.43,-1.35l2.45,-1.14l1.29,0.28l-0.06,1.25l0.59,0.37l1.54,-0.84Z",
      "name": "Tunisia"
    },
    "JO": {
      "path": "M518.65,329.54l-5.15,1.67l-0.19,0.64l2.19,2.56l-0.58,0.44l-0.33,0.78l-1.71,0.36l-1.71,1.89l-2.34,-0.38l1.21,-4.6l0.56,-4.33l2.81,0.99l4.45,-2.88l0.8,2.87Z",
      "name": "Jordan"
    },
    "HR": {
      "path": "M455.59,286.98l1.42,0.1l0.57,-0.46l0.74,0.44l0.98,0.07l0.43,-0.4l-0.01,-0.73l0.86,-0.57l0.21,-1.25l1.62,-0.78l2.55,1.93l2.07,0.69l0.88,-0.35l1.09,1.85l-0.56,0.77l-1.05,-0.63l-1.67,0.05l-2.1,-0.57l-1.3,0.07l-0.58,0.54l-0.57,-0.52l-0.65,0.16l-0.47,1.84l1.79,2.75l2.11,2.07l0.81,1.23l-1.27,-1.06l-2.2,-0.99l-1.73,-2.1l0.2,-0.63l-1.06,-1.38l-0.31,-1.43l-1.61,-0.56l-0.49,0.2l-0.45,0.89l-0.26,-1.24Z",
      "name": "Croatia"
    },
    "HT": {
      "path": "M238.65,368.15l-1.58,-0.17l-1.19,0.44l-0.91,-0.56l0.06,-0.21l3.62,0.5ZM239.22,368.07l0.82,-0.54l0.06,-0.62l-1.02,-1.03l0.02,-0.84l-0.3,-0.39l-0.93,-0.35l3.16,0.46l0.02,1.9l-0.48,0.35l-0.07,0.58l0.54,0.74l-1.81,-0.26Z",
      "name": "Haiti"
    },
    "HU": {
      "path": "M462.05,281.37l0.68,-1.93l-0.16,-0.54l0.71,-0.0l0.39,-0.35l0.1,-0.84l1.72,1.0l2.35,-0.43l0.43,-0.77l3.49,-0.92l0.69,-0.91l0.54,-0.15l2.55,1.09l0.69,-0.26l1.03,0.76l0.1,0.55l-1.45,0.83l-2.6,4.82l-1.79,0.61l-1.69,-0.11l-2.72,1.41l-1.83,-0.61l-2.55,-1.92l-0.7,-1.3Z",
      "name": "Hungary"
    },
    "HN": {
      "path": "M199.6,379.29l-1.71,-1.22l0.07,-0.96l3.04,-2.17l2.37,0.29l1.27,-0.09l1.1,-0.53l1.3,0.28l1.14,-0.26l1.37,0.37l2.25,1.39l-2.37,0.95l-1.23,-0.4l-0.88,1.31l-1.28,1.0l-0.43,-0.3l-0.55,0.08l-0.42,0.53l-0.96,0.05l-0.36,0.41l0.04,0.89l-0.52,0.6l-0.3,0.04l-0.3,-0.56l-0.66,-0.32l0.12,-0.68l-0.48,-0.66l-0.63,-0.25l-0.97,0.2Z",
      "name": "Honduras"
    },
    "PR": {
      "path": "M256.17,368.34l-0.27,0.28l-2.83,0.06l-0.07,-0.57l1.95,-0.1l1.23,0.34Z",
      "name": "Puerto Rico"
    },
    "PS": {
      "path": "M509.06,331.4l0.27,-0.17l-0.04,0.09l-0.23,0.08ZM509.37,331.14l-0.03,-0.63l-0.35,-0.18l0.32,-1.21l0.24,0.11l-0.19,1.91Z",
      "name": "Palestine"
    },
    "PT": {
      "path": "M401.85,314.47l-0.65,0.52l-1.11,-0.37l-0.93,0.18l0.29,-1.97l-0.24,-1.95l-1.24,-0.59l-0.47,-0.95l0.18,-1.87l1.01,-1.29l0.69,-3.25l-0.04,-1.52l-0.59,-2.16l1.29,-0.96l0.85,1.5l3.09,-0.33l0.49,1.17l-1.07,1.02l-0.03,2.43l-0.41,0.6l-0.08,1.25l-0.8,0.2l-0.26,0.57l0.93,1.79l-0.64,1.95l0.78,1.16l-1.12,1.72l0.08,1.13Z",
      "name": "Portugal"
    },
    "PY": {
      "path": "M274.9,466.41l0.74,1.55l-0.16,3.55l0.32,0.41l2.64,0.52l1.11,-0.48l1.4,0.6l0.36,0.62l0.53,3.53l1.27,0.41l0.98,-0.39l0.52,0.28l-0.0,1.23l-1.21,5.54l-2.09,1.99l-1.8,0.41l-4.72,-1.03l2.21,-3.81l-0.32,-1.54l-2.77,-1.32l-3.03,-2.01l-2.07,-0.45l-4.34,-4.19l0.91,-2.99l0.08,-1.45l1.07,-2.09l4.13,-0.73l2.18,0.04l2.06,1.2l0.03,0.61Z",
      "name": "Paraguay"
    },
    "PA": {
      "path": "M213.79,393.56l0.26,-1.53l-0.36,-0.26l-0.01,-0.5l0.44,-0.1l0.93,1.4l1.26,0.03l0.77,0.5l1.38,-0.24l2.51,-1.12l0.86,-0.72l3.45,0.85l1.4,1.19l0.41,1.75l-0.21,0.34l-0.53,-0.12l-0.47,0.29l-0.16,0.6l-0.68,-1.28l0.45,-0.49l-0.19,-0.66l-0.47,-0.13l-0.54,-0.84l-1.5,-0.75l-1.1,0.16l-0.75,0.99l-1.62,0.84l-0.18,0.96l0.85,0.97l-0.58,0.45l-0.69,0.08l-0.34,-1.18l-1.27,0.03l-0.71,-1.05l-2.59,-0.47Z",
      "name": "Panama"
    },
    "PG": {
      "path": "M808.58,428.76l2.54,2.57l-0.13,0.26l-0.33,0.12l-0.87,-0.78l-1.22,-2.17ZM801.41,422.94l0.51,0.29l0.26,0.27l-0.49,-0.36l-0.28,-0.21ZM803.17,424.48l0.59,0.5l0.08,1.06l-0.29,-0.91l-0.38,-0.65ZM796.68,428.31l0.52,0.75l1.43,-0.19l2.27,-1.82l-0.01,-1.43l1.12,0.16l-0.04,1.1l-0.7,1.28l-1.12,0.18l-0.62,0.79l-2.46,1.11l-1.17,-0.0l-3.08,-1.25l3.41,0.0l0.45,-0.68ZM789.15,433.47l2.31,1.81l1.59,2.62l1.34,0.14l-0.06,0.66l0.31,0.43l1.06,0.24l0.06,0.66l2.25,1.06l-1.21,0.13l-0.72,-0.64l-4.56,-0.65l-3.22,-2.89l-1.49,-2.35l-3.27,-1.11l-2.38,0.72l-1.59,0.86l-0.2,0.42l0.27,1.56l-1.55,0.69l-1.36,-0.4l-2.21,-0.09l-0.08,-15.44l8.39,2.93l2.95,2.4l0.6,1.64l4.02,1.5l0.31,0.69l-1.76,0.21l-0.33,0.52l0.55,1.68Z",
      "name": "Papua New Guinea"
    },
    "PE": {
      "path": "M244.97,425.11l-1.26,-0.07l-0.57,0.42l-1.93,0.45l-2.98,1.76l-0.36,1.36l-0.58,0.8l0.12,1.37l-1.24,0.6l-0.22,1.22l-0.62,0.84l1.04,2.28l1.28,1.44l-0.41,0.85l0.32,0.57l1.48,0.13l1.16,1.37l2.21,0.07l1.63,-1.08l-0.13,3.04l0.3,0.4l1.14,0.29l1.31,-0.35l1.9,3.62l-0.48,0.86l-0.17,3.89l-0.94,1.6l0.35,0.76l-0.48,1.08l0.98,2.0l-2.1,3.89l-0.97,0.51l-2.17,-1.31l-0.39,-1.18l-4.95,-2.62l-4.46,-2.82l-1.85,-1.53l-0.91,-1.87l0.3,-0.97l-2.11,-3.36l-4.82,-9.74l-1.04,-1.2l-0.87,-1.95l-3.4,-2.49l0.58,-1.18l-1.13,-2.23l0.66,-1.5l1.45,-1.15l-0.6,0.99l0.07,0.92l0.47,0.36l1.74,0.03l0.97,1.17l0.54,0.07l1.42,-1.03l0.6,-1.84l1.42,-2.02l3.04,-1.04l2.73,-2.62l0.86,-1.74l-0.1,-1.87l1.44,1.02l0.9,1.25l1.06,0.59l1.7,2.73l1.86,0.31l1.45,-0.61l0.96,0.39l1.36,-0.19l1.45,0.89l-1.4,2.21l0.31,0.61l0.59,0.05l0.47,0.5Z",
      "name": "Peru"
    },
    "PK": {
      "path": "M615.13,319.81l-1.88,2.0l-2.59,0.42l-3.73,-0.73l-1.6,1.43l-0.09,0.4l1.77,4.7l1.73,1.32l-1.73,1.38l-0.11,2.26l-2.34,2.8l-1.59,2.95l-2.46,2.8l-3.03,-0.07l-2.76,2.96l0.05,0.59l1.51,1.16l0.26,1.98l1.44,1.55l0.37,1.77l-5.02,-0.01l-1.78,1.76l-1.41,-0.53l-0.76,-1.94l-2.27,-2.23l-11.61,0.89l0.72,-2.47l3.43,-1.37l0.25,-0.43l-0.21,-1.29l-1.2,-0.67l-0.28,-2.57l-2.29,-1.2l-1.32,-2.09l2.85,1.0l2.62,-0.4l1.42,0.35l0.77,-0.59l1.71,0.2l3.25,-1.2l0.26,-0.36l0.08,-2.33l1.19,-1.41l1.68,0.0l0.58,-0.87l1.59,-0.32l1.2,0.17l0.98,-0.83l0.01,-1.99l0.94,-1.58l1.48,-0.71l0.19,-0.54l-0.69,-1.39l2.06,-0.12l0.69,-1.09l-0.03,-1.23l1.12,-1.15l-0.18,-1.88l-0.5,-1.14l1.17,-1.09l5.42,-0.99l2.59,-0.89l1.6,1.26l0.97,2.53l3.5,1.06Z",
      "name": "Pakistan"
    },
    "PH": {
      "path": "M737.01,393.71l0.39,2.98l-0.44,1.19l-0.55,-1.53l-0.67,-0.14l-1.17,1.28l0.65,2.1l-0.42,0.69l-2.48,-1.23l-0.58,-1.49l0.66,-1.03l-0.1,-0.53l-1.59,-1.19l-0.56,0.08l-0.65,0.87l-1.23,0.0l-1.58,0.97l0.83,-1.81l2.56,-1.42l0.65,0.84l0.45,0.13l1.9,-0.69l0.56,-1.12l1.5,-0.06l0.38,-0.43l-0.09,-1.2l1.21,0.72l0.36,2.03ZM733.59,386.41l0.05,0.76l0.08,0.27l-0.8,-0.42l-0.18,-0.72l0.85,0.12ZM734.08,385.93l-0.12,-1.13l-1.01,-1.29l1.36,0.03l0.53,0.73l0.51,2.06l-1.27,-0.4ZM733.76,387.52l0.39,0.99l-0.32,0.15l-0.07,-1.14ZM724.65,368.03l1.46,0.71l0.72,-0.31l-0.32,1.19l0.79,1.74l-0.57,1.88l-1.53,1.06l-0.39,2.27l0.56,2.06l1.63,0.57l1.16,-0.27l2.72,1.24l-0.19,1.1l0.77,0.85l-0.08,0.37l-1.4,-0.9l-0.88,-1.29l-0.66,0.0l-0.38,0.55l-1.6,-1.32l-2.15,0.36l-0.87,-0.4l0.07,-0.62l0.66,-0.56l-0.01,-0.62l-0.75,-0.6l-0.72,0.44l-0.73,-0.88l-0.39,-2.53l0.32,0.27l0.66,-0.28l0.26,-4.04l0.71,-2.06l1.14,0.0ZM731.03,388.72l-0.88,0.85l-1.19,1.95l-1.05,-1.2l0.93,-1.11l0.32,-1.48l0.52,-0.06l-0.27,1.16l0.22,0.45l0.49,-0.12l1.0,-1.32l-0.08,0.86ZM726.83,385.61l0.83,0.38l1.17,-0.0l-0.02,0.48l-2.0,1.41l0.02,-2.28ZM724.81,381.88l-0.39,1.29l-1.42,-1.98l1.2,0.05l0.6,0.64ZM716.54,391.7l1.12,-0.97l0.03,-0.03l-0.28,0.38l-0.87,0.63ZM719.21,388.91l0.04,-0.07l0.8,-1.54l0.16,0.76l-1.01,0.85Z",
      "name": "Philippines"
    },
    "PL": {
      "path": "M468.45,271.45l-1.1,-1.82l-1.87,-0.39l-0.48,-1.25l-1.72,-0.44l-0.47,0.25l-0.21,0.56l-0.72,-0.43l0.12,-0.82l-0.32,-0.45l-1.74,-0.32l-1.05,-1.13l-0.96,-2.4l0.17,-1.46l-0.62,-2.19l-0.82,-1.37l0.61,-1.22l-0.51,-1.88l1.46,-1.07l6.88,-3.37l2.12,0.62l0.15,0.81l0.38,0.33l5.51,0.54l4.53,-0.06l1.06,0.38l0.5,1.09l0.14,1.93l0.66,1.51l-0.01,1.34l-1.3,0.73l-0.17,0.5l0.74,1.83l0.07,1.86l1.22,3.37l-0.19,0.78l-1.23,0.53l-2.27,3.23l0.24,1.15l-1.99,-1.23l-2.01,0.46l-1.38,-0.32l-1.2,0.67l-1.05,-1.13l-1.17,0.27Z",
      "name": "Poland"
    },
    "ZM": {
      "path": "M481.47,443.27l0.39,0.31l2.52,0.15l0.99,1.18l2.01,0.36l1.4,-0.64l0.69,1.18l1.78,0.33l1.84,2.38l2.24,0.19l0.4,-0.43l-0.21,-2.77l-0.62,-0.3l-0.48,0.33l-1.98,-1.18l0.72,-5.32l-0.51,-1.19l0.58,-1.31l3.68,-0.62l0.26,0.64l1.21,0.63l0.9,-0.22l2.16,0.67l1.33,0.71l1.07,1.02l0.56,1.89l-0.88,2.72l0.43,2.1l-0.73,0.88l-0.76,2.39l0.6,0.68l-6.61,1.85l-0.29,0.44l0.19,1.47l-1.69,0.36l-1.43,1.04l-0.38,0.89l-0.87,0.26l-3.48,3.75l-4.15,-0.54l-1.52,-1.01l-1.77,-0.14l-1.82,0.53l-3.04,-3.46l0.11,-7.69l4.82,0.03l0.39,-0.49l-0.18,-0.76l0.33,-0.84l-0.4,-1.37l0.24,-1.06Z",
      "name": "Zambia"
    },
    "EH": {
      "path": "M384.42,359.7l0.26,-0.83l1.06,-1.32l0.8,-3.63l3.38,-2.88l0.69,-1.87l0.06,5.03l-1.98,0.21l-0.94,1.63l0.39,3.66l-3.71,-0.01ZM392.0,347.13l0.72,-1.91l1.77,-0.25l2.09,0.35l0.96,-0.65l1.27,-0.07l-0.0,2.65l-6.8,-0.12Z",
      "name": "W. Sahara"
    },
    "EE": {
      "path": "M485.7,228.2l2.62,0.79l2.44,-0.11l0.18,0.41l-1.67,2.62l0.66,4.56l-0.85,1.18l-1.72,-0.01l-3.21,-2.27l-1.85,0.58l0.22,-2.14l-0.62,-0.38l-0.64,0.42l-1.26,-1.35l-0.18,-2.36l2.87,-1.24l3.02,-0.69Z",
      "name": "Estonia"
    },
    "EG": {
      "path": "M492.06,333.38l1.47,0.44l2.95,-1.74l2.03,-0.22l1.52,0.32l0.6,1.27l0.7,0.04l0.41,-0.68l1.8,0.61l1.95,0.17l1.04,-0.54l1.43,4.34l-2.03,4.78l-1.66,-1.85l-1.76,-4.05l-0.65,-0.12l-0.35,0.67l1.04,3.03l3.44,7.26l1.77,3.16l2.04,2.76l-0.37,0.54l0.22,2.06l2.73,2.28l-28.43,0.0l0.0,-19.72l-0.73,-2.31l0.6,-1.66l-0.33,-1.32l0.69,-1.07l3.05,-0.04l4.82,1.62Z",
      "name": "Egypt"
    },
    "ZA": {
      "path": "M467.15,505.21l-0.13,-2.11l-0.69,-1.7l0.71,-0.7l-0.12,-2.46l-4.57,-8.67l0.78,-0.92l0.59,0.47l0.69,1.37l2.83,0.75l1.5,-0.27l2.24,-1.46l0.18,-9.94l1.35,2.39l-0.21,1.57l0.61,1.24l0.41,0.2l1.79,-0.29l2.61,-2.16l0.69,-1.37l0.95,-0.5l2.19,1.08l2.04,0.14l1.78,-0.67l0.85,-2.2l1.38,-0.34l1.59,-2.85l2.15,-1.95l3.41,-1.92l1.99,0.46l1.02,-0.28l0.99,0.2l1.75,5.47l-0.37,3.39l-0.82,-0.24l-1.0,0.47l-0.87,1.75l-0.04,1.2l1.98,1.91l1.47,-0.3l0.7,-1.24l1.09,0.01l-0.77,3.89l-0.58,1.15l-2.2,1.88l-3.17,5.02l-2.8,3.01l-3.57,3.07l-2.53,1.12l-1.22,0.15l-0.51,0.75l-1.17,-0.34l-1.4,0.54l-2.58,-0.55l-1.62,0.35l-1.19,-0.11l-2.54,1.18l-2.1,0.47l-1.6,1.15l-0.84,0.05l-0.93,-0.95l-0.93,-0.16l-0.97,-1.21l-0.25,0.05ZM491.46,495.56l0.62,-0.98l1.48,-0.62l1.18,-2.31l-0.07,-0.48l-1.99,-1.77l-1.68,0.59l-1.42,1.19l-1.34,1.82l0.02,0.49l1.88,2.23l1.32,-0.17Z",
      "name": "South Africa"
    },
    "EC": {
      "path": "M231.86,415.43l0.29,1.59l-0.69,1.45l-2.61,2.51l-3.13,1.11l-1.53,2.18l-0.49,1.68l-1.0,0.73l-1.02,-1.11l-1.78,-0.16l0.67,-1.15l-0.24,-0.86l1.25,-2.13l-0.54,-1.09l-0.67,-0.08l-0.72,0.87l-0.87,-0.64l0.35,-0.69l-0.36,-1.96l0.81,-0.51l0.45,-1.51l0.92,-1.57l-0.07,-0.97l2.65,-1.33l2.75,1.35l0.77,1.05l2.12,0.35l0.76,-0.32l1.96,1.21Z",
      "name": "Ecuador"
    },
    "IT": {
      "path": "M451.58,282.14l3.5,1.08l-0.22,1.43l0.34,1.0l-1.55,-0.28l-2.22,1.64l0.13,1.69l-0.27,1.22l0.82,1.78l2.39,1.84l1.3,2.87l2.79,2.73l2.05,0.1l0.25,0.31l-0.43,0.41l0.09,0.64l4.05,2.19l2.2,2.0l-0.17,0.42l-1.16,-1.17l-2.18,-0.54l-0.45,0.21l-1.05,2.12l0.14,0.51l1.59,1.06l-0.2,1.15l-1.06,0.36l-1.25,2.57l-0.36,0.08l0.0,-0.41l1.01,-2.65l-1.73,-3.5l-1.12,-0.56l-0.67,-1.29l-1.72,-0.75l-1.01,-1.25l-2.01,-0.35l-4.11,-3.59l-1.63,-1.87l-1.03,-3.6l-3.56,-1.55l-1.3,0.58l-1.68,1.6l0.17,-0.9l-0.27,-0.45l-1.14,-0.37l-0.55,-2.31l0.78,-1.37l-0.66,-1.44l0.81,0.44l1.41,-0.27l1.08,-0.94l0.53,0.39l1.19,-0.11l0.75,-1.38l1.51,0.37l1.39,-0.65l0.34,-1.31l1.06,0.36l0.5,-0.22l0.21,-0.51l1.95,-0.5l0.42,0.96ZM459.21,311.54l-0.67,1.87l0.33,1.12l-0.32,0.99l-1.48,-0.91l-4.52,-1.83l0.21,-0.97l2.67,0.25l3.8,-0.53ZM443.92,301.94l1.19,1.86l-0.3,3.74l-1.07,-0.01l-0.75,0.79l-0.53,-0.48l-0.1,-3.76l-0.41,-1.41l1.07,0.0l0.9,-0.74Z",
      "name": "Italy"
    },
    "VN": {
      "path": "M690.58,359.66l-2.72,1.89l-2.09,2.52l-0.63,1.98l4.31,6.55l2.32,1.68l1.44,1.97l1.11,4.65l-0.32,4.28l-1.93,1.55l-2.84,1.62l-2.11,2.17l-2.73,2.07l-0.59,-1.06l0.63,-1.54l-0.12,-0.47l-1.34,-1.05l1.51,-0.72l2.55,-0.18l0.3,-0.63l-0.82,-1.16l4.0,-2.09l0.31,-3.08l-0.57,-1.79l0.42,-2.69l-0.73,-1.99l-1.86,-1.79l-3.63,-5.38l-2.73,-1.5l0.37,-0.5l1.5,-0.65l0.21,-0.52l-0.97,-2.33l-0.37,-0.25l-2.83,-0.02l-2.25,-4.02l0.84,-0.42l4.39,-0.3l2.06,-1.35l1.15,0.91l1.88,0.41l-0.18,1.55l1.36,1.19l1.69,0.47Z",
      "name": "Vietnam"
    },
    "SB": {
      "path": "M826.68,441.55l-0.6,0.09l-0.2,-0.34l0.37,0.15l0.44,0.09ZM824.18,437.32l-0.26,-0.31l-0.31,-0.91l0.03,0.0l0.54,1.22ZM823.04,439.28l-1.66,-0.22l-0.2,-0.53l1.16,0.28l0.7,0.47ZM819.26,434.58l1.17,0.66l0.03,0.04l-0.82,-0.45l-0.38,-0.25Z",
      "name": "Solomon Is."
    },
    "ET": {
      "path": "M516.04,377.54l1.1,0.85l1.63,-0.46l0.68,0.48l1.63,0.03l2.01,0.96l1.73,1.68l1.64,2.1l-1.52,2.06l0.16,1.73l0.39,0.38l2.05,0.01l-0.36,1.03l2.86,3.6l8.32,3.09l1.32,0.02l-6.33,6.76l-3.1,0.11l-2.36,1.77l-1.47,0.04l-0.86,0.79l-1.38,-0.0l-1.32,-0.81l-2.29,1.05l-0.76,0.98l-3.29,-0.41l-3.07,-2.07l-1.8,-0.07l-0.62,-0.6l0.0,-1.24l-0.28,-0.38l-1.15,-0.37l-1.4,-2.6l-1.19,-0.69l-0.47,-1.01l-1.27,-1.23l-1.16,-0.22l0.43,-0.73l1.45,-0.28l0.41,-0.95l-0.03,-2.22l0.68,-2.45l1.05,-0.63l1.43,-3.08l1.57,-1.38l1.02,-2.53l0.35,-1.9l2.52,0.47l0.44,-0.24l0.58,-1.44Z",
      "name": "Ethiopia"
    },
    "SO": {
      "path": "M525.13,418.38l-1.13,-1.57l-0.03,-8.86l2.66,-3.38l1.67,-0.13l2.13,-1.69l3.41,-0.23l7.08,-7.57l2.91,-3.71l0.08,-4.85l2.98,-0.67l1.24,-0.87l0.45,-0.0l-0.2,3.03l-1.21,3.64l-2.73,6.0l-2.13,3.66l-5.03,6.17l-8.56,6.4l-2.78,3.08l-0.8,1.56Z",
      "name": "Somalia"
    },
    "ZW": {
      "path": "M498.91,471.53l-1.1,-0.22l-0.92,0.29l-2.09,-0.46l-1.49,-1.14l-1.89,-0.44l-0.62,-1.44l-0.01,-0.86l-0.3,-0.38l-0.97,-0.26l-2.72,-2.8l-1.93,-3.41l3.83,0.46l3.74,-3.89l1.08,-0.44l0.26,-0.78l1.25,-0.91l1.41,-0.26l0.5,0.9l1.99,-0.05l1.72,1.19l1.11,0.18l1.05,0.68l0.01,3.05l-0.59,3.84l0.38,0.87l-0.23,1.26l-0.39,0.36l-0.64,1.86l-2.43,2.82Z",
      "name": "Zimbabwe"
    },
    "ES": {
      "path": "M415.99,294.24l1.08,1.32l4.61,1.55l1.08,-0.64l2.58,1.41l2.72,-0.33l0.09,1.34l-2.15,2.02l-3.1,0.68l-0.31,0.31l-0.2,1.01l-1.54,1.87l-0.97,2.65l0.86,1.9l-1.34,1.4l-0.49,1.86l-1.88,0.7l-1.66,2.25l-5.35,-0.01l-1.81,1.17l-0.88,1.06l-0.86,-0.18l-0.79,-0.9l-0.68,-1.73l-2.37,-0.68l-0.12,-0.6l1.21,-2.0l-0.78,-1.19l0.62,-1.89l-0.8,-1.8l0.89,-0.51l0.09,-1.41l0.42,-0.63l0.03,-2.39l1.01,-0.78l0.12,-0.47l-1.04,-1.93l-1.46,-0.12l-0.63,0.42l-1.04,0.0l-0.53,-1.39l-0.55,-0.22l-1.31,0.73l0.07,-1.41l-0.87,-1.4l3.08,-2.16l2.98,0.6l3.32,-0.02l2.62,0.58l6.01,-0.06Z",
      "name": "Spain"
    },
    "ER": {
      "path": "M520.38,375.96l3.42,2.46l3.5,3.81l0.85,0.55l-0.95,-0.01l-3.51,-3.92l-2.33,-1.16l-1.73,-0.07l-0.91,-0.51l-1.25,0.52l-1.34,-1.03l-0.62,0.17l-0.66,1.63l-2.34,-0.43l-0.18,-0.68l1.29,-5.37l0.62,-0.63l1.95,-0.54l0.87,-1.03l1.17,2.45l0.68,2.36l1.49,1.45Z",
      "name": "Eritrea"
    },
    "ME": {
      "path": "M468.91,298.06l-1.24,-1.13l0.5,-2.11l0.88,-0.81l2.29,1.73l-0.52,0.71l-0.77,-0.3l-1.14,1.91Z",
      "name": "Montenegro"
    },
    "MD": {
      "path": "M491.9,285.98l-0.28,-1.04l0.25,-1.54l-0.15,-1.8l-3.32,-5.2l1.4,-0.31l1.71,1.08l1.07,0.18l0.88,0.78l0.03,1.44l0.78,0.52l0.33,1.38l0.81,0.94l0.0,0.67l-1.14,-0.08l-0.7,-0.47l-0.52,0.29l-0.06,0.94l-1.08,2.21Z",
      "name": "Moldova"
    },
    "MG": {
      "path": "M545.91,449.15l0.4,3.06l0.63,1.22l-0.21,1.04l-0.56,-0.81l-0.69,-0.01l-0.47,0.77l0.41,2.15l-0.18,0.89l-0.72,0.79l-0.15,2.18l-5.77,18.57l-3.92,1.7l-3.12,-1.54l-0.6,-1.26l-0.19,-2.48l-0.86,-2.12l-0.21,-1.83l0.39,-1.67l1.21,-0.76l0.01,-0.79l1.19,-2.08l0.23,-1.69l-1.06,-3.05l-0.19,-2.26l0.81,-1.36l0.32,-1.49l4.63,-1.23l3.44,-3.04l0.85,-1.42l-0.09,-0.71l0.78,-0.04l1.38,-1.79l0.13,-1.65l0.45,-0.62l1.16,1.7l0.59,1.62Z",
      "name": "Madagascar"
    },
    "MA": {
      "path": "M378.77,359.44l0.06,-0.63l0.93,-0.75l0.82,-1.41l-0.09,-1.07l0.79,-1.77l1.31,-1.64l0.95,-0.61l0.66,-1.61l0.09,-1.52l0.81,-1.54l1.72,-1.11l1.55,-2.81l1.16,-1.0l2.44,-0.41l1.94,-1.91l1.31,-0.82l2.09,-2.4l-0.51,-3.84l1.25,-3.95l1.5,-1.88l4.46,-2.74l2.37,-4.82l1.43,0.01l1.7,1.31l2.31,-0.21l3.46,0.7l0.81,1.67l0.16,1.84l0.86,3.17l0.57,0.63l-0.27,0.69l-3.05,0.46l-1.26,1.11l-1.33,0.24l-0.33,0.37l-0.09,1.91l-2.69,1.06l-1.07,1.5l-1.89,0.72l-2.58,0.47l-4.04,2.12l-0.53,4.86l-1.16,0.07l-0.92,0.64l-1.96,-0.36l-2.42,0.56l-0.74,1.99l-0.86,0.41l-1.14,3.39l-3.53,3.11l-0.81,3.66l-0.96,1.14l-0.29,0.84l-4.94,0.19Z",
      "name": "Morocco"
    },
    "UZ": {
      "path": "M598.64,298.24l-1.64,1.79l0.06,0.61l1.85,1.26l1.99,-0.71l2.27,1.34l-2.58,1.91l-2.57,-0.24l-0.2,-0.5l0.47,-1.39l-0.47,-0.52l-3.35,0.77l-2.1,3.89l-1.86,-0.14l-0.39,0.23l-0.65,1.43l0.21,0.53l1.65,0.69l0.47,2.05l-1.21,2.74l-1.54,-0.54l-1.11,-0.04l0.05,-1.53l-0.25,-0.38l-3.3,-1.35l-2.56,-1.53l-4.4,-3.69l-1.33,-3.48l-1.1,-0.68l-2.57,0.15l-0.7,-0.5l-0.46,-2.81l-3.37,-1.79l-0.46,0.06l-2.07,1.94l-2.09,1.14l-0.2,0.45l0.29,1.2l-1.92,0.03l-0.09,-11.97l5.98,-1.95l6.18,4.04l2.35,3.08l7.41,-0.61l2.72,2.28l-0.18,3.21l0.39,0.42l0.89,0.02l0.45,2.42l0.38,0.33l2.93,0.1l0.96,1.58l1.29,-0.25l1.05,-2.28l3.18,-2.25l1.24,-0.54Z",
      "name": "Uzbekistan"
    },
    "MM": {
      "path": "M673.9,359.64l-1.97,1.62l-0.57,0.98l-1.4,0.62l-1.36,1.08l-1.99,0.36l-1.08,2.72l-0.91,0.41l-0.19,0.55l1.21,2.31l2.52,3.49l-0.79,1.95l-0.74,0.41l-0.17,0.52l0.65,1.39l1.61,1.98l0.25,2.61l0.9,2.15l-1.92,3.6l0.68,-2.27l-0.81,-1.75l0.19,-2.68l-1.05,-1.54l-1.24,-6.25l-1.12,-2.29l-0.61,-0.13l-4.33,3.06l-2.39,-0.66l0.77,-2.89l-0.52,-2.65l-1.92,-3.02l0.25,-0.78l-0.29,-0.51l-1.33,-0.31l-1.61,-1.97l-0.1,-1.35l0.82,-0.23l0.04,-1.7l1.03,-0.53l0.21,-0.44l-0.23,-0.99l0.54,-0.98l0.08,-2.3l1.45,0.46l0.48,-0.2l1.12,-2.26l0.16,-1.4l1.34,-2.25l-0.01,-1.58l2.89,-1.73l1.62,0.46l0.51,-0.43l-0.17,-1.48l0.65,-0.39l0.07,-1.08l0.77,-0.11l0.71,1.41l1.06,0.72l-0.03,4.05l-2.38,2.46l-0.3,3.26l0.47,0.43l2.27,-0.39l0.51,2.15l1.47,0.69l-0.61,1.87l0.19,0.47l2.97,1.52l1.64,-0.56l0.02,0.35Z",
      "name": "Myanmar"
    },
    "ML": {
      "path": "M392.61,383.9l-0.19,-2.39l-0.99,-0.88l-0.44,-1.31l-0.09,-1.3l0.81,-0.59l0.35,-1.26l2.37,0.66l1.31,-0.48l0.86,0.15l0.66,-0.57l9.83,-0.04l0.38,-0.28l0.56,-1.82l-0.44,-0.66l-2.35,-22.51l3.26,-0.04l16.7,11.72l0.74,1.34l2.5,1.11l0.02,1.42l0.44,0.39l2.34,-0.22l0.01,5.49l-1.28,1.64l-0.26,1.51l-5.31,0.58l-1.08,0.93l-2.9,0.1l-0.87,-0.48l-1.38,0.37l-2.4,1.1l-0.6,0.88l-1.86,1.1l-0.43,0.71l-0.79,0.4l-1.44,-0.21l-0.81,0.84l-0.34,1.65l-1.91,2.04l-0.06,1.04l-0.67,1.23l0.13,1.17l-0.97,0.39l-0.23,-0.65l-0.52,-0.24l-1.35,0.4l-0.34,0.55l-2.69,-0.29l-0.37,-0.36l-0.02,-0.91l-0.65,-0.35l0.45,-0.65l-0.03,-0.52l-2.12,-2.46l-0.76,-0.01l-2.0,1.17l-0.78,-0.15l-0.8,-0.67l-1.21,0.23Z",
      "name": "Mali"
    },
    "MN": {
      "path": "M676.61,267.85l3.78,1.95l5.69,-1.19l2.35,0.48l2.34,1.79l1.81,2.09l2.28,-0.04l3.11,0.62l2.49,-0.96l3.42,-0.7l3.51,-2.62l1.21,0.34l1.56,1.35l2.31,-0.25l-2.72,6.05l0.64,1.85l0.5,0.22l1.31,-0.44l2.36,0.55l2.04,-1.29l1.73,1.03l2.1,2.39l-0.15,0.72l-1.72,-0.34l-3.79,0.54l-1.88,1.14l-1.76,2.29l-3.71,1.35l-2.44,1.82l-3.81,-0.99l-0.44,0.19l-1.31,2.27l1.07,2.53l-1.56,1.04l-1.74,1.78l-2.78,1.14l-3.78,0.14l-4.05,1.18l-2.75,1.69l-1.16,-0.94l-2.93,0.0l-3.61,-2.0l-2.59,-0.55l-3.41,0.46l-5.11,-0.75l-2.62,0.07l-1.31,-1.82l-1.4,-3.4l-1.47,-0.37l-3.14,-2.22l-6.15,-1.06l-0.73,-1.26l0.89,-4.37l-1.73,-2.97l-3.7,-1.54l-1.96,-1.86l-0.53,-2.16l2.39,-0.63l4.75,-3.33l3.59,-1.75l2.18,1.16l2.44,0.05l1.83,1.83l2.46,0.14l3.58,0.97l0.4,-0.12l2.43,-2.72l0.07,-0.43l-0.93,-2.14l2.28,-3.66l2.59,1.52l4.94,1.41l0.44,2.74Z",
      "name": "Mongolia"
    },
    "MK": {
      "path": "M472.81,299.6l0.49,-0.78l3.56,-0.8l1.01,0.87l0.14,1.71l-0.66,0.59l-1.14,-0.05l-1.14,0.75l-1.37,0.24l-0.79,-0.61l-0.3,-1.19l0.2,-0.73Z",
      "name": "Macedonia"
    },
    "MW": {
      "path": "M505.5,439.25l0.85,1.96l0.15,2.88l-0.69,1.66l0.72,1.81l0.06,1.29l0.49,0.64l0.07,1.07l0.4,0.55l0.8,-0.23l0.55,0.62l0.7,-0.21l0.34,0.6l0.19,2.98l-1.04,0.63l-0.53,1.27l-1.11,-1.1l-0.16,-1.59l0.51,-1.33l-0.32,-1.32l-0.99,-0.65l-0.82,0.12l-2.36,-1.66l0.63,-1.99l0.82,-1.18l-0.46,-2.03l0.9,-2.88l-0.95,-2.53l0.97,0.19l0.29,0.41Z",
      "name": "Malawi"
    },
    "MR": {
      "path": "M407.4,349.79l-2.62,0.03l-0.39,0.44l2.42,23.13l0.37,0.43l-0.39,1.27l-9.75,0.04l-0.56,0.54l-0.91,-0.11l-1.27,0.46l-1.61,-0.66l-0.98,0.03l-0.36,0.29l-0.38,1.37l-0.42,0.24l-2.93,-3.44l-2.96,-1.55l-1.62,-0.03l-1.27,0.55l-1.12,-0.2l-0.65,0.4l-0.08,-0.51l0.68,-1.31l0.31,-2.47l-0.57,-3.99l0.23,-1.25l-0.68,-1.53l-1.16,-1.05l0.25,-0.42l9.58,0.02l0.4,-0.45l-0.46,-3.79l0.47,-1.08l2.11,-0.22l0.36,-0.4l-0.08,-6.64l7.81,0.14l0.41,-0.4l0.01,-3.47l7.8,5.59Z",
      "name": "Mauritania"
    },
    "UG": {
      "path": "M498.55,406.22l0.7,-0.46l1.65,0.5l1.96,-0.57l1.7,0.01l1.45,-0.98l0.91,1.33l1.33,3.95l-2.57,4.03l-1.46,-0.4l-2.54,0.91l-1.37,1.61l-0.01,0.81l-2.42,-0.01l-2.26,1.01l-0.17,-1.59l0.58,-1.04l0.14,-1.94l1.37,-2.28l1.78,-1.58l-0.17,-0.65l-0.72,-0.24l0.13,-2.43Z",
      "name": "Uganda"
    },
    "MY": {
      "path": "M717.48,403.36l-1.39,0.65l-2.12,-0.41l-2.88,-0.0l-0.38,0.28l-0.84,2.75l-0.99,0.96l-1.21,3.29l-1.73,0.45l-2.45,-0.68l-1.39,0.31l-1.33,1.15l-1.59,-0.14l-1.41,0.44l-1.44,-1.19l-0.18,-0.73l1.34,0.53l1.93,-0.47l0.75,-2.23l4.02,-1.03l2.75,-3.21l0.82,0.94l0.64,-0.05l0.4,-0.65l0.96,0.06l0.42,-0.36l0.24,-2.69l1.81,-1.65l1.21,-1.87l0.63,-0.01l1.07,1.06l0.34,1.28l3.44,1.35l-0.06,0.35l-1.37,0.1l-0.35,0.54l0.32,0.88ZM673.68,399.48l0.17,1.1l0.47,0.33l1.65,-0.3l0.87,-0.94l1.61,1.52l0.98,1.57l-0.12,2.81l0.41,2.29l0.95,0.9l0.88,2.44l-1.27,0.12l-5.1,-3.68l-0.34,-1.29l-1.37,-1.59l-0.33,-1.97l-0.88,-1.4l0.25,-1.68l-0.46,-1.06l1.63,0.84Z",
      "name": "Malaysia"
    },
    "MX": {
      "path": "M133.1,328.46l0.22,0.49l9.64,3.54l6.96,-0.02l0.4,-0.4l0.0,-0.81l3.76,0.0l3.55,3.11l1.4,2.99l1.51,1.09l2.08,0.86l0.48,-0.14l1.46,-2.1l1.72,-0.05l1.59,1.03l2.06,3.53l1.47,1.63l1.26,3.28l2.18,1.06l2.27,0.6l-1.19,3.88l-0.42,5.19l1.79,5.01l1.62,1.94l0.61,1.55l1.2,1.45l2.55,0.67l1.38,1.13l7.54,-1.93l1.86,-1.32l1.14,-4.4l4.1,-1.24l3.56,-0.11l0.32,0.31l-0.06,0.97l-1.26,1.49l-0.67,1.74l0.38,0.71l-0.73,2.32l-0.49,-0.3l-1.0,0.08l-1.0,1.41l-0.47,-0.11l-0.53,0.47l-4.26,-0.02l-0.4,0.4l-0.0,1.08l-1.1,0.26l0.1,0.44l1.82,1.46l0.56,0.94l-3.19,0.21l-1.21,2.12l0.24,0.73l-0.2,0.45l-2.24,-2.21l-1.45,-0.94l-2.22,-0.7l-1.52,0.23l-3.06,1.18l-10.55,-3.9l-2.86,-2.0l-3.78,-0.94l-1.08,-1.21l-2.62,-1.46l-1.18,-1.57l-0.39,-0.85l0.66,-0.64l-0.19,-0.55l0.53,-0.77l0.01,-0.93l-2.0,-3.91l-2.21,-2.71l-2.53,-2.16l-1.19,-1.68l-2.2,-1.21l-0.31,-0.45l0.34,-1.56l-0.21,-0.44l-1.23,-0.63l-1.36,-1.26l-0.59,-1.87l-1.53,-0.48l-2.44,-2.68l-0.15,-0.94l-1.33,-2.14l-0.84,-2.11l-0.15,-1.39l-1.81,-1.16l-0.98,0.05l-1.31,-0.74l-0.58,0.22l-0.4,1.19l0.71,3.95l3.51,4.09l0.28,0.83l0.53,0.26l0.41,1.51l1.33,1.8l1.58,1.46l0.8,2.49l1.43,2.51l0.13,1.37l0.37,0.36l1.03,0.08l1.68,2.38l-0.84,0.79l-0.66,-1.55l-1.68,-1.59l-2.91,-1.94l0.06,-1.89l-0.53,-1.73l-2.91,-2.11l-0.56,0.08l-1.95,-1.14l-0.92,-1.02l0.72,-0.08l0.93,-1.06l0.08,-1.82l-1.93,-2.04l-1.46,-0.81l-3.76,-8.06l4.87,-0.45Z",
      "name": "Mexico"
    },
    "IL": {
      "path": "M507.77,331.27l0.39,-0.81l0.2,0.43l-0.34,1.09l0.52,0.43l0.68,-0.23l-0.86,3.84l-1.16,-3.52l0.6,-0.8l-0.03,-0.44ZM508.72,328.43l0.38,-1.13l0.64,0.0l0.52,-0.54l0.02,0.67l-0.52,1.01l-0.55,-0.25l-0.5,0.24Z",
      "name": "Israel"
    },
    "FR": {
      "path": "M444.48,298.15l-0.65,2.02l-0.56,-0.34l-0.51,-1.98l0.42,-1.04l0.99,-0.8l0.31,2.13ZM429.62,268.54l1.78,1.88l1.48,-0.14l2.08,1.68l1.36,0.33l1.23,0.98l3.1,0.6l-1.08,2.26l-0.3,2.52l-0.41,0.38l-0.92,-0.28l-0.51,0.42l0.07,0.77l-1.82,2.19l-0.04,1.65l0.57,0.37l0.85,-0.41l0.62,1.14l-0.04,1.13l0.61,1.11l-0.78,1.22l0.65,2.72l1.29,0.62l-0.19,1.03l-2.02,1.73l-4.75,-0.9l-3.84,1.13l-0.52,2.09l-2.47,0.37l-2.7,-1.47l-1.18,0.64l-4.28,-1.44l-0.76,-1.02l1.21,-2.03l0.41,-7.31l-2.58,-3.82l-1.89,-1.93l-3.74,-1.44l-0.2,-2.16l2.82,-0.72l4.11,0.96l0.48,-0.46l-0.62,-3.38l1.98,1.12l5.83,-3.02l0.91,-3.28l1.57,-0.58l0.25,0.97l1.34,0.35l1.05,1.43ZM289.01,408.29l-0.81,0.8l-0.78,0.12l-0.5,-0.66l-0.56,-0.1l-0.91,0.6l-0.46,-0.22l1.09,-2.96l-0.96,-1.77l-0.17,-1.49l1.07,-1.77l2.32,0.75l2.51,2.01l0.3,0.74l-2.14,3.96Z",
      "name": "France"
    },
    "XS": {
      "path": "M531.15,388.78l1.52,0.12l5.13,-0.96l5.3,-1.49l-0.01,4.43l-2.67,3.4l-1.85,0.01l-8.04,-2.95l-2.55,-3.19l1.12,-1.73l2.04,2.35Z",
      "name": "Somaliland"
    },
    "FI": {
      "path": "M492.16,172.43l-0.28,5.17l3.67,4.26l-2.21,4.98l2.86,6.98l-1.64,5.01l2.21,4.51l-0.98,3.55l3.63,4.02l-0.84,2.48l-7.53,9.52l-4.5,0.42l-4.38,1.84l-3.74,0.97l-1.3,-2.46l-2.36,-1.68l0.53,-4.89l-1.2,-4.86l1.14,-3.04l2.23,-3.46l5.68,-6.22l1.8,-1.58l-0.4,-2.8l-3.4,-2.81l-0.79,-2.25l-0.16,-10.13l-7.02,-7.77l0.96,-1.19l2.47,3.3l3.5,-0.17l2.57,1.6l0.53,-0.09l2.46,-3.23l1.19,-5.07l3.49,-2.23l2.82,2.55l-1.01,4.77Z",
      "name": "Finland"
    },
    "FJ": {
      "path": "M869.95,457.1l-1.21,0.42l-0.08,-0.24l2.98,-1.23l-0.15,0.44l-1.54,0.62ZM867.58,459.4l0.43,0.38l-0.27,0.91l-1.24,0.29l-1.04,-0.25l-0.14,-0.69l0.64,-0.59l0.92,0.26l0.7,-0.31Z",
      "name": "Fiji"
    },
    "FK": {
      "path": "M274.37,564.69l1.48,1.33l-0.53,1.0l-2.96,1.07l-0.95,-1.2l-0.57,-0.05l-1.79,1.54l-0.79,-1.16l2.52,-2.03l1.9,0.9l0.46,-0.09l1.23,-1.32Z",
      "name": "Falkland Is."
    },
    "NI": {
      "path": "M202.32,382.47l0.82,-0.18l1.03,-1.02l-0.04,-0.89l0.68,-0.0l0.63,-0.54l0.97,0.23l1.53,-1.28l0.58,-1.0l1.17,0.35l2.41,-0.95l0.13,1.34l-0.81,1.96l0.1,2.77l-0.36,0.38l-0.11,1.76l-0.47,0.81l0.18,1.15l-1.73,-0.86l-0.71,0.27l-1.47,-0.6l-0.52,0.16l-4.02,-3.85Z",
      "name": "Nicaragua"
    },
    "NL": {
      "path": "M430.16,264.22l0.76,-0.72l2.14,-5.88l3.19,-1.63l1.7,0.1l0.35,1.07l-0.6,3.64l-0.51,1.24l-1.24,0.0l-0.4,0.44l0.34,3.35l-2.18,-2.14l-0.43,-0.11l-2.22,0.8l-0.89,-0.15Z",
      "name": "Netherlands"
    },
    "NO": {
      "path": "M491.42,157.32l7.17,5.11l-2.71,1.67l-0.13,0.55l2.55,4.24l-3.9,2.61l-1.31,0.42l0.79,-4.7l-3.21,-2.91l-0.48,-0.04l-4.06,2.73l-1.21,5.15l-2.11,2.72l-2.64,-1.54l-3.04,0.32l-2.65,-3.53l-0.63,-0.01l-1.41,1.75l-1.41,0.26l-0.33,0.36l-0.33,4.08l-4.27,-0.99l-0.48,0.32l-0.6,3.44l-2.07,-0.02l-0.38,0.27l-4.15,11.7l-3.88,8.48l0.84,2.18l-0.71,1.86l-2.2,-0.09l-0.4,0.28l-1.64,5.41l0.15,7.19l1.58,2.74l-0.8,5.79l-2.04,3.34l-0.83,2.09l-1.27,-2.26l-0.65,-0.07l-4.87,5.52l-3.05,1.02l-3.16,-2.22l-0.86,-5.06l-0.78,-11.7l2.19,-3.29l6.55,-4.59l5.02,-5.96l4.64,-8.4l6.0,-12.26l11.0,-13.83l5.32,-3.11l3.99,0.38l0.38,-0.19l3.69,-6.04l4.48,0.3l4.3,-1.47ZM484.42,59.58l4.68,4.94l-3.51,7.19l-6.97,1.55l-7.03,-2.18l-0.42,-3.6l-0.37,-0.35l-3.35,-0.23l-2.51,-6.12l7.16,-3.9l3.42,3.43l0.63,-0.09l2.33,-4.19l5.93,3.56ZM482.22,93.35l-4.99,4.27l-3.84,-2.35l1.56,-3.06l-1.38,-3.53l4.4,-2.11l0.89,4.13l3.36,2.65ZM466.32,69.71l8.02,9.81l-6.13,5.05l-1.37,8.88l-2.22,2.36l-1.15,9.08l-2.49,0.35l-5.08,-6.44l2.14,-3.9l-0.08,-0.49l-3.69,-3.4l-4.82,-10.44l-1.89,-10.23l6.16,-4.58l1.22,4.4l0.41,0.29l3.57,-0.19l0.37,-0.32l0.9,-4.57l3.14,-0.43l3.02,4.76Z",
      "name": "Norway"
    },
    "NA": {
      "path": "M474.4,460.84l-1.11,0.05l-0.38,0.4l-0.07,9.11l-2.09,0.08l-0.38,0.4l-0.0,18.09l-1.98,1.29l-1.16,0.18l-2.43,-0.69l-0.48,-1.18l-0.99,-0.78l-0.55,0.05l-0.9,1.05l-1.52,-1.75l-0.94,-1.97l-1.99,-8.9l-0.06,-3.23l-0.33,-1.56l-2.3,-3.43l-1.91,-4.94l-1.96,-2.48l-0.12,-1.61l2.33,-0.8l1.43,0.07l1.82,1.15l10.23,-0.26l1.84,1.26l6.01,0.37ZM474.58,460.83l6.59,-1.65l1.91,0.41l-1.71,0.41l-1.31,0.85l-1.12,-0.95l-4.36,0.94Z",
      "name": "Namibia"
    },
    "VU": {
      "path": "M839.03,452.86l0.23,1.16l-0.44,0.03l-0.2,-1.47l0.42,0.28Z",
      "name": "Vanuatu"
    },
    "NC": {
      "path": "M838.79,471.67l-0.34,0.23l-2.9,-1.8l-3.27,-3.48l1.65,0.85l4.86,4.19Z",
      "name": "New Caledonia"
    },
    "NE": {
      "path": "M454.74,355.83l1.33,1.41l0.49,0.07l1.26,-0.72l0.53,3.62l0.94,0.85l0.17,0.94l0.82,0.72l-0.45,0.98l-0.96,5.37l-0.13,3.28l-3.05,2.34l-1.22,3.61l1.02,1.25l-0.0,1.48l0.39,0.4l1.13,0.04l-0.1,0.49l-0.45,0.09l-0.35,0.68l-1.47,-2.44l-0.86,-0.29l-2.09,1.38l-1.73,-0.67l-1.45,-0.17l-0.85,0.35l-1.36,-0.07l-1.64,1.1l-1.06,0.05l-2.94,-1.29l-1.44,0.59l-1.01,-0.03l-0.97,-0.95l-2.7,-0.99l-2.69,0.31l-0.87,0.65l-0.46,1.62l-0.74,1.17l-0.12,1.55l-1.57,-1.1l-1.31,0.24l0.03,-0.82l-0.32,-0.41l-2.59,-0.52l-0.15,-1.17l-1.36,-1.62l-0.29,-1.01l0.13,-0.85l1.29,-0.08l1.08,-0.93l3.31,-0.22l2.22,-0.41l0.32,-0.34l0.2,-1.5l1.39,-1.91l-0.01,-5.78l3.37,-1.15l7.24,-5.24l8.41,-5.07l3.69,1.09Z",
      "name": "Niger"
    },
    "NG": {
      "path": "M456.32,383.7l0.64,0.66l-0.28,1.06l-2.11,2.02l-2.03,5.2l-1.37,1.16l-1.15,3.19l-1.33,0.66l-1.46,-0.97l-1.21,0.16l-1.38,1.37l-0.91,0.24l-1.79,4.07l-2.33,0.81l-1.11,-0.07l-0.86,0.51l-1.71,-0.05l-1.19,-1.39l-0.89,-1.9l-1.77,-1.66l-3.95,-0.08l0.07,-5.23l0.42,-1.44l1.95,-2.32l-0.14,-0.91l0.43,-1.18l-0.53,-1.42l0.25,-2.95l0.72,-1.08l0.32,-1.35l0.46,-0.39l2.47,-0.28l2.34,0.89l1.15,1.03l1.28,0.04l1.22,-0.59l3.03,1.28l1.5,-0.14l1.36,-1.01l1.32,0.07l0.82,-0.35l3.45,0.81l1.82,-1.34l1.84,2.7l0.66,0.16Z",
      "name": "Nigeria"
    },
    "NZ": {
      "path": "M857.8,512.11l1.85,3.38l0.45,0.2l0.3,-0.38l0.03,-1.36l0.38,0.29l0.56,2.51l2.02,1.03l1.81,0.29l1.59,-1.16l0.7,0.2l-1.16,4.01l-1.98,0.12l-0.73,1.27l0.21,1.25l-2.44,4.45l-1.47,1.02l-0.42,-0.65l-0.66,-0.3l1.25,-2.35l-0.81,-2.16l-2.64,-1.38l0.04,-0.7l1.82,-1.29l0.42,-2.46l-0.15,-2.29l-0.96,-2.0l-0.05,-0.75l-3.11,-3.94l-0.82,-1.69l1.57,1.56l1.76,0.72l0.66,2.55ZM853.83,527.42l0.57,1.38l0.61,0.17l1.4,-1.06l0.46,0.9l0.0,1.2l-2.48,3.93l-1.26,1.36l-0.06,0.47l0.6,1.08l-1.47,0.09l-2.32,1.54l-2.04,5.78l-3.02,2.49l-2.03,-0.07l-1.72,-1.2l-2.46,-0.23l-0.29,-0.92l1.25,-2.46l3.05,-3.36l1.62,-0.67l4.01,-3.18l1.56,-1.87l1.08,-2.44l1.01,-1.01l0.35,-1.73l1.23,-1.07l0.35,0.88Z",
      "name": "New Zealand"
    },
    "NP": {
      "path": "M641.15,342.42l-0.0,3.36l-1.74,0.04l-4.8,-0.9l-1.59,-1.45l-3.36,-0.36l-7.66,-3.88l0.81,-2.23l2.33,-1.79l1.77,0.78l2.49,1.85l1.38,0.43l0.99,1.42l1.89,0.55l1.99,1.22l5.5,0.95Z",
      "name": "Nepal"
    },
    "XK": {
      "path": "M472.78,298.18l-1.1,-1.47l0.98,-0.9l0.29,-0.94l2.0,1.84l-0.4,0.85l-1.77,0.62Z",
      "name": "Kosovo"
    },
    "CI": {
      "path": "M407.4,389.11l0.86,0.42l0.56,0.9l1.13,0.54l1.19,-0.61l0.97,-0.08l1.42,0.54l0.6,3.25l-1.03,2.09l-0.65,2.85l1.06,2.33l-0.06,0.53l-2.54,-0.47l-1.66,0.03l-3.06,0.47l-4.11,1.61l0.32,-3.06l-1.18,-1.31l-1.32,-0.67l0.42,-0.86l-0.2,-1.4l0.5,-0.68l0.01,-1.59l0.84,-0.33l0.26,-0.5l-1.15,-3.02l0.12,-0.51l0.51,-0.25l0.66,0.31l1.93,0.02l0.67,-0.72l0.71,-0.14l0.25,0.7l0.57,0.22l1.4,-0.61Z",
      "name": "C\u00f4te d'Ivoire"
    },
    "CH": {
      "path": "M444.61,279.47l-0.29,1.12l0.16,0.5l1.13,0.67l1.03,0.12l-0.12,0.88l-0.79,0.44l-1.7,-0.42l-0.47,0.25l-0.46,1.23l-0.72,0.07l-0.3,-0.39l-0.58,-0.06l-1.31,1.14l-0.93,0.13l-0.87,-0.62l-0.82,-1.51l-0.52,-0.17l-0.61,0.29l0.02,-0.85l1.73,-1.95l0.07,-0.65l0.96,0.08l0.57,-0.53l1.97,0.02l0.67,-0.71l2.16,0.92Z",
      "name": "Switzerland"
    },
    "CO": {
      "path": "M242.07,384.75l-1.7,0.59l-0.59,1.19l-1.7,1.7l-0.37,1.94l-0.67,1.44l0.31,0.57l1.03,0.14l0.25,0.91l0.57,0.65l-0.04,2.35l1.64,1.42l3.16,-0.24l1.26,0.28l1.67,2.06l0.41,0.13l4.09,-0.39l0.45,0.22l-0.92,1.95l-0.2,1.8l0.52,1.83l0.75,1.05l-1.12,1.1l0.07,0.63l0.84,0.51l0.74,1.3l-0.39,-0.45l-0.59,-0.01l-0.71,0.74l-4.71,-0.05l-0.4,0.41l0.03,1.57l0.33,0.39l1.11,0.2l-1.68,0.4l-0.29,0.38l-0.01,1.82l1.16,1.14l0.34,1.25l-1.05,7.05l-1.04,-0.87l1.26,-1.99l-0.13,-0.56l-2.18,-1.23l-1.38,0.2l-1.14,-0.38l-1.27,0.61l-1.55,-0.26l-1.38,-2.46l-1.23,-0.75l-0.85,-1.2l-1.67,-1.19l-0.86,0.13l-2.11,-1.32l-1.01,0.31l-1.8,-0.29l-0.52,-0.91l-3.09,-1.68l0.77,-0.52l-0.1,-1.12l0.41,-0.64l1.34,-0.32l2.0,-2.88l-0.11,-0.57l-0.67,-0.43l0.39,-1.38l-0.52,-2.11l0.49,-0.83l-0.4,-2.13l-0.97,-1.36l0.17,-0.67l0.86,-0.08l0.47,-0.75l-0.46,-1.63l1.41,-0.07l1.8,-1.7l0.93,-0.24l0.3,-0.38l0.45,-2.78l1.22,-1.01l1.44,-0.04l0.45,-0.5l1.91,0.12l2.93,-1.85l1.15,-1.15l0.91,0.47l-0.26,0.45Z",
      "name": "Colombia"
    },
    "CN": {
      "path": "M740.22,270.81l4.55,1.5l2.81,2.58l0.98,3.43l0.38,0.29l3.8,0.0l2.34,-1.51l3.31,-0.89l-1.01,2.59l-1.01,1.46l-0.85,3.95l-1.53,3.16l-2.73,-0.57l-2.43,1.3l-0.19,0.43l0.65,2.95l-0.32,3.68l-0.94,0.07l-0.37,0.4l0.01,0.58l-0.89,-1.11l-0.67,0.07l-0.92,1.77l-3.72,1.4l-0.25,0.46l0.28,1.25l-1.5,-0.08l-1.08,-0.96l-0.59,0.06l-1.68,2.31l-2.7,1.74l-2.03,2.08l-3.39,0.92l-1.93,1.54l-1.22,0.4l0.42,-0.81l-0.43,-1.03l1.81,-2.01l0.02,-0.51l-1.32,-1.73l-0.51,-0.11l-2.25,1.21l-2.83,2.28l-1.5,2.02l-2.27,0.14l-1.56,1.64l-0.04,0.47l1.32,2.16l2.01,0.63l0.3,1.47l1.98,0.92l0.42,-0.05l2.6,-2.09l1.99,1.1l1.5,0.12l0.24,0.97l-3.39,0.94l-1.12,1.61l-2.5,1.64l-1.29,2.15l0.13,0.55l2.57,1.6l0.97,2.9l3.17,4.94l-0.03,1.8l-1.36,0.69l-0.19,0.5l0.6,1.55l1.41,0.95l-0.9,4.05l-1.43,0.4l-3.85,6.72l-2.28,3.23l-6.78,4.72l-2.73,0.3l-1.45,1.07l-0.61,-0.62l-0.56,-0.01l-1.36,1.29l-3.39,1.31l-2.61,0.41l-1.1,2.86l-0.81,0.09l-0.5,-1.47l0.5,-0.88l-0.25,-0.59l-3.36,-0.86l-1.3,0.41l-2.3,-0.64l-0.95,-0.87l0.34,-1.33l-0.3,-0.49l-2.19,-0.48l-1.13,-0.96l-0.48,-0.03l-2.06,1.4l-4.28,0.28l-2.76,1.08l-0.28,0.43l0.32,2.61l-0.59,-0.03l-0.19,-1.39l-0.56,-0.34l-1.67,0.72l-2.47,-1.26l0.63,-1.94l-0.25,-0.5l-1.37,-0.46l-0.55,-2.3l-0.46,-0.3l-2.13,0.37l0.24,-2.6l2.39,-2.48l0.03,-4.49l-1.19,-0.94l-0.79,-1.57l-0.41,-0.22l-1.4,0.2l-2.0,-0.32l0.48,-1.12l-1.17,-1.78l-0.56,-0.11l-1.62,1.1l-2.25,-0.6l-2.89,1.82l-2.25,2.08l-1.74,0.31l-1.17,-0.74l-3.32,-0.68l-1.48,0.83l-1.04,1.32l-0.12,-1.23l-0.54,-0.34l-1.44,0.56l-5.54,-0.9l-1.98,-1.22l-1.89,-0.56l-0.99,-1.42l-1.34,-0.39l-2.55,-1.88l-2.01,-0.89l-1.21,0.59l-5.57,-3.64l-0.54,-2.5l1.19,0.26l0.49,-0.37l0.08,-1.52l-0.98,-1.65l0.16,-2.6l-2.69,-3.58l-4.12,-1.33l-0.68,-2.18l-1.91,-1.6l-0.38,-0.78l-0.5,-3.27l-1.52,-0.73l-0.7,0.14l-0.49,-2.31l0.57,-0.59l-0.13,-0.89l2.06,-1.34l1.59,-0.59l2.55,0.42l0.43,-0.23l0.85,-1.9l2.99,-0.37l1.11,-1.41l4.04,-1.97l0.39,-0.97l-0.17,-1.67l1.48,-0.77l0.19,-0.49l-2.1,-5.65l4.54,-1.3l1.38,-0.84l1.88,-6.37l4.59,1.12l0.4,-0.13l1.49,-1.91l0.11,-3.42l2.01,-0.45l1.83,-2.43l0.45,-0.15l0.67,2.44l2.23,2.08l3.44,1.35l1.58,2.72l-0.93,4.08l0.95,1.84l6.54,1.28l2.95,2.14l1.48,0.4l1.07,3.0l1.52,2.13l3.06,0.09l5.13,0.76l3.38,-0.46l2.34,0.48l3.65,2.02l3.07,0.05l0.99,0.93l0.48,0.05l2.87,-1.78l3.94,-1.15l3.84,-0.16l3.06,-1.29l1.77,-1.81l1.72,-1.14l0.16,-0.47l-1.12,-2.36l1.05,-1.82l4.03,0.9l2.45,-1.85l3.76,-1.36l1.97,-2.46l1.63,-0.96l3.49,-0.47l1.91,0.4l0.47,-0.31l0.18,-1.65l-2.27,-2.59l-2.11,-1.27l-0.44,0.02l-1.78,1.27l-2.29,-0.54l-1.28,0.37l-0.43,-1.02l2.76,-6.16l3.03,1.25l3.53,-2.45l0.15,-1.96l2.18,-4.08l1.47,-1.55l-0.03,-2.26l-1.16,-1.03l1.66,-1.66l2.96,-0.72l3.21,-0.11l3.62,1.21l2.05,1.43l3.31,8.17l0.92,3.82ZM696.92,366.89l-1.87,1.1l-1.63,-0.65l-0.06,-1.84l1.03,-1.01l2.58,-0.7l1.15,0.05l0.31,0.56l-0.98,1.09l-0.53,1.4Z",
      "name": "China"
    },
    "CM": {
      "path": "M457.92,387.33l1.06,1.92l-1.4,0.16l-1.05,-0.23l-0.45,0.23l-0.54,1.2l0.08,0.45l1.48,1.48l1.05,0.45l1.01,2.47l-1.52,3.0l-0.68,0.68l-0.13,3.69l2.38,3.84l1.09,0.8l0.24,2.48l-3.67,-1.14l-11.27,-0.13l0.23,-1.79l-0.98,-1.66l-1.19,-0.54l-0.44,-0.97l-0.6,-0.42l1.71,-4.28l0.75,-0.13l1.38,-1.37l0.65,-0.03l1.71,0.99l1.93,-1.12l1.14,-3.2l1.38,-1.17l2.0,-5.16l2.17,-2.15l0.3,-1.65l-0.86,-0.89l0.18,-0.37l0.8,1.32l0.07,3.24Z",
      "name": "Cameroon"
    },
    "CL": {
      "path": "M246.67,568.71l-3.34,2.4l-0.55,3.89l-0.62,0.06l-2.66,-1.3l-2.82,-2.86l-3.06,-2.32l-0.71,-2.33l0.65,-2.52l-1.22,-2.56l-0.31,-6.43l1.02,-3.46l2.58,-2.79l-0.19,-0.66l-3.24,-0.91l2.11,-2.91l0.78,-5.35l2.3,1.02l0.56,-0.29l1.31,-7.14l-0.2,-0.42l-1.68,-0.9l-0.58,0.28l-0.7,3.81l-0.82,-0.25l1.58,-10.59l1.15,-2.43l-0.71,-3.1l-0.18,-3.15l1.02,-0.35l3.26,-9.88l1.07,-4.5l-0.56,-4.47l0.74,-2.47l-0.29,-3.45l1.46,-3.5l2.04,-17.19l-0.67,-7.94l1.04,-0.54l0.54,-0.92l0.79,1.16l0.32,1.82l1.25,1.19l-0.69,2.61l1.33,2.98l0.97,3.7l0.47,0.29l1.49,-0.31l0.11,0.25l-0.77,2.53l-2.57,1.28l-0.22,0.37l0.08,4.51l-0.47,0.8l0.58,1.25l-1.59,1.59l-1.68,2.74l-0.89,2.6l0.21,2.85l-1.49,2.9l1.12,5.38l0.64,0.64l-0.01,2.49l-1.39,2.89l0.02,2.59l-1.89,2.18l0.02,2.98l0.7,2.85l-1.44,1.23l-1.26,6.27l0.39,3.95l-0.98,0.94l0.58,3.94l1.04,1.3l-0.69,1.22l0.14,0.54l1.01,0.61l0.18,0.88l-1.04,0.92l0.26,2.03l-0.89,4.69l-1.31,3.11l0.25,2.01l-0.73,2.21l-1.97,1.93l0.28,4.31l0.88,1.43l1.6,0.0l-0.01,2.68l1.04,2.36l6.16,0.76ZM248.69,570.67l0.0,9.15l0.4,0.4l3.58,0.07l-0.53,1.14l-1.93,1.23l-2.45,-0.46l-1.9,-1.34l-2.54,-0.61l-5.59,-4.63l-2.57,-3.5l4.23,3.11l3.32,1.53l0.5,-0.14l1.29,-1.95l0.83,-2.85l2.04,-1.51l1.3,0.35Z",
      "name": "Chile"
    },
    "XC": {
      "path": "M504.86,320.38l0.39,0.01l0.27,-0.07l-0.3,0.35l-0.36,-0.28Z",
      "name": "N. Cyprus"
    },
    "CA": {
      "path": "M280.04,266.9l-1.66,3.44l0.11,0.49l0.5,-0.0l1.44,-1.15l1.05,0.52l-0.63,0.98l0.16,0.58l2.22,1.06l1.38,-0.83l1.97,0.93l-0.68,2.46l0.52,0.48l1.3,-0.48l0.99,3.78l-0.93,2.87l-0.77,0.09l-1.25,-0.52l0.49,-2.7l-0.87,-0.87l-0.52,0.06l-2.77,3.06l-0.43,-0.04l1.14,-1.12l-0.14,-0.66l-2.4,-0.9l-7.4,0.09l-0.2,-0.58l1.35,-1.14l0.02,-0.6l-0.8,-0.75l1.91,-2.12l2.57,-6.16l1.48,-2.16l1.98,-1.26l0.5,0.08l-1.6,3.09ZM68.32,168.48l4.07,1.51l3.89,3.35l2.78,0.73l0.42,-0.15l2.16,-2.88l2.84,-2.09l3.89,0.75l3.71,-3.14l3.71,-1.66l1.54,2.72l0.62,0.1l1.99,-1.93l0.48,-2.97l1.15,0.53l4.17,6.45l0.67,0.01l2.68,-3.95l0.27,4.33l0.54,0.35l3.08,-1.17l1.05,-2.04l2.63,0.36l3.83,3.0l5.86,2.58l3.48,1.19l2.44,-0.39l2.95,3.04l-3.23,3.06l0.16,0.67l4.53,1.42l6.92,-0.76l1.96,-1.04l2.47,3.65l0.64,0.03l2.72,-3.33l-0.01,-0.52l-2.34,-2.61l1.33,-1.93l2.87,-0.3l1.88,-0.64l1.8,1.47l2.48,3.63l0.41,0.17l2.63,-0.5l4.62,2.96l3.83,-1.03l3.59,0.16l0.42,-0.43l-0.27,-3.92l1.8,-0.96l3.49,2.08l-0.01,6.03l0.34,0.4l0.44,-0.28l1.5,-4.95l1.69,0.15l0.43,-0.33l1.13,-6.89l-2.74,-4.66l-2.86,-2.89l0.19,-8.09l2.75,-5.34l2.86,1.11l2.44,3.36l3.31,8.33l-2.12,3.42l0.22,0.59l4.38,1.37l-0.01,6.85l0.29,0.39l0.45,-0.18l3.02,-4.91l2.56,3.84l-0.68,5.11l2.42,4.42l0.7,0.0l2.61,-4.74l1.86,-5.93l0.15,-7.44l3.08,0.48l3.57,1.03l3.18,3.35l0.14,3.2l-1.81,3.53l1.71,3.82l-0.29,2.9l-4.72,4.27l-3.21,0.89l-2.43,-1.77l-0.62,0.23l-0.74,3.09l-2.4,5.08l-0.73,2.58l-2.76,3.73l-3.68,0.5l-2.07,2.63l-0.15,3.32l-2.86,0.78l-3.1,4.45l-2.74,5.98l-0.98,4.09l-0.14,5.74l0.31,0.4l3.44,0.75l2.25,7.78l0.48,0.26l3.37,-0.88l4.49,1.92l2.43,1.68l1.92,2.2l3.09,1.21l2.61,1.84l6.65,0.69l-0.36,3.49l0.8,4.33l1.81,4.63l3.81,3.97l0.51,0.05l2.08,-1.51l1.37,-4.39l-1.31,-6.63l-1.54,-2.05l3.69,-1.91l2.84,-3.1l1.49,-3.43l-0.24,-3.19l-1.7,-3.97l-2.92,-3.49l2.86,-5.19l-1.09,-4.55l-0.81,-7.95l1.39,-0.99l4.1,1.4l2.62,0.54l2.14,-1.31l5.09,4.62l1.07,2.2l4.09,0.36l-0.06,3.98l0.83,6.25l2.42,1.04l1.74,2.7l0.57,0.11l3.63,-2.66l2.51,-5.54l1.22,-1.73l7.63,15.44l-0.95,2.7l0.14,0.45l3.3,2.51l2.23,2.5l4.1,1.23l1.45,1.25l0.96,3.51l2.08,0.8l0.87,1.37l0.17,4.34l-3.4,2.77l-4.22,1.5l-3.06,3.15l-4.04,0.61l-5.35,-0.82l-6.4,0.25l-2.32,2.87l-3.25,1.78l-6.48,8.38l-0.03,0.47l0.45,0.17l2.33,-0.73l3.98,-4.83l5.12,-3.08l3.49,-0.36l1.77,1.49l-2.18,2.58l0.8,4.03l1.01,2.99l3.5,1.85l4.14,-0.52l2.14,-3.2l0.24,1.68l1.22,0.99l-2.64,2.0l-5.49,2.09l-2.54,1.45l-2.73,2.43l-1.38,-0.18l-0.08,-2.39l4.16,-2.8l0.16,-0.45l-0.39,-0.28l-4.01,0.12l-2.61,0.4l-1.4,-1.73l-0.12,-5.1l-1.11,-1.06l-1.83,0.44l-0.65,-0.76l-0.63,0.03l-1.91,2.77l-0.81,2.9l-0.81,1.48l-1.66,0.64l-0.47,0.87l-8.32,0.08l-1.21,0.71l-2.33,2.23l-0.72,-0.14l-1.36,1.08l-1.12,-0.54l-4.75,1.43l-0.9,1.32l0.21,0.59l1.7,0.22l0.05,0.22l-1.84,0.36l-1.85,0.9l-1.19,-0.29l-0.92,0.15l-2.95,2.0l-0.71,-0.11l0.32,-0.68l1.12,-1.78l1.72,-1.33l0.09,-2.6l1.16,-2.28l0.48,0.59l2.03,0.48l0.42,-0.16l0.82,-1.6l-2.66,-4.02l-2.29,-0.71l-5.63,-0.81l-0.4,-0.66l-0.86,0.2l0.27,-0.64l-0.21,-0.52l-0.72,-0.32l0.32,-1.06l-0.91,-1.28l0.34,-0.82l-0.29,-0.55l-2.6,-0.52l-0.76,-1.93l-0.95,-0.76l-1.67,-0.09l-2.67,-0.67l-1.13,1.4l-1.48,0.69l-0.85,1.24l-2.8,-0.89l-2.1,0.45l-2.38,-1.13l-4.23,-0.83l-0.58,-0.48l-0.42,-1.96l-0.4,-0.32l-0.85,0.02l-0.39,0.4l-0.01,1.07l-69.11,-0.01l-6.5,-5.37l-4.5,-1.66l-1.29,-3.28l0.34,-2.39l-0.2,-0.41l-3.03,-1.66l-0.52,-3.39l-2.92,-2.97l-0.05,-1.94l1.39,-2.23l-0.07,-2.8l-4.34,-3.13l-4.08,-8.55l-4.01,-4.22l-1.31,-2.51l-0.57,-0.15l-2.51,1.6l-2.18,2.42l-3.81,-5.1l-2.44,-1.39l-2.26,-0.18l0.03,-55.45ZM265.75,272.87l-0.72,0.04l-3.11,-1.15l-1.72,-1.35l3.19,0.89l2.36,1.57ZM249.33,12.09l6.65,1.61l5.26,2.56l4.43,5.22l-0.1,4.84l-5.98,7.79l-6.13,3.67l-2.26,3.84l0.35,0.6l4.74,-0.08l-5.52,9.28l-4.14,4.52l-4.23,11.87l-5.01,2.26l-1.69,2.82l-7.4,1.42l-0.32,0.34l0.22,0.41l3.02,1.48l-1.51,2.34l2.02,6.18l-2.26,4.04l-3.94,3.58l-1.16,4.49l-3.53,3.68l0.35,2.54l0.44,0.34l3.85,-0.39l0.04,2.09l-6.37,6.12l-6.3,-2.81l-7.5,1.6l-3.7,-1.27l-4.4,-0.52l-0.28,-4.64l4.41,-2.41l0.2,-0.41l-1.19,-8.1l1.06,-0.58l6.49,4.94l0.49,-0.0l0.12,-0.48l-3.41,-7.64l-3.92,-2.37l1.85,-4.46l4.51,-3.29l0.71,-4.65l-3.55,-5.6l-0.98,-6.84l6.22,0.58l1.88,1.51l0.57,-0.08l3.91,-5.41l-0.21,-0.62l-5.64,-1.76l-8.71,0.93l-4.24,-5.03l-2.06,-6.44l-2.92,-4.92l-0.52,-5.65l3.5,-3.22l2.94,-0.62l4.91,-2.99l3.67,-6.97l2.62,0.86l2.63,5.2l0.41,0.22l0.34,-0.32l1.88,-10.36l3.17,-3.13l4.37,-2.24l7.32,-0.83l1.2,2.03l0.52,0.16l7.1,-3.49l10.71,2.64ZM203.82,140.61l1.98,5.56l0.38,0.26l0.37,-0.27l2.27,-6.74l5.84,-3.34l4.06,8.5l-0.37,5.31l0.57,0.39l4.95,-2.38l2.28,-3.11l5.2,3.94l3.34,3.74l0.31,3.32l0.54,0.34l4.32,-1.65l2.44,4.64l6.13,3.12l2.09,2.87l2.25,6.4l-4.35,3.07l-0.01,0.65l5.9,4.44l3.95,1.47l3.53,5.87l3.81,0.57l-0.69,3.91l-4.11,6.58l-2.68,-2.22l-3.9,-5.85l-0.43,-0.17l-3.24,0.78l-0.3,0.35l-0.24,3.8l2.63,3.5l3.42,2.75l0.96,1.44l1.58,5.48l-0.73,3.38l-2.67,-1.26l-6.25,-4.45l-0.52,0.05l-0.04,0.52l6.1,8.03l0.24,1.1l-6.09,-1.92l-5.3,-3.12l-2.77,-2.46l0.72,-1.31l-0.1,-0.51l-7.38,-5.75l-0.64,0.33l0.03,1.33l-6.7,0.85l-1.79,-1.68l1.46,-3.85l4.49,-0.1l5.15,-0.77l0.31,-0.54l-0.79,-2.04l0.83,-2.91l3.22,-6.15l-0.67,-3.24l-1.07,-2.43l-3.84,-3.29l-4.67,-2.18l1.24,-1.37l0.05,-0.47l-2.65,-4.44l-2.33,-0.57l-1.88,-2.37l-0.65,0.04l-1.25,2.02l-4.3,0.88l-9.0,-1.6l-5.26,-2.14l-3.98,-1.1l-1.81,-2.3l2.43,-3.26l-0.32,-0.64l-3.2,-0.03l-0.75,-7.66l1.89,-7.38l2.46,-3.41l5.58,-2.04l-1.59,4.91ZM261.18,282.95l2.07,0.7l1.54,-0.05l-0.57,0.69l-0.66,0.17l-2.92,-1.41l-0.44,-0.86l0.38,-0.46l0.61,1.23ZM230.78,185.0l-2.28,0.26l-0.54,-2.72l0.98,-3.45l1.88,-0.76l1.65,1.57l0.03,2.61l-0.24,0.76l-1.47,1.73ZM229.41,141.37l0.16,1.75l-4.89,-0.38l-2.72,1.08l-0.48,-0.34l-2.65,-4.39l0.09,-2.82l0.87,-0.43l5.47,0.92l4.14,4.61ZM222.03,214.7l-0.78,2.22l-0.56,-0.23l-0.54,-1.3l0.87,-1.54l0.57,0.07l0.44,0.77ZM183.65,102.44l3.0,3.59l4.7,-0.02l1.97,3.24l-0.41,4.19l2.83,2.3l1.84,2.54l6.99,1.27l4.2,-2.19l4.96,-0.84l3.84,0.67l2.53,3.56l0.53,3.8l-1.43,2.32l-3.48,1.88l-3.25,-1.1l-7.15,1.44l-5.04,0.16l-3.95,-1.13l-6.43,-2.95l-0.83,-5.12l-0.3,-4.98l-2.56,-4.72l-5.31,-1.46l-2.69,-3.1l0.83,-3.99l4.63,0.64ZM207.36,195.03l0.42,2.4l0.63,0.26l0.99,-0.72l1.27,1.36l5.47,3.76l0.21,2.54l0.49,0.36l1.62,-0.39l1.33,1.4l-1.71,1.36l-3.54,-1.23l-1.33,-2.43l-0.66,-0.06l-2.46,2.99l-3.05,2.47l-0.7,-2.67l-0.45,-0.29l-2.39,0.38l1.64,-2.22l0.32,-4.55l0.78,-5.03l1.13,0.31ZM215.49,211.5l-2.69,2.74l-1.33,-0.09l-0.38,-1.01l1.61,-2.18l2.82,0.04l-0.02,0.5ZM202.66,70.17l2.91,4.33l-3.3,3.83l-4.54,9.4l-4.14,0.83l-4.93,-1.5l-2.57,-4.9l0.04,-4.53l1.93,-3.49l-0.36,-0.59l-4.35,0.1l-2.61,-4.34l-1.55,-6.33l1.71,-6.55l1.67,-4.57l2.41,-1.04l0.22,-0.48l-0.96,-3.26l5.05,-0.73l3.21,8.41l8.21,6.06l1.95,9.35ZM187.39,143.67l-2.74,6.11l-2.28,-0.24l-1.49,-6.99l0.04,-4.2l1.26,-3.63l2.29,-2.28l4.96,0.3l4.35,2.01l-3.51,7.33l-2.87,1.59ZM186.12,124.07l-1.2,3.26l-3.2,-0.62l-2.75,-2.26l1.22,-4.02l3.15,-2.36l1.93,3.09l0.86,2.91ZM185.64,96.93l-0.83,0.24l-4.33,-0.68l-0.51,-2.52l4.35,0.15l1.52,1.89l-0.2,0.91ZM180.62,90.66l-3.24,2.16l-1.76,-2.41l-1.05,-4.51l-0.18,-4.75l2.69,0.43l1.32,0.77l2.85,4.19l-0.63,4.11ZM180.98,172.19l-1.22,1.91l-3.04,-1.9l-2.16,0.64l-2.93,-2.72l1.98,-2.02l1.52,-2.75l3.72,3.03l2.13,3.8ZM169.77,135.22l2.97,1.73l4.08,-1.03l0.51,2.03l-2.26,4.02l0.07,0.48l3.66,3.51l-0.43,6.97l-3.8,2.82l-2.06,-0.56l-1.71,-2.96l-6.1,-6.18l0.04,-2.04l4.64,0.95l0.44,-0.57l-2.66,-5.4l2.61,-3.78ZM174.46,107.75l1.36,3.53l0.08,5.21l-1.09,7.07l-3.71,0.89l-2.35,-1.35l0.05,-5.54l-0.47,-0.4l-3.64,0.69l-0.14,-7.04l2.56,0.16l3.62,-3.51l3.32,0.59l0.42,-0.3ZM170.01,87.71l0.84,4.38l-3.36,-1.1l-4.3,-4.01l-4.91,-0.41l2.06,-3.18l-0.05,-0.5l-2.92,-2.99l-0.16,-4.33l4.31,1.6l6.62,4.67l1.87,5.86ZM134.6,141.21l-1.16,3.7l0.55,0.48l5.29,-2.43l3.29,4.01l0.64,-0.03l2.53,-3.85l1.89,2.29l2.03,7.94l0.37,0.3l0.4,-0.26l1.28,-3.56l-1.72,-8.28l1.76,-1.01l2.22,1.24l2.69,3.29l2.45,13.62l8.57,7.16l-0.23,2.66l-3.8,0.53l-0.29,0.6l1.51,2.57l-0.67,2.03l-4.14,-1.0l-4.49,-1.91l-3.03,0.47l-4.65,2.34l-10.43,1.63l-1.41,-3.17l-3.42,-1.92l-2.23,0.65l-2.72,-5.01l5.02,-1.82l3.63,0.3l3.27,-1.29l0.25,-0.38l-0.26,-0.37l-4.84,-1.75l-5.5,0.57l-3.28,-0.14l-1.06,-2.23l5.47,-2.91l0.2,-0.46l-0.4,-0.3l-3.77,0.11l-3.96,-1.88l1.97,-5.68l1.69,-3.21l6.41,-4.99l2.07,1.35ZM158.82,138.54l-1.83,4.71l-3.34,-5.15l0.6,-0.86l2.98,-0.32l1.59,1.62ZM149.59,111.85l0.99,3.73l0.63,0.21l2.09,-1.62l2.15,0.37l0.41,4.59l-1.42,4.36l-8.24,1.45l-6.38,4.09l-3.32,0.18l-0.26,-2.47l5.03,-4.13l0.12,-0.46l-0.41,-0.24l-11.2,1.15l-3.08,-1.54l3.28,-9.52l2.11,-2.66l6.67,3.38l4.39,5.99l4.63,0.92l0.44,-0.53l-3.52,-9.7l2.01,-3.46l2.07,1.01l0.81,4.89ZM145.71,84.15l-2.55,2.05l-3.61,-0.01l0.03,-1.26l2.32,-3.45l0.99,0.43l2.82,2.24ZM144.69,94.95l-4.27,3.06l-3.27,-3.31l1.81,-3.41l3.34,-1.13l3.11,1.67l-0.73,3.12ZM118.92,155.09l-5.99,3.39l-1.29,-3.14l-5.55,-4.03l2.72,-9.3l2.17,-5.73l-2.25,-5.4l7.82,-1.34l3.61,1.91l6.24,0.5l2.31,2.51l2.44,3.4l-2.87,2.01l-6.21,6.07l-3.1,5.73l-0.05,3.42ZM129.56,96.45l-0.31,7.96l-1.8,3.53l-2.35,0.59l-4.6,4.46l-3.74,1.48l-2.92,-1.93l4.07,-7.68l5.0,-7.12l3.62,0.15l3.02,-1.45ZM111.13,275.3l-0.71,0.3l-3.83,-1.6l-0.83,-1.38l-2.13,-1.28l-0.67,-1.21l-2.4,-0.65l-0.75,-2.19l3.73,1.32l2.25,0.41l2.0,3.05l2.52,1.64l0.8,1.62ZM87.8,253.38l0.9,0.35l1.87,-0.27l-0.67,4.25l1.83,2.97l-1.42,-1.69l-0.98,-1.97l-1.19,-1.23l-0.34,-2.41Z",
      "name": "Canada"
    },
    "CG": {
      "path": "M466.72,406.37l-0.1,1.03l-1.25,2.97l-0.19,3.62l-0.46,1.78l-0.23,0.63l-1.61,1.19l-1.21,1.39l-1.09,2.43l0.04,2.09l-3.25,3.25l-0.5,-0.24l-0.5,-0.83l-1.36,-0.02l-0.98,0.89l-1.68,-0.99l-1.54,1.24l-1.52,-1.96l1.57,-1.14l0.11,-0.52l-0.77,-1.35l2.1,-0.66l0.39,-0.73l1.05,0.82l2.21,0.11l1.12,-1.37l0.37,-1.81l-0.27,-2.09l-1.13,-1.5l1.0,-2.69l-0.13,-0.45l-0.92,-0.58l-1.6,0.17l-0.51,-0.94l0.1,-0.61l2.75,0.09l3.97,1.24l0.51,-0.33l0.17,-1.28l1.24,-2.21l1.28,-1.14l2.76,0.49Z",
      "name": "Congo"
    },
    "CF": {
      "path": "M461.16,408.1l-0.26,-1.19l-1.09,-0.77l-0.84,-1.18l-0.29,-1.0l-1.04,-1.15l0.08,-3.44l0.58,-0.49l1.16,-2.36l1.85,-0.17l0.61,-0.62l0.97,0.58l3.15,-0.97l2.48,-1.92l0.02,-0.96l2.82,0.02l2.36,-1.18l1.93,-2.86l1.16,-0.94l1.11,-0.31l0.27,0.87l1.34,1.48l-0.39,2.02l0.3,1.01l4.01,2.76l0.17,0.93l2.63,2.31l0.6,1.44l2.08,1.4l-3.84,-0.21l-1.94,0.88l-1.24,-0.49l-2.67,1.2l-1.29,-0.18l-0.51,0.37l-0.6,1.22l-3.35,-0.65l-1.57,-0.91l-2.42,-0.83l-1.45,0.91l-0.97,1.28l-0.26,1.56l-3.22,-0.43l-1.49,1.33l-0.94,1.62Z",
      "name": "Central African Rep."
    },
    "CD": {
      "path": "M487.01,402.27l2.34,-0.14l1.35,1.84l1.34,0.45l0.86,-0.39l1.21,0.12l1.07,-0.41l0.54,0.89l2.04,1.54l-0.14,2.72l0.7,0.54l-1.38,1.13l-1.53,2.54l-0.17,2.05l-0.59,1.08l-0.02,1.72l-0.72,0.84l-0.66,3.01l0.63,1.32l-0.44,4.26l0.64,1.47l-0.37,1.22l0.86,1.8l1.53,1.42l0.3,1.27l0.44,0.51l-4.08,0.75l-0.92,1.82l0.51,1.35l-0.74,5.46l0.17,0.38l2.45,1.47l0.54,-0.1l0.12,1.64l-1.28,-0.01l-1.85,-2.37l-1.94,-0.45l-0.48,-1.14l-0.56,-0.2l-1.41,0.74l-1.71,-0.3l-1.01,-1.19l-2.49,-0.2l-0.44,-0.77l-1.98,-0.21l-2.88,0.36l0.11,-2.42l-0.85,-1.13l-0.16,-1.36l0.32,-1.74l-0.47,-0.89l-0.04,-1.5l-0.4,-0.39l-2.53,0.02l0.1,-0.41l-0.39,-0.49l-1.28,0.01l-0.43,0.46l-1.62,0.32l-0.83,1.8l-1.09,-0.28l-2.4,0.52l-1.37,-1.91l-1.3,-3.31l-0.38,-0.27l-7.39,-0.03l-2.46,0.42l0.5,-0.45l0.37,-1.47l0.66,-0.38l0.92,0.08l0.73,-0.82l0.87,0.02l0.31,0.68l1.4,0.36l3.59,-3.63l0.01,-2.23l1.02,-2.29l2.69,-2.39l0.43,-0.99l0.49,-1.96l0.17,-3.51l1.25,-2.95l0.36,-3.15l0.86,-1.13l1.1,-0.67l3.57,1.73l3.65,0.73l0.46,-0.21l0.8,-1.46l1.24,0.19l2.61,-1.17l0.81,0.44l1.04,-0.03l0.59,-0.66l0.7,-0.16l1.81,0.25Z",
      "name": "Dem. Rep. Congo"
    },
    "CZ": {
      "path": "M458.44,265.89l1.23,1.2l1.49,0.27l0.09,1.1l1.36,0.81l0.58,-0.21l0.25,-0.67l1.12,0.29l0.53,1.3l1.67,0.21l0.69,1.14l-1.4,1.19l-0.12,0.65l-0.55,0.55l-1.59,0.21l-0.56,0.65l-1.03,-0.52l-1.03,0.17l-2.15,-1.12l-1.05,0.4l-1.18,1.3l-1.53,-1.0l-2.59,-2.49l-0.57,-2.36l1.48,-0.7l0.99,-1.01l1.72,-0.74l0.54,-0.59l0.73,0.29l0.87,-0.32Z",
      "name": "Czech Rep."
    },
    "CY": {
      "path": "M504.35,321.02l0.49,0.34l-1.34,0.65l-0.91,-0.29l-0.26,-0.55l2.02,-0.14Z",
      "name": "Cyprus"
    },
    "CR": {
      "path": "M211.34,387.89l0.48,1.0l1.61,1.62l-0.54,0.45l0.3,1.42l-0.25,1.2l-1.09,-0.6l-0.05,-1.25l-2.46,-1.43l-0.28,-0.77l-0.66,-0.45l-0.45,-0.0l-0.11,1.05l-1.32,-0.95l0.31,-1.31l-0.36,-0.6l0.31,-0.27l1.42,0.58l1.29,-0.14l0.56,0.56l0.74,0.17l0.55,-0.27Z",
      "name": "Costa Rica"
    },
    "CU": {
      "path": "M221.21,356.57l1.27,1.05l2.18,-0.29l4.43,3.42l2.09,0.45l-0.1,0.41l0.36,0.49l1.75,0.1l1.44,0.97l-3.07,0.42l-4.17,-0.03l0.79,-0.7l-0.04,-0.63l-1.2,-0.76l-1.49,-0.16l-0.7,-0.62l-0.56,-1.44l-0.4,-0.25l-1.34,0.1l-2.2,-0.68l-0.89,-0.6l-3.18,-0.41l-0.28,-0.17l0.6,-0.76l-0.36,-0.29l-2.73,-0.05l-1.7,1.33l-0.91,0.03l-0.61,0.71l-1.03,0.22l1.14,-1.35l1.01,-0.54l3.69,-1.04l3.98,0.22l2.21,0.87Z",
      "name": "Cuba"
    },
    "SZ": {
      "path": "M500.35,482.11l0.5,2.14l-0.39,0.94l-1.04,0.22l-1.23,-1.25l-0.02,-0.69l0.84,-1.65l1.34,0.28Z",
      "name": "Swaziland"
    },
    "SY": {
      "path": "M510.98,327.85l0.08,-1.44l0.55,-1.47l1.28,-1.07l0.12,-0.44l-0.41,-1.19l-1.14,-0.38l-0.19,-1.91l0.53,-1.11l1.29,-1.31l0.19,-1.27l0.6,0.24l2.61,-0.82l1.36,0.56l2.06,-0.01l2.95,-1.17l3.29,-0.29l-0.72,1.1l-1.49,1.11l0.23,2.19l-0.89,3.46l-10.14,6.13l-2.17,-0.92Z",
      "name": "Syria"
    },
    "KG": {
      "path": "M621.37,297.76l-3.91,1.98l-0.95,1.31l-3.03,0.37l-1.14,2.06l-2.35,-0.39l-2.01,0.7l-2.39,1.55l0.09,1.02l-0.42,0.44l-4.5,0.47l-3.01,-1.02l-2.38,0.19l0.12,-0.96l2.3,0.46l1.14,-0.97l1.99,0.21l3.21,-2.37l-0.03,-0.67l-2.97,-1.75l-1.95,0.72l-1.27,-0.86l1.77,-1.84l-0.12,-0.64l-0.4,-0.18l0.36,-0.95l1.35,-0.39l4.01,1.14l0.5,-0.31l0.35,-1.82l1.08,-0.54l3.4,1.37l1.14,-0.35l7.61,0.43l1.15,1.13l1.27,0.45Z",
      "name": "Kyrgyzstan"
    },
    "KE": {
      "path": "M506.26,414.59l1.87,-2.56l0.93,-2.15l-1.38,-4.08l-1.06,-1.6l2.82,-2.75l0.79,0.26l0.12,1.41l0.86,0.83l1.9,0.11l3.28,2.13l3.57,0.44l1.05,-1.12l1.96,-0.9l0.82,0.69l1.16,0.09l-1.78,2.45l0.03,9.12l1.3,1.94l-1.37,0.78l-0.67,1.03l-1.08,0.46l-0.34,1.67l-0.81,1.07l-0.45,1.55l-0.68,0.56l-3.2,-2.23l-0.35,-1.58l-8.86,-4.98l0.14,-1.6l-0.57,-1.04Z",
      "name": "Kenya"
    },
    "SS": {
      "path": "M481.71,393.21l1.07,-0.73l1.2,-3.2l1.36,-0.26l1.61,2.0l0.87,0.34l1.11,-0.41l1.5,0.07l0.57,0.53l2.49,0.0l0.44,-0.63l1.07,-0.4l0.45,-0.84l0.59,-0.33l1.9,1.34l1.6,-0.2l2.83,-3.35l-0.32,-2.23l1.6,-0.53l-0.24,1.62l0.3,1.84l1.34,1.18l0.2,1.88l0.35,0.41l0.02,1.54l-0.23,0.47l-1.42,0.25l-0.85,1.44l0.3,0.6l1.4,0.17l1.12,1.08l0.59,1.13l1.03,0.53l1.28,2.37l-4.42,3.99l-1.74,0.01l-1.89,0.55l-1.47,-0.52l-1.15,0.57l-2.96,-2.62l-1.3,0.49l-1.06,-0.15l-0.79,0.39l-0.82,-0.22l-1.8,-2.7l-1.91,-1.1l-0.66,-1.5l-2.62,-2.33l-0.18,-0.94l-2.37,-1.61Z",
      "name": "S. Sudan"
    },
    "SR": {
      "path": "M283.12,400.08l2.1,0.53l-1.08,1.95l0.2,1.72l0.93,1.49l-0.59,2.04l-0.43,0.71l-1.12,-0.42l-1.32,0.22l-0.93,-0.2l-0.46,0.26l-0.25,0.73l0.33,0.7l-0.89,-0.13l-1.39,-1.98l-0.31,-1.34l-0.97,-0.31l-0.89,-1.47l0.35,-1.61l1.45,-0.82l0.33,-1.87l2.61,0.44l0.58,-0.47l1.75,-0.16Z",
      "name": "Suriname"
    },
    "KH": {
      "path": "M689.52,379.15l0.5,1.47l-0.28,2.77l-4.0,1.87l-0.16,0.59l0.69,0.97l-2.06,0.17l-2.05,0.97l-1.82,-0.32l-0.9,-1.17l-1.23,-2.56l-0.55,-2.88l1.4,-1.87l3.01,-0.46l2.23,0.35l2.01,0.99l0.51,-0.14l0.95,-1.49l1.74,0.75Z",
      "name": "Cambodia"
    },
    "SV": {
      "path": "M195.8,379.9l1.41,-1.21l2.24,1.46l0.98,-0.27l0.44,0.21l-0.27,1.07l-1.14,-0.03l-3.65,-1.23Z",
      "name": "El Salvador"
    },
    "SK": {
      "path": "M476.87,273.43l-1.2,2.33l-2.74,-1.08l-1.05,0.4l-0.52,0.78l-3.44,0.85l-0.48,0.81l-1.74,0.38l-1.88,-1.17l-0.2,-1.03l0.4,-0.94l1.02,0.01l0.86,-0.39l1.74,-2.23l0.83,0.19l0.76,-0.39l1.06,1.14l0.49,0.08l1.33,-0.74l1.26,0.34l1.63,-0.49l1.87,1.16Z",
      "name": "Slovakia"
    },
    "KR": {
      "path": "M737.47,312.73l1.03,-0.11l0.87,-1.28l2.69,-0.35l0.32,-0.3l1.75,3.04l0.59,1.94l0.02,3.41l-0.81,1.45l-2.22,0.59l-1.92,1.21l-1.79,0.21l-0.2,-1.21l0.44,-2.44l-0.97,-2.83l1.45,-0.41l0.23,-0.6l-1.48,-2.32Z",
      "name": "Korea"
    },
    "SI": {
      "path": "M456.18,286.22l-0.51,-1.56l0.2,-1.29l1.68,0.23l1.44,-0.83l2.08,-0.09l0.62,-0.56l0.24,0.62l-1.66,0.8l-0.43,1.53l-0.67,0.28l-0.24,0.94l-1.2,-0.55l-0.54,0.09l-0.33,0.43l-0.67,-0.05Z",
      "name": "Slovenia"
    },
    "KP": {
      "path": "M736.77,312.06l-0.91,-0.45l-0.89,0.68l-1.23,-0.97l0.49,-1.01l0.5,-0.32l0.58,-2.78l-0.45,-0.8l-1.38,-0.34l-0.75,-0.55l1.69,-1.74l2.72,-1.75l1.57,-2.11l1.1,0.86l2.17,0.12l0.41,-0.49l-0.32,-1.43l3.54,-1.33l0.93,-1.56l1.03,1.28l-1.46,1.26l-0.79,1.2l0.02,2.38l-1.08,0.61l-1.41,1.55l-1.7,0.58l-1.23,1.17l-0.16,2.14l2.12,1.67l-0.16,0.33l-2.59,0.32l-1.14,1.41l-1.21,0.08Z",
      "name": "Dem. Rep. Korea"
    },
    "KW": {
      "path": "M540.8,336.41l0.38,0.92l-0.17,0.78l0.61,1.64l-0.95,0.04l-0.83,-1.35l-1.59,-0.2l1.34,-2.02l1.21,0.17Z",
      "name": "Kuwait"
    },
    "SN": {
      "path": "M390.09,377.95l0.12,1.57l0.49,1.48l0.96,0.82l0.05,1.3l-1.26,-0.19l-0.75,0.33l-1.84,-0.62l-5.84,-0.13l-2.54,0.51l-0.22,-1.04l1.78,0.04l2.01,-0.92l1.03,0.48l1.09,0.05l1.29,-0.62l0.14,-0.58l-0.51,-0.74l-1.81,0.25l-1.13,-0.64l-0.79,0.04l-0.72,0.61l-2.31,0.06l-0.92,-1.79l-0.82,-0.65l0.64,-0.36l1.81,-3.15l0.65,-0.64l1.04,0.19l1.39,-0.56l1.19,-0.02l2.72,1.39l3.03,3.53Z",
      "name": "Senegal"
    },
    "SL": {
      "path": "M394.46,393.98l-1.73,1.98l-0.58,1.34l-2.07,-1.06l-1.22,-1.26l-0.65,-2.4l1.16,-0.97l0.67,-1.18l1.21,-0.52l1.66,0.0l1.03,1.65l0.52,2.42Z",
      "name": "Sierra Leone"
    },
    "KZ": {
      "path": "M552.75,298.52l0.51,-1.47l-0.48,-1.19l-2.96,-1.32l-1.07,-2.94l-1.37,-0.98l-0.03,-0.45l1.95,0.27l0.45,-0.38l0.09,-2.29l1.75,-0.47l2.09,0.51l0.49,-0.34l0.45,-3.5l-0.45,-2.38l-0.42,-0.32l-2.41,0.17l-2.39,-0.84l-2.87,1.59l-2.15,0.7l-0.86,-0.4l0.15,-1.86l-1.6,-2.47l-2.02,-0.09l-1.83,-2.19l1.33,-2.64l-0.61,-1.04l1.66,-3.54l2.17,1.91l0.66,-0.26l0.29,-2.7l4.94,-4.15l3.67,-0.1l8.38,4.33l2.97,-1.63l3.74,-0.08l3.1,1.99l0.56,-0.13l0.6,-0.97l3.28,0.16l0.4,-0.27l0.63,-1.89l-0.15,-0.46l-3.62,-2.47l1.99,-1.65l-0.2,-1.23l2.05,-0.92l0.17,-0.58l-1.66,-2.63l0.88,-1.1l9.22,-1.46l1.35,-1.1l6.17,-1.58l2.26,-1.78l4.05,0.85l0.74,4.22l0.54,0.3l2.46,-0.98l2.8,1.27l-0.18,2.03l0.44,0.43l2.58,-0.3l4.83,-3.09l0.03,0.36l3.16,3.23l5.57,10.31l0.69,0.03l1.11,-1.75l3.11,2.07l3.78,-0.93l1.13,0.59l1.15,2.17l1.83,0.89l1.0,1.55l0.4,0.18l2.95,-0.47l1.06,1.89l-1.65,2.2l-1.92,0.33l-0.33,0.38l-0.12,3.61l-1.14,1.37l-4.73,-1.15l-0.48,0.28l-1.76,6.36l-1.1,0.68l-4.91,1.4l-0.26,0.52l2.13,5.72l-1.4,0.73l-0.08,1.73l-0.87,-0.28l-1.43,-1.27l-7.9,-0.45l-0.92,0.34l-3.74,-1.37l-1.63,0.99l-0.31,1.59l-3.7,-1.05l-1.87,0.48l-0.76,1.57l-1.35,0.6l-3.3,2.34l-1.12,2.31l-0.42,0.01l-0.93,-1.56l-2.86,-0.1l-0.45,-2.43l-0.39,-0.33l-0.81,-0.02l0.02,-3.32l-3.0,-2.52l-4.58,0.18l-2.74,0.47l-2.34,-3.04l-6.74,-4.23l-6.45,2.1l-0.28,0.38l0.1,12.31l-0.69,0.09l-1.62,-2.42l-1.83,-1.07l-3.13,0.66l-0.68,0.6Z",
      "name": "Kazakhstan"
    },
    "SA": {
      "path": "M537.53,338.97l2.0,0.25l0.91,1.39l1.49,-0.06l0.88,2.19l1.29,0.79l0.51,1.03l1.56,1.08l-0.1,1.98l0.32,0.93l1.57,2.56l0.76,0.55l0.71,-0.04l1.37,4.1l7.83,1.63l0.51,-0.29l0.77,1.29l-1.56,5.0l-7.29,2.58l-7.31,1.05l-2.34,1.19l-1.88,2.79l-0.76,0.28l-0.83,-0.79l-0.91,0.12l-2.88,-0.52l-3.5,0.25l-0.86,-0.57l-0.58,0.15l-0.66,1.29l0.16,1.12l-0.43,0.33l-0.93,-1.42l-0.33,-1.18l-1.23,-0.89l-1.27,-2.1l-0.78,-2.27l-1.73,-1.83l-1.14,-0.49l-1.54,-2.37l-0.2,-3.5l-1.44,-3.02l-1.27,-1.19l-1.33,-0.58l-1.31,-3.5l-0.77,-0.7l-0.97,-2.05l-2.8,-4.2l-1.07,-0.17l0.59,-2.85l2.75,0.31l1.08,-0.88l0.6,-0.99l1.74,-0.36l0.65,-1.08l0.72,-0.43l0.1,-0.6l-2.09,-2.45l4.42,-1.3l0.48,-0.39l2.75,0.73l3.66,2.01l7.03,5.8l4.88,0.32Z",
      "name": "Saudi Arabia"
    },
    "SE": {
      "path": "M480.3,192.35l-4.15,1.76l-2.43,4.19l0.32,3.66l-3.86,4.45l-4.93,4.95l-1.79,7.79l1.78,3.64l2.29,2.71l-2.14,5.19l-2.69,1.39l-0.95,7.87l-1.3,3.9l-2.71,-0.39l-0.43,0.25l-1.32,3.3l-2.29,0.16l-0.75,-3.94l-2.09,-5.18l-1.86,-6.56l1.04,-2.66l2.12,-3.53l0.83,-6.02l-1.6,-2.83l-0.15,-7.02l1.52,-4.93l2.18,0.09l0.39,-0.26l0.87,-2.28l-0.85,-2.14l3.83,-8.36l4.06,-11.45l2.12,0.02l0.4,-0.33l0.59,-3.35l4.31,1.0l0.49,-0.36l0.34,-4.24l1.04,-0.19l6.98,7.72l0.07,9.8l0.74,2.18Z",
      "name": "Sweden"
    },
    "SD": {
      "path": "M505.98,389.25l-0.34,-0.78l-1.17,-0.91l-0.27,-1.62l0.29,-1.82l-0.34,-0.46l-1.16,-0.18l-0.54,0.59l-1.23,0.11l-0.28,0.65l0.53,0.66l0.17,1.23l-2.44,3.01l-0.96,0.2l-2.39,-1.41l-0.95,0.52l-0.38,0.78l-1.11,0.41l-0.29,0.5l-1.94,0.0l-0.54,-0.52l-1.81,-0.09l-0.95,0.41l-2.45,-2.36l-2.07,0.54l-0.73,1.27l-0.6,2.11l-1.25,0.58l-0.75,-0.62l0.27,-2.67l-1.48,-1.78l-0.22,-1.49l-0.92,-0.97l-0.02,-1.3l-0.57,-1.17l-0.69,-0.16l0.7,-1.31l-0.18,-1.15l0.65,-0.63l0.03,-0.55l-0.36,-0.42l1.56,-3.02l1.91,0.16l0.43,-0.4l-0.1,-11.14l2.49,-0.01l0.4,-0.4l-0.0,-4.96l29.02,0.0l0.65,2.11l-0.49,0.67l0.36,2.75l0.93,3.22l2.12,1.59l-0.9,1.07l-1.72,0.4l-0.98,0.91l-1.42,5.73l0.24,1.16l-0.38,2.09l-0.97,2.4l-1.53,1.32l-1.32,2.93l-1.22,0.86l-0.37,1.34Z",
      "name": "Sudan"
    },
    "DO": {
      "path": "M241.8,368.82l0.05,-0.67l-0.47,-0.75l0.43,-0.45l0.19,-1.02l-0.09,-1.57l1.66,0.01l1.99,0.64l0.33,0.69l1.29,0.19l0.33,0.77l0.99,0.09l0.81,0.64l-0.46,0.53l-1.13,-0.48l-1.87,-0.01l-1.27,0.6l-0.75,-0.56l-1.01,0.55l-0.79,1.43l-0.23,-0.62Z",
      "name": "Dominican Rep."
    },
    "DJ": {
      "path": "M528.43,386.01l-0.45,0.67l-0.58,-0.25l-1.51,0.13l-0.18,-1.02l1.45,-1.97l0.83,0.17l0.77,-0.44l0.2,1.01l-1.21,0.52l-0.06,0.7l0.73,0.48Z",
      "name": "Djibouti"
    },
    "DK": {
      "path": "M452.3,246.5l-1.22,2.88l-2.11,-1.99l-0.26,-1.39l2.98,-1.2l0.61,1.7ZM447.78,242.9l-0.32,0.89l-0.89,-0.07l-1.8,3.21l0.54,2.1l-1.13,0.47l-1.58,-0.48l-0.91,-2.19l-0.07,-4.44l0.99,-2.3l2.0,-0.26l1.11,-1.38l1.3,-0.85l-0.05,1.54l-0.73,1.69l0.3,1.28l1.25,0.79Z",
      "name": "Denmark"
    },
    "DE": {
      "path": "M453.15,278.66l-0.56,-0.42l-1.2,-0.11l-1.89,0.66l-2.12,-0.15l-0.57,0.71l-0.83,-0.67l-0.98,0.09l-2.56,-1.08l-0.49,0.15l-0.39,0.62l-1.46,-0.02l0.26,-2.16l1.24,-2.54l-0.28,-0.57l-3.51,-0.68l-0.95,-0.81l0.12,-1.49l-0.49,-1.0l0.27,-2.61l-0.38,-3.76l1.43,-0.25l0.63,-1.53l0.65,-3.87l-0.43,-1.44l0.31,-0.56l1.61,-0.18l0.34,0.68l0.67,0.07l1.7,-2.09l-0.57,-3.77l1.35,0.41l1.33,-0.45l0.28,1.46l2.27,0.9l-0.02,1.24l0.52,0.39l2.55,-0.8l1.33,-1.07l2.53,1.51l1.08,1.24l0.51,1.88l-0.61,1.39l0.88,1.43l0.58,2.06l-0.16,1.52l0.87,2.18l-0.54,0.2l-0.49,-0.34l-0.54,0.07l-0.57,0.68l-1.71,0.73l-1.01,1.02l-1.75,0.82l-0.2,0.5l0.84,2.98l2.45,2.3l-0.71,1.4l-1.0,0.83l0.33,2.27Z",
      "name": "Germany"
    },
    "YE": {
      "path": "M528.26,376.46l0.26,-0.43l-0.22,-1.03l0.28,-0.61l-0.09,-0.91l0.92,-0.7l-0.08,-1.37l0.39,-0.76l1.01,0.48l3.33,-0.27l3.76,0.42l0.95,0.82l1.36,-0.59l1.74,-2.67l2.18,-1.11l6.86,-0.96l2.48,5.52l-1.64,0.77l-0.56,1.93l-6.23,2.19l-2.29,1.82l-1.93,0.05l-1.41,1.03l-4.24,0.75l-1.72,1.5l-3.28,0.19l-0.52,-1.19l0.02,-1.52l-1.34,-3.33Z",
      "name": "Yemen"
    },
    "DZ": {
      "path": "M441.47,315.57l-0.34,1.19l0.39,2.88l-0.55,2.35l-1.58,1.92l0.36,2.53l1.92,1.66l0.17,0.85l1.43,1.1l1.85,7.66l0.13,1.23l-0.57,5.23l0.2,1.59l-0.88,1.03l-0.02,0.5l1.41,1.93l0.14,1.24l0.89,1.54l0.5,0.17l0.97,-0.42l1.72,1.11l0.83,1.29l-8.23,4.95l-7.23,5.24l-3.43,1.15l-2.3,0.21l-0.28,-1.63l-2.56,-1.12l-0.67,-1.28l-26.12,-18.48l0.01,-3.67l3.77,-1.98l2.44,-0.43l2.12,-0.8l1.08,-1.5l2.81,-1.11l0.34,-2.2l1.34,-0.31l1.04,-1.0l3.46,-0.73l0.36,-1.59l-0.58,-0.56l-0.83,-3.02l-0.18,-1.95l-0.8,-1.65l2.06,-1.44l2.62,-0.52l1.71,-1.32l2.31,-0.91l8.23,-0.8l1.51,0.41l2.27,-1.19l2.45,-0.02l0.91,0.65l1.38,-0.05Z",
      "name": "Algeria"
    },
    "US": {
      "path": "M892.73,206.44l1.34,0.72l1.36,-0.5l1.85,1.36l2.21,0.69l-1.59,1.04l-2.57,-2.02l-2.38,0.18l-0.3,-0.25l0.09,-1.21ZM183.2,272.56l0.38,1.78l1.12,0.96l4.22,0.82l2.39,1.15l2.19,-0.43l2.01,0.64l-1.73,0.85l-3.49,3.04l-0.14,0.83l0.52,0.39l2.3,-0.7l1.8,1.17l5.17,-2.8l-0.37,0.89l0.24,0.53l1.35,0.45l1.71,1.35l4.7,-1.01l0.4,0.77l1.58,0.45l0.68,0.78l-1.42,0.21l-2.2,-0.37l-3.59,1.03l-2.72,3.73l0.35,0.91l0.62,-0.0l0.61,-0.75l-1.43,5.39l0.29,3.47l0.67,1.77l0.61,0.48l1.03,-0.07l0.75,-0.43l1.59,-2.19l0.13,-2.45l-0.82,-2.2l0.11,-1.33l1.2,-2.74l0.42,-0.36l0.48,0.84l0.4,-0.3l0.4,-1.6l0.59,-0.51l0.24,-0.94l1.66,0.56l1.67,1.25l-0.03,2.8l-1.28,1.3l0.02,1.21l0.87,0.37l1.67,-1.46l0.49,0.18l0.51,3.02l-2.51,4.23l0.17,0.59l1.54,0.69l1.51,0.19l1.93,-0.49l4.72,-2.41l2.16,-2.03l-0.08,-1.39l0.77,-0.26l3.91,0.4l2.14,-1.19l0.19,-0.39l-0.31,-1.71l2.31,-2.21l1.0,-0.57l8.31,-0.03l0.57,-0.94l1.9,-0.88l0.92,-1.72l0.75,-2.75l1.58,-2.29l0.94,0.69l1.44,-0.54l0.81,0.77l-0.0,4.78l1.98,3.01l-2.38,1.52l-5.36,2.37l-1.81,3.03l0.01,1.98l0.83,1.79l0.78,0.27l-6.43,1.12l-2.21,1.0l-0.21,0.48l0.45,0.28l3.52,-0.57l-2.73,0.77l-1.77,-0.26l-0.76,0.91l0.23,0.65l0.34,0.07l-0.43,1.87l-1.26,1.73l-1.46,-1.16l-0.49,-0.06l-0.18,0.46l0.52,1.74l0.61,0.64l0.03,0.92l-0.94,1.5l-1.22,-1.31l-0.28,-2.52l-0.35,-0.35l-0.42,0.27l-0.48,1.39l0.34,1.57l-0.97,-0.29l-0.48,0.22l0.16,0.5l1.54,0.91l0.1,2.78l0.78,0.52l0.53,3.76l-1.43,2.04l-2.47,0.86l-1.71,1.78l-1.31,0.27l-1.27,1.11l-0.43,1.05l-2.7,1.91l-2.64,3.21l-0.45,2.23l0.45,2.17l0.85,2.51l1.09,2.0l0.04,1.26l1.16,3.2l-0.18,2.82l-0.55,1.49l-0.47,0.22l-0.88,-0.24l-0.33,-1.01l-1.03,-0.79l-2.75,-5.4l0.46,-2.04l-0.76,-1.66l-1.95,-2.41l-1.47,-0.55l-2.38,1.23l-1.46,-1.42l-1.79,-0.75l-2.78,0.36l-2.27,-0.31l-2.03,0.23l-1.04,0.45l-0.18,0.57l0.39,0.67l0.19,1.47l-0.9,-0.23l-0.84,0.49l-1.57,-0.08l-2.08,-1.52l-2.08,0.34l-1.91,-0.65l-3.74,0.89l-2.39,2.17l-2.54,1.28l-1.45,1.47l-0.61,1.43l-0.02,1.98l0.38,1.9l-1.99,-0.55l-1.81,-0.8l-1.25,-3.25l-1.44,-1.57l-2.24,-3.73l-1.76,-1.15l-2.28,-0.01l-1.71,2.18l-1.74,-0.72l-1.16,-0.78l-1.52,-3.14l-3.94,-3.35l-4.34,-0.0l-0.4,0.4l-0.0,0.81l-6.5,0.02l-9.04,-3.34l-0.33,-0.75l-5.69,0.52l-0.43,-1.37l-1.62,-1.72l-1.14,-0.41l-0.55,-0.94l-1.27,-0.14l-1.02,-0.83l-2.22,-0.29l-0.43,-0.33l-0.36,-1.7l-2.4,-3.06l-2.02,-4.21l-0.05,-0.96l-2.93,-3.59l-0.33,-2.54l-1.3,-1.83l0.52,-2.65l-0.09,-2.87l-0.78,-2.59l0.96,-3.2l0.61,-6.46l-0.46,-4.91l-1.48,-4.8l0.09,-0.23l3.09,1.09l1.27,3.33l0.71,0.07l0.68,-1.24l-1.12,-5.71l68.79,-0.0l0.4,-0.4l0.13,-1.09ZM32.37,157.48l1.75,3.33l0.67,0.06l0.98,-1.29l3.62,0.39l-0.12,1.35l0.27,0.41l3.83,1.28l2.65,-0.7l5.14,2.3l4.86,0.72l1.87,0.93l3.47,-1.11l3.64,2.11l2.52,0.95l-0.03,56.12l0.38,0.4l2.37,0.14l2.29,1.31l3.91,5.31l0.63,0.04l2.4,-2.69l2.1,-1.34l1.18,2.24l3.95,4.14l4.1,8.6l4.22,2.91l0.06,2.46l-1.03,1.56l-1.12,-1.31l-2.06,-1.31l-0.68,-3.73l-3.26,-3.82l-1.32,-4.34l-0.33,-0.28l-6.34,-0.42l-2.8,-1.31l-5.26,-5.09l-6.77,-2.72l-3.55,0.39l-4.79,-2.25l-3.33,-2.21l-2.78,1.09l-0.25,0.43l0.46,3.15l-3.97,1.29l-2.26,1.69l-2.25,0.84l-0.29,-2.33l1.07,-4.71l2.51,-1.5l0.15,-0.53l-0.69,-1.3l-0.62,-0.11l-3.19,2.88l-1.77,3.43l-3.56,3.49l-0.04,0.53l1.65,2.14l-2.16,3.15l-5.1,3.33l-0.76,2.13l-3.78,2.28l-0.91,2.19l-2.68,1.74l-1.82,-0.27l-6.95,4.17l-3.92,1.13l2.36,-1.94l2.5,-1.4l2.58,-2.35l3.26,-0.66l1.2,-1.79l3.42,-2.69l2.56,-2.83l0.42,-3.52l1.25,-2.78l-0.09,-0.45l-0.46,-0.07l-2.63,1.33l-0.6,-0.62l-0.6,0.03l-1.02,1.31l-1.33,-1.98l-0.71,0.08l-0.3,0.77l-0.56,-1.45l-0.62,-0.17l-2.39,1.85l-1.03,-0.0l-0.18,-2.46l0.44,-1.74l-1.7,-2.14l-0.41,-0.11l-3.01,0.89l-1.94,-2.17l-1.61,-1.16l-0.11,-2.96l-1.78,-2.05l0.88,-2.78l2.01,-2.96l0.87,-2.7l1.66,-0.33l1.59,0.82l0.5,-0.12l1.86,-2.47l1.93,0.32l1.91,-1.75l-0.34,-2.97l-1.22,-1.04l1.59,-1.93l-0.33,-0.65l-1.69,0.11l-2.66,1.27l-0.72,1.08l-1.92,-1.11l-3.43,0.63l-3.41,-1.3l-1.05,-2.33l-2.87,-3.16l3.14,-2.29l5.47,-2.98l1.51,0.0l-0.29,2.67l0.42,0.44l5.29,-0.24l0.34,-0.59l-2.03,-3.88l-3.12,-2.51l-1.79,-3.25l-2.4,-2.83l-3.25,-2.04l1.19,-3.05l4.45,-0.33l3.16,-3.2l0.69,-3.62l2.43,-3.32l2.42,-0.86l4.6,-3.26l2.51,0.36l3.66,-3.91l3.4,1.47ZM37.56,239.39l-2.21,1.54l-0.94,-0.87l-0.32,-1.79l3.24,-2.14l1.37,0.26l0.77,1.05l-1.9,1.94ZM31.06,363.53l0.98,0.48l0.75,0.91l-1.77,1.1l-0.44,-1.57l0.48,-0.92ZM29.32,361.52l0.19,0.06l0.11,0.07l-0.18,0.04l-0.12,-0.16ZM25.2,359.55l0.2,0.24l-0.14,-0.02l-0.05,-0.23ZM5.91,226.07l-1.09,0.55l-2.4,-1.69l1.72,-0.6l1.6,0.37l0.17,1.37Z",
      "name": "United States"
    },
    "UY": {
      "path": "M286.86,504.69l-0.94,1.64l-2.58,1.54l-1.67,-0.55l-1.42,0.28l-2.4,-1.28l-1.51,0.09l-1.28,-1.4l0.16,-1.65l0.56,-0.83l-0.02,-2.91l1.22,-5.04l1.18,-0.23l2.36,2.12l1.08,0.03l4.36,3.37l1.24,1.73l-0.98,1.58l0.62,1.52Z",
      "name": "Uruguay"
    },
    "LB": {
      "path": "M510.37,325.96l-0.89,0.55l1.84,-3.86l0.6,0.08l0.24,0.7l-1.15,0.96l-0.64,1.57Z",
      "name": "Lebanon"
    },
    "LA": {
      "path": "M689.54,378.29l-1.76,-0.75l-0.5,0.15l-0.94,1.48l-1.33,-0.65l0.62,-0.99l0.11,-2.2l-2.04,-2.45l-0.25,-2.69l-1.9,-2.14l-2.15,-0.31l-0.79,0.93l-1.12,0.06l-1.06,-0.4l-2.05,1.22l-0.04,-1.63l0.61,-2.74l-0.36,-0.49l-1.35,-0.1l-0.11,-1.26l-0.97,-0.9l0.33,-0.61l1.63,-1.34l0.39,0.36l1.33,0.07l0.42,-0.45l-0.34,-2.75l0.7,-0.21l1.28,1.86l1.11,2.41l0.36,0.23l2.82,0.02l0.72,1.72l-1.4,0.67l-0.72,0.95l0.13,0.59l2.91,1.54l3.61,5.34l1.88,1.81l0.57,1.65l-0.35,1.99Z",
      "name": "Lao PDR"
    },
    "TW": {
      "path": "M724.01,356.0l-0.73,1.52l-0.9,-1.56l-0.26,-1.81l1.38,-2.53l1.73,-1.8l0.64,0.46l-1.86,5.73Z",
      "name": "Taiwan"
    },
    "TT": {
      "path": "M266.64,389.17l0.28,-1.17l1.13,-0.22l-0.06,1.21l-1.35,0.18Z",
      "name": "Trinidad and Tobago"
    },
    "TR": {
      "path": "M513.19,301.28l3.65,1.31l3.06,-0.48l2.09,0.29l3.13,-1.74l2.44,-0.15l2.19,1.49l0.35,0.95l-0.23,1.5l0.24,0.43l2.34,1.31l-1.23,0.67l-0.2,0.43l0.75,3.55l-0.42,1.23l1.16,2.15l-0.57,0.25l-0.9,-0.73l-2.91,-0.41l-1.25,0.5l-4.23,0.45l-2.81,1.15l-1.9,0.01l-1.54,-0.57l-2.56,0.81l-0.66,-0.49l-0.64,0.29l-0.12,1.59l-0.89,0.9l-0.49,-0.75l0.8,-1.4l-0.41,-0.19l-1.43,0.25l-2.0,-0.69l-2.04,1.79l-3.49,0.32l-2.14,-1.66l-2.7,-0.1l-0.87,1.34l-1.36,0.29l-2.28,-1.56l-2.71,-0.02l-1.37,-2.89l-1.7,-1.68l1.09,-2.23l-0.08,-0.46l-1.31,-1.28l2.41,-2.71l3.68,-0.13l0.36,-0.25l0.94,-2.24l4.48,0.41l3.23,-2.2l2.8,-0.91l3.98,-0.07l4.28,2.31ZM488.78,302.77l-1.7,1.44l-0.51,-0.99l1.37,-2.91l-0.78,-0.93l1.78,-0.74l1.78,0.37l0.45,1.31l1.81,0.89l-0.14,0.26l-2.76,0.17l-1.31,1.13Z",
      "name": "Turkey"
    },
    "LK": {
      "path": "M624.16,398.87l-1.82,0.48l-0.99,-1.67l-0.42,-3.47l0.95,-3.45l1.21,0.98l2.26,4.21l-0.34,2.34l-0.85,0.58Z",
      "name": "Sri Lanka"
    },
    "LV": {
      "path": "M489.13,238.44l0.98,0.86l0.21,2.15l0.72,2.39l-3.68,2.17l-2.21,-1.98l-1.3,-0.34l-0.27,-0.73l-0.45,-0.25l-2.41,0.44l-4.15,-0.29l-2.48,1.13l0.07,-2.68l1.15,-2.72l1.91,-1.29l2.14,3.3l2.01,-0.09l0.38,-0.35l0.45,-3.34l1.74,-0.68l3.03,2.19l2.16,0.1Z",
      "name": "Latvia"
    },
    "LT": {
      "path": "M486.92,246.68l0.19,1.58l-2.02,1.5l-0.54,2.27l-2.48,1.47l-2.05,-0.02l-0.5,-1.08l-1.3,-0.59l-0.07,-2.33l-1.21,-0.74l-2.38,-0.69l-0.45,-3.18l2.51,-1.21l4.09,0.28l2.23,-0.39l0.52,0.88l1.23,0.27l2.22,1.99Z",
      "name": "Lithuania"
    },
    "LU": {
      "path": "M436.07,271.5l-0.48,-0.1l0.29,-1.66l0.29,0.51l-0.1,1.25Z",
      "name": "Luxembourg"
    },
    "LR": {
      "path": "M399.36,395.85l0.18,1.54l-0.49,1.0l0.08,0.47l2.47,1.8l-0.33,2.81l-2.65,-1.13l-5.78,-4.62l0.58,-1.32l2.1,-2.34l0.86,-0.22l0.77,1.14l-0.14,0.86l0.59,0.87l1.0,0.14l0.76,-0.99Z",
      "name": "Liberia"
    },
    "LS": {
      "path": "M491.05,494.85l-0.48,0.15l-1.5,-1.78l1.12,-1.53l2.18,-1.51l1.52,1.34l-0.99,1.94l-1.23,0.4l-0.62,0.98Z",
      "name": "Lesotho"
    },
    "TH": {
      "path": "M670.27,385.68l-1.41,3.9l0.15,2.01l0.38,0.36l1.38,0.07l0.9,2.05l0.55,2.34l1.4,1.45l1.61,0.38l0.96,0.97l-0.5,0.64l-1.1,0.2l-0.34,-1.18l-2.04,-1.1l-0.63,0.23l-0.63,-0.62l-0.48,-1.3l-2.55,-2.64l-0.73,0.41l0.95,-3.91l2.16,-4.25ZM670.67,384.59l-0.92,-2.2l-0.26,-2.64l-2.14,-3.1l0.72,-0.5l0.89,-2.62l-2.62,-3.66l-0.99,-1.9l0.88,-0.52l1.05,-2.63l1.74,-0.19l2.59,-1.63l0.76,0.58l0.13,1.42l0.37,0.36l1.23,0.09l-0.52,2.34l0.05,2.46l0.6,0.33l2.43,-1.45l0.77,0.4l1.47,-0.08l0.71,-0.89l1.48,0.14l1.71,1.92l0.25,2.69l1.92,2.15l-0.1,1.92l-0.61,0.87l-2.22,-0.33l-3.5,0.65l-1.6,2.14l0.36,2.6l-1.51,-0.79l-1.85,-0.01l0.28,-1.54l-0.4,-0.47l-2.21,0.02l-0.4,0.37l-0.19,2.77l-0.34,0.94Z",
      "name": "Thailand"
    },
    "TF": {
      "path": "M596.66,558.28l-3.18,0.21l-0.05,-1.59l0.4,-1.7l1.28,0.9l2.08,0.42l-0.53,1.76Z",
      "name": "Fr. S. Antarctic Lands"
    },
    "TG": {
      "path": "M422.7,387.47l-0.1,1.24l1.53,1.53l0.08,1.1l0.5,0.65l-0.11,5.64l0.49,1.47l-1.31,0.35l-1.02,-2.13l-0.18,-1.13l0.53,-2.2l-0.63,-1.16l-0.22,-3.7l-1.01,-1.41l0.07,-0.29l1.37,0.03Z",
      "name": "Togo"
    },
    "TD": {
      "path": "M480.25,365.02l0.12,9.75l-2.1,0.05l-1.14,1.91l-0.69,1.65l0.34,0.73l-0.66,0.92l0.24,0.9l-0.86,1.97l0.45,0.5l0.59,-0.1l0.34,0.65l0.03,1.39l0.9,1.06l-1.45,0.43l-1.27,1.03l-1.83,2.78l-2.16,1.08l-2.31,-0.15l-0.86,0.25l-0.26,0.49l0.17,0.62l-2.11,1.69l-2.85,0.87l-1.09,-0.57l-0.73,0.67l-1.12,0.1l-1.1,-3.13l-1.25,-0.64l-1.22,-1.23l0.3,-0.65l3.01,0.04l0.35,-0.6l-1.3,-2.21l-0.08,-3.33l-0.97,-1.68l0.22,-1.06l-0.38,-0.48l-1.22,-0.04l0.0,-1.27l-0.98,-1.08l0.97,-3.05l3.25,-2.68l0.13,-3.38l0.95,-5.29l0.52,-1.1l-0.1,-0.47l-0.91,-0.8l-0.19,-0.98l-0.8,-0.6l-0.55,-3.77l2.11,-1.24l19.56,10.1Z",
      "name": "Chad"
    },
    "LY": {
      "path": "M483.49,331.4l-0.77,1.19l0.3,1.46l-0.6,1.92l0.73,2.26l0.0,25.02l-2.48,0.01l-0.41,0.87l-19.41,-10.02l-4.41,2.35l-1.37,-1.37l-3.82,-1.13l-1.14,-1.71l-1.98,-1.28l-1.22,0.33l-0.67,-1.15l-0.16,-1.3l-1.29,-1.77l0.88,-1.24l-0.07,-4.54l0.43,-2.38l-0.86,-3.65l1.13,-0.8l0.22,-1.23l-0.21,-1.1l3.49,-2.78l0.28,-2.06l2.44,0.85l1.18,-0.22l1.97,0.47l3.14,1.26l1.37,2.7l5.71,1.77l2.64,1.43l1.62,-0.76l1.29,-1.41l-0.45,-2.46l0.67,-1.22l1.67,-1.29l1.56,-0.37l3.13,0.56l1.09,1.36l3.98,0.83l0.38,0.6Z",
      "name": "Libya"
    },
    "AE": {
      "path": "M550.76,353.19l1.89,-0.42l3.84,0.02l4.77,-4.92l0.19,0.38l0.26,1.67l-0.82,0.01l-0.39,0.35l-0.08,2.12l-0.82,0.64l-0.01,1.0l-0.67,1.03l-0.39,1.45l-7.07,-1.29l-0.71,-2.04Z",
      "name": "United Arab Emirates"
    },
    "VE": {
      "path": "M240.68,386.52l0.53,0.75l-0.02,1.07l-1.07,1.78l0.95,2.01l0.42,0.23l1.4,-0.44l0.56,-1.84l-0.77,-1.17l-0.1,-1.49l2.83,-0.94l0.26,-0.49l-0.28,-0.97l0.3,-0.28l0.66,1.32l1.96,0.26l1.4,1.23l0.08,0.69l0.39,0.35l4.81,-0.23l1.49,1.12l1.92,0.31l1.67,-0.84l0.22,-0.61l3.44,-0.14l-0.18,0.56l0.86,1.2l2.19,0.35l1.68,1.1l0.37,1.87l0.41,0.32l1.56,0.17l-1.66,1.36l-0.22,0.92l0.66,0.98l-1.67,0.54l-0.3,0.4l0.04,0.99l-0.56,0.57l-0.01,0.55l1.85,2.27l-0.66,0.69l-4.47,1.29l-0.72,0.54l-3.69,-0.9l-0.71,0.27l-0.02,0.7l0.91,0.53l-0.08,1.55l0.35,1.58l0.35,0.31l1.66,0.17l-1.3,0.52l-0.48,1.13l-2.68,0.91l-0.6,0.77l-1.57,0.13l-1.17,-1.13l-0.8,-2.52l-1.25,-1.26l1.02,-1.23l-1.29,-2.95l0.18,-1.62l1.0,-2.21l-0.2,-0.49l-1.14,-0.47l-4.02,0.36l-1.82,-2.11l-1.57,-0.33l-2.99,0.23l-1.06,-0.98l0.25,-1.24l-0.2,-1.02l-0.59,-0.69l-0.29,-1.06l-1.08,-0.39l0.78,-2.81l1.9,-2.12Z",
      "name": "Venezuela"
    },
    "AF": {
      "path": "M600.86,316.06l-1.73,1.47l0.72,3.0l-1.1,1.13l-0.02,1.35l-0.49,0.78l-2.15,-0.09l-0.37,0.58l0.8,1.63l-1.4,0.74l-1.06,1.8l0.07,1.81l-0.66,0.56l-0.91,-0.22l-1.91,0.38l-0.48,0.81l-1.88,0.14l-1.49,1.9l-0.08,2.2l-2.91,1.07l-1.64,-0.24l-0.72,0.58l-1.41,-0.31l-2.4,0.41l-3.54,-1.24l1.98,-2.49l-0.21,-1.88l-0.3,-0.34l-1.63,-0.42l-0.19,-1.69l-0.76,-2.19l0.96,-1.48l-0.18,-0.59l-0.75,-0.31l1.48,-5.22l2.12,0.97l2.14,-0.38l0.74,-1.45l1.77,-0.42l1.54,-1.0l0.62,-2.51l1.88,-0.54l0.48,-0.87l0.93,0.61l2.13,0.12l2.55,1.01l1.96,-0.89l0.64,0.46l0.58,-0.13l0.69,-1.23l1.58,-0.09l0.47,-0.64l0.24,-1.17l0.79,-0.81l0.81,0.43l-0.19,0.66l0.71,0.58l-0.09,2.61l1.28,1.05ZM601.25,315.96l1.86,-0.88l1.42,-1.28l3.93,0.22l0.11,0.23l-2.26,0.81l-5.06,0.9Z",
      "name": "Afghanistan"
    },
    "IQ": {
      "path": "M530.81,314.51l0.79,0.72l1.26,-0.3l1.46,3.35l1.63,1.01l0.15,1.38l-1.23,1.13l-0.53,2.67l1.73,2.85l3.12,1.72l1.16,2.02l-0.38,1.98l0.39,0.48l0.41,-0.0l0.02,1.16l0.79,1.02l-2.51,-0.11l-1.71,2.58l-4.3,-0.21l-7.02,-5.78l-3.73,-2.06l-2.89,-0.78l-0.86,-3.1l5.46,-3.23l0.95,-3.7l-0.2,-2.14l1.28,-0.77l1.22,-1.86l0.86,-0.39l2.67,0.37Z",
      "name": "Iraq"
    },
    "IS": {
      "path": "M384.17,190.14l-0.45,3.88l2.67,3.88l-3.04,4.17l-9.15,4.83l-9.47,-2.42l1.99,-2.05l-0.1,-0.63l-4.53,-2.38l3.43,-0.89l0.3,-0.41l-0.11,-1.75l-0.3,-0.36l-4.81,-1.29l1.43,-3.39l3.37,-0.82l3.74,4.02l0.56,0.03l3.59,-3.17l2.9,1.61l0.45,-0.04l3.95,-3.21l3.58,0.38Z",
      "name": "Iceland"
    },
    "IR": {
      "path": "M533.43,314.24l-1.29,-2.38l0.43,-1.06l-0.72,-3.4l1.03,-0.56l0.32,0.9l1.26,1.49l2.06,0.57l1.12,-0.18l2.89,-2.33l0.6,-0.15l0.42,0.54l-0.74,1.37l0.06,0.46l1.56,1.68l0.66,0.05l0.67,1.99l2.55,0.89l1.88,1.61l3.7,0.53l3.91,-0.83l0.47,-0.8l2.17,-0.66l1.65,-1.68l1.49,0.08l1.19,-0.57l1.57,0.26l2.84,1.62l1.88,0.32l2.77,2.69l1.78,0.2l0.18,2.19l-1.69,5.93l0.23,0.49l0.64,0.26l-0.85,1.58l0.81,2.33l0.19,1.83l0.3,0.35l1.63,0.43l0.16,1.43l-2.16,2.5l-0.01,0.51l2.21,3.19l2.35,1.3l0.06,2.26l1.24,0.74l0.12,0.75l-3.31,1.33l-1.08,3.14l-9.68,-1.74l-0.99,-3.18l-1.43,-0.75l-2.18,0.48l-2.47,1.31l-2.82,-0.86l-2.46,-2.11l-2.41,-0.84l-3.42,-6.37l-0.49,-0.2l-1.17,0.41l-1.43,-0.86l-0.51,0.09l-0.64,0.77l-0.97,-1.07l-0.02,-1.4l-0.71,-0.39l0.27,-1.92l-1.29,-2.25l-3.13,-1.73l-1.59,-2.62l0.51,-2.08l1.3,-1.32l-0.19,-1.79l-1.73,-1.17l-1.57,-3.6Z",
      "name": "Iran"
    },
    "AM": {
      "path": "M537.0,308.96l-0.27,0.03l-1.24,-2.34l-0.92,0.01l-0.62,-0.73l-0.69,-0.08l-0.96,-0.89l-1.58,-0.69l0.2,-1.3l-0.28,-0.9l2.73,-0.41l1.13,1.15l-0.21,1.0l1.06,0.9l-0.5,0.74l0.08,0.53l2.05,1.37l0.04,1.62Z",
      "name": "Armenia"
    },
    "AL": {
      "path": "M470.32,297.19l0.73,0.03l0.93,0.99l0.13,0.95l-0.3,1.27l0.36,1.43l1.02,0.9l-1.82,3.2l-0.18,-0.65l-1.26,-1.0l-0.19,-1.36l0.53,-3.17l-0.55,-1.64l0.61,-0.94Z",
      "name": "Albania"
    },
    "AO": {
      "path": "M461.55,429.93l1.26,3.16l1.94,2.36l2.47,-0.54l1.25,0.32l0.44,-0.18l0.93,-1.92l1.31,-0.08l0.41,-0.44l0.47,-0.0l-0.1,0.41l0.39,0.49l2.65,-0.02l0.03,1.2l0.48,1.02l-0.34,1.52l0.18,1.56l0.83,1.04l-0.13,2.87l0.54,0.39l3.96,-0.41l-0.1,1.81l0.39,1.06l-0.24,1.45l-4.7,-0.03l-0.4,0.39l-0.12,8.23l2.93,3.55l-3.84,0.9l-5.89,-0.36l-1.88,-1.27l-10.47,0.23l-1.3,-1.03l-1.85,-0.16l-2.4,0.78l-0.15,-1.08l0.33,-2.2l1.0,-3.5l1.35,-3.24l2.24,-2.82l0.33,-2.07l-0.13,-1.54l-0.8,-1.08l-1.21,-2.88l0.87,-1.62l-1.27,-4.13l-1.17,-1.53l2.47,-0.63l7.03,0.03ZM451.71,428.77l-0.47,-1.26l1.25,-1.11l0.32,0.3l-0.99,1.03l-0.12,1.04Z",
      "name": "Angola"
    },
    "AR": {
      "path": "M258.05,471.85l1.38,1.83l0.68,-0.08l0.87,-1.93l2.39,0.09l4.94,4.92l2.17,0.51l2.99,1.99l2.47,1.04l0.26,0.88l-2.38,4.1l0.23,0.58l5.39,1.21l2.13,-0.46l2.46,-2.25l0.49,-2.47l0.76,-0.32l0.98,1.25l-0.04,1.9l-3.67,2.62l-2.85,2.79l-3.42,4.08l-1.3,5.37l0.01,2.9l-0.54,0.77l-0.36,3.52l3.15,2.82l-0.31,1.9l1.54,1.59l-0.1,1.23l-2.3,3.86l-3.55,1.64l-4.91,0.65l-2.7,-0.32l-0.43,0.5l0.5,1.83l-0.49,2.34l0.4,1.59l-1.21,0.94l-2.34,0.42l-2.29,-1.15l-1.41,0.93l0.41,3.97l1.69,1.02l1.41,-0.77l0.39,0.92l-2.08,0.99l-2.01,2.14l-0.47,3.69l-0.49,1.57l-2.34,0.12l-2.08,2.01l-0.63,3.07l2.46,2.67l2.21,0.74l-0.73,2.83l-2.84,2.04l-1.73,4.57l-2.18,1.47l-1.15,1.98l0.77,4.43l1.16,1.7l-2.44,-0.66l-5.82,-0.52l-0.91,-2.06l0.05,-2.9l-0.46,-0.4l-1.41,0.21l-0.69,-1.12l-0.2,-3.82l1.89,-1.73l0.79,-2.4l-0.26,-1.97l1.31,-3.13l0.91,-4.79l-0.23,-1.96l1.06,-0.95l-0.27,-1.32l-1.01,-0.76l0.63,-1.12l-0.05,-0.46l-1.05,-1.22l-0.53,-3.58l0.97,-0.92l-0.42,-4.02l1.21,-6.04l1.53,-1.49l-0.75,-3.06l-0.01,-2.68l1.79,-1.91l0.05,-2.76l1.43,-3.06l0.01,-2.77l-0.69,-0.77l-1.09,-4.84l1.48,-2.87l-0.19,-2.93l0.85,-2.48l1.59,-2.58l1.73,-1.72l0.05,-0.51l-0.61,-0.89l0.45,-0.89l-0.07,-4.37l2.71,-1.48l0.86,-2.84l-0.22,-0.73l1.77,-2.07l2.9,0.58ZM256.68,580.89l-1.95,0.18l-1.42,-1.53l-3.82,-0.12l-0.0,-7.37l1.57,3.7l3.26,2.57l3.18,1.01l-0.81,1.56Z",
      "name": "Argentina"
    },
    "AU": {
      "path": "M705.79,484.09l0.27,0.04l0.18,-0.47l-0.49,-1.51l0.92,1.16l0.45,0.15l0.28,-0.39l-0.09,-1.61l-1.99,-3.77l1.09,-3.43l-0.24,-1.62l0.34,-0.64l0.38,1.08l0.43,-0.19l0.99,-1.75l1.91,-0.85l1.29,-1.18l1.81,-0.93l0.95,-0.17l0.93,0.27l1.92,-0.97l1.46,-0.29l1.03,-0.82l1.44,0.04l2.78,-0.86l1.36,-1.18l0.71,-1.48l1.41,-1.28l0.3,-2.63l1.27,-1.61l0.78,1.67l0.54,0.19l1.07,-0.52l0.15,-0.59l-0.73,-1.02l0.45,-0.73l0.78,0.4l0.58,-0.3l0.28,-1.84l1.87,-2.17l1.12,-0.39l0.28,-0.58l0.62,0.17l0.5,-0.36l0.03,-0.38l1.87,-0.58l1.65,1.06l1.35,1.49l3.4,0.39l0.44,-0.54l-0.46,-1.24l1.05,-1.82l1.04,-0.62l0.14,-0.55l-0.25,-0.41l0.88,-1.19l1.31,-0.78l1.31,0.27l2.1,-0.48l0.31,-0.4l-0.05,-1.31l-0.92,-0.78l1.48,0.56l1.41,1.08l2.11,0.65l0.81,-0.21l1.4,0.71l1.69,-0.67l0.8,0.19l0.64,-0.33l0.71,0.78l-1.33,1.96l-0.71,0.07l-0.35,0.51l0.24,0.87l-1.52,2.38l0.12,1.06l2.15,1.66l1.97,0.86l3.04,2.4l1.97,0.66l0.54,0.89l2.72,0.87l1.84,-1.12l2.07,-6.05l-0.43,-3.63l0.3,-1.75l0.47,-0.87l-0.32,-0.69l1.09,-3.31l0.46,-0.47l0.4,0.71l0.17,1.52l0.65,0.53l0.15,1.04l0.85,1.22l0.12,2.41l0.9,2.03l0.57,0.18l1.3,-0.79l1.69,1.73l-0.2,1.09l0.53,2.23l0.39,1.32l0.68,0.49l0.6,1.99l-0.2,1.51l0.81,1.79l2.87,1.56l3.14,2.21l-0.12,0.78l1.38,1.62l0.95,2.84l0.58,0.22l0.71,-0.42l0.8,0.92l0.61,0.01l0.46,2.48l4.82,4.87l0.66,2.1l-0.07,3.44l1.15,2.31l-0.13,2.37l-1.1,3.88l0.04,1.73l-0.48,2.02l-1.05,2.56l-1.9,1.57l-1.73,3.77l-2.38,6.57l-0.24,3.08l-1.15,0.88l-2.86,0.16l-2.31,1.3l-2.5,2.46l-1.81,-1.24l-1.29,-0.49l0.31,-1.32l-0.55,-0.46l-1.5,0.69l-2.01,2.12l-7.1,-2.39l-1.49,-1.79l-1.13,-4.06l-1.45,-1.37l-1.84,-0.28l0.58,-1.28l-0.61,-2.26l-0.73,-0.1l-1.14,1.96l-0.94,0.24l0.6,-0.77l0.44,-1.84l0.99,-1.67l-0.2,-2.22l-0.28,-0.35l-0.43,0.13l-2.0,2.51l-1.51,1.0l-0.93,2.15l-1.35,-0.87l-0.01,-1.63l-1.57,-2.18l-1.11,-0.96l0.27,-0.39l-0.13,-0.58l-3.21,-1.8l-1.84,-0.13l-2.55,-1.44l-4.58,0.3l-6.02,2.02l-2.54,-0.14l-2.62,1.5l-2.13,0.67l-1.49,2.78l-3.48,0.33l-2.3,-0.54l-3.48,0.46l-1.6,1.58l-0.81,-0.03l-2.36,1.75l-3.24,-0.11l-3.72,-2.38l0.04,-1.18l1.19,-0.49l0.48,-0.93l0.21,-3.17l-0.28,-1.75l-1.34,-3.02l-0.39,-1.56l0.06,-1.8l-0.96,-1.79l-0.17,-1.0l-1.02,-1.04l-0.29,-2.09l-1.15,-1.85ZM784.91,527.24l2.67,1.14l3.23,-1.06l1.08,0.16l0.16,3.5l-0.85,1.25l-0.18,1.86l-0.27,-0.29l-0.62,0.04l-1.56,2.15l-1.66,-0.2l-1.41,-2.68l-0.37,-2.29l-1.4,-2.82l0.04,-0.96l1.14,0.2Z",
      "name": "Australia"
    },
    "AT": {
      "path": "M462.92,275.34l0.01,2.75l-1.06,0.01l-0.34,0.61l0.39,0.64l-1.07,2.55l-2.0,0.08l-1.34,0.81l-5.27,-1.14l-0.48,-1.1l-0.47,-0.23l-2.47,0.64l-0.42,0.58l-2.45,-0.51l-0.75,-0.44l0.44,-1.16l1.11,0.9l0.63,-0.17l0.25,-0.69l1.91,0.14l1.87,-0.66l0.97,0.09l0.68,0.66l0.65,-0.15l0.25,-0.83l-0.31,-2.16l0.82,-0.52l0.68,-1.35l1.49,0.98l0.52,-0.07l1.34,-1.47l0.61,-0.2l1.79,1.07l1.3,-0.12l0.74,0.46Z",
      "name": "Austria"
    },
    "IN": {
      "path": "M623.36,335.51l-1.27,1.12l-0.97,2.68l0.21,0.5l8.04,4.05l3.43,0.39l1.57,1.44l4.92,0.91l2.18,-0.04l0.38,-0.3l0.29,-1.28l-0.32,-1.72l0.15,-0.92l0.82,-0.32l0.44,2.59l2.28,1.07l1.78,-0.4l4.14,0.1l0.38,-0.36l0.18,-1.73l-0.53,-0.69l1.4,-0.31l2.25,-2.09l2.69,-1.7l1.92,0.64l1.8,-1.03l0.8,1.22l-0.69,0.98l0.26,0.63l2.42,0.38l0.09,0.52l-0.83,0.77l0.13,1.14l-1.53,-0.3l-3.24,1.94l-0.12,1.84l-1.32,2.23l-0.17,1.44l-0.93,1.89l-1.63,-0.52l-0.52,0.37l-0.09,2.72l-0.56,1.13l0.2,0.85l-0.53,0.28l-1.18,-3.85l-1.08,-0.27l-0.38,0.31l-0.24,1.03l-0.66,-0.68l0.55,-1.12l1.21,-0.35l1.15,-2.33l-0.23,-0.56l-1.58,-0.49l-4.33,-0.29l-0.19,-1.63l-0.35,-0.35l-1.11,-0.13l-1.91,-1.16l-0.57,0.17l-0.88,1.89l0.11,0.48l1.38,1.12l-1.11,0.73l-0.69,1.14l0.18,0.55l1.24,0.59l-0.32,1.59l0.85,2.01l0.36,2.08l-0.22,0.62l-4.58,0.54l-0.33,0.42l0.13,1.86l-1.18,1.39l-3.65,1.85l-2.79,3.1l-4.32,3.33l-0.18,1.29l-4.65,1.82l-0.77,2.19l0.64,5.37l-1.06,2.51l-0.01,3.97l-1.24,0.28l-1.14,1.94l0.39,0.85l-1.69,0.53l-1.04,1.84l-0.65,0.47l-2.06,-2.06l-2.1,-6.05l-2.2,-3.67l-1.05,-4.8l-2.29,-3.61l-1.76,-8.34l0.01,-3.18l-0.49,-2.59l-0.55,-0.29l-3.53,1.56l-1.52,-0.28l-2.87,-2.86l0.86,-0.7l0.08,-0.54l-0.74,-1.06l-2.68,-2.13l1.26,-1.38l5.33,0.01l0.39,-0.48l-0.5,-2.37l-1.42,-1.51l-0.27,-2.01l-1.44,-1.26l2.33,-2.5l3.05,0.07l2.62,-2.99l1.6,-2.96l2.4,-2.88l0.06,-2.16l1.98,-1.58l-0.01,-0.64l-1.93,-1.4l-0.82,-1.91l-0.81,-2.4l0.91,-0.97l3.58,0.7l2.93,-0.45l2.32,-2.35l2.31,3.07l-0.24,2.31l0.99,1.68l-0.05,0.92l-1.34,-0.3l-0.48,0.47l0.7,3.26l2.61,2.09l3.02,1.77Z",
      "name": "India"
    },
    "TZ": {
      "path": "M495.56,426.32l2.8,-3.13l-0.02,-0.82l-0.64,-1.3l0.68,-0.52l0.14,-1.47l-0.76,-1.25l0.31,-0.11l2.26,0.03l-0.51,2.76l0.76,1.3l0.5,0.12l1.05,-0.53l1.19,-0.12l0.61,0.24l1.43,-0.62l0.1,-0.67l-0.71,-0.62l1.57,-1.7l8.65,4.86l0.32,1.53l3.34,2.33l-1.05,2.81l0.13,1.61l1.63,1.12l-0.6,1.77l-0.01,2.33l1.89,4.05l0.57,0.44l-1.47,1.09l-2.61,0.95l-1.43,-0.04l-1.06,0.77l-2.29,0.36l-2.87,-0.69l-0.83,0.07l-0.64,-0.75l-0.31,-2.8l-1.32,-1.36l-3.25,-0.77l-3.96,-1.59l-1.18,-2.42l-0.32,-1.75l-1.76,-1.49l0.42,-1.05l-0.44,-0.89l0.08,-0.96l-0.46,-0.58l0.06,-0.56Z",
      "name": "Tanzania"
    },
    "AZ": {
      "path": "M539.27,301.57l1.33,0.36l0.44,-0.21l0.4,-0.78l1.11,-1.01l2.3,3.71l1.5,0.55l-1.32,0.17l-0.34,0.33l-0.81,3.49l-0.98,1.01l0.05,1.26l-1.28,-1.27l0.73,-1.34l-0.78,-1.39l-1.51,0.17l-2.32,1.87l-0.04,-1.43l-2.05,-1.48l0.5,-0.74l-0.07,-0.53l-1.07,-0.91l0.33,-0.54l-0.14,-0.55l-1.17,-1.02l1.91,0.73l1.71,0.07l0.37,-0.88l-1.01,-1.48l0.2,-0.14l0.4,0.06l1.63,1.92ZM533.76,306.94l0.63,0.52l0.69,-0.0l0.63,1.35l-0.71,-0.18l-1.25,-1.69Z",
      "name": "Azerbaijan"
    },
    "IE": {
      "path": "M405.07,254.34l0.37,2.67l-1.78,3.47l-4.21,2.28l-2.89,-0.5l1.83,-4.09l-1.24,-4.04l4.62,-4.68l0.33,1.5l-0.5,2.21l0.41,0.49l1.45,-0.06l1.61,0.75Z",
      "name": "Ireland"
    },
    "ID": {
      "path": "M756.47,417.79l0.69,4.01l2.79,1.78l0.51,-0.1l2.04,-2.59l2.71,-1.43l2.05,-0.0l3.9,1.73l2.46,0.45l0.08,15.16l-1.75,-1.55l-2.54,-0.51l-0.88,0.72l-2.32,0.06l0.69,-1.33l1.45,-0.64l0.23,-0.46l-0.65,-2.74l-1.24,-2.22l-5.04,-2.3l-2.09,-0.23l-3.68,-2.27l-0.55,0.13l-0.65,1.07l-0.52,0.12l-0.55,-1.89l-1.21,-0.78l1.84,-0.62l1.72,0.05l0.39,-0.52l-0.21,-0.66l-0.38,-0.28l-3.45,-0.0l-1.13,-1.48l-2.1,-0.43l-0.52,-0.61l2.69,-0.48l1.28,-0.78l3.66,0.94l0.3,0.71ZM757.91,430.25l-0.62,0.82l-0.1,-0.8l0.59,-1.12l0.13,1.1ZM747.38,422.88l0.34,0.72l-1.22,-0.57l-4.68,-0.1l0.27,-0.62l2.78,-0.09l2.52,0.67ZM741.05,415.14l-0.67,-2.88l0.64,-2.01l0.41,0.86l1.21,0.18l0.16,0.7l-0.1,1.68l-0.84,-0.16l-0.46,0.3l-0.34,1.34ZM739.05,423.4l-0.5,0.45l-1.34,-0.36l-0.17,-0.37l1.73,-0.08l0.27,0.36ZM721.45,414.41l-0.19,1.97l2.24,2.23l0.54,0.02l1.27,-1.07l2.75,-0.5l-0.9,1.21l-2.11,0.93l-0.16,0.6l2.22,3.01l-0.3,1.07l1.36,1.75l-2.26,0.85l-0.28,-0.31l0.12,-1.19l-1.64,-1.34l0.17,-2.24l-0.56,-0.39l-1.67,0.76l-0.23,0.39l0.3,6.18l-1.1,0.25l-0.69,-0.47l0.64,-2.21l-0.39,-2.42l-0.39,-0.34l-0.8,-0.01l-0.58,-1.29l0.98,-1.6l0.35,-1.96l1.32,-3.87ZM728.59,426.17l0.38,0.5l-0.02,1.28l-0.88,0.49l-0.53,-0.48l1.04,-1.79ZM729.04,416.88l0.27,-0.05l-0.02,0.13l-0.24,-0.08ZM721.68,413.95l0.16,-0.32l1.89,-1.65l1.83,0.68l3.16,0.35l2.94,-0.1l2.39,-1.66l-1.73,2.13l-1.66,0.43l-2.41,-0.48l-4.17,0.13l-2.39,0.51ZM730.55,440.42l1.11,-1.94l2.02,-0.82l0.08,0.62l-1.45,1.68l-1.77,0.46ZM728.12,435.8l-0.1,0.38l-3.46,0.66l-2.91,-0.27l-0.0,-0.25l1.54,-0.41l1.66,0.73l1.67,-0.19l1.61,-0.65ZM722.9,440.18l-0.64,0.03l-2.26,-1.21l1.12,-0.24l1.78,1.42ZM716.26,435.69l0.88,0.51l1.28,-0.17l0.2,0.35l-4.65,0.73l0.4,-0.67l1.15,-0.02l0.75,-0.74ZM711.66,423.74l-0.38,-0.16l-2.54,1.01l-1.12,-1.44l-1.69,-0.13l-1.16,-0.75l-3.04,0.77l-1.1,-1.15l-3.31,-0.11l-0.35,-3.05l-1.35,-0.95l-1.11,-1.98l-0.33,-2.06l0.27,-2.14l0.9,-1.01l0.37,1.15l2.09,1.49l1.53,-0.48l1.82,0.08l1.38,-1.19l1.0,-0.18l2.28,0.67l2.26,-0.53l1.52,-3.64l1.01,-0.99l0.78,-2.57l4.1,0.31l-1.11,1.77l0.02,0.46l1.7,2.2l-0.23,1.39l2.07,1.71l-2.33,0.42l-0.88,1.9l0.1,2.05l-2.4,1.9l-0.06,2.45l-0.7,2.79ZM692.58,431.94l0.35,0.26l4.8,0.25l0.78,-0.97l4.17,1.09l1.13,1.69l3.69,0.45l2.14,1.05l-1.8,0.61l-2.77,-1.0l-4.8,-0.12l-5.24,-1.42l-1.84,-0.25l-1.11,0.3l-4.26,-0.97l-0.7,-1.14l-1.59,-0.13l1.18,-1.66l2.74,0.13l2.87,1.13l0.26,0.69ZM685.53,429.08l-2.22,0.04l-2.06,-2.04l-3.15,-2.01l-2.93,-3.52l-3.11,-5.33l-2.2,-2.12l-1.64,-4.06l-2.32,-1.69l-1.27,-2.07l-1.96,-1.5l-2.51,-2.65l-0.11,-0.66l4.81,0.53l2.15,2.38l3.31,2.74l2.35,2.66l2.7,0.17l1.95,1.59l1.54,2.17l1.59,0.95l-0.84,1.71l0.15,0.52l1.44,0.87l0.79,0.1l0.4,1.58l0.87,1.4l1.96,0.39l1.0,1.31l-0.6,3.01l-0.09,3.51Z",
      "name": "Indonesia"
    },
    "UA": {
      "path": "M493.77,283.66l1.85,0.21l0.66,-0.27l0.1,-0.68l-0.25,-0.87l-0.8,-0.85l-0.34,-1.43l-0.87,-0.71l0.01,-1.37l-1.13,-1.01l-1.16,-0.23l-2.07,-1.18l-1.66,0.37l-0.67,0.55l-0.9,-0.0l-0.86,0.91l-1.69,0.33l-0.76,0.47l-1.18,-0.82l-3.05,-0.42l-0.9,0.48l-0.22,-0.62l-1.16,-0.85l0.86,-1.88l0.25,0.1l0.53,-0.51l-0.57,-1.53l2.08,-2.96l1.38,-0.69l0.26,-1.34l-1.09,-3.02l0.9,-0.18l1.27,-1.02l1.78,-0.08l2.45,0.31l2.87,0.98l1.87,0.08l0.85,0.53l1.06,-0.47l0.78,0.77l2.17,-0.18l0.91,0.35l0.54,-0.34l0.15,-1.9l0.58,-0.67l2.82,-0.06l0.87,-0.86l3.0,-0.22l1.29,1.86l-0.53,0.89l0.21,1.25l0.36,0.33l1.78,0.17l0.93,2.49l3.18,1.38l1.95,-0.52l1.69,1.77l1.39,-0.04l3.36,1.15l0.02,0.75l-0.97,1.91l0.49,2.26l-0.28,0.89l-2.37,0.33l-1.29,1.04l-0.21,1.6l-1.85,0.32l-1.58,1.12l-2.41,0.24l-2.16,1.36l-0.19,0.36l0.32,2.54l1.49,0.93l1.92,-0.16l-0.18,0.47l-2.65,0.61l-3.21,1.92l-0.89,-0.46l0.44,-1.33l-0.24,-0.5l-2.27,-0.86l2.41,-1.32l0.12,-0.62l-0.93,-0.95l-3.62,-0.85l-0.14,-1.08l-0.47,-0.34l-2.32,0.45l-2.91,4.52l-1.19,-0.45l-0.98,0.48l-0.36,-0.21l1.35,-2.93Z",
      "name": "Ukraine"
    },
    "QA": {
      "path": "M549.32,350.8l-0.76,-0.24l-0.14,-1.72l0.84,-1.35l0.47,0.54l0.04,1.41l-0.45,1.36Z",
      "name": "Qatar"
    },
    "MZ": {
      "path": "M508.58,448.77l-0.34,-2.6l0.51,-2.07l3.55,0.64l2.51,-0.38l1.02,-0.76l1.49,0.01l2.74,-0.99l1.66,-1.21l0.51,9.32l0.41,1.25l-0.68,1.69l-0.93,1.74l-1.5,1.52l-5.16,2.32l-2.78,2.78l-1.02,0.54l-1.71,1.84l-0.98,0.59l-0.35,2.45l1.16,1.99l0.49,2.24l0.43,0.31l-0.06,2.14l-0.39,1.21l0.5,0.73l-0.25,0.78l-0.92,0.86l-5.13,2.47l-1.22,1.39l0.21,1.17l0.59,0.4l-0.11,0.78l-1.22,-0.02l-0.73,-3.1l0.42,-3.19l-1.78,-5.56l2.49,-2.89l0.69,-1.93l0.44,-0.43l0.28,-1.57l-0.39,-0.94l0.59,-3.72l-0.01,-3.32l-1.48,-1.17l-1.2,-0.23l-1.74,-1.18l-1.92,0.0l-0.3,-2.12l7.06,-1.98l1.28,1.1l0.89,-0.1l0.67,0.45l0.1,0.75l-0.51,1.3l0.19,1.83l1.75,1.86l0.65,-0.13l0.71,-1.68l1.17,-0.86l-0.26,-3.51l-1.05,-1.87l-1.04,-0.95Z",
      "name": "Mozambique"
    }
  },
  "height": 583.0802520919394,
  "projection": {
    "type": "merc",
    "centralMeridian": 11.5
  },
  "width": 900.0
})