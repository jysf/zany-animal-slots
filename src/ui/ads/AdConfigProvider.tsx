// AdConfigProvider — reactive ad-config context (PROJ-004). Mirrors StatsProvider: hydrate from
// readAdConfig(), persist the override on change, expose setters the control panel uses. A no-op
// default keeps provider-less consumers (tests) working. Engine never sees this (DEC-001).
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_AD_CONFIG, type AdConfig } from './adConfig';
import { readAdConfig, writeAdConfig, clearAdConfig } from './adConfigStorage';

export interface AdConfigContextValue {
  config: AdConfig;
  setConfig: (next: AdConfig) => void;
  update: (patch: Partial<AdConfig>) => void;
  resetToDefault: () => void;
}

const AdConfigContext = createContext<AdConfigContextValue>({
  config: DEFAULT_AD_CONFIG,
  setConfig: () => {},
  update: () => {},
  resetToDefault: () => {},
});

export function AdConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<AdConfig>(() => readAdConfig());

  // Persist the override on every change (guarded; never throws — DEC-005).
  useEffect(() => {
    writeAdConfig(config);
  }, [config]);

  const setConfig = useCallback((next: AdConfig) => setConfigState(next), []);
  const update = useCallback((patch: Partial<AdConfig>) => setConfigState((prev) => ({ ...prev, ...patch })), []);
  const resetToDefault = useCallback(() => {
    clearAdConfig();
    setConfigState(DEFAULT_AD_CONFIG);
  }, []);

  const value = useMemo<AdConfigContextValue>(
    () => ({ config, setConfig, update, resetToDefault }),
    [config, setConfig, update, resetToDefault],
  );

  return <AdConfigContext.Provider value={value}>{children}</AdConfigContext.Provider>;
}

/** Subscribe to the ad config. Returns the committed default + no-op setters without a provider. */
export function useAdConfig(): AdConfigContextValue {
  return useContext(AdConfigContext);
}
