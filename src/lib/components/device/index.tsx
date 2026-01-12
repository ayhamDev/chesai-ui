/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import {
  Battery,
  Camera,
  Laptop,
  Power,
  Signal,
  Smartphone,
  Tablet,
  Wifi,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "../button";
import { ButtonGroup } from "../button-group";
import { Typography } from "../typography";

// --- CVA Variants for dynamic styling ---
const frameVariants = cva(
  "relative p-3 bg-gray-900 shadow-2xl transition-all duration-300 ease-in-out",
  {
    variants: {
      device: {
        phone: "w-[393px] h-[852px] rounded-[60px] p-[12px]",
        tablet: "w-[768px] h-[1024px] rounded-[40px] p-[14px]",
        laptop: "w-[1280px] h-[800px] rounded-2xl p-2",
      },
    },
  }
);

const bezelVariants = cva("relative w-full h-full bg-black overflow-hidden", {
  variants: {
    device: {
      phone: "rounded-[48px]",
      tablet: "rounded-[28px]",
      laptop: "rounded-lg",
    },
  },
});

const screenVariants = cva("relative w-full h-full overflow-hidden", {
  variants: {
    device: {
      phone: "rounded-[48px]",
      tablet: "rounded-[28px]",
      laptop: "rounded-lg",
    },
    isOn: {
      true: "bg-white dark:bg-graphite-background",
      false: "bg-black",
    },
  },
});

type DeviceType = "phone" | "tablet" | "laptop";

interface DeviceFrameProps {
  children?: React.ReactNode;
  defaultType?: DeviceType;
}

const DeviceFrame = ({ children, defaultType = "phone" }: DeviceFrameProps) => {
  const [device, setDevice] = useState<DeviceType>(defaultType);
  const [isOn, setIsOn] = useState(true);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  );

  React.useEffect(() => {
    const timer = setInterval(
      () =>
        setCurrentTime(
          new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        ),
      60000
    );
    return () => clearInterval(timer);
  }, []);

  const FrameContent = (
    <div className="transform scale-[0.8] origin-top">
      {/* Phone Frame */}
      <div className={frameVariants({ device })}>
        {/* Inner bezel */}
        <div className={bezelVariants({ device })}>
          {/* Screen */}
          <div className={screenVariants({ device, isOn })}>
            {/* --- DEVICE-SPECIFIC UI --- */}
            {device === "phone" && (
              <>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[126px] h-[37px] rounded-full bg-black flex items-center justify-center">
                  <Camera className="w-3 h-3 text-gray-800" />
                </div>
                {isOn && (
                  <div className="absolute top-0 left-0 right-0 h-14 flex items-end pb-1 px-8 justify-between z-40 text-black">
                    <span className="text-sm font-semibold">{currentTime}</span>
                    <div className="flex items-center gap-1">
                      <Signal className="w-4 h-4" />
                      <Wifi className="w-4 h-4" />
                      <Battery className="w-5 h-5" />
                    </div>
                  </div>
                )}
              </>
            )}

            {device === "tablet" && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-2 h-2 rounded-full bg-black" />
            )}

            {device === "laptop" && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 w-[200px] h-[25px] rounded-b-lg bg-gray-900 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-black" />
              </div>
            )}

            {/* Content Area */}
            {isOn && (
              <div
                className={clsx(
                  "w-full h-full overflow-hidden relative",
                  "mt-12 pb-12"
                )}
              >
                {children}
              </div>
            )}

            {!isOn && (
              <div className="flex items-center justify-center h-full">
                <Power className="w-12 h-12 text-gray-800" />
              </div>
            )}
          </div>
        </div>

        {/* Physical Buttons (Phone only) */}
        {device === "phone" && (
          <>
            <button
              onClick={() => setIsOn(!isOn)}
              className="absolute -right-[3px] top-[200px] w-[3px] h-[80px] bg-gray-700 rounded-r-lg"
              aria-label="Power"
            />
            <button
              className="absolute -left-[3px] top-[160px] w-[3px] h-[50px] bg-gray-700 rounded-l-lg"
              aria-label="Volume Up"
            />
            <button
              className="absolute -left-[3px] top-[220px] w-[3px] h-[50px] bg-gray-700 rounded-l-lg"
              aria-label="Volume Down"
            />
          </>
        )}
        {/* Laptop Hinge */}
        {device === "laptop" && (
          <div className="absolute bottom-[-18px] left-[10%] w-[80%] h-[18px] bg-gray-800 rounded-b-lg z-[-1]">
            <div className="w-[100px] h-1 bg-gray-900 rounded-b-sm mx-auto mt-2" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <ButtonGroup shape="minimal">
        <Button
          variant={device === "phone" ? "primary" : "secondary"}
          onClick={() => setDevice("phone")}
          startIcon={<Smartphone className="h-4 w-4" />}
        >
          Phone
        </Button>
        <Button
          variant={device === "tablet" ? "primary" : "secondary"}
          onClick={() => setDevice("tablet")}
          startIcon={<Tablet className="h-4 w-4" />}
        >
          Tablet
        </Button>
        <Button
          variant={device === "laptop" ? "primary" : "secondary"}
          onClick={() => setDevice("laptop")}
          startIcon={<Laptop className="h-4 w-4" />}
        >
          Laptop
        </Button>
      </ButtonGroup>
      {FrameContent}
    </div>
  );
};

export default DeviceFrame;
