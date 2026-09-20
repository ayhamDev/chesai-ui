import React, { useRef } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DirectionProvider, useDirection } from "./direction";
import { LayoutProvider, useLayout } from "./layout-context";
import { Toolbar } from "../components/toolbar";
import { Slider } from "../components/slider";
import { Popover, PopoverContent, PopoverTrigger } from "../components/popover";

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
});
afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("dir");
  document.documentElement.removeAttribute("style");
  document.documentElement.classList.remove("rtl", "ltr");
  vi.unstubAllGlobals();
});

function Toggle() {
  const { toggleDirection } = useLayout();
  return <button onClick={toggleDirection}>Toggle direction</button>;
}

describe("direction integration", () => {
  it("updates Radix keyboard navigation when the application direction changes", async () => {
    render(<LayoutProvider initialDirection="rtl"><Toggle /><Toolbar><Toolbar.Button>First</Toolbar.Button><Toolbar.Button>Second</Toolbar.Button></Toolbar></LayoutProvider>);
    const first = screen.getByRole("button", { name: "First" });
    const second = screen.getByRole("button", { name: "Second" });
    expect(screen.getByRole("toolbar").getAttribute("dir")).toBe("rtl");
    act(() => first.focus());
    fireEvent.keyDown(first, { key: "ArrowLeft" });
    await waitFor(() => expect(document.activeElement).toBe(second));
    fireEvent.click(screen.getByText("Toggle direction"));
    expect(screen.getByRole("toolbar").getAttribute("dir")).toBe("ltr");
    act(() => first.focus());
    fireEvent.keyDown(first, { key: "ArrowRight" });
    await waitFor(() => expect(document.activeElement).toBe(second));
  });

  it("preserves a nested direction scope across a popover portal", () => {
    render(<LayoutProvider initialDirection="ltr"><DirectionProvider dir="rtl"><Popover open><PopoverTrigger>Open</PopoverTrigger><PopoverContent data-testid="portal">Arabic content</PopoverContent></Popover></DirectionProvider></LayoutProvider>);
    const portal = screen.getByTestId("portal");
    expect(portal.getAttribute("dir")).toBe("rtl");
    expect(portal.closest("[dir=rtl]")).toBe(portal);
    expect(document.documentElement.dir).toBe("ltr");
  });

  it("observes local DOM direction changes and respects an explicit override", async () => {
    function Probe({ dir }: { dir?: string }) {
      const ref = useRef<HTMLDivElement>(null);
      const direction = useDirection(ref, dir);
      return <div ref={ref} data-testid="probe">{direction}</div>;
    }
    const { rerender } = render(<div dir="rtl"><Probe /></div>);
    expect(screen.getByTestId("probe").textContent).toBe("rtl");
    rerender(<div dir="ltr"><Probe /></div>);
    await waitFor(() => expect(screen.getByTestId("probe").textContent).toBe("ltr"));
    rerender(<div dir="ltr"><Probe dir="rtl" /></div>);
    expect(screen.getByTestId("probe").textContent).toBe("rtl");
  });

  it.each([false, true])("keeps slider segments and keyboard direction consistent in RTL (inverted=%s)", inverted => {
    const onChange = vi.fn();
    const { container } = render(<DirectionProvider dir="rtl"><Slider defaultValue={[30]} step={10} inverted={inverted} onValueChange={onChange} withTicks /></DirectionProvider>);
    const thumb = screen.getByRole("slider");
    fireEvent.keyDown(thumb, { key: "ArrowLeft" });
    expect(onChange).toHaveBeenLastCalledWith([inverted ? 20 : 40]);
    const segment = container.querySelector<HTMLElement>("div[style*='max(0px']");
    expect(segment).not.toBeNull();
    expect(inverted ? segment!.style.left : segment!.style.right).not.toBe("");
    expect(inverted ? segment!.style.right : segment!.style.left).toBe("");
  });
});
