import React, { useState } from "react";
import { Geometry } from 'geojson';

import './GeoDrawingTools.css';
import { DrawInteraction, DrawType } from "@map-colonies/react-components";

interface GeoDrawingToolsProps {
  onGeometryDrawn?: (geometry: Geometry) => void;
}


export const GeoDrawingTools: React.FC<GeoDrawingToolsProps> = ({
  onGeometryDrawn
}) => {
  const [drawType, setDrawType] = useState<DrawType|undefined>(undefined);

  const drawTypeSetter = (type: DrawType|undefined) =>{
    setDrawType(type);
  };

  return (
    <>
      <DrawInteraction drawType={drawType as DrawType} onPolygonSelected={onGeometryDrawn} />
      <div id="draw-controls">
        {/* <button data-type="Point" onClick={}>Point</button> */}
        {/* <button data-type="LineString">Line</button> */}
        <button onClick={()=>{drawTypeSetter(DrawType.POLYGON)}}>Polygon</button>
        <button onClick={()=>{drawTypeSetter(DrawType.BOX)}}>Box</button>
        <button id="clear" onClick={()=>{drawTypeSetter(undefined)}}>Cancel Draw</button>
      </div>
    </>
  )
}