"use client";

import React, { useEffect, useRef, useState } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import "@photo-sphere-viewer/core/index.css";
import { Loader2 } from "lucide-react";

interface PanoramaViewerProps {
    imageUrl: string;
    caption?: string;
    height?: string;
}

export default function PanoramaViewer({ imageUrl, caption, height = "500px" }: PanoramaViewerProps) {
    const viewerRef = useRef<HTMLDivElement>(null);
    const viewerInstance = useRef<Viewer | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let viewer: Viewer | null = null;
        let isMounted = true;
        setIsLoading(true);

        const initViewer = setTimeout(() => {
            if (!isMounted || !viewerRef.current) return;

            viewerRef.current.innerHTML = "";

            viewer = new Viewer({
                container: viewerRef.current,
                panorama: imageUrl,
                caption: caption || "Visite Virtuelle 360°",
                loadingTxt: "Chargement de la vue 360°...",
                navbar: [
                    "zoom",
                    "caption",
                    "fullscreen",
                ],
            });

            viewer.addEventListener("panorama-loaded", () => {
                if (isMounted) setIsLoading(false);
            });

            viewer.addEventListener("ready", () => {
                if (isMounted) setIsLoading(false);
            });

            viewer.addEventListener("panorama-error", (e) => {
                console.error("Viewer error:", e);
                if (isMounted) setIsLoading(false);
            });

            viewerInstance.current = viewer;

            setTimeout(() => {
                if (isMounted) setIsLoading(false);
            }, 3000);
        }, 150);

        return () => {
            isMounted = false;
            clearTimeout(initViewer);
            if (viewer) {
                viewer.destroy();
            }
            viewerInstance.current = null;
        };
    }, [imageUrl, caption]);

    return (
        <div className="relative" style={{ width: "100%", height }}>
            {isLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100 rounded-lg">
                    <Loader2 size={40} className="animate-spin text-primary mb-3" />
                    <p className="text-slate-500 font-medium">Chargement de la vue 360°...</p>
                </div>
            )}
            <div ref={viewerRef} style={{ width: "100%", height, borderRadius: "0.5rem", overflow: "hidden" }} className="shadow-lg" />
        </div>
    );
}
