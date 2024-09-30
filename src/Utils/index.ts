import { Feature, FeatureCollection, Geometry } from "geojson";
import polygonToLine from '@turf/polygon-to-line';
import { Polygon } from "@turf/helpers";


export const getFootprintsCollection = (geometryList: Record<string, unknown>[], isPolylined = false): FeatureCollection => {

return {
    type: "FeatureCollection",
    features: geometryList.map<Feature>(geom => {
      let geometry = geom as unknown as Geometry;
      


      if(isPolylined) {
        geometry = (polygonToLine(geometry as Polygon) as Feature).geometry
      }

      return{
        type: "Feature",
        properties: {},
        geometry: geometry 
      };

    }),
  }
}