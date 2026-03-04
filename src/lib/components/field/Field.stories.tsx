import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { toast, Toaster } from "sonner";
import * as z from "zod";

import { Button } from "../button";
import { Card } from "../card";
import { Input } from "../input";
import { Typography } from "../typography";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "../input-group";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "./index";

const meta: Meta<typeof Field> = {
  title: "Components/Forms & Inputs/Forms (TanStack)",
  component: Field,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A composable form API inspired by Shadcn, featuring seamless integration with `@tanstack/react-form` and `zod`.",
      },
    },
  },
  decorators: [
    (Story) => (
      <>
        <Toaster />
        <Story />
      </>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Field>;

const formSchema = z.object({
  title: z
    .string()
    .min(5, "Bug title must be at least 5 characters.")
    .max(32, "Bug title must be at most 32 characters."),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(100, "Description must be at most 100 characters."),
});

export const BugReportForm: Story = {
  render: () => {
    const form = useForm({
      defaultValues: {
        title: "",
        description: "",
      },
      validators: {
        onChange: formSchema,
      },
      onSubmit: async ({ value }) => {
        toast.success("Bug Report Submitted", {
          description: (
            <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-surface-container-highest p-4 text-on-surface">
              <code>{JSON.stringify(value, null, 2)}</code>
            </pre>
          ),
          position: "bottom-right",
        });
      },
    });

    return (
      <Card className="w-full sm:w-[450px] p-0 overflow-hidden" shape="minimal">
        <div className="p-6 border-b border-outline-variant bg-surface-container-lowest">
          <Typography variant="title-medium" className="font-bold">
            Bug Report
          </Typography>
          <Typography variant="body-small" muted className="mt-1">
            Help us improve by reporting bugs you encounter.
          </Typography>
        </div>

        <div className="p-6">
          <form
            id="bug-report-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field
                name="title"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Bug Title</FieldLabel>
                      {/* Uses standard Chesai Input, passing isInvalid down */}
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        isInvalid={isInvalid}
                        placeholder="Login button not working on mobile"
                        autoComplete="off"
                        variant="faded"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="description"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                      <InputGroup>
                        <InputGroupTextarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="I'm having an issue with the login button on mobile."
                          minRows={4}
                          variant="flat"
                          isInvalid={isInvalid}
                        />
                        <InputGroupAddon align="block-end">
                          <InputGroupText className="tabular-nums">
                            {field.state.value.length}/100 characters
                          </InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                      <FieldDescription>
                        Include steps to reproduce, expected behavior, and what
                        actually happened.
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
            </FieldGroup>
          </form>
        </div>

        <div className="p-4 bg-surface-container-lowest border-t border-outline-variant">
          <Field orientation="horizontal">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button type="submit" form="bug-report-form">
              Submit
            </Button>
          </Field>
        </div>
      </Card>
    );
  },
};
