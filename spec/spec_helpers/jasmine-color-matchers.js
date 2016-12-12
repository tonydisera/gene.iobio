(function(global, $) {

  var jasmineColorMatchers = {
    toHaveColor: function () {
      return {
        compare: function (actual, expected) {
          return {
            pass: Color(actual).toCSS() === Color(expected).toCSS()
          };
        }
      };
    },
    toHaveFill: function(){
      return {
        compare: function (actual, expected) {
          var fill = removeAlphaFromRGBA($(actual).css('fill'));
          return {
            pass: Color(fill).toCSS() === Color(expected).toCSS()
          };
        }
      };
    },
    toHaveStroke: function() {
      return {
        compare: function (actual, expected) {
          var fill = removeAlphaFromRGBA($(actual).css('stroke'));
          return {
            pass: Color(fill).toCSS() === Color(expected).toCSS()
          };
        }
      };
    }
  };

  function removeAlphaFromRGBA(fill) {
    if (fill.slice(0,4) === 'rgba') {
      var values = fill.slice(5, -1).split(',');
      values.pop();
      return 'rgb(' + values.join(',') + ')';
    }
    return fill;
  }

  global.jasmineColorMatchers = jasmineColorMatchers;
})(window, jQuery);