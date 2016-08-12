'use strict';

System.register(['lodash', './cubism_ctrl', 'app/plugins/sdk'], function (_export, _context) {
  "use strict";

  var _, CubismChartCtrl, loadPluginCss;

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_cubism_ctrl) {
      CubismChartCtrl = _cubism_ctrl.CubismChartCtrl;
    }, function (_appPluginsSdk) {
      loadPluginCss = _appPluginsSdk.loadPluginCss;
    }],
    execute: function () {

      loadPluginCss({
        dark: 'plugins/grafana-cubism-panel/css/cubism_dark.css',
        light: 'plugins/grafana-cubism-panel/css/cubism_light.css'
      });

      _export('PanelCtrl', CubismChartCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map
