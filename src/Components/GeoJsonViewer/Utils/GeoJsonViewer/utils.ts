import shp, { parseShp } from 'shpjs';
import { Style, Icon } from 'ol/style';
import { FeatureCollection } from 'geojson';

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
