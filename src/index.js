import React from 'react';
import ReactDOM from 'react-dom';
import 'spectre.css/dist/spectre.min.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import './index.css';

var owa_baseUrl = 'https://owa.internal.oleg.kim/';
var owa_cmds = owa_cmds || [];
owa_cmds.push(['setSiteId', '1c5802ac80efdccb69782296aee2bae7']);
owa_cmds.push(['trackPageView']);
owa_cmds.push(['trackClicks']);

(function () {
  var _owa = document.createElement('script'); _owa.type = 'text/javascript'; _owa.async = true;
  owa_baseUrl = ('https:' == document.location.protocol ? window.owa_baseSecUrl || owa_baseUrl.replace(/http:/, 'https:') : owa_baseUrl);
  _owa.src = owa_baseUrl + 'modules/base/js/owa.tracker-combined-min.js';
  var _owa_s = document.getElementsByTagName('script')[0]; _owa_s.parentNode.insertBefore(_owa, _owa_s);
}());


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
