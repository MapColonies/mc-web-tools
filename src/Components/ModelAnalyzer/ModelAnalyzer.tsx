import { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { Box, IRasterLayer } from '@map-colonies/react-components';
import { IBaseMap } from '@map-colonies/react-components/dist/cesium-map/settings/settings';
import { useQueryParams } from '../../Hooks/useQueryParams';
import appConfig from '../../Utils/Config';
import { validateIDsQuery } from '../../Utils/ValidateQueryParams';
import { requestHandlerWithToken } from '../../Utils/RequestHandler';
import { getRecordsQueryByID, parseQueryResults } from '../../Utils/CswQueryBuilder';

import './ModelAnalyzer.css';

const ModelAnalyzer: React.FC = (): JSX.Element => {
	const [models, setModels] = useState<Record<string, unknown>[]>([]);
	const queryParams = useQueryParams();

	// let clientPosition: IClientFlyToPosition | undefined = undefined;
	let modelIds: string[] = [];
	let idQueried = queryParams.get("model_ids");
	const userToken = queryParams.get("token");
	const withBaseMaps = queryParams.get("withBaseMaps");
	const isDebugMode = queryParams.get("debug");

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

	// const positionQueried: string | null = queryParams.get("position");
	// if (positionQueried != null) {
	// 	if (!validatePositionQuery(positionQueried)) {
	// 		console.error({ msg: `position param is not according to the specifications` });
	// 	} else {
	// 		const parsedPosition = positionQueried.split(',');
	// 		clientPosition = {
	// 			center: [+parsedPosition[0], +parsedPosition[1]],
	// 			zoom: +parsedPosition[2]
	// 		};
	// 	}
	// }
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

	const url = links ? `${links?.["#text"]}?token=${userToken}` : null;
	const baseMapCurrent = appConfig.baseMaps.maps.find((baseMap: IBaseMap) => baseMap.isCurrent);
	const WMTSLayerFromActiveBaseMap = baseMapCurrent?.baseRasteLayers.find((layer)=> layer.type === 'WMTS_LAYER');

	const buildBaseMapQueryParam = (rasterLayer: IRasterLayer) => {
		if (rasterLayer) {
			const baseLayerEncoded = window.btoa(JSON.stringify(rasterLayer.options));
			return `&baseMapLayerEncoded=${baseLayerEncoded}`;
		}
		return '';
	};

	const buildTerrainProviderParam = () => {
		if (appConfig.terrainProviderUrl) {
			return `&terrainProviderUrl=${appConfig.terrainProviderUrl}`;
		}
		return '';
	};

	const debugModeParam = `&debug=${isDebugMode || false}`;
	const withBaseMapsParam = `&withBaseMaps=${withBaseMaps || true}`;
	const modelUrlParam = `?modelUrl=${url || ''}`;


	const iframeParams = `${modelUrlParam}${buildBaseMapQueryParam(WMTSLayerFromActiveBaseMap as IRasterLayer)}${buildTerrainProviderParam()}${withBaseMapsParam}${debugModeParam}`;

	return (
		<>
			<Box>
				<iframe
					id="viewer-iframe"
					src={`./Cesium-ion-SDK-1.110/Apps/3d-analysis.htm${iframeParams}`}
					title="Simple Viewer"
				/>
			</Box>
		</>
	);
};

export default ModelAnalyzer;
