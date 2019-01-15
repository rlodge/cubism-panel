'use strict';

System.register(['lodash', 'app/core/utils/kbn', 'jquery.flot', 'jquery.flot.pie', './cubism/index'], function (_export, _context) {
  "use strict";

  var _, kbn, cubism;

  function link(scope, elem, attrs, ctrl) {
    var data, panel, context, cubismHeight;
    var anHour = 60 * 60 * 1000;
    var aDay = 24 * anHour;
    var aWeek = 7 * aDay;
    var aMonth = 4 * aWeek;

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
      var span = latest - earliest;
      var size = Math.floor(d3.select(cubismContainer).node().getBoundingClientRect().width);
      var step = Math.floor((latest - earliest) / size);
      var serverDelay = Date.now() - latest;

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

      var cubismData = data.map(function (series, seriesIndex) {
        return convertDataToCubism(series, seriesIndex, cubismTimestamps);
      });

      cubismHeight = 0;

      cubismData.forEach(function (d) {
        cubismHeight = cubismHeight + d.override.height;
      });

      cubismHeight = cubismHeight + 60;

      if (setElementHeight()) {
        d3.select(cubismContainer).selectAll(".axis").data(["top", "bottom"]).enter().append("div").attr("class", function (d) {
          return d + " axis";
        }).each(function (d) {
          var scale = d3.time.hour;
          var count = 6;
          if (span < 2 * anHour) {
            var scale = d3.time.minute;
            var count = 15;
          } else if (span < 12 * anHour) {
            var scale = d3.time.hour;
            var count = 1;
          } else if (span < aDay) {
            var scale = d3.time.hour;
            var count = 3;
          } else if (span < 2 * aDay) {
            var scale = d3.time.hour;
            var count = 6;
          } else if (span < 2 * aWeek) {
            var scale = d3.time.day;
            var count = 1;
          } else if (span < 2 * aMonth) {
            var scale = d3.time.day;
            var count = 2;
          }
          d3.select(this).call(context.axis().ticks(scale, count).orient(d));
        });

        d3.select(cubismContainer).append("div").attr("class", "rule").call(context.rule());

        d3.select(cubismContainer).call(function (div) {
          function fn(d, i) {
            var thisHorizon = this;
            var extent = null;
            if (d.override.extent.low != null && d.override.extent.high != null && d.override.extent.low != undefined && d.override.extent.high != undefined) {
              extent = [d.override.extent.low, d.override.extent.high];
            }
            var formatFn = kbn.valueFormats[d.override.format];
            d3.select(thisHorizon).call(context.horizon().colors(d.override.colors.negative.concat(d.override.colors.positive).map(function (c) {
              return c.rgb;
            })).height(d.override.height).format(function (value) {
              if (isNaN(value) || value == null || value == undefined) {
                return "";
              } else {
                return formatFn(value);
              }
            }).extent(extent));
          }

          var allHorizons = div.selectAll('.horizon').data(cubismData);

          allHorizons.each(fn);

          allHorizons.enter().insert("div", ".bottom").attr("class", "horizon").each(fn);
        });
      }
    }

    function convertDataToCubism(series, seriesIndex, timestamps) {
      var override = ctrl.getMatchingSeriesOverride(series);
      var metric = context.metric(function (start, stop, step, callback) {
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
            if (override.summaryType == "sum") {
              return sumValues(values);
            } else if (override.summaryType == "min") {
              return minValue(values);
            } else if (override.summaryType == "max") {
              return maxValue(values);
            } else {
              return averageValues(values);
            }
          }).value();
        }
        callback(null, values);
      }, series.target);
      metric.override = override;
      return metric;
    }

    function sumValues(values) {
      return values.reduce(function (a, b) {
        return a + b;
      }, 0);
    }

    function averageValues(values) {
      var sum = values.reduce(function (a, b) {
        return a + b;
      }, 0);
      return sum / values.length;
    }

    function maxValue(values) {
      return values.reduce(function (a, b) {
        return Math.max(a, b);
      }, 0);
    }

    function minValue(values) {
      return values.reduce(function (a, b) {
        return Math.min(a, b);
      }, 0);
    }

    function setElementHeight() {
      try {
        var height = ctrl.height || panel.height || ctrl.row.height;
        if (_.isString(height)) {
          height = parseInt(height.replace('px', ''), 10);
        }

        height -= 5; // padding
        height -= panel.title ? 24 : 9; // subtract panel title bar

        height = Math.max(height, cubismHeight);

        cubismContainer.style.height = height + 'px';
        cubismContainer.style.minHeight = height + 'px';

        return true;
      } catch (e) {
        // IE throws errors sometimes
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
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }, function (_jqueryFlot) {}, function (_jqueryFlotPie) {}, function (_cubismIndex) {
      cubism = _cubismIndex.default;
    }],
    execute: function () {}
  };
});
//# sourceMappingURL=rendering.js.map
