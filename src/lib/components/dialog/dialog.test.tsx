import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogExpand,
  DialogTitle,
  DialogTrigger,
  type DialogProps,
} from "./index";
import { resolveSheetSnap } from "./sheet-motion";

beforeEach(() => {
  let pointerTime = 0;
  vi.stubGlobal(
    "PointerEvent",
    class extends MouseEvent {
      pointerId: number;
      constructor(type: string, options: PointerEventInit = {}) {
        super(type, options);
        this.pointerId = options.pointerId ?? 1;
        Object.defineProperty(this, "timeStamp", {
          value: (pointerTime += 1000),
        });
      }
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function Example({
  contentSize = "400px",
  ...props
}: Partial<DialogProps> & { contentSize?: string | number | null }) {
  const [open, setOpen] = useState(true);
  return (
    <Dialog open={open} onOpenChange={setOpen} variant="sheet" {...props}>
      <DialogTrigger>Open sheet</DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        sheetSize={contentSize ?? undefined}
      >
        <DialogTitle>Invoice items</DialogTitle>
        <DialogExpand />
        <input aria-label="Description" defaultValue="Consulting" />
        <DialogClose>Close sheet</DialogClose>
      </DialogContent>
    </Dialog>
  );
}

describe("expandable edge sheet", () => {
  it("updates backdrop blur without disrupting the sheet or its content", () => {
    const { rerender } = render(<Example overlay overlayBlur="lg" />);
    const input = screen.getByRole("textbox", { name: "Description" });
    fireEvent.change(input, { target: { value: "Updated invoice" } });
    expect(document.querySelector('[data-sheet-overlay]')?.className).toContain('backdrop-blur-[16px]');
    rerender(<Example overlay overlayBlur="none" />);
    expect(document.querySelector('[data-sheet-overlay]')?.className).toContain('backdrop-blur-none');
    expect(screen.getByRole("textbox", { name: "Description" })).toBe(input);
    expect((input as HTMLInputElement).value).toBe("Updated invoice");
    rerender(<Example overlay={false} overlayBlur="xl" />);
    expect(document.querySelector('[data-sheet-overlay]')).toBeNull();
  });

  it.each([
    "top",
    "bottom",
    "left",
    "right",
  ] as const)("hides the %s handle and its space while retaining expansion controls", (side) => {
    const { rerender } = render(<Example side={side} />);
    const dialog = screen.getByRole("dialog");
    const padding = {
      top: "paddingBottom",
      bottom: "paddingTop",
      left: "paddingRight",
      right: "paddingLeft",
    }[side] as "paddingTop" | "paddingBottom" | "paddingRight" | "paddingLeft";
    expect(dialog.style[padding]).toBe("44px");
    rerender(<Example side={side} showDragHandle={false} />);
    expect(
      screen.queryByRole("separator", { name: "Resize sheet" }),
    ).toBeNull();
    expect(dialog.style[padding]).toBe("");
    fireEvent.click(
      screen.getByRole("button", { name: "Expand to full page" }),
    );
    expect(dialog.getAttribute("data-expanded")).toBe("true");
    rerender(<Example side={side} showDragHandle />);
    expect(
      screen.getByRole("separator", { name: "Resize sheet" }),
    ).toBeTruthy();
  });
  it("accepts responsive partial coverage and updates it without resetting content", () => {
    const { rerender } = render(<Example contentSize={null} sheetSize={0.3} />);
    const dialog = screen.getByRole("dialog");
    const input = screen.getByRole("textbox");
    expect(dialog.style.height).toBe("30%");
    rerender(<Example contentSize={null} sheetSize={0.65} />);
    expect(dialog.style.height).toBe("65%");
    expect(screen.getByRole("textbox")).toBe(input);
    rerender(<Example contentSize="min(480px, 70dvh)" sheetSize={0.65} />);
    expect(dialog.style.height).toBe("min(480px, 70dvh)");
  });

  it.each([
    false,
    true,
  ])("supports overlay dismissal=%s independently of blocking the page", async (closeOnOutsideClick) => {
    render(<Example overlay closeOnOutsideClick={closeOnOutsideClick} />);
    expect(screen.getByRole("dialog").getAttribute("aria-modal")).toBe("true");
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.click(document.querySelector("[data-sheet-overlay]")!);
    if (closeOnOutsideClick)
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    else expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("can dismiss on a page click without showing an overlay", async () => {
    render(
      <>
        <button>Page action</button>
        <Example closeOnOutsideClick />
      </>,
    );
    expect(document.querySelector("[data-sheet-overlay]")).toBeNull();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fireEvent.pointerDown(screen.getByRole("button", { name: "Page action" }));
    fireEvent.pointerUp(screen.getByRole("button", { name: "Page action" }));
    fireEvent.click(screen.getByRole("button", { name: "Page action" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("does not dismiss a locked sheet through its overlay", () => {
    render(<Example overlay closeOnOutsideClick isLocked />);
    fireEvent.click(document.querySelector("[data-sheet-overlay]")!);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it.each([
    [100, 0, "closed"],
    [300, 0, "partial"],
    [600, 0, "partial"],
    [850, 0, "expanded"],
    [600, 1, "expanded"],
    [300, -1, "closed"],
    [850, -1, "partial"],
  ] as const)("settles size %s with velocity %s at %s", (size, velocity, snap) => {
    expect(resolveSheetSnap(size, 400, 1000, velocity)).toBe(snap);
  });

  it("leaves the page interactive and stays open when focus or clicks move outside", async () => {
    const onClick = vi.fn();
    render(
      <>
        <button onClick={onClick}>Page action</button>
        <input aria-label="Page field" />
        <Example />
      </>,
    );
    const outside = screen.getByRole("button", { name: "Page action" });
    expect(document.body.style.pointerEvents).not.toBe("none");
    expect(document.body.style.overflow).not.toBe("hidden");
    // Radix registers its outside pointer listener on the next task.
    await new Promise((resolve) => setTimeout(resolve, 0));
    fireEvent.pointerDown(outside, { pointerId: 1 });
    fireEvent.click(outside);
    expect(onClick).toHaveBeenCalledOnce();
    screen.getByLabelText("Page field").focus();
    expect(document.activeElement).toBe(screen.getByLabelText("Page field"));
    expect(screen.getByRole("dialog").getAttribute("aria-modal")).toBe("false");
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it.each([
    "top",
    "bottom",
    "left",
    "right",
  ] as const)("drags the %s sheet through partial, expanded and dismissed detents", async (side) => {
    render(<Example side={side} />);
    const dialog = screen.getByRole("dialog");
    const handle = screen.getByRole("separator", { name: "Resize sheet" });
    const input = screen.getByRole("textbox");
    const horizontal = side === "left" || side === "right";
    const dimension = horizontal ? "width" : "height";
    const sign = side === "top" || side === "left" ? 1 : -1;
    const bounds = (size: number) =>
      ({
        width: horizontal ? size : 1000,
        height: horizontal ? 1000 : size,
      }) as DOMRect;
    vi.spyOn(dialog.parentElement!, "getBoundingClientRect").mockReturnValue(
      bounds(1000),
    );
    vi.spyOn(
      document.querySelector("[data-sheet-size-probe]")!,
      "getBoundingClientRect",
    ).mockReturnValue(bounds(400));
    vi.spyOn(dialog, "getBoundingClientRect").mockImplementation(() =>
      bounds(
        dialog.style[dimension] === "100%"
          ? 1000
          : Number.parseFloat(dialog.style[dimension]),
      ),
    );
    handle.setPointerCapture = vi.fn();
    handle.hasPointerCapture = () => true;
    handle.releasePointerCapture = vi.fn();
    const pointer = (delta = 0) => ({
      pointerId: 1,
      button: 0,
      [horizontal ? "clientX" : "clientY"]: 500 + delta * sign,
    });
    fireEvent.pointerDown(handle, pointer());
    fireEvent.pointerMove(handle, pointer(200));
    expect(dialog.style[dimension]).toBe("600px");
    expect(dialog.style.transitionDuration).toBe("0ms");
    fireEvent.pointerUp(handle, pointer(200));
    expect(dialog.style[dimension]).toBe("400px");
    fireEvent.pointerDown(handle, pointer());
    fireEvent.pointerMove(handle, pointer(390));
    fireEvent.pointerUp(handle, pointer(390));
    expect(dialog.style[dimension]).toBe("100%");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.pointerDown(handle, pointer());
    fireEvent.pointerMove(handle, pointer(-300));
    fireEvent.pointerUp(handle, pointer(-300));
    expect(dialog.style[dimension]).toBe("400px");
    expect(document.body.style.overflow).not.toBe("hidden");
    expect(screen.getByRole("textbox")).toBe(input);
    fireEvent.pointerDown(handle, pointer());
    fireEvent.pointerMove(handle, pointer(-200));
    fireEvent.pointerCancel(handle, pointer(-200));
    expect(dialog.style[dimension]).toBe("400px");
    fireEvent.pointerDown(handle, pointer());
    fireEvent.pointerUp(handle, pointer());
    fireEvent.doubleClick(handle);
    expect(dialog.style[dimension]).toBe("400px");
    fireEvent.pointerDown(handle, pointer());
    fireEvent.pointerMove(handle, pointer(-250));
    fireEvent.pointerUp(handle, pointer(-250));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
  it.each([
    "top",
    "bottom",
    "left",
    "right",
  ] as const)("expands from %s and restores its size without remounting content", (side) => {
    render(<Example side={side} />);
    const dialog = screen.getByRole("dialog");
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Edited service" } });
    const dimension = side === "left" || side === "right" ? "width" : "height";
    expect(dialog.style[dimension]).toBe("400px");
    expect(dialog.style[side]).toBe("0px");
    fireEvent.click(
      screen.getByRole("button", { name: "Expand to full page" }),
    );
    expect(dialog.style.width).toBe("100%");
    expect(dialog.style.height).toBe("100%");
    expect(dialog.style.borderRadius).toBe("0");
    expect(screen.getByRole("textbox")).toBe(input);
    fireEvent.click(screen.getByRole("button", { name: "Collapse to sheet" }));
    expect(dialog.style[dimension]).toBe("400px");
    expect(input.value).toBe("Edited service");
  });

  it("lets a parent control expansion", () => {
    const onExpandedChange = vi.fn();
    const { rerender } = render(
      <Example expanded={false} onExpandedChange={onExpandedChange} />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Expand to full page" }),
    );
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("dialog").style.height).toBe("400px");
    rerender(<Example expanded onExpandedChange={onExpandedChange} />);
    expect(
      screen
        .getByRole("button", { name: "Collapse to sheet" })
        .getAttribute("aria-expanded"),
    ).toBe("true");
  });

  it("closes an expanded sheet with Escape and restores trigger focus", async () => {
    render(<Example defaultExpanded />);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Open sheet" }),
      ),
    );
  });

  it("keeps a locked sheet open on Escape and disables its close control", () => {
    render(<Example isLocked />);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: "Close sheet" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it("supports the legacy fullscreen variant and leaves basic dialogs centered", () => {
    const { rerender } = render(<Example variant="fullscreen" />);
    expect(
      screen.getByRole("button", { name: "Expand to full page" }),
    ).toBeTruthy();
    rerender(<Example variant="basic" />);
    expect(
      screen.queryByRole("button", { name: "Expand to full page" }),
    ).toBeNull();
    expect(screen.getByRole("dialog").style.position).toBe("");
  });
});
