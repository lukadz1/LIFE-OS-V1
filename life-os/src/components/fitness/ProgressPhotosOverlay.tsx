import {
  Camera as CameraIcon,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { ProgressPhoto } from "../../types";
import { formatPastDate } from "../../utils/date";
import { compressImageFile, compressVideoFrame } from "../../utils/image";

interface ProgressPhotosOverlayProps {
  open: boolean;
  photos: ProgressPhoto[];
  latestWeightKg: number | null;
  onClose: () => void;
  onAdd: (dataUrl: string, weightKg: number | null) => void;
  onDelete: (id: string) => void;
}

type Mode = "grid" | "camera" | "compare";

export function ProgressPhotosOverlay({
  open,
  photos,
  latestWeightKg,
  onClose,
  onAdd,
  onDelete,
}: ProgressPhotosOverlayProps) {
  const [mode, setMode] = useState<Mode>("grid");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || mode !== "camera") {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      return;
    }
    let cancelled = false;
    setCameraError(null);
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        if (!cancelled)
          setCameraError("Camera unavailable — use upload instead.");
      });
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open, mode, facingMode]);

  useEffect(() => {
    if (!open) {
      setMode("grid");
      setCompareIds([]);
    }
  }, [open]);

  if (!open) return null;

  function handleCapture() {
    if (!videoRef.current || videoRef.current.videoWidth === 0) return;
    const dataUrl = compressVideoFrame(videoRef.current);
    onAdd(dataUrl, latestWeightKg);
    setMode("grid");
  }

  async function handleFileChosen(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressImageFile(file);
    onAdd(dataUrl, latestWeightKg);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  const comparePhotos = compareIds
    .map((id) => photos.find((p) => p.id === id))
    .filter((p): p is ProgressPhoto => !!p);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3.5 sm:px-6">
        <button
          onClick={onClose}
          aria-label="Close progress photos"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text-dim transition-colors hover:text-text"
        >
          <X size={16} />
        </button>
        <h2 className="font-serif text-xl text-text italic">
          Progress photos
        </h2>
        <span className="ml-auto font-mono text-xs text-text-dim">
          {photos.length} saved
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        {mode === "camera" && (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[18px] bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-text-dim">
                  {cameraError}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setFacingMode((f) => (f === "user" ? "environment" : "user"))
                }
                aria-label="Flip camera"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text-dim hover:text-text"
              >
                <RefreshCw size={16} />
              </button>
              <button
                onClick={handleCapture}
                aria-label="Capture photo"
                className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/80 bg-accent"
              />
              <button
                onClick={() => setMode("grid")}
                aria-label="Cancel"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text-dim hover:text-text"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {mode === "compare" && (
          <div>
            <button
              onClick={() => setMode("grid")}
              className="mb-3 text-sm text-accent hover:opacity-80"
            >
              ← Back to grid
            </button>
            {comparePhotos.length === 2 ? (
              <div className="grid grid-cols-2 gap-3">
                {comparePhotos.map((p) => (
                  <div
                    key={p.id}
                    className="overflow-hidden rounded-[14px] border border-border"
                  >
                    <img
                      src={p.dataUrl}
                      alt={formatPastDate(p.at)}
                      className="aspect-[3/4] w-full object-cover"
                    />
                    <div className="flex items-center justify-between px-2.5 py-2 text-xs">
                      <span className="text-text-dim">
                        {formatPastDate(p.at)}
                      </span>
                      {p.weightKg != null && (
                        <span className="font-mono text-text">
                          {p.weightKg}kg
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-text-dim">
                Pick two photos from the grid to compare.
              </p>
            )}
          </div>
        )}

        {mode === "grid" && (
          <>
            <div className="mb-4 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setMode("camera")}
                className="flex items-center justify-center gap-2 rounded-[12px] bg-accent/15 py-3 text-sm font-medium text-accent transition-colors hover:bg-accent/25"
              >
                <CameraIcon size={15} /> Take photo
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-[12px] bg-field py-3 text-sm font-medium text-text-dim transition-colors hover:text-text"
              >
                <Upload size={15} /> Upload
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChosen}
                className="hidden"
              />
            </div>

            {compareIds.length > 0 && (
              <button
                onClick={() => setMode("compare")}
                disabled={compareIds.length !== 2}
                className="mb-3 w-full rounded-full bg-field py-2 text-xs font-medium text-text-dim disabled:opacity-50"
              >
                Compare selected ({compareIds.length}/2)
              </button>
            )}

            {photos.length === 0 ? (
              <p className="py-16 text-center text-sm text-text-dim">
                No photos yet — take or upload your first one.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {[...photos].reverse().map((p) => {
                  const checked = compareIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className={`group relative overflow-hidden rounded-[14px] border ${
                        checked ? "border-accent" : "border-border"
                      }`}
                    >
                      <button
                        onClick={() => toggleCompare(p.id)}
                        className="block w-full"
                      >
                        <img
                          src={p.dataUrl}
                          alt={formatPastDate(p.at)}
                          className="aspect-[3/4] w-full object-cover"
                        />
                      </button>
                      <div className="flex items-center justify-between bg-surface px-2 py-1.5 text-[11px]">
                        <span className="text-text-dim">
                          {formatPastDate(p.at)}
                        </span>
                        {p.weightKg != null && (
                          <span className="font-mono text-text">
                            {p.weightKg}kg
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => onDelete(p.id)}
                        aria-label="Delete photo"
                        className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
