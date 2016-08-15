import {MetricsPanelCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
import kbn from 'app/core/utils/kbn';
import rendering from './rendering';
import tinycolor from './tinycolor2/tinycolor';

export class CubismChartCtrl extends MetricsPanelCtrl {

  constructor($scope, $injector, $rootScope) {
    super($scope, $injector);
    this.$rootScope = $rootScope;
    this.data = [];
    this.seriesNames = [];
    this.defaultBands = [
      {
        negative: [{rgb: "rgb(8,81,156)"}, {rgb: "rgb(49,130,189)"}, {rgb: "rgb(107,174,214)"}, {rgb: "rgb(189,215,231)"}],
        positive: [{rgb: "rgb(186,228,179)"}, {rgb: "rgb(116,196,118)"}, {rgb: "rgb(49,163,84)"}, {rgb: "rgb(0,109,44)"}]
      },
      {
        negative: [{rgb: "rgb(8,81,156)"}, {rgb: "rgb(49,130,189)"}, {rgb: "rgb(107,174,214)"}, {rgb: "rgb(189,215,231)"}],
        positive: [{rgb: "#bae4b3"}, {rgb: "#ffff00"}, {rgb: "#ff8000"}, {rgb: "#ff0000"}]
      },
      {
        negative: [{rgb: "rgb(8,81,156)"}, {rgb: "rgb(49,130,189)"}, {rgb: "rgb(107,174,214)"}, {rgb: "rgb(189,215,231)"}],
        positive: [{rgb: "rgb(255, 198, 198)"}, {rgb: "rgb(255, 147, 147)"}, {rgb: "rgb(255, 96, 96)"}, {rgb: "rgb(255, 45, 45)"}]
      }
    ];

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

    _.defaults(this.panel, panelDefaults);
    _.defaults(this.panel.legend, panelDefaults.legend);

    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
  }

  getSeriesNames(self) {
    if (self.seriesNames) {
      return self.seriesNames;
    } else {
      return [];
    }
  };

  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/grafana-cubism-panel/editor.html', 2);
    this.unitFormats = kbn.getUnitFormats();
  }

  setUnitFormat(override, subItem) {
    override.format = subItem.value;
    this.render();
  }

  onDataError() {
    this.data = [];
    this.render();
  }

  changeSeriesColor(series, color) {
    series.color = color;
    this.panel.aliasColors[series.alias] = series.color;
    this.render();
  }

  onDataReceived(dataList) {
    this.data = dataList;
    this.seriesNames = dataList
      .map(function (series) {
        return series.alias || series.target;
      });
    this.render(this.data);
  }

  addSeriesOverride() {
    if (this.panel.seriesOverides == null || this.panel.seriesOverides == undefined) {
      this.panel.seriesOverides = [];
    }
    this.panel.seriesOverides.push(this.defaultSeriesOverride());
  }

  defaultSeriesOverride() {
    return {
      alias: "",
      summaryType: "average",
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

  bandsChange(override) {
    if (override.bands > 0 && override.bands <= 10) {
      this.adjustColorBands("-", override.bands, override.colors.negative);
      this.adjustColorBands("+", override.bands, override.colors.positive);
    }
    this.render();
  }

  adjustColorBands(which, bands, colorArray) {
    if (which == "+") {
      colorArray.reverse();
    }
    if (colorArray.length > bands) {
      colorArray.splice(0, colorArray.length - bands)
    } else if (colorArray.length < bands) {
      for (var i = 0; i < (bands - colorArray.length); i++) {
        colorArray.unshift({rgb: tinycolor(colorArray[0].rgb).darken(10).toRgbString()});
      }
    }
    if (which == "+") {
      colorArray.reverse();
    }
  }

  setBandsWith(override, defaultColor) {
    override.bands = defaultColor.positive.length;
    override.colors = _.cloneDeep(defaultColor);
  }

  removeSeriesOverride(index) {
    this.panel.seriesOverides.splice(index, 1);
    this.render();
  }

  getMatchingSeriesOverride(series) {
    var target = series.alias || series.target;
    var found = _.find(
      this.panel.seriesOverides,
      function (override) {
        if (override.alias && override.alias.length > 0) {
          if (override.alias[0] == "/" && override.alias[override.alias.length - 1] == "/") {
            var pattern = override.alias.substring(1,override.alias.length - 1);
            var re = new RegExp(pattern);
            return re.test(target);
          } else {
            return override.alias == target;
          }
        }
      }
    );
    return found || this.defaultSeriesOverride();
  }

  //noinspection JSMethodCanBeStatic
  link(scope, elem, attrs, ctrl) {
    rendering(scope, elem, attrs, ctrl);
  }
}

CubismChartCtrl.templateUrl = 'module.html';
