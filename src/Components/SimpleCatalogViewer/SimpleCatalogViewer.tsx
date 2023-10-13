import React, { useEffect, useState } from 'react';
import { AxiosResponse } from 'axios';
import { Cesium3DTileset, CesiumMap, CesiumSceneMode, TerrainianHeightTool, InspectorTool } from '@map-colonies/react-components';
import { requestHandlerWithToken } from './utils/requestHandler';
import { getRecordsQueryByID, parseQueryResults } from './utils/cswQueryBuilder';
import appConfig from '../../Utils/Config';
import Terrain from '../Terrain/Terrain';
import { useQueryParams } from "../../Hooks/useQueryParams";

import './SimpleCatalogViewer.css';

type ModelsQueryParam = string[];

const MAXIMUM_SCREEN_SPACE_ERROR = 5;
const CULL_REQUESTS_WHILE_MOVING_MULTIPLIER = 120;

const SimpleCatalogViewer: React.FC = (): JSX.Element => {

  const id: string[] = [
    '7cc40791-441e-4d45-bdad-0a9077396839',
    '90faf01d-dfd4-4e8c-8b8b-4e935410f478'
  ];
  const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Im1hcC1jb2xvbmllcy1pbnQifQ.eyJhbyI6WyJodHRwczovL2FwcC1pbnQtY2xpZW50LXJvdXRlLWludGVncmF0aW9uLmFwcHMuajFsazNuanAuZWFzdHVzLmFyb2FwcC5pbyIsImh0dHBzOi8vYXBwLWludC1jbGllbnQtdG9vbHMtcm91dGUtaW50ZWdyYXRpb24uYXBwcy5qMWxrM25qcC5lYXN0dXMuYXJvYXBwLmlvIiwiaHR0cDovL2xvY2FsaG9zdDozMDAwIl0sImQiOlsicmFzdGVyIiwicmFzdGVyV21zIiwicmFzdGVyRXhwb3J0IiwiZGVtIiwidmVjdG9yIiwiM2QiXSwiaWF0IjoxNjc0NjMyMzQ2LCJzdWIiOiJtYXBjb2xvbmllcy1hcHAiLCJpc3MiOiJtYXBjb2xvbmllcy10b2tlbi1jbGkifQ.e-4SmHNOE8FwpcJoHdp-3Dh6D8GqCwM5wZfZIPrivGhfeKdihcsjEj_WN2jWN-ULha_ytZN5gRusLjwikNwgbF6hvb-QTDe3bEHPAjtgpZmF4HaJze8e6VPDF1tTC52CHDzNnwkUGAH1tnVGq10SnyhsGDezUChTVeBeVu-swTI58qCjemUQRw7-Q03uSEH24AkbX2CC1_rNwulo7ChglyTdn01tTWPsPjIuDjeixxm2CUmUHpfZzroaSzwof7ByQe22o3tFddje6ItNLBUC_VN7UfNLa_QPSVbIuNac-iMGFbK-RIyXUK8mp1AwddvSGsBUYcDs8fWMLzKhItljnw';
  
  const [models, setModels] = useState<Record<string,unknown>[]>([]);
  
  const queryParams = useQueryParams();
  const requestedModels: ModelsQueryParam = JSON.parse(queryParams.get("models") ?? '[]');

  useEffect(()=>{
    const cswRequestHandler = async (url: string, method: string, params: Record<string, unknown>): Promise<AxiosResponse> =>
      requestHandlerWithToken(appConfig.simpleCatalogViewerTool.csw3dUrl, method, params);

    cswRequestHandler(appConfig.simpleCatalogViewerTool.csw3dUrl, 'POST', {data: getRecordsQueryByID(id,'http://schema.mapcolonies.com/3d')})
      .then((res) => {
        console.log(res.data);
  
        let jObj = parseQueryResults(res.data, 'mc:MC3DRecord');
        console.log(jObj);
        setModels(jObj);
      });
  },[]);

    
  return (
    <CesiumMap
      style={{height: '95%'}}
      center={JSON.parse(appConfig.mapCenter)}
      zoom={+appConfig.mapZoom}
      sceneModes={[CesiumSceneMode.SCENE3D]}
      baseMaps={appConfig.baseMaps}
      id={'simpleViewer'}
    >
      {/* <Cesium3DTileset
        url={`${appConfig.publicUrl}/assets/tileset/L16_31023/L16_31023.json`}
        isZoomTo={true}
      /> */}

       {models.length && <Cesium3DTileset
        url={`${(models[1]['mc:links'] as any)[0]['#text']}?token=${token}`}
        isZoomTo={true}
      />}

      {/* {models.map((model, i) => {
            return <Cesium3DTileset
                maximumScreenSpaceError={MAXIMUM_SCREEN_SPACE_ERROR}
                cullRequestsWhileMovingMultiplier={CULL_REQUESTS_WHILE_MOVING_MULTIPLIER}
                preloadFlightDestinations
                preferLeaves
                skipLevelOfDetail
                url={`${(model['mc:links'] as any)[0]['#text']}?token=${token}`}
                isZoomTo={i === 0}
            />
          })} */}

      <Terrain />
    </CesiumMap>
  );

};

export default SimpleCatalogViewer;