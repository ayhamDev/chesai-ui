"use client";

import React, { ReactNode, useEffect, useLayoutEffect, useState } from "react";

// @ts-ignore - The new React 19 Activity Component
const ReactActivity = React.Activity;

// Graceful fallback for older React versions that don't support Activity yet.
// `display: contents` ensures the wrapper div doesn't mess up CSS Grid/Flexbox layouts.
const ActivityWrapper = ReactActivity
  ? ReactActivity
  : ({ mode, children }: any) => (
      <div style={{ display: mode === "hidden" ? "none" : "contents" }}>
        {children}
      </div>
    );

// --- Types ---
export type OSType =
  | "windows"
  | "mac"
  | "ios"
  | "android"
  | "linux"
  | "unknown";
export type DeviceType = "desktop" | "mobile" | "tablet" | "tv" | "unknown";
export type ScreenSize = "sm" | "md" | "lg" | "xl" | "2xl";

export interface EnvState {
  os: OSType;
  device: DeviceType;
  width: number;
  size: ScreenSize;
}

export interface MatchProps {
  /** Target Operating System(s) */
  os?: OSType | OSType[];
  /** Target Device Type(s) */
  device?: DeviceType | DeviceType[];
  /** Target Screen Size bracket(s) */
  size?: ScreenSize | ScreenSize[];
  /** Minimum screen width in pixels */
  minWidth?: number;
  /** Maximum screen width in pixels */
  maxWidth?: number;
  /** Set to true if this should be the default when no other Match passes */
  fallback?: boolean;
  children: ReactNode;
}

export interface AdaptiveActivityProps {
  children: ReactNode;
  /** Optional override for testing / Storybook purposes */
  envOverride?: Partial<EnvState>;
}

// --- Environment Detection ---
const getEnvState = (override?: Partial<EnvState>): EnvState => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      os: "unknown",
      device: "desktop",
      width: 1024,
      size: "lg",
      ...override,
    };
  }

  const ua = navigator.userAgent;
  let os: OSType = "unknown";

  if (/Win/i.test(ua)) os = "windows";
  else if (/Mac/i.test(ua)) {
    // iPadOS 13+ spoofs Safari on Mac. Check touch points to differentiate.
    if (navigator.maxTouchPoints > 1) os = "ios";
    else os = "mac";
  } else if (/iPhone|iPad|iPod/i.test(ua)) os = "ios";
  else if (/Android/i.test(ua)) os = "android";
  else if (/Linux/i.test(ua)) os = "linux";

  let device: DeviceType = "desktop";

  // Robust TV detection
  if (
    /TV|SmartTV|AppleTV|GoogleTV|Roku|WebOS|Tizen|HbbTV|PlayStation|Xbox|BRAVIA/i.test(
      ua,
    )
  ) {
    device = "tv";
  } else if (
    /iPad|Tablet/i.test(ua) ||
    (os === "android" && !/Mobile/i.test(ua))
  ) {
    device = "tablet";
  } else if (/Mobi|iPhone|iPod/i.test(ua) || os === "android" || os === "ios") {
    device = "mobile";
  }

  const width = window.innerWidth;
  let size: ScreenSize = "sm";

  if (width >= 1536) size = "2xl";
  else if (width >= 1280) size = "xl";
  else if (width >= 1024) size = "lg";
  else if (width >= 768) size = "md";

  return { os, device, width, size, ...override };
};

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// --- Sub-component ---
/**
 * AdaptiveActivity.Match
 * Defines a view that renders conditionally based on device/screen rules.
 */
const Match: React.FC<MatchProps> = ({ children }) => {
  return <>{children}</>;
};
Match.displayName = "AdaptiveActivity.Match";

// --- Main Component ---
/**
 * AdaptiveActivity
 * Uses React 19's <Activity> component to preserve the state, DOM, and context
 * of hidden views while seamlessly switching between adaptive device/screen layouts.
 */
export const AdaptiveActivityRoot = ({
  children,
  envOverride,
}: AdaptiveActivityProps) => {
  const [env, setEnv] = useState<EnvState>(() => getEnvState(envOverride));

  useIsomorphicLayoutEffect(() => {
    const handleResize = () => setEnv(getEnvState(envOverride));
    window.addEventListener("resize", handleResize);
    // Sync initial state if override changes
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [envOverride]);

  const childArray = React.Children.toArray(children).filter(
    React.isValidElement,
  );

  let activeIndex = -1;
  let fallbackIndex = -1;

  for (let i = 0; i < childArray.length; i++) {
    const child = childArray[i];
    const props = child.props as MatchProps;

    if (props.fallback) {
      fallbackIndex = i;
      continue;
    }

    let isMatch = true;

    if (props.os) {
      const osArr = Array.isArray(props.os) ? props.os : [props.os];
      if (!osArr.includes(env.os)) isMatch = false;
    }

    if (props.device) {
      const devArr = Array.isArray(props.device)
        ? props.device
        : [props.device];
      if (!devArr.includes(env.device)) isMatch = false;
    }

    if (props.size) {
      const sizeArr = Array.isArray(props.size) ? props.size : [props.size];
      if (!sizeArr.includes(env.size)) isMatch = false;
    }

    if (props.minWidth !== undefined && env.width < props.minWidth)
      isMatch = false;
    if (props.maxWidth !== undefined && env.width > props.maxWidth)
      isMatch = false;

    if (isMatch) {
      activeIndex = i;
      break; // Stop at first valid match
    }
  }

  const renderIndex = activeIndex !== -1 ? activeIndex : fallbackIndex;

  // We map through ALL valid children and wrap them in an <Activity> boundary.
  // The matched component gets mode="visible", all others get mode="hidden".
  // This tells React to pause their effects and drop their priority without wiping their states!
  return (
    <>
      {childArray.map((child, index) => {
        const isActive = index === renderIndex;
        return (
          <ActivityWrapper key={index} mode={isActive ? "visible" : "hidden"}>
            {child}
          </ActivityWrapper>
        );
      })}
    </>
  );
};

export const AdaptiveActivity = Object.assign(AdaptiveActivityRoot, {
  Match,
});
