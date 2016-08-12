import _ from 'lodash';
import {CubismChartCtrl} from './cubism_ctrl';
import {loadPluginCss} from 'app/plugins/sdk';

loadPluginCss({
  dark: 'plugins/grafana-cubism-panel/css/cubism_dark.css',
  light: 'plugins/grafana-cubism-panel/css/cubism_light.css'
});

export {
  CubismChartCtrl as PanelCtrl
};
