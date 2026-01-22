import { CSSProperties, PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
// import { useIntl } from 'react-intl';
import { Feature } from 'geojson';
import { get, isEmpty } from 'lodash';
import { FitOptions } from 'ol/View';
import { Style } from 'ol/style';
import {
  Box,
  GeoJSONFeature,
  getWMTSOptions,
  getXYZOptions,
  IBaseMap,
  Legend,
  LegendItem,
  Map,
  TileLayer,
  TileWMTS,
  TileXYZ,
  useMap,
  useVectorSource,
  VectorLayer,
  VectorSource
} from '@map-colonies/react-components';
import appConfig from '../../../Utils/Config';
import { FeatureType, FeatureTypeDrawingStyles } from '../Utils/GeoJsonViewer/utils';

import './GeoFeaturesPresentor.css';

interface GeoFeaturesPresentorProps {
  geoFeatures?: Feature[];
  style?: CSSProperties | undefined,
  fitOptions?: FitOptions | undefined,
  selectedFeatureKey?: string;
  selectionStyle?: Style;
}

const DEFAULT_PROJECTION = 'EPSG:4326';

export const GeoFeaturesPresentorComponent: React.FC<PropsWithChildren<GeoFeaturesPresentorProps>> = ({
  geoFeatures,
  style,
  fitOptions,
  selectedFeatureKey,
  selectionStyle,
  children
}) => {
  // const intl = useIntl();
  
 
  const previewBaseMap = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-array-constructor
    const olBaseMap = new Array();
    let baseMap = appConfig.baseMaps?.maps.find((map: IBaseMap) => map.isForPreview);
    if (!baseMap) {
      baseMap = appConfig.baseMaps?.maps.find((map: IBaseMap) => map.isCurrent);
    }
    if (baseMap) {
      baseMap.baseRasterLayers.forEach((layer: any) => {
        if (layer.type === 'WMTS_LAYER') {
          const wmtsOptions = getWMTSOptions({
            url: layer.options.url as string,
            layer: '',
            matrixSet: get(layer.options, 'tileMatrixSetID') as string,
            format: get(layer.options, 'format'),
            projection: DEFAULT_PROJECTION, // Should be taken from map-server capabilities (MAPCO-3780)
            style: get(layer.options, 'style'),
          });
          olBaseMap.push(
            <TileLayer key={layer.id} options={{ opacity: layer.opacity }}>
              <TileWMTS options={{
                ...wmtsOptions,
                crossOrigin: 'anonymous'
              }} />
            </TileLayer>
          );
        }
        if (layer.type === 'XYZ_LAYER') {
          const xyzOptions = getXYZOptions({
            url: layer.options.url as string,
          });
          olBaseMap.push(
            <TileLayer key={layer.id} options={{ opacity: layer.opacity }}>
              <TileXYZ options={{
                ...xyzOptions,
                crossOrigin: 'anonymous'
              }} />
            </TileLayer>
          )
        }
      })
    }
    return olBaseMap;
  }, []);
  
   const LegendsArray = [] as LegendItem[];
  // const LegendsArray = useMemo(() => {
  //   const res: LegendItem[] = [];
  //   PPMapStyles.forEach((value, key)=>{
  //     if (!key.includes('MARKER')) {
  //       res.push({
  //         title: intl.formatMessage({id: `polygon-parts.map-preview-legend.${key}`}) as string,
  //         style: value as Style
  //       });
  //     }
  //   });
  //   return res;
  // }, []);
  
  const GeoFeaturesInnerComponent: React.FC = () => {
    const source = useVectorSource();
    const map = useMap();

    //   source.once('change', () => {
    //     if (source.getState() === 'ready') {
    //       setTimeout(() => { 
    //         map.getView().fit(source.getExtent(), fitOptions)
    //       },0);
    //     }
    //   });

    return (
      <>
        {
          geoFeatures?.map((feat, idx) => {
            let featureStyle = FeatureTypeDrawingStyles.get(feat?.geometry.type as FeatureType);

            if ( selectedFeatureKey && feat?.properties?.key === selectedFeatureKey) {
              featureStyle = selectionStyle;
            }

            return (feat && !isEmpty(feat.geometry)) ?
              <GeoJSONFeature 
                geometry={{...feat.geometry}} 
                fit={false}
                key={feat.id ?? idx}
                featureStyle={featureStyle}
              /> : null
          })
        }
      </>
    );
  };

  return (
    <Box style={{...style}}>
      <Map>
        {/* <MapLoadingIndicator/> */}
        {previewBaseMap}
        <VectorLayer>
          <VectorSource>
            <GeoFeaturesInnerComponent/>
          </VectorSource>
        </VectorLayer>
        {/* <Legend legendItems={LegendsArray} title={'Legend'}/> */}
        {children}
      </Map>
    </Box>
  );
};
