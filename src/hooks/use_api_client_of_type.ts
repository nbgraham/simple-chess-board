import { useMemo } from "react";
import { API_CLIENT, IApiClient } from "../api_client";
import { API_CLIENT as MOCK_API_CLIENT } from "../__mocks__/api_client";

export type ApiClientType = 'server' | 'local';

export const useApiClientOfType = (type :ApiClientType) => 
     useMemo(() => getApiClient(type), [type])

export function getApiClient(type: string): IApiClient {
    return type === 'server' ? API_CLIENT : MOCK_API_CLIENT;
}

