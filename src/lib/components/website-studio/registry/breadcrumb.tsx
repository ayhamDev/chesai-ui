import React from "react";
import * as Icons from "lucide-react";
import { Breadcrumb } from "../../breadcrumb";
import type { RegistryComponent } from "../types";

export const BreadcrumbConfig: RegistryComponent = {
  name: "Breadcrumb",
  category: "Navigation",
  render: ({ pathString, separatorIcon, ...props }) => {
    const paths = (pathString || "Home, Category, Current Page")
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);

    const SeparatorIcon = separatorIcon ? (Icons as any)[separatorIcon] : null;

    return (
      <div className="w-full" {...props}>
        <Breadcrumb>
          <Breadcrumb.List>
            {paths.map((path: string, index: number) => {
              const isLast = index === paths.length - 1;
              return (
                <React.Fragment key={index}>
                  <Breadcrumb.Item>
                    {isLast ? (
                      <Breadcrumb.Page>{path}</Breadcrumb.Page>
                    ) : (
                      <Breadcrumb.Link href="#">{path}</Breadcrumb.Link>
                    )}
                  </Breadcrumb.Item>
                  {!isLast && (
                    <Breadcrumb.Separator>
                      {SeparatorIcon ? <SeparatorIcon size={14} /> : undefined}
                    </Breadcrumb.Separator>
                  )}
                </React.Fragment>
              );
            })}
          </Breadcrumb.List>
        </Breadcrumb>
      </div>
    );
  },
  controls: {
    pathString: {
      type: "textarea",
      label: "Path Items (Comma Separated)",
      defaultValue: "Home, Products, Shoes",
      group: "Content",
      supportsCMS: true,
    },
    separatorIcon: {
      type: "text",
      label: "Separator Icon (Lucide)",
      description: "Leave empty for default Chevron. Try 'Slash' or 'Minus'",
      defaultValue: "ChevronRight",
      group: "Aesthetics",
    },
  },
};
