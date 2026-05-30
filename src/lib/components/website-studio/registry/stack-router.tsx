import React from "react";
import { createStackNavigator } from "../../stack-router";
import { Typography } from "../../typography";
import { Button } from "../../button";
import type { RegistryComponent } from "../types";

// Create a mock stack specifically for the Studio Canvas
const MockStack = createStackNavigator<any>();

const MockScreen = ({ route, navigation }: any) => (
  <div className="p-6 pt-24 text-center opacity-50 flex flex-col items-center gap-4 h-full bg-surface">
    <Typography variant="title-medium" className="font-bold">
      {route?.name || "Screen"}
    </Typography>
    <Typography variant="body-medium">
      This is a nested screen rendered by the StackRouter.
    </Typography>
    <Button 
      variant="secondary" 
      onClick={() => navigation.push("Details")}
    >
      Simulate Navigation
    </Button>
  </div>
);

export const StackRouterConfig: RegistryComponent = {
  name: "Stack Router",
  category: "Navigation",
  render: ({ mode, initialRouteName, variant, ...props }) => {
    return (
      <div className="w-full flex justify-center py-8" {...props}>
        {/* Mocking a mobile device frame to contain the router gracefully */}
        <div className="w-[393px] h-[852px] bg-background border-8 border-surface-container-highest rounded-[48px] overflow-hidden shadow-2xl relative">
          <MockStack.Navigator 
            initialRouteName={initialRouteName || "Home"} 
            mode={mode || "memory"}
          >
            <MockStack.Screen 
              name="Home" 
              component={MockScreen} 
              options={{
                headerTitle: "Home",
                appBarProps: { color: variant || "surface-container", variant: "medium" }
              }} 
            />
            <MockStack.Screen 
              name="Details" 
              component={MockScreen} 
              options={{
                headerTitle: "Details",
                appBarProps: { color: variant || "surface-container", variant: "small" }
              }} 
            />
          </MockStack.Navigator>
        </div>
      </div>
    );
  },
  controls: {
    initialRouteName: {
      type: "text",
      label: "Initial Route Name",
      group: "Routing",
      defaultValue: "Home",
    },
    mode: {
      type: "select",
      label: "Routing Mechanism",
      group: "Routing",
      defaultValue: "memory",
      options: [
        { label: "Memory (Internal Stack)", value: "memory" },
        { label: "Path (URL Sync)", value: "path" },
      ],
    },
    variant: {
      type: "select",
      label: "Default AppBar Color",
      group: "Aesthetics",
      defaultValue: "surface-container",
      options: [
        { label: "Surface Container", value: "surface-container" },
        { label: "Primary", value: "primary" },
        { label: "Transparent", value: "transparent" },
      ],
    },
  },
};
