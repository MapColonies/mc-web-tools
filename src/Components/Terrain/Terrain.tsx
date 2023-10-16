import React, { useEffect, useState } from 'react';
import { get } from 'lodash';
import { Box, CesiumCesiumTerrainProvider, CesiumEllipsoidTerrainProvider, useCesiumMap } from '@map-colonies/react-components';
import appConfig from '../../Utils/Config';

import './Terrain.css';

const Terrain: React.FC = () => {

  const mapViewer = useCesiumMap();
  const [ missingTiles, setMissingTiles ] = useState<string[]>([]);

  useEffect(() => {
      const isTerrainTileError = (e: Record<string, unknown>): boolean => {
        return get(e, 'level') as number > 0;
      };
  
      const handleTerrainError = (e: Record<string, unknown>): void => {
        if (!isTerrainTileError(e)) {
          console.error('Terrain provider error: Falling back to default terrain.', e);
          // Remove error event listener after failing once
          // @ts-ignore
          mapViewer.terrainProvider.errorEvent.removeEventListener(handleTerrainError);
          // Set default empty terrain provider
          mapViewer.terrainProvider = new CesiumEllipsoidTerrainProvider({});
        } else {
          console.error('Terrain provider error: Tile problem.', e);
          setMissingTiles(prev => [...prev, e.message as string]);
        }
      };
  
      if (appConfig.terrainProviderUrl) {
        mapViewer.terrainProvider = new CesiumCesiumTerrainProvider({
          url: appConfig.terrainProviderUrl
        });
        // @ts-ignore
        mapViewer.terrainProvider.errorEvent.addEventListener(handleTerrainError);
      } else {
        console.error(`Terrain Provider Access Error:\n\nEmpty Terrain URL`);
        mapViewer.terrainProvider = new CesiumEllipsoidTerrainProvider({});
      }
    
  }, []);

  return (
    <Box className="Terrain">
      {
        missingTiles.length > 0 &&
        <Box className="Dialog">
          {
            missingTiles.map(tile => <Box>{tile}</Box>)
          }
        </Box>
      }
    </Box>
  );

};

export default Terrain;
