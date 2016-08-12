'use strict';

System.register(['lodash', 'jquery', 'jquery.flot', 'jquery.flot.pie', './cubism/index'], function (_export, _context) {
  "use strict";

  var _, $, cubism;

  function link(scope, elem, attrs, ctrl) {
    var data, panel, context;
    var cubismContainer = elem.find('.cubism-panel').get(0);

    ctrl.events.on('render', function () {
      render();
      ctrl.renderingCompleted();
    });

    function render() {
      if (!ctrl.data) {
        return;
      }

      cubismContainer.innerHTML = "";
      context = cubism.context()
      //.serverDelay(scope.cubismServerDelay)
      .step(1000).size(Math.floor(d3.select(cubismContainer).node().getBoundingClientRect().width)).stop();

      data = ctrl.data;
      panel = ctrl.panel;

      if (setElementHeight()) {
        var random = function random(x) {
          var value = 0,
              values = [],
              i = 0,
              last;
          return context.metric(function (start, stop, step, callback) {
            start = +start, stop = +stop;
            last = isNaN(last) ? start : last;
            while (last < stop) {
              last += step;
              value = Math.max(-10, Math.min(10, value + .8 * Math.random() - .4 + .2 * Math.cos(i += x * .02)));
              values.push(value);
              values = values.slice((start - stop) / stop);
            }
            callback(null, values);
          }, x);
        };

        d3.select(cubismContainer).selectAll(".axis").data(["top", "bottom"]).enter().append("div").attr("class", function (d) {
          return d + " axis";
        }).each(function (d) {
          d3.select(this).call(context.axis().ticks(12).orient(d));
        });

        d3.select(cubismContainer).append("div").attr("class", "rule").call(context.rule());

        //this is where the metrics are created
        var Data = d3.range(1, 6).map(random);
        // var primary = Data[4];
        // var secondary = primary.shift(-30 * 60 * 1000); //why is this metric identical to the primary metric?
        // Data[5] = secondary;

        console.log(Data);

        d3.select(cubismContainer).selectAll(".horizon").data(Data).enter().insert("div", ".bottom").attr("class", "horizon").call(context.horizon().extent([-10, 10]));
      }
    }

    function setElementHeight() {
      try {
        var height = ctrl.height || panel.height || ctrl.row.height;
        if (_.isString(height)) {
          height = parseInt(height.replace('px', ''), 10);
        }

        height -= 5; // padding
        height -= panel.title ? 24 : 9; // subtract panel title bar

        cubismContainer.style.height = height + 'px';

        return true;
      } catch (e) {
        // IE throws errors sometimes
        console.log(e);
        return false;
      }
    }

    function formatter(label, slice) {
      return "<div style='font-size:" + ctrl.panel.fontSize + ";text-align:center;padding:2px;color:" + slice.color + ";'>" + label + "<br/>" + Math.round(slice.percent) + "%</div>";
    }
  }

  _export('default', link);

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_jquery) {
      $ = _jquery.default;
    }, function (_jqueryFlot) {}, function (_jqueryFlotPie) {}, function (_cubismIndex) {
      cubism = _cubismIndex.default;
    }],
    execute: function () {}
  };
});
//# sourceMappingURL=rendering.js.map
