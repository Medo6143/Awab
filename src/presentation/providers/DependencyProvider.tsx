import React, { createContext, useContext, useMemo } from 'react';
import { AppDependencies, createDependencies } from '../../data/container';

const defaults = createDependencies();
const DependencyContext = createContext<AppDependencies>(defaults);

/** Optional override, e.g. fakes in tests; the app works without wrapping anything. */
export const DependencyProvider = ({ value, children }: { value?: Partial<AppDependencies>; children: React.ReactNode }) => {
  const merged = useMemo(() => ({ ...defaults, ...value }), [value]);
  return <DependencyContext.Provider value={merged}>{children}</DependencyContext.Provider>;
};

export const useDependencies = () => useContext(DependencyContext);
