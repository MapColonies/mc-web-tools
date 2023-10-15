import axios, { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import  appConfig  from '../../../Utils/Config';

export const requestHandler = async (url: string, method: string, params: AxiosRequestConfig): Promise<AxiosResponse> => {
  const requestConfig: AxiosRequestConfig = {
    url,
    method: method as Method,
    ...params,
    headers: {
      ...{ ...(params.headers ?? {})},
    } as Record<string, unknown>,
  };

  return axios
    .request(requestConfig)
    .then((res) => res)
    .catch((error) => {
      throw error;
    });
};

export const requestHandlerWithToken = async (url: string, method: string, params: AxiosRequestConfig, token: string): Promise<AxiosResponse> => {
const injectionType = appConfig.simpleCatalogViewerTool.tokenInjectionType;
const attributeName = appConfig.simpleCatalogViewerTool.tokenAttributeName;
const reqConfig = { ...params };

  if (injectionType.toLowerCase() === 'header') {
    reqConfig.headers = {
      ...reqConfig.headers,
      [attributeName]: token,
    } as Record<string, unknown>;
  } else if (injectionType.toLowerCase() === 'queryparam') {
    reqConfig.params = {
      ...reqConfig.params,
      [attributeName]: token,
    } as Record<string, unknown>;
  }

  return requestHandler(url, method, reqConfig);
};

