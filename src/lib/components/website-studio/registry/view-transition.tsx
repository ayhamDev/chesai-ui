import React from "react";
import { TransitionLink } from "../../view-transition";
import { Card } from "../../card";
import { Typography } from "../../typography";
import type { RegistryComponent } from "../types";

export const ViewTransitionConfig: RegistryComponent = {
  name: "Shared Transition Link",
  category: "Interactions",
  acceptsChildren: true,
  render: ({ linkTo, transitionName, children, ...props }) => (
    <div className="w-fit inline-block" {...props}>
      <TransitionLink onNavigate={() => console.log(`Navigating to ${linkTo}`)}>
        {children || (
          <Card 
            variant="surface-container-high" 
            shape="minimal" 
            padding="sm" 
            className="cursor-pointer hover:bg-surface-container-highest transition-colors"
            style={{ viewTransitionName: transitionName || 'demo-card' }}
          >
            <Typography variant="body-medium" className="font-bold">
              Transition Target
            </Typography>
            <Typography variant="body-small" muted>
              Click me to morph
            </Typography>
          </Card>
        )}
      </TransitionLink>
    </div>
  ),
  controls: {
    linkTo: {
      type: "link",
      label: "Navigate To",
      group: "Behavior",
      supportsCMS: true,
    },
    transitionName: {
      type: "text",
      label: "viewTransitionName (CSS)",
      group: "Behavior",
      description: "Must match the target element on the next page exactly.",
      defaultValue: "shared-hero-image",
    },
  },
};
