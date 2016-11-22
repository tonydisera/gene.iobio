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
        var fill = $(actual).css('fill');
        return {
          pass: Color(fill).toCSS() === Color(expected).toCSS()
        };
      }
    };
  },
  toHaveStroke: function() {
    return {
      compare: function (actual, expected) {
        var fill = $(actual).css('stroke');
        return {
          pass: Color(fill).toCSS() === Color(expected).toCSS()
        };
      }
    };
  }
};
