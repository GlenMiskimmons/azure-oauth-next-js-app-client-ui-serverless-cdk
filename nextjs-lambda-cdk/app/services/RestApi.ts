import axios, { AxiosRequestConfig } from 'axios';

import { RestApiResponse } from '../models/rest-api/RestApiResponse';

const serviceUrl = process.env.NEXT_PUBLIC_SERVICE_URI;

const getAccessToken = async (ssoToken: string): Promise<any> => {
  const axiosConfig: AxiosRequestConfig = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ssoToken}`,
    },
    params: {
      ssoToken,
    },
  };

  return axios(`${serviceUrl}/auth`, axiosConfig).then(
    (response) => response.data
  );
};
const callPublicEndpoint = async (): Promise<RestApiResponse> => {
  console.log(`${serviceUrl}/public`);
  return axios.get(`${serviceUrl}/public`).then((response) => response.data);
};

const callPrivateEndpoint = async (
  accessToken?: string
): Promise<RestApiResponse> => {
  return axios
    .get(`${serviceUrl}/private`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((response) => response.data);
};

export { getAccessToken, callPublicEndpoint, callPrivateEndpoint };
