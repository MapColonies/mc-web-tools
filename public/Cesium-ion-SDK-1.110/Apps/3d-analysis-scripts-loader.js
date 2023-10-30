// This script should solve issues regarding browser caching after new app version is published.
// searchParams.get("version") === docker image tag, new image tag -> new version -> browser will not use cached script.

(() => {
  const searchParams = new URLSearchParams(window.location.search.substring(1));
  const app_version = searchParams.get("version") || 'NO_VERSION';
  const timestamp = new Date().getTime().toString();
  
  document.write(`<script sync src="../../env-config.js?timestamp=${timestamp}"><\/script>`);
  document.write(`<script sync src="../Build/CesiumUnminified/Cesium.js?version=${app_version}"><\/script>`);
  document.write(`<script sync src="./intl-overrides/cesium-measurments-override.js?version=${app_version}"><\/script>`);
  document.write(`<script src="../../viewerCesiumNavigationMixin.js?version=${app_version}"><\/script>`);
  document.write(`<script src="../../CesiumSdkViewshedMixin/CesiumSdkViewshedMixin.js?version=${app_version}"><\/script>`);
  document.write(`<script src="./utils.js?version=${app_version}"><\/script>`);

  document.write(`<link rel="stylesheet" href="../Build/CesiumUnminified/Widgets/widgets.css?version=${app_version}">`);
  document.write(`<link rel="stylesheet" href="../../CesiumSdkViewshedMixin/CesiumSdkViewshedMixin.css?version=${app_version}">`);
  document.write(`<link rel="stylesheet" href="./3d-analysis.css?version=${app_version}">`);
})()