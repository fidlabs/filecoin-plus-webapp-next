"use client";
import { ClientProvidersResponse } from "@/lib/api";
import { convertBytesToIEC } from "@/lib/utils";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";

interface IClientProvidersContext {
  providersData: ClientProvidersResponse | undefined;
  activeProviderIndex: number;
  setActiveProviderIndex: (index: number) => void;
  providersChartData: {
    name: string;
    value: number;
    totalSize: string;
    valueString: string;
  }[];
}

const ClientProvidersContext = createContext<IClientProvidersContext>({
  providersData: undefined,
  activeProviderIndex: 0,
  providersChartData: [],
  setActiveProviderIndex: () => {},
} as IClientProvidersContext);

const ClientProvidersProvider = ({
  children,
  initialData,
}: PropsWithChildren<{
  initialData: ClientProvidersResponse;
}>) => {
  const [activeProviderIndex, setActiveProviderIndex] = useState(-1);

  const providersChartData = useMemo(() => {
    return initialData?.stats?.map((item) => ({
      name: item.provider,
      value: +item.percent,
      totalSize: convertBytesToIEC(+item.total_deal_size),
      valueString: `${convertBytesToIEC(+item.total_deal_size)} (${item.percent}%)`,
    }));
  }, [initialData]);

  return (
    <ClientProvidersContext.Provider
      value={{
        providersData: initialData,
        activeProviderIndex,
        setActiveProviderIndex,
        providersChartData,
      }}
    >
      <>{children}</>
    </ClientProvidersContext.Provider>
  );
};

const useClientProvidersDetails = () => {
  return useContext(ClientProvidersContext);
};

export { ClientProvidersProvider, useClientProvidersDetails };
