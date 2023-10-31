function CesiumBaseMapsPickerMixin(viewer, options = {}) {
  const DEFAULT_OPTIONS = { containerSelector: '.cesium-viewer-toolbar' };
  
  options = {...DEFAULT_OPTIONS , ...options };

  function CesiumBaseMapsPicker(viewer, options) {
    this.viewer = viewer;
    this.options = options;
    this.baseLayerPicker = undefined;

    let currentModel = undefined;
    const baseMapsImageryProviders = this.options.baseMaps.maps.map((baseMapLayer) => {
      const providers = [];
      baseMapLayer.baseRasteLayers.sort((a, b) => a.zIndex - b.zIndex).forEach(layer => {
        switch (layer.type) {
          case 'WMS_LAYER':
            const wmsProvider = new Cesium.WebMapServiceImageryProvider(layer.options);
            wmsProvider.alpha = layer.opacity;
            providers.push(wmsProvider);
            break;
          case 'XYZ_LAYER':
            const xyzProvider = new Cesium.UrlTemplateImageryProvider(layer.options);
            xyzProvider.alpha = layer.opacity;
            providers.push(xyzProvider);
            break;

          case 'WMTS_LAYER':
            const wmtsLayerOptions = layer.options;
            wmtsLayerOptions.tilingScheme = new Cesium.GeographicTilingScheme();
            const wmtsProvider = new Cesium.WebMapTileServiceImageryProvider(wmtsLayerOptions);
            wmtsProvider.alpha = layer.opacity;
            providers.push(wmtsProvider);
            break;

          default:
            break;
        }
      });

      const providerModel = new Cesium.ProviderViewModel({
        name: baseMapLayer.title,
        tooltip: baseMapLayer.title,
        iconUrl: baseMapLayer.thumbnail,
        category: "",
        creationFunction: () => providers
      });

      if(baseMapLayer.isCurrent) {
        currentModel = providerModel;
      }

      return providerModel;
    });


    const baseLayerPicker = new Cesium.BaseLayerPicker(
      document.querySelector(this.options.containerSelector), {
        globe: viewer.scene.globe,
        selectedImageryProviderViewModel: currentModel,
        imageryProviderViewModels: baseMapsImageryProviders
    });

    document.querySelector('.cesium-baseLayerPicker-sectionTitle').innerHTML = "מפות בסיס";

    this.baseLayerPicker = baseLayerPicker;

    this.destroy = () => {
      Cesium.destroyObject(this.baseLayerPicker);
      return Cesium.destroyObject(this);

    }
  }

  if (typeof Cesium === "undefined") {
      throw new Error("[CesiumBaseMapsMixin] Cesium is required.");
  }

  if (!Cesium.defined(viewer)) {
      throw new Cesium.DeveloperError("[CesiumBaseMapsMixin] Viewer is required.");
  }

  if(typeof options.baseMaps === 'undefined') {
    throw new Cesium.DeveloperError("[CesiumBaseMapsMixin] baseMaps are required.");
  }

  const cesiumBaseMapPicker = new CesiumBaseMapsPicker(viewer, options);

  const viewerDestoryFunc = viewer.destroy;

  viewer.destroy = function () {
      viewerDestoryFunc.apply(viewer, arguments);
      cesiumBaseMapPicker.destroy();
  };

  Object.defineProperties(viewer, {
      baseMapsPicker: {
          get: function () {
              return cesiumBaseMapPicker;
          }
      }
  });
}