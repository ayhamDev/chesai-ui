import React from "react";
import { Dropzone } from "../../dropzone";
import type { RegistryComponent } from "../types";

export const DropzoneConfig: RegistryComponent = {
  name: "File Dropzone",
  category: "Forms",
  render: ({ label, description, accept, multiple, maxSize, disabled, ...props }) => {
    return (
      <div className="w-full" {...props}>
        <Dropzone
          label={label}
          description={description}
          accept={accept}
          multiple={multiple}
          maxSize={maxSize ? maxSize * 1024 * 1024 : undefined}
          disabled={disabled}
          onDrop={() => console.log("File dropped in Studio preview")}
        />
      </div>
    );
  },
  controls: {
    label: {
      type: "text",
      label: "Main Label Text",
      defaultValue: "Upload Document",
      group: "Content",
      supportsCMS: true,
    },
    description: {
      type: "text",
      label: "Sub-Description",
      defaultValue: "Drag and drop your files here, or click to browse.",
      group: "Content",
      supportsCMS: true,
    },
    accept: {
      type: "text",
      label: "Accepted File Types",
      description: "e.g. .pdf, .jpg, .png",
      defaultValue: ".pdf, .png, .jpg",
      group: "Validation",
    },
    multiple: {
      type: "boolean",
      label: "Allow Multiple Files",
      defaultValue: true,
      group: "Validation",
    },
    maxSize: {
      type: "number",
      label: "Max Size per File (MB)",
      defaultValue: 5,
      group: "Validation",
    },
    disabled: {
      type: "boolean",
      label: "Disabled",
      defaultValue: false,
      group: "State",
    },
  },
};
