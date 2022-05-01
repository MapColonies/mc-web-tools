import React, { useState } from 'react';
import { CesiumTerrainProvider, Resource } from 'cesium';
import { Cesium3DTileset, CesiumMap, CesiumSceneMode } from '@map-colonies/react-components';
import { LayerType } from '@map-colonies/react-components/dist/cesium-map/layers-manager';
import { IBaseMaps } from '@map-colonies/react-components/dist/cesium-map/settings/settings';
import { InspectorTool } from '@map-colonies/react-components/dist/cesium-map/tools/inspector.tool';
import { TerrainianHeightTool } from '@map-colonies/react-components/dist/cesium-map/tools/terranian-height.tool';

import './App.css';

const App: React.FC = () => {
  const [center] = useState<[number, number]>([34.817, 31.911]);

  const BASE_MAPS: IBaseMaps = {
    maps: [
      {
        id: '1st',
        title: '1st Map Title',
        isCurrent: true,
        thumbnail:
          'https://nsw.digitaltwin.terria.io/build/efa2f6c408eb790753a9b5fb2f3dc678.png',
        baseRasteLayers: [
          {
            id: 'GOOGLE_TERRAIN',
            type: 'XYZ_LAYER' as LayerType,
            opacity: 1,
            zIndex: 0,
            options: {
              url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
              layers: '',
              credit: 'GOOGLE',
            },
          },
        ],
        baseVectorLayers: [],
      },
    ],
  };

  const CTBDProvider = new CesiumTerrainProvider({
    url: new Resource({
      url: 'http://localhost:8080',
    }),
  });
  
  return (
    <div className="App">
      <section className="App-body">
        <CesiumMap
          style={{height: '95%'}}
          center={center}
          zoom={5}
          sceneModes={[CesiumSceneMode.SCENE3D]}
          baseMaps={BASE_MAPS}
          terrainProvider={CTBDProvider}
        >
          <Cesium3DTileset
            url="/assets/tileset/L16_31023/L16_31023.json"
            isZoomTo={true}
          />
          <TerrainianHeightTool />
          <InspectorTool />
        </CesiumMap>
      </section>
    </div>
  );
}

export default App;
