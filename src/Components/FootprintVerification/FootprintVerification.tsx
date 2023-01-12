import React, { useState } from 'react';
import { CesiumMap, CesiumSceneMode } from '@map-colonies/react-components';
import { IBaseMaps } from '@map-colonies/react-components/dist/cesium-map/settings/settings';
import appConfig from '../../Utils/Config';

const FootprintVerification: React.FC = (): JSX.Element => {

  const [center] = useState<[number, number]>(JSON.parse(appConfig.mapCenter));

  const baseMaps: IBaseMaps = JSON.parse(appConfig.baseMaps);

  return (
    <CesiumMap
      style={{height: '100%'}}
      center={center}
      zoom={+appConfig.mapZoom}
      sceneModes={[CesiumSceneMode.SCENE2D]}
      baseMaps={baseMaps}
    />
  );

};

export default FootprintVerification;