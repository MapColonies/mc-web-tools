import React from 'react';
import { CesiumMap, CesiumSceneMode } from '@map-colonies/react-components';
import appConfig from '../../Utils/Config';

const FootprintVerification: React.FC = (): JSX.Element => {

  return (
    <CesiumMap
      style={{height: '100%'}}
      center={JSON.parse(appConfig.mapCenter)}
      zoom={+appConfig.mapZoom}
      sceneMode={CesiumSceneMode.SCENE2D}
      baseMaps={appConfig.baseMaps}
    />
  );

};

export default FootprintVerification;