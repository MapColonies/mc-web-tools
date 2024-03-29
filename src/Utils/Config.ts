import { CesiumGeographicTilingScheme } from '@map-colonies/react-components';
import { IRasterLayer } from '@map-colonies/react-components/dist/cesium-map/layers-manager';
import { IBaseMap, IBaseMaps } from '@map-colonies/react-components/dist/cesium-map/settings/settings';

const PUBLIC_URL = (window as any)._env_.PUBLIC_URL;
const MAP_CENTER = (window as any)._env_.MAP_CENTER;
const MAP_ZOOM = (window as any)._env_.MAP_ZOOM;
const BASE_MAPS = JSON.parse((window as any)._env_.BASE_MAPS);
const DEFAULT_TERRAIN_PROVIDER_URL = (window as any)._env_.DEFAULT_TERRAIN_PROVIDER_URL;
const APPS = JSON.parse((window as any)._env_.APPS);
const TOKEN_INJECTION_TYPE = (window as any)._env_.ACCESS_TOKEN_INJECTION_TYPE;
const TOKEN_ATTRIBUTE_NAME = (window as any)._env_.ACCESS_TOKEN_ATTRIBUTE_NAME;
const MAP_SERVICE_RASTER_URL = (window as any)._env_.MAP_SERVICE_RASTER_URL;
const CSW_RASTER_URL = (window as any)._env_.CSW_RASTER_URL;
const CSW_3D_URL = (window as any)._env_.CSW_3D_URL;

export enum LinkType {
  WMTS_BASE = 'WMTS_BASE',
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
  public publicUrl = PUBLIC_URL || '.';
  public mapCenter = MAP_CENTER || '[34.817, 31.911]';
  public mapZoom = MAP_ZOOM || '14';
  public baseMaps = enrichBaseMaps(BASE_MAPS);
  public terrainProviderUrl = DEFAULT_TERRAIN_PROVIDER_URL;
  public apps = APPS;
  public simpleCatalogViewerTool = {
    tokenInjectionType: TOKEN_INJECTION_TYPE,
    tokenAttributeName: TOKEN_ATTRIBUTE_NAME,
    mapSericeRasterUrl: MAP_SERVICE_RASTER_URL,
    cswRasterUrl: CSW_RASTER_URL,
    csw3dUrl: CSW_3D_URL,
  }
}

const appConfig = new Config(); // Singleton

export default appConfig;