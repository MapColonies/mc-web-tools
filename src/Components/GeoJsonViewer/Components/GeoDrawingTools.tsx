import React, { useState } from "react";
import { Box } from "@map-colonies/react-components";
import { Geometry } from 'geojson';
// import { DrawInteraction, DrawType } from "@map-colonies/react-components";
import { DrawInteraction, DrawType } from "./DrawInteraction";
import { BoxIcon, LineStringIcon, PointIcon, PolygonIcon, StarIcon } from "./DrawingIcons";

import './GeoDrawingTools.css';
import { Button } from "@map-colonies/react-core";

interface GeoDrawingToolsProps {
  onGeometryDrawn?: (geometry: Geometry) => void;
}


export const GeoDrawingTools: React.FC<GeoDrawingToolsProps> = ({
  onGeometryDrawn
}) => {
  const [drawType, setDrawType] = useState<DrawType|undefined>(undefined);

  return (
    <>
      <DrawInteraction 
        drawType={drawType as DrawType} 
        onPolygonSelected={(geom) => {
          if(onGeometryDrawn) {
            onGeometryDrawn(geom);
          }
          setDrawType(undefined);
        }} 
      />

      <Box className="geoDrawingToolbar ol-control">
        <Button id="star-button" className="tool-button" onClick={()=>{setDrawType(DrawType.STAR)}}>
          {StarIcon}
        </Button>

        <Button id="box-button" className="tool-button" onClick={()=>{setDrawType(DrawType.BOX)}}>
          {BoxIcon}
        </Button>

        <Button id="polygon-button" className="tool-button" onClick={()=>{setDrawType(DrawType.POLYGON)}}>
          {PolygonIcon}
        </Button>

        <Button id="linestring-button" className="tool-button" onClick={()=>{setDrawType(DrawType.LINE_STRING)}}>
          {LineStringIcon}
        </Button>

        <Button id="point-button" className="tool-button" onClick={()=>{setDrawType(DrawType.POINT)}}>
          {PointIcon}
        </Button>
      </Box>
    </>
  )
}