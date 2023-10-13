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

  let idQueried: string | null | string[] = queryParams.get("identifiers");
  let idList: string[] = [];
  if (idQueried == null) {
    console.log("identifiers does not exists in the query params!");
  } else {
    if (idQueried === "[]") {
      console.log("identifiers is an empty array");
    } else {
      idList = JSON.parse(idQueried);
      console.log(`identifiers:\n${idList}`);
    }
  }
  // [LON, LAT]
  const mapCenter: [number, number] = JSON.parse(
    queryParams.get("position") ?? appConfig.mapCenter
  );
  const mapZoom = +(queryParams.get("zoom") ?? appConfig.mapZoom);
  const userToken = queryParams.get("token");


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
      data: getRecordsQueryByID(idList, "http://schema.mapcolonies.com/3d"),
    }).then((res) => {
      let modelsResponse = parseQueryResults(res.data, "mc:MC3DRecord");
      setModels(modelsResponse);
    }).catch(e => console.log(e));
  }, []);

  return (
    <CesiumMap
      center={mapCenter}
      zoom={mapZoom}
      sceneModes={[CesiumSceneMode.SCENE3D]}
      baseMaps={appConfig.baseMaps}
    >
        {
        models.length && models.map((model, i) => {
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
                  isZoomTo={i === 0}
                />
            )
        })
    }
      <Terrain />
    </CesiumMap>
  );
};

export default SimpleCatalogViewer;
