import React, { useEffect } from 'react';
import { CesiumTerrainProvider, EllipsoidTerrainProvider } from 'cesium';
import { get } from 'lodash';
import { useCesiumMap } from '@map-colonies/react-components';
import appConfig from '../../Utils/Config';

const Terrain: React.FC = () => {

  const mapViewer = useCesiumMap();

  useEffect(() => {
    const isTerrainTileError = (e: Record<string, unknown>): boolean => {
      return get(e, 'level') as number > 0;
    };

    const handleTerrainError = (e: Record<string, unknown>): void => {
      if (!isTerrainTileError(e)) {
        console.error('Terrain provider error: Falling back to default terrain.', e);
        alert(`\nTerrain Provider Access Error:\n\n${appConfig.terrainProviderUrl}`);
        // Remove error event listener after failing once
        mapViewer.terrainProvider.errorEvent.removeEventListener(handleTerrainError);
        // Set default empty terrain provider
        mapViewer.terrainProvider = new EllipsoidTerrainProvider({});
      } else {
        console.error('Terrain provider error: Tile problem.', e);
      }
    };

    if (appConfig.terrainProviderUrl) {
      mapViewer.terrainProvider = new CesiumTerrainProvider({
        url: appConfig.terrainProviderUrl
      });
      mapViewer.terrainProvider.errorEvent.addEventListener(handleTerrainError);
    } else {
      alert(`\nTerrain Provider Access Error:\n\nEmpty Terrain URL`);
      mapViewer.terrainProvider = new EllipsoidTerrainProvider({});
    }
  }, []);

  return null;

};

export default Terrain;
