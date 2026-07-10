import { useCallback, useEffect, useState } from "react";
import {
  getProgressPhotos,
  saveProgressPhotos,
} from "../services/dataService";
import type { ProgressPhoto } from "../types";
import { createId } from "../utils/id";

export function useProgressPhotos() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getProgressPhotos().then((data) => {
      if (!active) return;
      setPhotos(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const addPhoto = useCallback((dataUrl: string, weightKg: number | null) => {
    setPhotos((prev) => {
      const next = [
        ...prev,
        { id: createId(), dataUrl, weightKg, at: new Date().toISOString() },
      ].sort((a, b) => a.at.localeCompare(b.at));
      void saveProgressPhotos(next);
      return next;
    });
  }, []);

  const deletePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const next = prev.filter((p) => p.id !== id);
      void saveProgressPhotos(next);
      return next;
    });
  }, []);

  return { loading, photos, addPhoto, deletePhoto };
}
