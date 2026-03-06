
'use client';

import { useAppStore } from "@/store/useStore";
import { useEffect, useRef } from "react";
import type { Data } from "@/types";

export function DataHydrator({ initialData }: { initialData: Data }) {
    const { setData } = useAppStore();
    const prevDataJson = useRef("");

    useEffect(() => {
        if (initialData) {
            // Simple heuristic: If server returns completely empty data (no sectors, no companies), 
            // it's likely a connection failure or uninitialized DB. 
            // In this case, we PRESERVE the local persisted state (Mocks or previous edits) instead of wiping it.
            const hasData = initialData.sectors.length > 0 || initialData.companies.length > 0;

            if (!hasData) {
                console.warn("[DataHydrator] Server returned empty data. Skipping hydration to preserve local state.");
                return;
            }

            const currentDataJson = JSON.stringify(initialData);
            if (prevDataJson.current !== currentDataJson) {
                console.log("Hydrating Store with new data from Server");
                setData(initialData);
                prevDataJson.current = currentDataJson;
            }
        }
    }, [initialData, setData]);

    return null;
}
