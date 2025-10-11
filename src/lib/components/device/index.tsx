/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
import { Battery, Camera, Power, Signal, Wifi } from "lucide-react";
import React, { useState } from "react";
import { Typography } from "../typography";

const iPhone15Frame = ({
  children,
  variant = "pro",
  color = "titanium-black",
}) => {
  const [isOn, setIsOn] = useState(true);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  );

  // Update time every minute
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const frameColors = {
    "titanium-black": "bg-gray-900",
    "titanium-white": "bg-gray-100",
    "titanium-blue": "bg-blue-900",
    "titanium-natural": "bg-gray-700",
    pink: "bg-pink-300",
    yellow: "bg-yellow-300",
    green: "bg-green-300",
    blue: "bg-blue-400",
    black: "bg-black",
  };

  const borderColor = frameColors[color] || frameColors["titanium-black"];

  return (
    <div className="relative">
      {/* Phone Frame */}
      <div
        className={`relative w-[393px] h-[852px] ${borderColor} rounded-[60px] p-[12px] shadow-2xl transform perspective-1000`}
      >
        {/* Inner bezel */}
        <div className="relative w-full h-full bg-black rounded-[48px] overflow-hidden">
          {/* Screen */}
          <div
            className={`relative w-full h-full ${
              isOn ? "bg-white" : "bg-black"
            } rounded-[48px] overflow-hidden`}
          >
            {/* Dynamic Island */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
              <div className="relative">
                <div className="bg-black w-[126px] h-[37px] rounded-full flex items-center justify-center">
                  <div className="absolute left-3 w-2 h-2 bg-gray-900 rounded-full"></div>
                  <Camera className="w-3 h-3 text-gray-800" />
                </div>
              </div>
            </div>

            {/* Status Bar */}
            {isOn && (
              <div className="absolute top-0 left-0 right-0 h-14 flex items-end pb-1 px-8 justify-between z-40">
                <div className="flex items-center gap-1">
                  <span className="text-black text-sm font-semibold">
                    {currentTime}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Signal className="w-4 h-4 text-black" />
                  <Wifi className="w-4 h-4 text-black" />
                  <Battery className="w-5 h-5 text-black" />
                </div>
              </div>
            )}

            {/* Content Area */}
            {isOn && (
              <div className="w-full h-full pt-14 pb-8 overflow-hidden relative">
                {children || (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-8">
                      <div className="mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                          <Camera className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        iPhone 15 {variant === "pro" ? "Pro" : ""}
                      </h2>
                      <p className="text-gray-600">Your content goes here</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Screen off state */}
            {!isOn && (
              <div className="flex items-center justify-center h-full">
                <Power className="w-12 h-12 text-gray-800" />
              </div>
            )}
          </div>
        </div>

        {/* Physical Buttons */}

        {/* Power Button */}
        <button
          onClick={() => setIsOn(!isOn)}
          className="absolute -right-[3px] top-[200px] w-[3px] h-[80px] bg-gray-700 rounded-r-lg hover:bg-gray-600 transition-colors"
          aria-label="Power"
        />

        {/* Volume Up */}
        <button
          className="absolute -left-[3px] top-[160px] w-[3px] h-[50px] bg-gray-700 rounded-l-lg hover:bg-gray-600 transition-colors"
          aria-label="Volume Up"
        />

        {/* Volume Down */}
        <button
          className="absolute -left-[3px] top-[220px] w-[3px] h-[50px] bg-gray-700 rounded-l-lg hover:bg-gray-600 transition-colors"
          aria-label="Volume Down"
        />

        {/* Action Button (Pro models) */}
        {variant === "pro" && (
          <button
            className="absolute -left-[3px] top-[120px] w-[3px] h-[30px] bg-orange-600 rounded-l-lg hover:bg-orange-500 transition-colors"
            aria-label="Action Button"
          />
        )}
      </div>

      {/* Device Name */}
    </div>
  );
};

export default iPhone15Frame;
