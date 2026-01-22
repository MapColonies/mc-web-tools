import { Style, Stroke, Icon } from 'ol/style';

export enum FeatureType {
  POINT = 'Point',
  LINE_STRING = 'LineString',
  LINEAR_RING = 'LinearRing',
  POLYGON = 'Polygon',
  MULTI_POINT = 'MultiPoint',
  MULTI_LINE_STRING = 'MultiLineString',
  MULTI_POLYGON = 'MultiPolygon',
  GEOMETRY_COLLECTION = 'GeometryCollection',
  CIRCLE = 'Circle',
}


export const formatJson = (json: Record<string,unknown>)=>{
  return JSON.stringify(json,null,2);
}

export const FeatureTypeDrawingStyles = new Map<FeatureType, Style | undefined>([
  [
    FeatureType.POLYGON,
    undefined
    // new Style({
    //   stroke: new Stroke({
    //     width: 4,
    //     color: "#000000"
    //   })
    // })
  ],
  [
    FeatureType.POINT,
    new Style({
      image: new Icon({
        scale: 0.2,
        anchor: [0.5, 1],
        src: 'assets/img/map-marker.gif'
      })
    })
  ]
]);
