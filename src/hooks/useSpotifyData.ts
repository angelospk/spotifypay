import { useState, useEffect } from "react";

export interface Member {
  name: string;
  data: number[];
}

export interface SpotifyData {
  periods: string[];
  members: Member[];
  lastUpdated: string;
}

export interface ProcessedPeriod {
  label: string;
  date: Date;
  index: number;
  isSep2023: boolean;
  isSep2025: boolean;
  price: number;
}

const API_URL =
  "https://raw.githubusercontent.com/angelospk/spot_cache/refs/heads/main/data.json";

// Convert ISO date to Greek label (e.g., "Μαρ 22" or "Σεπ 25")
function formatPeriodLabel(isoDate: string): string {
  const date = new Date(isoDate);
  const month = date.getMonth();
  const year = date.getFullYear() % 100; // Get last 2 digits

  // Check if it's March (2) or September (8)
  // The ISO dates are actually the last day of Feb or Aug
  // So we need to add 1 to get the start of the period
  const actualMonth = (month + 1) % 12;

  const monthLabel = actualMonth === 2 || actualMonth === 3 ? "Μαρ" : "Σεπ";

  return `${monthLabel} ${year.toString().padStart(2, "0")}`;
}

// Determine price for each period
function getPriceForPeriod(label: string): number {
  const [season, yearStr] = label.split(" ");
  const year = parseInt("20" + yearStr);

  // Before Sep 2023: 10€
  // Sep 2023 to Aug 2025: 13€
  // Sep 2025 onwards: 15€

  if (year < 2023) return 10;
  if (year === 2023 && season === "Μαρ") return 10;
  if (year === 2023 && season === "Σεπ") return 13;
  if (year === 2024) return 13;
  if (year === 2025 && season === "Μαρ") return 13;
  if (year === 2025 && season === "Σεπ") return 15;
  return 15; // 2026 onwards
}

export function useSpotifyData() {
  const [data, setData] = useState<SpotifyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const jsonData = await response.json();
        setData(jsonData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("Error fetching Spotify data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Process periods to include labels and metadata
  const processedPeriods: ProcessedPeriod[] =
    data?.periods.map((period, index) => {
      const label = formatPeriodLabel(period);
      return {
        label,
        date: new Date(period),
        index,
        isSep2023: label === "Σεπ 23",
        isSep2025: label === "Σεπ 25",
        price: getPriceForPeriod(label),
      };
    }) || [];

  // Find current period (closest to today)
  const getCurrentPeriodIndex = (): number => {
    if (!data) return 0;
    const now = new Date();
    let currentIndex = 0;

    for (let i = 0; i < data.periods.length; i++) {
      const periodDate = new Date(data.periods[i]);
      if (periodDate <= now) {
        currentIndex = i;
      } else {
        break;
      }
    }

    return currentIndex;
  };

  const currentPeriodIndex = getCurrentPeriodIndex();
  const currentPeriod = processedPeriods[currentPeriodIndex];
  const nextPeriod = processedPeriods[currentPeriodIndex + 1];

  return {
    data,
    loading,
    error,
    processedPeriods,
    currentPeriod,
    nextPeriod,
    currentPeriodIndex,
  };
}
