import { useMemo } from "react";
import { API_CLIENT } from "../api_client";
import { API_CLIENT as MOCK_API_CLIENT } from "../__mocks__/api_client";

export type ApiClientType = 'server' | 'local';

export const useApiClientOfType = (type :ApiClientType) => 
     useMemo(() => type === 'server' ? API_CLIENT : MOCK_API_CLIENT, [type])
