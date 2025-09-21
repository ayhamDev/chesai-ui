// src/components/MobileFrame.tsx

import React, { useState } from "react";
// Import icons from lucide-react
import { BatteryFull, Signal, Wifi } from "lucide-react";

// Define the type for the component's props
interface MobileFrameProps {
  initialUrl?: string;
}

/**
 * A helper function to intelligently convert a standard URL to its potential mobile version.
 * @param {string} originalUrl - The URL to convert.
 * @returns {string} The potentially mobile-optimized URL.
 */
const convertToMobileUrl = (originalUrl: string): string => {
  try {
    const url = new URL(originalUrl);
    if (url.hostname.startsWith("www.")) {
      url.hostname = url.hostname.replace("www.", "m.");
    }
    return url.toString();
  } catch (error) {
    console.error("Invalid URL for conversion:", originalUrl);
    return originalUrl;
  }
};

const MobileFrame: React.FC<MobileFrameProps> = ({
  initialUrl = "https://www.apple.com",
}) => {
  const mobileInitialUrl = convertToMobileUrl(initialUrl);

  const [url, setUrl] = useState<string>(mobileInitialUrl);
  const [inputValue, setInputValue] = useState<string>(mobileInitialUrl);

  const handleLoadUrl = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let newUrl = inputValue.trim();

    if (
      newUrl &&
      !newUrl.startsWith("http://") &&
      !newUrl.startsWith("https://")
    ) {
      newUrl = "https://" + newUrl;
    }

    const mobileUrl = convertToMobileUrl(newUrl);
    setUrl(mobileUrl);
    setInputValue(mobileUrl);
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-4 bg-gray-100 rounded-xl">
      {/* URL Input Controls */}
      <form onSubmit={handleLoadUrl} className="flex gap-2 w-full max-w-md">
        <input
          type="url"
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInputValue(e.target.value)
          }
          placeholder="Enter a URL..."
          className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Load
        </button>
      </form>

      {/* iPhone 15 Pro Frame */}
      <div className="relative w-[393px] h-[852px] bg-gradient-to-br from-slate-700 to-slate-900 rounded-[60px] shadow-2xl p-2">
        {/* Physical Buttons */}
        <div className="absolute left-[-4px] top-[110px] w-1 h-8 bg-slate-700 rounded-l-md"></div>
        <div className="absolute left-[-4px] top-[180px] w-1 h-14 bg-slate-700 rounded-l-md"></div>
        <div className="absolute left-[-4px] top-[250px] w-1 h-14 bg-slate-700 rounded-l-md"></div>
        <div className="absolute right-[-4px] top-[200px] w-1 h-24 bg-slate-700 rounded-r-md"></div>

        {/* Inner Bezel / Screen Area */}
        <div className="w-full h-full bg-black rounded-[52px] overflow-hidden relative">
          <iframe
            key={url}
            src={url}
            title="Mobile Content"
            className="w-full h-full border-none"
            sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          />

          {/* Dynamic Island */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-36 h-9 bg-black rounded-full z-10"></div>

          {/* Status Bar Content */}
          <div className="absolute top-0 left-0 w-full h-12 z-20 text-white/95 text-sm font-bold pointer-events-none">
            <div className="flex justify-between items-center px-9 pt-6">
              <span>9:41</span>
              <div className="flex items-center gap-2">
                <Signal size={17} strokeWidth={2.5} />
                <Wifi size={17} strokeWidth={2.5} />
                <BatteryFull size={22} strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-1.5 bg-gray-400 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default MobileFrame;
