import React, { useEffect } from 'react';
import { CesiumTerrainProvider, EllipsoidTerrainProvider } from 'cesium';
import { useCesiumMap } from '@map-colonies/react-components';
import appConfig from '../../Utils/Config';

const Terrain: React.FC = () => {

  const mapViewer = useCesiumMap();

  useEffect(() => {
    mapViewer.terrainProvider = new CesiumTerrainProvider({
      url: appConfig.terrainProviderUrl,
    });

    const terrainErrorEvent = mapViewer.terrainProvider.errorEvent;

    function handleTerrainError(e: unknown): void {
      if (appConfig.terrainProviderUrl) {
        alert(`\nTerrain Provider Access Error\n\n${appConfig.terrainProviderUrl}`);
      }
      mapViewer.terrainProvider = new EllipsoidTerrainProvider({});
      terrainErrorEvent.removeEventListener(handleTerrainError);
    }

    terrainErrorEvent.addEventListener(handleTerrainError);
  }, []);

  return null;

};

export default Terrain;
