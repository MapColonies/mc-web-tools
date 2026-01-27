import React, { useState } from "react";
import { Box } from "@material-ui/core";
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import FeatureCollectionSchema from "geojson-schema/FeatureCollection.json";
import { GeoFeaturesPresentorComponent } from "./Components/GeoFeaturesPresentor";
import { MonacoEditor } from "./Components/monacoEditor";
import { MonacoInitializer } from "./Components/monacoInitalizer";

import "./GeoJsonViewer.css";
import { FeatureType, FeatureTypeDrawingStyles, formatJson } from "./Utils/GeoJsonViewer/utils";
import { GeoDrawingTools } from "./Components/GeoDrawingTools";
import { GeoMenu } from "./Components/GeoMenu";

const kuku = 0;

const GeoJsonViewer: React.FC = (): JSX.Element => {
  const [geoFeatures, setGeoFeatures] = useState<Feature<Geometry, GeoJsonProperties>[]>([]);
  const [code, setCode] = useState<string>(formatJson({"type": "FeatureCollection","features": []}));
  const [selectedFeature, setSelectedFeature] = useState<string>('');

  // const handlePolygonSelected = (geometry: Geometry): void => {
  //   const rewindedPolygon = rewind(geometry as Polygon);
  //   props.onPolygonSelection(rewindedPolygon);
  // };
  const handleGeometryDrawn = (geometry: any): void => {
    console.log('***** handleGeometryDrawn', geometry);
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

  const handleGeoJSONLoaded = (featCollection: any): void => {
    console.log('***** handleGeoJSONLoaded', featCollection);
   
    setGeoFeatures(featCollection.features);
    
    setCode(
      formatJson(featCollection)
    );
  };

  return (
    <Box className="geojsonViewer container">
      <Box className="left">
        <GeoFeaturesPresentorComponent
          geoFeatures={
            [...(geoFeatures ?? []) as Feature<Geometry, GeoJsonProperties>[]]
          }
          selectedFeatureKey={selectedFeature}
          // @ts-ignore
          selectionStyle={[FeatureTypeDrawingStyles.get(FeatureType.SELECTED_FILL), FeatureTypeDrawingStyles.get(FeatureType.SELECTED_MARKER)]}
          style={{ position: 'relative', direction: 'ltr', height: '100%' }}
          fitOptions={{ padding: [10, 20, 10, 20] }}
        >
          <GeoDrawingTools onGeometryDrawn={handleGeometryDrawn}></GeoDrawingTools>
          <GeoMenu onFileLoaded={handleGeoJSONLoaded}></GeoMenu>
        </GeoFeaturesPresentorComponent>
      </Box>
      <Box className="right">
        <MonacoInitializer />
        <MonacoEditor 
          height="100%"
          codeText={code}
          onSelectGeometry={(key) => {
            setSelectedFeature(key);
          }}
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
