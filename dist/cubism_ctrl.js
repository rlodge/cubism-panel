'use strict';

System.register(['app/plugins/sdk', 'lodash', 'app/core/utils/kbn', './rendering', './tinycolor2/tinycolor'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, _, kbn, rendering, tinycolor, _createClass, CubismChartCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }, function (_rendering) {
      rendering = _rendering.default;
    }, function (_tinycolor2Tinycolor) {
      tinycolor = _tinycolor2Tinycolor.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('CubismChartCtrl', CubismChartCtrl = function (_MetricsPanelCtrl) {
        _inherits(CubismChartCtrl, _MetricsPanelCtrl);

        function CubismChartCtrl($scope, $injector, $rootScope) {
          _classCallCheck(this, CubismChartCtrl);

          var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(CubismChartCtrl).call(this, $scope, $injector));

          _this.$rootScope = $rootScope;
          _this.data = [];
          _this.seriesNames = [];
          _this.defaultBands = [{
            negative: [{ rgb: "rgb(8,81,156)" }, { rgb: "rgb(49,130,189)" }, { rgb: "rgb(107,174,214)" }, { rgb: "rgb(189,215,231)" }],
            positive: [{ rgb: "rgb(186,228,179)" }, { rgb: "rgb(116,196,118)" }, { rgb: "rgb(49,163,84)" }, { rgb: "rgb(0,109,44)" }]
          }, {
            negative: [{ rgb: "rgb(8,81,156)" }, { rgb: "rgb(49,130,189)" }, { rgb: "rgb(107,174,214)" }, { rgb: "rgb(189,215,231)" }],
            positive: [{ rgb: "#bae4b3" }, { rgb: "#ffff00" }, { rgb: "#ff8000" }, { rgb: "#ff0000" }]
          }, {
            negative: [{ rgb: "rgb(8,81,156)" }, { rgb: "rgb(49,130,189)" }, { rgb: "rgb(107,174,214)" }, { rgb: "rgb(189,215,231)" }],
            positive: [{ rgb: "rgb(255, 198, 198)" }, { rgb: "rgb(255, 147, 147)" }, { rgb: "rgb(255, 96, 96)" }, { rgb: "rgb(255, 45, 45)" }]
          }];

          var panelDefaults = {
            links: [],
            datasource: null,
            interval: null,
            targets: [{}],
            cacheTimeout: null,
            nullPointMode: 'connected',
            aliasColors: {},
            format: 'short',
            valueName: 'current',
            fontSize: '80%',
            seriesOverrides: []
          };

          _.defaults(_this.panel, panelDefaults);
          _.defaults(_this.panel.legend, panelDefaults.legend);

          _this.events.on('data-received', _this.onDataReceived.bind(_this));
          _this.events.on('data-error', _this.onDataError.bind(_this));
          _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_this));
          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          return _this;
        }

        _createClass(CubismChartCtrl, [{
          key: 'getSeriesNames',
          value: function getSeriesNames(self) {
            if (self.seriesNames) {
              return self.seriesNames;
            } else {
              return [];
            }
          }
        }, {
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.addEditorTab('Options', 'public/plugins/grafana-cubism-panel/editor.html', 2);
            this.unitFormats = kbn.getUnitFormats();
          }
        }, {
          key: 'setUnitFormat',
          value: function setUnitFormat(override, subItem) {
            override.format = subItem.value;
            this.render();
          }
        }, {
          key: 'onDataError',
          value: function onDataError() {
            this.data = [];
            this.render();
          }
        }, {
          key: 'changeSeriesColor',
          value: function changeSeriesColor(series, color) {
            series.color = color;
            this.panel.aliasColors[series.alias] = series.color;
            this.render();
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
            this.data = dataList;
            this.seriesNames = dataList.map(function (series) {
              return series.alias || series.target;
            });
            this.render(this.data);
          }
        }, {
          key: 'addSeriesOverride',
          value: function addSeriesOverride() {
            if (this.panel.seriesOverides == null || this.panel.seriesOverides == undefined) {
              this.panel.seriesOverides = [];
            }
            this.panel.seriesOverides.push(this.defaultSeriesOverride());
          }
        }, {
          key: 'defaultSeriesOverride',
          value: function defaultSeriesOverride() {
            return {
              alias: "",
              summaryType: "sum",
              extent: {
                low: null,
                high: null
              },
              format: "short",
              height: 30,
              bands: 4,
              colors: _.cloneDeep(this.defaultBands[0])
            };
          }
        }, {
          key: 'bandsChange',
          value: function bandsChange(override) {
            if (override.bands > 0 && override.bands <= 10) {
              this.adjustColorBands("-", override.bands, override.colors.negative);
              this.adjustColorBands("+", override.bands, override.colors.positive);
            }
            console.log(override.colors.positive);
            this.render();
          }
        }, {
          key: 'adjustColorBands',
          value: function adjustColorBands(which, bands, colorArray) {
            if (which == "+") {
              colorArray.reverse();
            }
            if (colorArray.length > bands) {
              colorArray.splice(0, colorArray.length - bands);
            } else if (colorArray.length < bands) {
              for (var i = 0; i < bands - colorArray.length; i++) {
                colorArray.unshift({ rgb: tinycolor(colorArray[0].rgb).darken(10).toRgbString() });
              }
            }
            if (which == "+") {
              colorArray.reverse();
            }
          }
        }, {
          key: 'setBandsWith',
          value: function setBandsWith(override, defaultColor) {
            override.bands = defaultColor.positive.length;
            override.colors = _.cloneDeep(defaultColor);
          }
        }, {
          key: 'removeSeriesOverride',
          value: function removeSeriesOverride(index) {
            this.panel.seriesOverides.splice(index, 1);
            this.render();
          }
        }, {
          key: 'getMatchingSeriesOverride',
          value: function getMatchingSeriesOverride(series) {
            var target = series.alias || series.target;
            var found = _.find(this.panel.seriesOverides, function (override) {
              if (override.alias && override.alias.length > 0) {
                if (override.alias[0] == "/" && override.alias[override.alias.length - 1] == "/") {
                  var pattern = override.alias.substring(1, override.alias.length - 1);
                  var re = new RegExp(pattern);
                  return re.test(target);
                } else {
                  return override.alias == target;
                }
              }
            });
            return found || this.defaultSeriesOverride();
          }
        }, {
          key: 'link',
          value: function link(scope, elem, attrs, ctrl) {
            rendering(scope, elem, attrs, ctrl);
          }
        }]);

        return CubismChartCtrl;
      }(MetricsPanelCtrl));

      _export('CubismChartCtrl', CubismChartCtrl);

      CubismChartCtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=cubism_ctrl.js.map
