import { CesiumGeographicTilingScheme } from '@map-colonies/react-components';
import { IRasterLayer } from '@map-colonies/react-components/dist/cesium-map/layers-manager';
import { IBaseMap, IBaseMaps } from '@map-colonies/react-components/dist/cesium-map/settings/settings';

const MAP_CENTER = (window as any)._env_.MAP_CENTER;
const MAP_ZOOM = (window as any)._env_.MAP_ZOOM;
const BASE_MAPS = JSON.parse((window as any)._env_.BASE_MAPS);
const DEFAULT_TERRAIN_PROVIDER_URL = (window as any)._env_.DEFAULT_TERRAIN_PROVIDER_URL;

export enum LinkType {
  WMTS_LAYER = 'WMTS_LAYER',
  XYZ_LAYER = 'XYZ_LAYER',
  THREE_D_LAYER = '3D_LAYER',
  THREE_D_TILES = '3DTiles',
  TERRAIN_QMESH = 'TERRAIN_QMESH',
  WMTS = 'WMTS',
  WMS = 'WMS',
  WCS = 'WCS',
  THUMBNAIL_S = 'THUMBNAIL_S',
  THUMBNAIL_M = 'THUMBNAIL_M',
  THUMBNAIL_L = 'THUMBNAIL_L',
  LEGEND_DOC = 'LEGEND_DOC',
  LEGEND_IMG = 'LEGEND_IMG',
  LEGEND = 'LEGEND'
}

const enrichBaseMaps = (baseMaps: IBaseMaps): IBaseMaps => {
  return {
    maps: baseMaps.maps.map((baseMap: IBaseMap) => {
      return {
        ...baseMap,
        baseRasteLayers: (baseMap.baseRasteLayers as IRasterLayer[]).map((rasterLayer) => {
          return {
            ...rasterLayer,
            options: {
              ...rasterLayer.options,
              tilingScheme: (rasterLayer.type === LinkType.WMTS_LAYER) ? new CesiumGeographicTilingScheme() : undefined
            }
          };
        })
      }
    })
  }
};

class Config {
  public mapCenter = MAP_CENTER || '[34.817, 31.911]';
  public mapZoom = MAP_ZOOM || '5';
  public baseMaps = enrichBaseMaps(BASE_MAPS) || '{"maps":[{"id":"1st","title":"1st Map","isCurrent":true,"thumbnail":"https://nsw.digitaltwin.terria.io/build/3456d1802ab2ef330ae2732387726771.png","baseRasteLayers":[{"id":"GOOGLE_TERRAIN","type":"XYZ_LAYER","opacity":1,"zIndex":0,"options":{"url":"https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}","layers":"","credit":"GOOGLE"}},{"id":"INFRARED_RASTER","type":"WMS_LAYER","opacity":0.6,"zIndex":1,"options":{"url":"https://mesonet.agron.iastate.edu/cgi-bin/wms/goes/conus_ir.cgi?","layers":"goes_conus_ir","credit":"Infrared data courtesy Iowa Environmental Mesonet","parameters":{"transparent":"true","format":"image/png"}}}],"baseVectorLayers":[]},{"id":"2nd","title":"2nd Map","thumbnail":"https://nsw.digitaltwin.terria.io/build/efa2f6c408eb790753a9b5fb2f3dc678.png","baseRasteLayers":[{"id":"RADAR_RASTER","type":"WMS_LAYER","opacity":0.6,"zIndex":1,"options":{"url":"https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi?","layers":"nexrad-n0r","credit":"Radar data courtesy Iowa Environmental Mesonet","parameters":{"transparent":"true","format":"image/png"}}},{"id":"GOOGLE_TERRAIN","type":"XYZ_LAYER","opacity":1,"zIndex":0,"options":{"url":"https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}","layers":"","credit":"GOOGLE"}},{"id":"VECTOR_TILES_GPS","type":"XYZ_LAYER","opacity":1,"zIndex":2,"options":{"url":"https://gps.tile.openstreetmap.org/lines/{z}/{x}/{y}.png","layers":"","credit":"openstreetmap"}}],"baseVectorLayers":[]},{"id":"3rd","title":"3rd Map","thumbnail":"https://nsw.digitaltwin.terria.io/build/d8b97d3e38a0d43e5a06dea9aae17a3e.png","baseRasteLayers":[{"id":"VECTOR_TILES","type":"XYZ_LAYER","opacity":1,"zIndex":0,"options":{"url":"https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38","layers":"","credit":"thunderforest"}},{"id":"VECTOR_TILES_GPS_1","type":"XYZ_LAYER","opacity":1,"zIndex":1,"options":{"url":"https://gps.tile.openstreetmap.org/lines/{z}/{x}/{y}.png","layers":"","credit":"openstreetmap"}}],"baseVectorLayers":[]}]}';
  public terrainProviderUrl = DEFAULT_TERRAIN_PROVIDER_URL || 'http://localhost:8080';
}

const appConfig = new Config(); // Singleton

export default appConfig;