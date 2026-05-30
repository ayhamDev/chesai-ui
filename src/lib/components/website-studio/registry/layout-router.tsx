import React from "react";
import { LayoutRouter } from "../../layout-router";
import { Card } from "../../card";
import { Typography } from "../../typography";
import type { RegistryComponent } from "../types";

export const LayoutRouterConfig: RegistryComponent = {
  name: "Shared Element Router",
  category: "Interactions",
  render: ({ duration, dismissible, dismissDirection, ...props }) => {
    return (
      <div className="w-full h-[500px] border border-dashed border-outline-variant/50 rounded-2xl bg-surface-container-lowest overflow-hidden shadow-sm" {...props}>
        <LayoutRouter duration={duration}>
          <LayoutRouter.List>
            <div className="p-4 grid grid-cols-2 gap-4 h-full">
              {[1, 2].map((id) => (
                <LayoutRouter.Link key={id} id={`item-${id}`} className="cursor-pointer">
                  <Card variant="surface-container" shape="minimal" padding="none" className="h-40 overflow-hidden relative group">
                    <LayoutRouter.SharedElement tag="bg" className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors">{null}</LayoutRouter.SharedElement>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <LayoutRouter.SharedElement tag="title">
                        <Typography variant="title-medium" className="font-bold text-primary">Item {id}</Typography>
                      </LayoutRouter.SharedElement>
                    </div>
                  </Card>
                </LayoutRouter.Link>
              ))}
            </div>
          </LayoutRouter.List>

          {[1, 2].map((id) => (
            <LayoutRouter.Screen
              key={id}
              id={`item-${id}`}
              presentation="modal"
              dismissible={dismissible}
              dismissDirection={dismissDirection}
            >
              <div className="w-full h-[400px] flex flex-col p-6">
                <LayoutRouter.SharedElement tag="bg" className="absolute inset-0 bg-surface-container-high rounded-[inherit] -z-10">{null}</LayoutRouter.SharedElement>
                <LayoutRouter.SharedElement tag="title">
                  <Typography variant="display-small" className="font-bold text-primary mb-4">Item {id}</Typography>
                </LayoutRouter.SharedElement>
                <Typography variant="body-medium" className="opacity-70">
                  This is the detailed view. Notice how the background and title smoothly morphed from their list positions.
                  {dismissible ? ` Swipe ${dismissDirection === 'y' ? 'down' : 'right'} to dismiss.` : ' Click the backdrop to close.'}
                </Typography>
              </div>
            </LayoutRouter.Screen>
          ))}
        </LayoutRouter>
      </div>
    );
  },
  controls: {
    duration: {
      type: "slider",
      label: "Animation Duration (seconds)",
      group: "Behavior",
      defaultValue: 0.5,
      min: 0.2,
      max: 1.5,
      step: 0.1,
    },
    dismissible: {
      type: "boolean",
      label: "Swipe to Dismiss",
      group: "Behavior",
      defaultValue: true,
    },
    dismissDirection: {
      type: "select",
      label: "Dismiss Direction",
      group: "Behavior",
      defaultValue: "y",
      hidden: (props) => !props.dismissible,
      options: [
        { label: "Vertical (Y)", value: "y" },
        { label: "Horizontal (X)", value: "x" },
      ],
    },
  },
};
