import { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { Box, IRasterLayer } from '@map-colonies/react-components';
import { IBaseMap } from '@map-colonies/react-components/dist/cesium-map/settings/settings';
import { useQueryParams } from '../../Hooks/useQueryParams';
import appConfig from '../../Utils/Config';
import { validateIDsQuery, validatePositionQuery } from '../../Utils/ValidateQueryParams';
import { requestHandlerWithToken } from '../../Utils/RequestHandler';
import { getRecordsQueryByID, parseQueryResults } from '../../Utils/CswQueryBuilder';

import './SimpleViewer.css';

interface IClientFlyToPosition {
	center: [number, number];
	zoom: number;
}

const SimpleViewer: React.FC = (): JSX.Element => {
	const [models, setModels] = useState<Record<string, unknown>[]>([]);
	const queryParams = useQueryParams();

	let clientPosition: IClientFlyToPosition | undefined = undefined;
	let modelIds: string[] = [];
	let idQueried: string | null = queryParams.get("model_ids");
	if (idQueried == null) {
		console.error({ msg: `didn't provide models_ids` });
	} else {
		if (!validateIDsQuery(idQueried)) {
			console.error({ msg: `models_ids param is not according to the specifications` });
		} else {
			modelIds = idQueried.split(',');

			// Make a unique model ids array
			modelIds = [...new Set(modelIds)];
		}
	}

	const positionQueried: string | null = queryParams.get("position");
	if (positionQueried != null) {
		if (!validatePositionQuery(positionQueried)) {
			console.error({ msg: `position param is not according to the specifications` });
		} else {
			const parsedPosition = positionQueried.split(',');
			clientPosition = {
				center: [+parsedPosition[0], +parsedPosition[1]],
				zoom: +parsedPosition[2]
			};
		}
	}
	const userToken = queryParams.get("token");
	if (userToken === null) {
		console.error(`Error: No token was provided. The token should be as a query param with the name "token".\nA good example: "http://url?token=TOKEN"`);
	}

	useEffect(() => {
		if (modelIds.length > 2) {
			console.warn('You provided more than 2 models. This is not recommended');
		}

		if (userToken) {
			const cswRequestHandler = async (
				url: string,
				method: string,
				params: Record<string, unknown>
			): Promise<AxiosResponse> =>
				requestHandlerWithToken(appConfig.csw3dUrl, method, params, userToken);

			cswRequestHandler(appConfig.csw3dUrl, 'POST', {
				data: getRecordsQueryByID(modelIds, 'http://schema.mapcolonies.com/3d')
			})
				.then((res) => {
					let modelsResponse = parseQueryResults(res.data, 'mc:MC3DRecord');
					if (modelsResponse !== null) {
						setModels(modelsResponse);
					}
				})
				.catch((e) => {
					console.error(e);
				});
		}
	}, []);

	let links = models[0]?.["mc:links"] as any;
	if (Array.isArray(links)) {
			links = links.find((link) => link["@_scheme"] === "3D_LAYER");
	}

	const url = `${links?.["#text"]}?token=${userToken}`;
	const baseMapCurrent = appConfig.baseMaps.maps.find((baseMap: IBaseMap) => baseMap.isCurrent);
	const WMTSLayerFromActiveBaseMap = baseMapCurrent?.baseRasteLayers.find((layer)=> layer.type === 'WMTS_LAYER');

	const buildBaseMapQueryParam = (rasterLayer: IRasterLayer) => {
		const baseLayerEncoded = window.btoa(JSON.stringify(rasterLayer.options));
		return `baseMapLayerEncoded=${baseLayerEncoded}`;
	}

	return (
		<>
			<Box>
				<iframe
					src={`${process.env.PUBLIC_URL}/Cesium-ion-SDK-1.110/Apps/HelloWorld.html?modelUrl=${url}&${buildBaseMapQueryParam(WMTSLayerFromActiveBaseMap as IRasterLayer)}`}
					title="Simple Viewer"
					style={{ width: '100%', height: '89vh', border: 'none' }}
				/>
			</Box>
			{/* <CesiumMap
                center={clientPosition?.center ?? appConfig.mapCenter}
                zoom={clientPosition?.zoom ?? appConfig.mapZoom}
                sceneModes={[CesiumSceneMode.SCENE3D]}
                baseMaps={appConfig.baseMaps}
                className={`SimpleViewer ${isLoading ? "loading" : ""}`}
            >
                <Box className="Errors">
                    {dialogErrors.map((error, i) => (
                        <Box key={error} className="Dialog">
                            {error}
                        </Box>
                    ))}
                </Box>
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
                <Terrain />
            </CesiumMap> */}
		</>
	);
};

export default SimpleViewer;
