import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { toast, Toaster } from "sonner";
import * as z from "zod";
import { DollarSign, Mail, User } from "lucide-react";

import { Button } from "../button";
import { Card } from "../card";
import { Typography } from "../typography";
import { Separator } from "../separator";

import { Input } from "../input";
import { NumberInput } from "../number-input";
import { Select } from "../select";
import { MultiSelect } from "../multi-select";
import { Switch } from "../switch";
import { Checkbox } from "../checkbox";
import { Radio } from "../radio-group";
import { Slider } from "../slider";
import { DatePicker } from "../date-picker/date-picker";
import { Textarea } from "../textarea";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "../otp-field";
import { Dropzone } from "../dropzone";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "./index";

const meta: Meta = {
  title: "Showcase/Forms",
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div className="flex justify-center w-full bg-surface-container-low min-h-screen p-8">
        <Toaster />
        <Story />
      </div>
    ),
  ],
};

export default meta;

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 chars"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "Must be 18+").max(99),
  bio: z.string().max(160, "Bio is too long").min(10, "Bio is too short"),
  salary: z.number().min(0),
  role: z.string().min(1, "Please select a role"),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  theme: z.enum(["light", "dark", "system"]),
  notifications: z.boolean(),
  marketing_emails: z.boolean(),
  terms: z.boolean().refine((val) => val === true, "You must accept terms"),
  dob: z.date({ required_error: "Date of birth is required" }),
  meetingTime: z.any(),
  projectRange: z.any().optional(),
  securityCode: z.string().min(6, "Code must be 6 digits"),
  volume: z.array(z.number()).refine((val) => val[0] > 0, "Volume cannot be 0"),
  files: z.array(z.any()).max(2, "Max 2 files"),
});

type FormValues = z.infer<typeof formSchema>;

