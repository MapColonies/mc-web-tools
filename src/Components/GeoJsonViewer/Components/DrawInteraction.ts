import React, { useEffect } from 'react';
import { useMap } from '@map-colonies/react-components';
import { Draw } from 'ol/interaction';
import { Geometry as OlGeom, Polygon } from 'ol/geom';
import { Coordinate } from 'ol/coordinate';
import { createBox, DrawEvent, Options as DrawOptions } from 'ol/interaction/Draw';
import { Style, Icon } from 'ol/style';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'geojson';

export enum DrawType {
  POINT = 'Point',
  LINE_STRING = 'LineString',
  //   LINEAR_RING = 'LinearRing',
  POLYGON = 'Polygon',
  MULTI_POINT = 'MultiPoint',
  //   MULTI_LINE_STRING = 'MultiLineString',
  MULTI_POLYGON = 'MultiPolygon',
  //   GEOMETRY_COLLECTION = 'GeometryCollection',
  CIRCLE = 'Circle',
  BOX = 'Box',
  STAR = 'Star',
}

export interface DrawProps {
  drawType: DrawType;
  onPolygonSelected?: (geometry: Geometry) => void;
}

export const DrawInteraction: React.FC<DrawProps> = ({ drawType, onPolygonSelected }) => {
  const map = useMap();
  useEffect(() => {
    let draw: Draw | null = null;

    const setupDrawInteraction = (type: DrawType) => {
      const options: DrawOptions = { type: DrawType.CIRCLE };

      switch (type) {
        case DrawType.BOX:
          options.geometryFunction = createBox();
          break;
        case DrawType.POLYGON:
          options.type = DrawType.POLYGON;
          break;
        case DrawType.LINE_STRING:
          options.type = DrawType.LINE_STRING;
          break;
        case DrawType.POINT:
          options.type = DrawType.POINT;
          options.style = new Style({
            image: new Icon({
              scale: 0.2,
              anchor: [0.5, 1],
              src: 'assets/img/map-marker.gif',
            }),
          });
          break;
        case DrawType.STAR:
          options.geometryFunction = function (coordinates, geometry) {
            const center = coordinates[0] as Coordinate;
            const last = coordinates[coordinates.length - 1] as Coordinate;
            const dx = center[0] - last[0];
            const dy = center[1] - last[1];
            const radius = Math.sqrt(dx * dx + dy * dy);
            const rotation = Math.atan2(dy, dx);
            const newCoordinates = [];
            const numPoints = 12;
            for (let i = 0; i < numPoints; ++i) {
              const angle = rotation + (i * 2 * Math.PI) / numPoints;
              const fraction = i % 2 === 0 ? 1 : 0.5;
              const offsetX = radius * fraction * Math.cos(angle);
              const offsetY = radius * fraction * Math.sin(angle);
              newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
            }
            newCoordinates.push(newCoordinates[0].slice());
            if (!geometry) {
              geometry = new Polygon([newCoordinates]);
            } else {
              geometry.setCoordinates([newCoordinates]);
            }
            return geometry;
          };
          break;
        default:
          return;
      }

      draw = new Draw(options);
      map.addInteraction(draw);

      const onDrawEnd = (e: DrawEvent): void => {
        const geoJson = new GeoJSON();
        const geom = geoJson.writeGeometryObject(e.feature.getGeometry() as OlGeom);
        onPolygonSelected?.(geom);
      };

      draw.on('drawend', onDrawEnd);
    };

    setupDrawInteraction(drawType);

    return () => {
      if (draw) {
        draw.un('drawend', () => {});
        map.removeInteraction(draw);
      }
    };
  }, [drawType, onPolygonSelected, map]);

  return null;
};
