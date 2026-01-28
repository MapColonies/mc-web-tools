import shp, { parseShp } from 'shpjs';
import { Style, Icon, Stroke, Fill } from 'ol/style';
import { FeatureCollection } from 'geojson';
import CircleStyle from 'ol/style/Circle';
import { Coordinate } from 'ol/coordinate';
import MultiPoint from 'ol/geom/MultiPoint';

export const FEATURE_ID_FIELD = 'id';

export const MONACO_ROW_NUMBER_COLUMN = 1;

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
  SELECTED_FILL = 'SELECTED_FILL',
  SELECTED_MARKER = 'SELECTED_MARKER',
}

export enum HighlightMode {
  HOVER_ON_KEY_FIELD = 'HOVER_ON_KEY_FIELD',
  HOVER_ON_FEATTURE = 'HOVER_ON_FEATTURE',
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
  ],
  [
    FeatureType.SELECTED_FILL,
    new Style({
      stroke: new Stroke({
        width: 2,
        color: "#ff0000"
      }),
      fill: new Fill({
        color: "#aa2727"
      })

    }),
  ],
  [
    FeatureType.SELECTED_MARKER,
    new Style({
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({
          color: '#FFA032', //GC_WARNING_HIGH
        }),
      }),
      geometry: function (feature) {
        // return the coordinates of the inner and outer rings of the polygon
        //@ts-ignore
        const coordinates = feature?.getGeometry()?.getCoordinates().reduce( 
          (accumulator: Array<Coordinate>, currentValue: Array<Coordinate>) => [...accumulator, ...currentValue],
          []
        );
        return new MultiPoint(coordinates);
      }
    })
  ],
]);

export function importShapeFileFromClient(
  fileLoadCB: (ev: ProgressEvent<FileReader>, type: string, fileName?: string) => void,
  allowGeojson = false,
  allowSingleSHP = true,
  cancelLoadCB = ()=>{}): void {
  const input = document.createElement('input');
  const supportedExtensions = [allowSingleSHP ? '.shp': '', '.zip', ...(allowGeojson ? ['.geojson'] : [])];
  input.setAttribute('type', 'file');
  input.setAttribute('accept', supportedExtensions.join(','));
  input.addEventListener('change',(e): void => {
    const target = (e.currentTarget as HTMLInputElement);
    if (target.files) {
      const file = target.files[0];
      const fileType = file.name.split('.').pop();
      const fileName = file.name.replace(`.${fileType}`, '');
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      fileReader.addEventListener('load', (e) => {
        fileLoadCB(e, fileType as string, fileName);
        input.remove();
      });
    }
  });
  input.addEventListener('cancel',(e): void => {
    cancelLoadCB();
    input.remove();
  });
  input.click();
}  

export const proccessShapeFile = async (
    shapeArrayBuffer: ArrayBuffer,
    fileType: string
  ): Promise<FeatureCollection> => {
    return new Promise((resolve, reject) => {
      const ZIP_EXTENSION = 'zip';

      try {
        // Supports zip files as well as single shape files.
        if (fileType === ZIP_EXTENSION) {
          void shp(shapeArrayBuffer)
            .then((data) => {
              return resolve(data as FeatureCollection);
            })
            .catch(() => {
              return reject(new Error('***** Shape file content Invalid *****'));
            });
        } else {
          const DEFAULT_PROJECTION = 'WGS84';
          // Probably is shape file.
          const geometryArr = parseShp(shapeArrayBuffer, DEFAULT_PROJECTION);

          const geometryPolygon = geometryArr;
          return resolve({
            "type": "FeatureCollection", 
            "features": geometryPolygon.map((geom) => ({
              "type": "Feature",
              "properties": {},
              "geometry": {...geom}
            }))
          });
        }
      } catch (e) {
        return reject(new Error('***** Shape Invalid *****'));
      }
    });
  };
