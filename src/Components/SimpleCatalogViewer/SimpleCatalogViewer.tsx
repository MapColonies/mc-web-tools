import {
    CesiumMap,
    CesiumSceneMode,
    Cesium3DTileset,
    CesiumWMTSLayer,
    
} from "@map-colonies/react-components";
import appConfig from "../../Utils/Config";
import Terrain from "../Terrain/Terrain";
import { useQueryParams } from "../../Hooks/useQueryParams";

const MAXIMUM_SCREEN_SPACE_ERROR = 5;
const CULL_REQUESTS_WHILE_MOVING_MULTIPLIER = 120;

type ModelsQueryParam = string[];
export const SimpleCatalogViewer: React.FC = () => {
    const optionsWMTS = {
        url: "http://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer/WMTS",
        layer: "USGSShadedReliefOnly",
        style: "default",
        format: "image/jpeg",
        tileMatrixSetID: "default028mm",
        maximumLevel: 19
    };

    const queryParams = useQueryParams();
    const requestedModels: ModelsQueryParam = JSON.parse(queryParams.get("models") ?? '[]');
    
    // Query PYCSW and get the links for the models
    const queryPycsw = (modelsIds: ModelsQueryParam): string[] => {
      // Get links array
      const modelLinks = modelsIds.map(id => `${appConfig.publicUrl}/assets/tileset/${id}/${id}.json`);
      return modelLinks;
    }

    const modelLinks = queryPycsw(requestedModels);

    return (
        <CesiumMap
            center={JSON.parse(appConfig.mapCenter)}
            zoom={+appConfig.mapZoom}
            sceneModes={[CesiumSceneMode.SCENE3D]}
            baseMaps={appConfig.baseMaps}
        >
          {modelLinks.map((modelUrl, i) => {
            return <Cesium3DTileset
                maximumScreenSpaceError={MAXIMUM_SCREEN_SPACE_ERROR}
                cullRequestsWhileMovingMultiplier={CULL_REQUESTS_WHILE_MOVING_MULTIPLIER}
                preloadFlightDestinations
                preferLeaves
                skipLevelOfDetail
                url={modelUrl}
                isZoomTo={i === 0}
            />
          })}

            {/* <CesiumWMTSLayer
                meta={{
                    id: 1,
                    // @ts-ignore
                    searchLayerPredicate: (cesiumLayer, idx) => {
                        const linkUrl = optionsWMTS.url;
                        const cesiumLayerLinkUrl = get(
                            cesiumLayer,
                            "_imageryProvider._resource._url"
                        ) as string;
                        const isLayerFound =
                            linkUrl.split("?")[0] === cesiumLayerLinkUrl.split("?")[0];
                        return isLayerFound;
                    }
                }}
                options={optionsWMTS}
            /> */}

            <Terrain />
        </CesiumMap>
    );
};
