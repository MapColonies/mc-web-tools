import React, { useEffect, useState } from "react";
import { AxiosResponse } from "axios";
import {
  Cesium3DTileset,
  CesiumMap,
  CesiumSceneMode,
} from "@map-colonies/react-components";
import { requestHandlerWithToken } from "./utils/requestHandler";
import {
  getRecordsQueryByID,
  parseQueryResults,
} from "./utils/cswQueryBuilder";
import appConfig from "../../Utils/Config";
import Terrain from "../Terrain/Terrain";
import { useQueryParams } from "../../Hooks/useQueryParams";

import "./SimpleCatalogViewer.css";

const MAXIMUM_SCREEN_SPACE_ERROR = 5;
const CULL_REQUESTS_WHILE_MOVING_MULTIPLIER = 120;

const SimpleCatalogViewer: React.FC = (): JSX.Element => {
  const [models, setModels] = useState<Record<string, unknown>[]>([]);
  const queryParams = useQueryParams();

  let idQueried: string | null | string[] = queryParams.get("model_ids");
  let modelIds: string[] = [];
  if (idQueried == null) {
    console.error({ msg: `didn't provide models_ids` });
    alert(`Error: model_ids does not exists in the query params!\nA good example: "http://url?model_ids=#ID1,#ID2`);
  } else {
    modelIds = idQueried.split(',');
    if (modelIds.length > 2) {
        alert(`Warning: You provided more than 2 models. This is not recommended`);
    }
  }
  const userToken = queryParams.get("token");
  if (userToken === null) {
    console.error({ msg: `didn't provide token` });
    alert(`Error: No token was provided. The token should be as a query param with the name "token".\nA good example: "http://url?token=#TOKEN`);
  }

  useEffect(() => {
    const cswRequestHandler = async (
      url: string,
      method: string,
      params: Record<string, unknown>
    ): Promise<AxiosResponse> =>
      requestHandlerWithToken(
        appConfig.simpleCatalogViewerTool.csw3dUrl,
        method,
        params
      );

    cswRequestHandler(appConfig.simpleCatalogViewerTool.csw3dUrl, "POST", {
      data: getRecordsQueryByID(modelIds, "http://schema.mapcolonies.com/3d"),
    }).then((res) => {
      let modelsResponse = parseQueryResults(res.data, "mc:MC3DRecord");
      if (modelsResponse !== null) {
        setModels(modelsResponse);
      }
    }).catch(e => console.error(e));
  }, []);

  return (
    <CesiumMap
      center={appConfig.mapCenter}
      zoom={appConfig.mapZoom}
      sceneModes={[CesiumSceneMode.SCENE3D]}
      baseMaps={appConfig.baseMaps}
    >
        {
        models.length && models.map((model, index) => {
            let links = (model["mc:links"] as any);
            if(Array.isArray(links)) {
                links = links.find((link) => link["@_scheme"] === "3D_LAYER");
            }

            return (
                <Cesium3DTileset
                  maximumScreenSpaceError={MAXIMUM_SCREEN_SPACE_ERROR}
                  cullRequestsWhileMovingMultiplier={
                    CULL_REQUESTS_WHILE_MOVING_MULTIPLIER
                  }
                  preloadFlightDestinations
                  preferLeaves
                  skipLevelOfDetail
                  url={`${links["#text"]}?token=${userToken}`}
                  isZoomTo={model["mc:id"] === modelIds[0]}
                />
            )
        })
    }
      <Terrain />
    </CesiumMap>
  );
};

export default SimpleCatalogViewer;
