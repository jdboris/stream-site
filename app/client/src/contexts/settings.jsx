import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { tryOperation } from "../utils/utils";

const SettingsContext = createContext(null);

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children, setErrors }) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [banners, setBanners] = useState(null);

  async function updateSettings(updateData) {
    const oldSettings = { ...settings };

    await tryOperation(
      async () => {
        // Latency compensation
        setSettings((old) => ({
          ...old,
          ...updateData,
        }));

        const response = await fetch("/api/settings", {
          method: "PUT",
          body: JSON.stringify(updateData),
          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        setSettings(data);
      },
      (e) => {
        if (e.length) {
          setSettings(oldSettings);
          throw e;
        }
      },
      setLoading
    );
  }

  // NOTE: Must memoize to fix dependency warnings
  const readAll = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      setSettings(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const readAllBanners = useCallback(async () => {
    const response = await fetch("/api/banners/all", {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error);
    }

    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: "base",
    });

    const banners = data.sort((a, b) => collator.compare(a.name, b.name));

    setBanners(banners);
  }, []);

  useEffect(() => {
    tryOperation(
      async () => {
        await readAll();
      },
      setErrors,
      setLoading
    );
  }, [setErrors, readAll]);

  return (
    <SettingsContext.Provider
      value={{
        loading,
        settings,
        banners,
        readAll,
        readAllBanners,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
