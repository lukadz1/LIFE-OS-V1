import { useEffect, useState } from "react";
import { getLifeAreas } from "../services/dataService";
import type { LifeArea } from "../types";

export function useLifeAreas() {
  const [areas, setAreas] = useState<LifeArea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getLifeAreas().then((data) => {
      if (!active) return;
      setAreas(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { areas, loading };
}
