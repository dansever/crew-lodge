"use client";

import { useEffect, useState } from "react";

let cachedMap: Record<string, string> | null = null;
let isLoadingCache = false;

async function loadCountryMap(): Promise<Record<string, string>> {
  if (cachedMap) {
    return cachedMap;
  }

  if (isLoadingCache) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (cachedMap) {
          clearInterval(checkInterval);
          resolve(cachedMap);
        }
      }, 100);
    });
  }

  isLoadingCache = true;

  try {
    if (typeof window === "undefined") {
      return {};
    }

    const response = await fetch("/datasets/countries.csv", {
      cache: "force-cache",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to load countries CSV (${response.status}): ${response.statusText}`
      );
    }

    const csvText = await response.text();
    const lines = csvText.split("\n").filter((line) => line.trim());

    // Skip header row (country,name)
    const dataLines = lines.slice(1);

    const map: Record<string, string> = {};
    for (const line of dataLines) {
      const commaIndex = line.indexOf(",");
      if (commaIndex === -1) continue;

      const country = line.slice(0, commaIndex).trim();
      const name = line.slice(commaIndex + 1).trim();
      if (country && name) {
        map[country] = name;
      }
    }

    cachedMap = map;
    return map;
  } catch {
    return {};
  } finally {
    isLoadingCache = false;
  }
}

export function useCountryMap() {
  const [map, setMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCountryMap()
      .then((loadedMap) => {
        setMap(loadedMap);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { map, isLoading };
}
