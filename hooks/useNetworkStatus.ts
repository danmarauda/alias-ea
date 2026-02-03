import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  details: any;
}

export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: null,
    type: 'unknown',
    details: null,
  });

  useEffect(() => {
    // Get initial network state
    const getInitialState = async () => {
      const state = await NetInfo.fetch();
      const isConnected = state.isConnected ?? false;

      setNetworkState({
        isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        details: state.details,
      });
    };

    getInitialState();

    // Subscribe to connectivity changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected ?? false;

      setNetworkState({
        isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        details: state.details,
      });

      // Log for debug
      console.log('Network state changed:', {
        isConnected,
        type: state.type,
        isInternetReachable: state.isInternetReachable,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Function to manually refresh network state
  const refreshNetworkState = async () => {
    const state = await NetInfo.fetch();
    const isConnected = state.isConnected ?? false;

    setNetworkState({
      isConnected,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      details: state.details,
    });

    return isConnected;
  };

  return {
    ...networkState,
    refreshNetworkState,
  };
};
