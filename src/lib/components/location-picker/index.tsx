"use client";

import { useDebounce } from "@uidotdev/usehooks";
import { clsx } from "clsx";
import { Check, MapPin } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ViewState } from "react-map-gl/maplibre";
import { Button } from "../button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../item";
import { Map } from "../map";
import { SearchView } from "../search-view";
import { Typography } from "../typography";

// --- Types ---

export interface SearchResult {
  id: string | number;
  label: string;
  description?: string;
  latitude: number;
  longitude: number;
}

// @ts-expect-error
export interface LocationPickerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Initial coordinates [longitude, latitude] */
  defaultCoordinates?: [number, number];
  /** Callback when user confirms selection */
  onSelect?: (
    coordinates: { latitude: number; longitude: number },
    zoom: number,
  ) => void;
  /** Callback when Cancel is clicked */
  onCancel?: () => void;
  /** Search logic callback */
  onSearch?: (query: string) => Promise<SearchResult[]>;
  /** Optional: Callback when map stops moving */
  onMapIdle?: (coordinates: { latitude: number; longitude: number }) => void;

  // UI Configuration
  title?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;

  /**
   * Custom footer component.
   * If provided, the default footer container is removed entirely.
   * Use this to render a Sheet or custom overlay.
   */
  footer?: (props: {
    onConfirm: () => void;
    onCancel: () => void;
    latitude: number;
    longitude: number;
  }) => React.ReactNode;
}

export const LocationPicker = ({
  className,
  defaultCoordinates = [-0.1276, 51.5072],
  onSelect,
  onCancel,
  onSearch,
  onMapIdle,
  title = "Select Location",
  placeholder = "Search for a place...",
  confirmLabel = "Confirm Location",
  cancelLabel = "Cancel",
  footer,
  ...props
}: LocationPickerProps) => {
  // --- STATE ---

  const [viewState, setViewState] = useState<Partial<ViewState>>({
    longitude: defaultCoordinates[0],
    latitude: defaultCoordinates[1],
    zoom: 12,
  });

  const [displayCoords, setDisplayCoords] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: defaultCoordinates[1],
    lng: defaultCoordinates[0],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const lastUpdateRef = useRef(0);

  // --- LOGIC ---

  useEffect(() => {
    const runSearch = async () => {
      if (!debouncedQuery || !onSearch) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await onSearch(debouncedQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    };
    runSearch();
  }, [debouncedQuery, onSearch]);

  const handleSelectResult = (result: SearchResult) => {
    setViewState({
      longitude: result.longitude,
      latitude: result.latitude,
      zoom: 14,
    });
    setDisplayCoords({ lat: result.latitude, lng: result.longitude });
    onMapIdle?.({
      latitude: result.latitude,
      longitude: result.longitude,
    });
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleConfirm = () => {
    if (onSelect) {
      onSelect(
        { latitude: displayCoords.lat, longitude: displayCoords.lng },
        viewState.zoom || 12,
      );
    }
  };

  const handleMapMove = useCallback((evt: any) => {
    setViewState(evt.viewState);

    const now = Date.now();
    if (now - lastUpdateRef.current > 60) {
      setDisplayCoords({
        lat: evt.viewState.latitude,
        lng: evt.viewState.longitude,
      });
      lastUpdateRef.current = now;
    }
  }, []);

  const handleMapIdle = useCallback(
    (evt: any) => {
      const { latitude, longitude } = evt.viewState;
      setDisplayCoords({ lat: latitude, lng: longitude });
      onMapIdle?.({ latitude, longitude });
    },
    [onMapIdle],
  );

  // --- RENDER ---

  return (
    <div
      className={clsx(
        "flex flex-col relative w-full h-full bg-surface-container-low overflow-hidden",
        className,
      )}
      {...props}
    >
      {/* TOP SEARCH BAR */}
      <div className="absolute top-4 left-4 right-4 z-10 max-w-md mx-auto">
        <SearchView
          variant="docked"
          value={searchQuery}
          onChange={setSearchQuery}
          open={isSearchOpen}
          onOpenChange={setIsSearchOpen}
          placeholder={placeholder}
          className="shadow-xl border border-outline-variant/40"
          dockedLeadingIcon={<MapPin className="w-5 h-5 text-primary" />}
        >
          <div className="p-2">
            {isSearching ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((result) => (
                <Item
                  key={result.id}
                  variant="ghost"
                  className="cursor-pointer"
                  onClick={() => handleSelectResult(result)}
                >
                  <ItemMedia>
                    <MapPin className="w-5 h-5 text-on-surface-variant" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{result.label}</ItemTitle>
                    {result.description && (
                      <ItemDescription>{result.description}</ItemDescription>
                    )}
                  </ItemContent>
                </Item>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {searchQuery
                  ? "No results found"
                  : "Start typing to find a place"}
              </div>
            )}
          </div>
        </SearchView>
      </div>

      {/* MAP AREA */}
      <div className="flex-1 relative isolate">
        <Map
          longitude={viewState.longitude}
          latitude={viewState.latitude}
          zoom={viewState.zoom}
          onMove={handleMapMove}
          onMoveEnd={handleMapIdle}
          shape="sharp"
          className="w-full h-full"
        >
          <Map.Controls position="bottom-right" showLocate />
        </Map>

        {/* FIXED CENTER PIN */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center pb-8 z-20">
          <div className="relative flex flex-col items-center">
            <div className="w-4 h-4 bg-black/30 rounded-full blur-[2px] absolute bottom-0 translate-y-1/2 scale-x-125" />
            <MapPin
              size={48}
              className="text-primary fill-primary-container animate-bounce"
              strokeWidth={2}
            />
          </div>
        </div>
      </div>

      {/* FOOTER - Conditionally Rendered */}
      {footer ? (
        footer({
          onConfirm: handleConfirm,
          onCancel: onCancel || (() => {}),
          latitude: displayCoords.lat,
          longitude: displayCoords.lng,
        })
      ) : (
        <div className="bg-surface-container border-t border-outline-variant shrink-0 z-20 shadow-[0_-4px_20px_-12px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left w-full sm:w-auto">
              <Typography variant="label-large" className="font-bold">
                {title}
              </Typography>
              <Typography
                variant="body-small"
                className="text-muted-foreground"
              >
                Drag map to adjust location
              </Typography>
              <Typography
                variant="label-small"
                className="font-mono tabular-nums opacity-60 mt-1"
              >
                {displayCoords.lat.toFixed(5)}, {displayCoords.lng.toFixed(5)}
              </Typography>
            </div>
            <div className="flex w-full sm:w-auto gap-3">
              {onCancel && (
                <Button
                  variant="ghost"
                  className="flex-1 sm:flex-none"
                  onClick={onCancel}
                >
                  {cancelLabel}
                </Button>
              )}
              <Button
                variant="primary"
                startIcon={<Check size={18} />}
                className="flex-1 sm:flex-none"
                onClick={handleConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
