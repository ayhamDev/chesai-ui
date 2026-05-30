import React from "react";
import { AvatarGroup } from "../../avatar/AvatarGroup";
import { Avatar } from "../../avatar";
import type { RegistryComponent } from "../types";

export const AvatarGroupConfig: RegistryComponent = {
  name: "Avatar Group",
  category: "Media",
  acceptsChildren: true,
  render: ({ max, children, ...props }) => (
    <div className="w-fit inline-block" {...props}>
      <AvatarGroup max={max}>
        {children || (
          <>
            <Avatar src="https://i.pravatar.cc/150?u=1" fallback="A" />
            <Avatar src="https://i.pravatar.cc/150?u=2" fallback="B" />
            <Avatar src="https://i.pravatar.cc/150?u=3" fallback="C" />
            <Avatar src="https://i.pravatar.cc/150?u=4" fallback="D" />
            <Avatar src="https://i.pravatar.cc/150?u=5" fallback="E" />
          </>
        )}
      </AvatarGroup>
    </div>
  ),
  controls: {
    max: {
      type: "number",
      label: "Maximum Avatars to Show",
      description: "Any extra avatars will be grouped into a +X circle.",
      group: "Layout",
      defaultValue: 4,
      min: 1,
      max: 20,
      step: 1,
    },
  },
};
