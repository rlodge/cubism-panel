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
      if (!(ctrl.data && ctrl.data.length > 0)) {
        return;
      }

      var firstSeries = ctrl.data[0].datapoints;
      var earliest = firstSeries[0][1];
      var latest = firstSeries[firstSeries.length - 1][1];
      var seriesLength = firstSeries.length;
      var size = Math.floor(d3.select(cubismContainer).node().getBoundingClientRect().width);
      var step = Math.floor((latest - earliest) / size);
      var seriesStep = Math.floor((latest - earliest) / (seriesLength - 1));
      var serverDelay = Date.now() - latest;
      // console.log(earliest + ":" + new Date(earliest));
      // console.log(latest + ":" + new Date(latest));
      // console.log(seriesLength);
      // console.log(step);

      var cubismTimestamps = [];
      for (var ts = earliest; ts <= latest; ts = ts + step) {
        cubismTimestamps.push(ts);
      }

      /*
      First we need the server delay to be at the right place (now - latest)
       */

      cubismContainer.innerHTML = "";
      context = cubism.context().serverDelay(serverDelay).step(step).size(size).stop();

      data = ctrl.data;
      panel = ctrl.panel;

      if (setElementHeight()) {
        d3.select(cubismContainer).selectAll(".axis").data(["top", "bottom"]).enter().append("div").attr("class", function (d) {
          return d + " axis";
        }).each(function (d) {
          d3.select(this).call(context.axis().ticks(12).orient(d));
        });

        d3.select(cubismContainer).append("div").attr("class", "rule").call(context.rule());

        var cubismData = data.map(function (series, seriesIndex) {
          return convertDataToCubism(series, seriesIndex, cubismTimestamps);
        });
        console.log(cubismData);
        // var primary = Data[4];
        // var secondary = primary.shift(-30 * 60 * 1000); //why is this metric identical to the primary metric?
        // Data[5] = secondary;

        d3.select(cubismContainer).selectAll(".horizon").data(cubismData).enter().insert("div", ".bottom").attr("class", "horizon").call(context.horizon().extent([-10, 10]));
      }
    }

    function convertDataToCubism(series, seriesIndex, timestamps) {
      return context.metric(function (start, stop, step, callback) {
        var dataPoints = series.datapoints;
        var values = [];
        if (timestamps.length == dataPoints.length) {
          values = dataPoints.map(function (point) {
            return point[0];
          });
        } else if (timestamps.length > dataPoints.length) {
          var pointIndex = 0;
          values = _.chain(timestamps).map(function (ts, tsIndex) {
            var point = dataPoints[pointIndex];
            var nextPoint = null;
            if (pointIndex + 1 < dataPoints.length) {
              nextPoint = dataPoints[pointIndex + 1];
            }
            if (nextPoint == null || ts < nextPoint[1]) {
              return point[0];
            } else {
              pointIndex++;
              return nextPoint[0];
            }
          }).value();
        } else {
          var lastPointIndex = 0;
          values = _.chain(timestamps).map(function (ts, tsIndex) {
            var nextTs = null;
            if (tsIndex + 1 < timestamps.length) {
              nextTs = timestamps[tsIndex + 1];
            }
            var values = dataPoints.filter(function (point) {
              return point[1] >= ts && (nextTs == null || point[1] < nextTs);
            }).map(function (point) {
              return point[0];
            });
            return averageValues(values);
          }).value();
        }
        callback(null, values);
      }, series.target);
    }

    function sumValues(values) {
      return values.reduce(function (a, b) {
        return a + b;
      });
    }

    function averageValues(values) {
      var sum = values.reduce(function (a, b) {
        return a + b;
      });
      return sum / values.length;
    }

    function maxValue(values) {
      return values.reduce(function (a, b) {
        return Math.max(a, b);
      });
    }

    function minValue(values) {
      return values.reduce(function (a, b) {
        return Math.min(a, b);
      });
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
