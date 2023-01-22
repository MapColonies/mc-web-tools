import React from 'react';
import { Cesium3DTileset, CesiumMap, CesiumSceneMode } from '@map-colonies/react-components';
import { InspectorTool } from '@map-colonies/react-components/dist/cesium-map/tools/inspector.tool';
import { TerrainianHeightTool } from '@map-colonies/react-components/dist/cesium-map/tools/terranian-height.tool';
import appConfig from '../../Utils/Config';
import Terrain from '../Terrain/Terrain';

const TerrainVerification: React.FC = (): JSX.Element => {

  return (
    <CesiumMap
      style={{height: '95%'}}
      center={JSON.parse(appConfig.mapCenter)}
      zoom={+appConfig.mapZoom}
      sceneModes={[CesiumSceneMode.SCENE3D]}
      baseMaps={appConfig.baseMaps}
    >
      <Cesium3DTileset
        url="/assets/tileset/L16_31023/L16_31023.json"
        isZoomTo={true}
      />
      <Terrain />
      <TerrainianHeightTool />
      <InspectorTool />
    </CesiumMap>
  );

};

export default TerrainVerification;