import { QueryClient } from '@tanstack/react-query';
import { cache } from '@/lib/storage';

// Simple QueryClient configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 3,
    },
  },
});

// MMKV persistence functions for React Query
export const persistQueryCache = () => {
  try {
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();

    const cacheData = queries.map(query => ({
      queryKey: query.queryKey,
      queryHash: query.queryHash,
      data: query.state.data,
      dataUpdatedAt: query.state.dataUpdatedAt,
      error: query.state.error,
      errorUpdatedAt: query.state.errorUpdatedAt,
      status: query.state.status,
    }));

    cache.set('react-query-cache', cacheData);
    console.log('React Query cache saved:', cacheData.length, 'queries');
  } catch (error) {
    console.error('Cache save error:', error);
  }
};

export const restoreQueryCache = () => {
  try {
    const cacheData = cache.get('react-query-cache');

    if (!cacheData || !Array.isArray(cacheData)) {
      console.log('No React Query cache to restore');
      return;
    }

    const queryCache = queryClient.getQueryCache();

    cacheData.forEach((queryData: any) => {
      if (queryData.data && queryData.queryKey) {
        queryClient.setQueryData(queryData.queryKey, queryData.data);
      }
    });

    console.log('React Query cache restored:', cacheData.length, 'queries');
  } catch (error) {
    console.error('Cache restoration error:', error);
  }
};
