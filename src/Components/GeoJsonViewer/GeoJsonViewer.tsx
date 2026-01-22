import React, { useState } from "react";
import { Box } from "@material-ui/core";
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import FeatureCollectionSchema from "geojson-schema/FeatureCollection.json";
import { GeoFeaturesPresentorComponent } from "./Components/GeoFeaturesPresentor";
import { MonacoEditor } from "./Components/monacoEditor";
import { MonacoInitializer } from "./Components/monacoInitalizer";

import "./GeoJsonViewer.css";
import { formatJson } from "./Utils/GeoJsonViewer/utils";
import { GeoDrawingTools } from "./Components/GeoDrawingTools";
// const geoFeatures = [
//   {
//     "type": "Feature",
//     "properties": {},
//     "geometry": {
//       "coordinates": [
//         [
//           [
//             -73.81078170569457,
//             40.763327294370185
//           ],
//           [
//             -73.81078170569457,
//             40.650608669882786
//           ],
//           [
//             -73.5707365262566,
//             40.650608669882786
//           ],
//           [
//             -73.5707365262566,
//             40.763327294370185
//           ],
//           [
//             -73.81078170569457,
//             40.763327294370185
//           ]
//         ]
//       ],
//       "type": "Polygon"
//     },
//     "id": 0
//   },
//   {
//     "type": "Feature",
//     "properties": {},
//     "geometry": {
//       "coordinates": [
//         [
//           [
//             -74.17140764668494,
//             40.622173335990055
//           ],
//           [
//             -74.17140764668496,
//             40.55637598015247
//           ],
//           [
//             -73.98055222810099,
//             40.55637598015247
//           ],
//           [
//             -73.98055222810099,
//             40.622173335990055
//           ],
//           [
//             -74.17140764668494,
//             40.622173335990055
//           ]
//         ]
//       ],
//       "type": "Polygon"
//     }
//   },
//   {
//     "type": "Feature",
//     "properties": {
//       "featureType": "PP_PERIMETER_MARKER"
//     },
//     "geometry": {
//       "coordinates": [
//         -73.88946776594211,
//         40.59560924152893
//       ],
//       "type": "Point"
//     }
//   }
// ];
const kuku = 0;

const GeoJsonViewer: React.FC = (): JSX.Element => {
  const [geoFeatures, setGeoFeatures] = useState<Feature<Geometry, GeoJsonProperties>[]>([]);
  const [code, setCode] = useState<string>(formatJson({"type": "FeatureCollection","features": []}));

  // const handlePolygonSelected = (geometry: Geometry): void => {
  //   const rewindedPolygon = rewind(geometry as Polygon);
  //   props.onPolygonSelection(rewindedPolygon);
  // };
  const handleGeometryDrawn = (geometry: any): void => {
    console.log('***** handlePolygonSelected', geometry);
    const updatedGeoFeatures: Feature<Geometry, GeoJsonProperties>[] = [
      ...geoFeatures,
      {
        "type": "Feature",
        "properties": {},
        "geometry": {...geometry}
      }
    ];

    setGeoFeatures(updatedGeoFeatures);
    
    setCode(
      formatJson({
        "type": "FeatureCollection", 
        "features": updatedGeoFeatures
      })
    );
  };

  return (
    <Box className="geojsonViewer container">
      <Box className="left">
        <GeoFeaturesPresentorComponent
          geoFeatures={
            [...(geoFeatures ?? []) as Feature<Geometry, GeoJsonProperties>[]]
          }
          // selectedFeatureKey={selectedFeature}
          // @ts-ignore
          // selectionStyle={[PPMapStyles.get(FeatureType.SELECTED_FILL), PPMapStyles.get(FeatureType.SELECTED_MARKER)]}
          style={{ position: 'relative', direction: 'ltr', height: '100%' }}
          fitOptions={{ padding: [10, 20, 10, 20] }}
        >
          <GeoDrawingTools onGeometryDrawn={handleGeometryDrawn}></GeoDrawingTools>
        </GeoFeaturesPresentorComponent>
      </Box>
      <Box className="right">
        <MonacoInitializer />
        <MonacoEditor 
          height="100%"
          codeText={code}
          onChange={(value, ev) => {
            const featureCollection = JSON.parse(value ?? '')
            setGeoFeatures(featureCollection.features)
          }}
          schema={FeatureCollectionSchema}
        />
      </Box>
    </Box>
  );
};

export default GeoJsonViewer;
