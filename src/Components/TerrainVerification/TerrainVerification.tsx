import React from 'react';
import { Cesium3DTileset, CesiumMap, CesiumSceneMode, TerrainianHeightTool, InspectorTool } from '@map-colonies/react-components';
import appConfig from '../../Utils/Config';
import Terrain from '../Terrain/Terrain';

import './TerrainVerification.css';

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
        url={`${appConfig.publicUrl}/assets/tileset/L16_31023/L16_31023.json`}
        isZoomTo={true}
      />
      <Terrain />
      <TerrainianHeightTool />
      <InspectorTool />
    </CesiumMap>
  );

};

export default TerrainVerification;