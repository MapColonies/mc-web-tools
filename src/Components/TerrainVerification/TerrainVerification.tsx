import React from 'react';
import { CesiumTerrainProvider, Resource } from 'cesium';
import { Cesium3DTileset, CesiumMap, CesiumSceneMode } from '@map-colonies/react-components';
import { InspectorTool } from '@map-colonies/react-components/dist/cesium-map/tools/inspector.tool';
import { TerrainianHeightTool } from '@map-colonies/react-components/dist/cesium-map/tools/terranian-height.tool';
import appConfig from '../../Utils/Config';

const TerrainVerification: React.FC = (): JSX.Element => {

  const terrainProvider = new CesiumTerrainProvider({
    url: new Resource({
      url: appConfig.terrainProviderUrl,
    }),
  });

  return (
    <CesiumMap
      style={{height: '95%'}}
      center={JSON.parse(appConfig.mapCenter)}
      zoom={+appConfig.mapZoom}
      sceneModes={[CesiumSceneMode.SCENE3D]}
      baseMaps={appConfig.baseMaps}
      terrainProvider={terrainProvider}
    >
      <Cesium3DTileset
        url="/assets/tileset/L16_31023/L16_31023.json"
        isZoomTo={true}
      />
      <TerrainianHeightTool />
      <InspectorTool />
    </CesiumMap>
  );

};

export default TerrainVerification;