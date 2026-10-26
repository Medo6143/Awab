import React, { createContext, useContext, useMemo } from 'react';
import { createRepositories, Repositories } from '../../data/repositories';

const defaultRepositories = createRepositories();
const RepositoryContext = createContext<Repositories>(defaultRepositories);

/** Optional override, e.g. fakes in tests; the app works without wrapping anything. */
export const RepositoryProvider = ({ value, children }: { value?: Partial<Repositories>; children: React.ReactNode }) => {
  const merged = useMemo(() => ({ ...defaultRepositories, ...value }), [value]);
  return <RepositoryContext.Provider value={merged}>{children}</RepositoryContext.Provider>;
};

export const useRepositories = () => useContext(RepositoryContext);
