import React, { useEffect, useState } from "react";
import { AxiosResponse } from "axios";
import {
    Cesium3DTileset,
    CesiumColor,
    CesiumConstantProperty,
    CesiumGeojsonLayer,
    CesiumMap,
    CesiumSceneMode
} from "@map-colonies/react-components";
import { requestHandlerWithToken } from "./utils/requestHandler";
import { getRecordsQueryByID, parseQueryResults } from "./utils/cswQueryBuilder";
import appConfig from "../../Utils/Config";
import Terrain from "../Terrain/Terrain";
import { useQueryParams } from "../../Hooks/useQueryParams";

import "./SimpleCatalogViewer.css";
import { validateIDsQuery, validatePositionQuery, validateShowExtent } from "./utils/validateQueryParams";
import { getFootprintsCollection } from "./utils";

const MAXIMUM_SCREEN_SPACE_ERROR = 5;
const CULL_REQUESTS_WHILE_MOVING_MULTIPLIER = 120;
interface IClientFlyToPosition {
    center: [number, number];
    zoom: number;
}

const SimpleCatalogViewer: React.FC = (): JSX.Element => {
    const [models, setModels] = useState<Record<string, unknown>[]>([]);
    const [footprints, setFootprints] = useState<Record<string, unknown>[]>([]);
    // const [isLoading, setIsLoading] = useState(true);
    const queryParams = useQueryParams();

    let clientPosition: IClientFlyToPosition | undefined = undefined;
    let modelIds: string[] = [];
    let shouldShowExtent = false;
    let idQueried: string | null = queryParams.get("model_ids");
    if (idQueried == null) {
        console.error(
            `Error: model_ids does not exists in the query params!\nA good example: "http://url?model_ids=ID1,ID2"`
        );
    } else {
        if (!validateIDsQuery(idQueried)) {
            console.error(
                `Error: model_ids does not fit the specification!\nA good example: "http://url?model_ids=ID1,ID2"`
            );
        } else {
            modelIds = idQueried.split(",");

            // Make a unique model ids array
            modelIds = [...new Set(modelIds)];
        }
    }

    const positionQueried: string | null = queryParams.get("position");
    if (positionQueried != null) {
        if (!validatePositionQuery(positionQueried)) {
            console.error(
                `Error: position does not fit the specification!\nA good example: "http://url?position=lon,lat,height"\nP.S\nThe position param is optional`
            );
        } else {
            const parsedPosition = positionQueried.split(",");
            clientPosition = {
                center: [+parsedPosition[0], +parsedPosition[1]],
                zoom: +parsedPosition[2]
            };
        }
    }
    const userToken = queryParams.get("token");
    if (userToken === null) {
        console.error(
            `Error: No token was provided. The token should be as a query param with the name "token".\nA good example: "http://url?token=TOKEN"`
        );
    }

    // const shouldShowExtent = JSON.parse(queryParams.get("show_extent") || "false");
    const shouldShowExtentQueried = queryParams.get("show_extent");
    if (shouldShowExtentQueried != null) {
      if (!validateShowExtent(shouldShowExtentQueried)) {
        console.error(
            `Error: show_extent parameter does not fit the specification!\nA good example: http://url?show_extent=true"`
        );
      } else {
          shouldShowExtent = JSON.parse(shouldShowExtentQueried);
      }
    }

    useEffect(() => {
        if (modelIds.length > 2) {
            console.warn("You provided more than 2 models. This is not recommended");
        }

        if (userToken) {
            const cswRequestHandler = async (
                url: string,
                method: string,
                params: Record<string, unknown>
            ): Promise<AxiosResponse> =>
                requestHandlerWithToken(
                    appConfig.simpleCatalogViewerTool.csw3dUrl,
                    method,
                    params,
                    userToken
                );

            cswRequestHandler(appConfig.simpleCatalogViewerTool.csw3dUrl, "POST", {
                data: getRecordsQueryByID(modelIds, "http://schema.mapcolonies.com/3d")
            })
                .then((res) => {
                    let modelsResponse = parseQueryResults(res.data, "mc:MC3DRecord");
                    if (modelsResponse !== null) {
                        setModels(modelsResponse);
                        setFootprints(modelsResponse.map(model => JSON.parse(model["mc:footprint"] as string)));
                    }
                })
                .catch((e) => {
                    console.error(e);
                });
            //   .finally(() => {
            //       setIsLoading(false);
            //   });
        }
    }, []);

    return (
        <>
            <CesiumMap
                center={clientPosition?.center ?? appConfig.mapCenter}
                zoom={clientPosition?.zoom ?? appConfig.mapZoom}
                sceneModes={[CesiumSceneMode.SCENE3D]}
                baseMaps={appConfig.baseMaps}
                // className={`simpleViewer ${isLoading ? "loading" : ""}`}
            >
                {models.map((model) => {
                    let links = model["mc:links"] as any;
                    if (Array.isArray(links)) {
                        links = links.find((link) => link["@_scheme"] === "3D_LAYER");
                    }
                    return (
                        <Cesium3DTileset
                            key={model.id as string}
                            maximumScreenSpaceError={MAXIMUM_SCREEN_SPACE_ERROR}
                            cullRequestsWhileMovingMultiplier={
                                CULL_REQUESTS_WHILE_MOVING_MULTIPLIER
                            }
                            preloadFlightDestinations
                            preferLeaves
                            skipLevelOfDetail
                            // url={
                            //     new CesiumResource({
                            //         url: `${links["#text"]}`,
                            //         queryParameters: {
                            //             token: userToken
                            //         }
                            //     })
                            // }
                            url={`${links["#text"]}?token=${userToken}`}
                            isZoomTo={!clientPosition && model["mc:id"] === modelIds[0]}
                        />
                    );
                })}
                
                {shouldShowExtent && 
                    <CesiumGeojsonLayer
                        clampToGround={true}
                        data={getFootprintsCollection(footprints, true)}
                        onLoad={(geojsonDataSource) => {
                            geojsonDataSource.entities.values.forEach((item) => {
                                if (item.polyline) {
                                    const color = CesiumColor.CYAN;
                                    (item.polyline.width as CesiumConstantProperty).setValue(5);
                                    // @ts-ignore
                                    item.polyline.material = color;
                                }
                            })
                        }}
                    />
                }
                <Terrain />
            </CesiumMap>
        </>
    );
};

export default SimpleCatalogViewer;