export const KitchenSinkForm: StoryObj = {
  render: () => {
    const form = useForm<FormValues>({
      defaultValues: {
        username: "",
        email: "",
        age: 18,
        bio: "",
        salary: 50000,
        role: "",
        skills: [],
        theme: "system",
        notifications: true,
        marketing_emails: false,
        terms: false,
        dob: undefined as unknown as Date,
        meetingTime: null,
        securityCode: "",
        volume: [50],
        files: [],
      },
      validatorAdapter: zodValidator(),
      validators: {
        onChange: formSchema,
      },
      onSubmit: async ({ value }) => {
        console.log("Submitted:", value);
        toast.success("Form Submitted", {
          description: "Check the console for the JSON payload.",
        });
      },
    });

    return (
      <Card className="w-full max-w-3xl mx-auto" padding="lg">
        <div className="mb-8">
          <Typography variant="headline-medium">Profile Settings</Typography>
          <Typography variant="body-large" muted>
            Manage your account settings and preferences.
          </Typography>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-8">
            <section className="space-y-4">
              <Typography
                variant="title-medium"
                className="font-bold border-b border-outline-variant pb-2"
              >
                Basic Information
              </Typography>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form.Field
                  name="username"
                  children={(field) => (
                    <Field data-invalid={field.state.meta.errors.length > 0}>
                      <FieldLabel>Username</FieldLabel>
                      <Input
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        isInvalid={field.state.meta.errors.length > 0}
                        placeholder="jdoe"
                        variant="filled"
                        startContent={<User className="w-4 h-4 opacity-50" />}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                <form.Field
                  name="email"
                  children={(field) => (
                    <Field data-invalid={field.state.meta.errors.length > 0}>
                      <FieldLabel>Email</FieldLabel>
                      {/* REPLACED InputGroup with standard Input + startContent */}
                      <Input
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="john@example.com"
                        variant="filled"
                        isInvalid={field.state.meta.errors.length > 0}
                        startContent={<Mail className="w-4 h-4 opacity-50" />}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />
              </div>

              <form.Field
                name="bio"
                children={(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel>Bio</FieldLabel>
                    {/* REPLACED InputGroup with standard Textarea + absolute positioning for counter */}
                    <div className="relative w-full">
                      <Textarea
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Tell us a little about yourself..."
                        isInvalid={field.state.meta.errors.length > 0}
                        variant="filled"
                        // Add padding bottom to make room for the counter
                        className="pb-6"
                      />

                      <div className="absolute bottom-2 right-3 text-xs opacity-70 pointer-events-none tabular-nums">
                        {field.state.value.length}/160
                      </div>
                    </div>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />
            </section>

            <section className="space-y-4">
              <Typography
                variant="title-medium"
                className="font-bold border-b border-outline-variant pb-2"
              >
                Job Details
              </Typography>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form.Field
                  name="role"
                  children={(field) => (
                    <Field data-invalid={field.state.meta.errors.length > 0}>
                      <FieldLabel>Role</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={field.handleChange}
                        isInvalid={field.state.meta.errors.length > 0}
                        placeholder="Select a role"
                        variant="filled"
                        items={[
                          { value: "dev", label: "Developer" },
                          { value: "design", label: "Designer" },
                          { value: "pm", label: "Product Manager" },
                        ]}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                <form.Field
                  name="skills"
                  children={(field) => (
                    <Field data-invalid={field.state.meta.errors.length > 0}>
                      <FieldLabel>Skills</FieldLabel>
                      <MultiSelect
                        value={field.state.value}
                        onValueChange={field.handleChange}
                        isInvalid={field.state.meta.errors.length > 0}
                        placeholder="Select skills"
                        variant="filled"
                        options={[
                          { value: "react", label: "React" },
                          { value: "vue", label: "Vue" },
                          { value: "angular", label: "Angular" },
                          { value: "nodejs", label: "Node.js" },
                        ]}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                <form.Field
                  name="salary"
                  children={(field) => (
                    <Field data-invalid={field.state.meta.errors.length > 0}>
                      <FieldLabel>Expected Salary</FieldLabel>
                      <NumberInput
                        value={field.state.value}
                        onValueChange={field.handleChange}
                        isInvalid={field.state.meta.errors.length > 0}
                        min={0}
                        step={1000}
                        variant="filled"
                        startContent={
                          <DollarSign className="w-4 h-4 opacity-50" />
                        }
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                <form.Field
                  name="dob"
                  children={(field) => (
                    <Field data-invalid={field.state.meta.errors.length > 0}>
                      <FieldLabel>Date of Birth</FieldLabel>
                      <DatePicker
                        value={field.state.value}
                        onChange={field.handleChange}
                        variant="docked"
                        isInvalid={field.state.meta.errors.length > 0}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />
              </div>
            </section>

            <section className="space-y-4">
              <Typography
                variant="title-medium"
                className="font-bold border-b border-outline-variant pb-2"
              >
                Verification & Preferences
              </Typography>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <form.Field
                  name="securityCode"
                  children={(field) => (
                    <Field data-invalid={field.state.meta.errors.length > 0}>
                      <FieldLabel>Security Code</FieldLabel>
                      <InputOTP
                        maxLength={6}
                        value={field.state.value}
                        onChange={field.handleChange}
                        isInvalid={field.state.meta.errors.length > 0}
                        variant="filled"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                      <FieldDescription>
                        Check your authenticator app.
                      </FieldDescription>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                <form.Field
                  name="volume"
                  children={(field) => (
                    <Field>
                      <FieldLabel>Notification Volume</FieldLabel>
                      <div className="pt-2">
                        <Slider
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          max={100}
                          step={1}
                          visual="bar"
                        />
                      </div>
                      <FieldDescription className="mt-2">
                        System volume level: {field.state.value}%
                      </FieldDescription>
                    </Field>
                  )}
                />
              </div>

              <form.Field
                name="theme"
                children={(field) => (
                  <Field className="mt-4">
                    <FieldLabel>Interface Theme</FieldLabel>
                    <Radio
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      className="flex flex-row gap-6"
                    >
                      <Radio.Item value="light" label="Light" />
                      <Radio.Item value="dark" label="Dark" />
                      <Radio.Item value="system" label="System" />
                    </Radio>
                  </Field>
                )}
              />
            </section>

            <section className="space-y-4">
              <div className="rounded-xl border border-outline-variant p-4 space-y-4">
                <form.Field
                  name="notifications"
                  children={(field) => (
                    <Field
                      orientation="horizontal"
                      className="items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <FieldLabel>Push Notifications</FieldLabel>
                        <FieldDescription>
                          Receive alerts about your account activity.
                        </FieldDescription>
                      </div>
                      <Switch
                        checked={field.state.value}
                        onCheckedChange={field.handleChange}
                      />
                    </Field>
                  )}
                />
                <Separator />
                <form.Field
                  name="marketing_emails"
                  children={(field) => (
                    <Field
                      orientation="horizontal"
                      className="items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <FieldLabel>Marketing Emails</FieldLabel>
                        <FieldDescription>
                          Receive offers and newsletters.
                        </FieldDescription>
                      </div>
                      <Switch
                        checked={field.state.value}
                        onCheckedChange={field.handleChange}
                      />
                    </Field>
                  )}
                />
              </div>

              <form.Field
                name="terms"
                children={(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <div className="flex items-start gap-3 mt-4">
                      <Checkbox
                        id="terms"
                        checked={field.state.value}
                        onChange={(e) => field.handleChange(e.target.checked)}
                      />
                      <div className="space-y-1">
                        <FieldLabel htmlFor="terms">
                          Accept Terms & Conditions
                        </FieldLabel>
                        <FieldDescription>
                          You agree to our Terms of Service and Privacy Policy.
                        </FieldDescription>
                        <FieldError errors={field.state.meta.errors} />
                      </div>
                    </div>
                  </Field>
                )}
              />
            </section>

            <section>
              <form.Field
                name="files"
                children={(field) => (
                  <Field>
                    <FieldLabel>Upload Resume</FieldLabel>
                    <Dropzone
                      onDrop={(files) => field.handleChange(files)}
                      maxSize={5000000}
                      accept=".pdf,.doc,.docx"
                      label="Drop resume here"
                      description="PDF or Word documents up to 5MB"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />
            </section>

            <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant">
              <Button
                type="button"
                variant="ghost"
                onClick={() => form.reset()}
              >
                Reset Form
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </FieldGroup>
        </form>
      </Card>
    );
  },
};
