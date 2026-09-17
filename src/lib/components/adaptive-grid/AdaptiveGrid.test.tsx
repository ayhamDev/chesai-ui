import { act, cleanup, render, screen } from "@testing-library/react";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GridItemConfig } from "./types";

interface DragEventStub {
  active: { id: string };
  delta?: { x: number; y: number };
}

interface DndContextProps {
  onDragStart: (event: DragEventStub) => void;
  onDragMove: (event: DragEventStub) => void;
  onDragEnd: (event: DragEventStub) => void;
}

interface MotionDivProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: unknown;
  initial?: unknown;
  exit?: unknown;
  transition?: unknown;
}

const dnd = vi.hoisted(() => ({ props: null as DndContextProps | null }));

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({
    children,
    ...props
  }: React.PropsWithChildren<DndContextProps>) => {
    dnd.props = props;
    return children;
  },
  PointerSensor: function PointerSensor() {},
  useSensor: () => ({}),
  useSensors: (...sensors: unknown[]) => sensors,
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: React.PropsWithChildren) => children,
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<MotionDivProps>) => {
      const {
        animate: _animate,
        initial: _initial,
        exit: _exit,
        transition: _transition,
        ...domProps
      } = props;
      return <div {...domProps}>{children}</div>;
    },
  },
}));

vi.mock("./GridItem", () => ({
  GridItem: ({
    item,
    renderContent,
  }: {
    item: GridItemConfig;
    renderContent: (
      interacting: boolean,
      dragProps: Record<string, never>,
    ) => React.ReactNode;
  }) => (
    <div data-testid={`grid-${item.id}`} data-x={item.x} data-y={item.y}>
      {renderContent(false, {})}
    </div>
  ),
}));

import { AdaptiveGrid } from "./AdaptiveGrid";

const items: GridItemConfig[] = [
  { id: "a", x: 0, y: 0, w: 6, h: 2 },
  { id: "b", x: 6, y: 0, w: 6, h: 2 },
];

describe("AdaptiveGrid collision delay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    dnd.props = null;
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(1200);
    vi.stubGlobal(
      "ResizeObserver",
      class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const renderGrid = (onChange = vi.fn()) => {
    render(
      <AdaptiveGrid
        items={items}
        columns={12}
        minColumnWidth={false}
        gap="none"
        stackBelow={false}
        collisionDelay={300}
        onChange={onChange}
        renderItem={(item) => <span>{item.id}</span>}
      />,
    );
    return onChange;
  };

  const startAndMoveOverB = () => {
    act(() => {
      dnd.props?.onDragStart({ active: { id: "a" } });
      dnd.props?.onDragMove({ active: { id: "a" }, delta: { x: 600, y: 0 } });
    });
  };

  it("waits until the dragged item dwells for 300ms before reflowing", () => {
    renderGrid();
    startAndMoveOverB();

    expect(screen.getByTestId("grid-b").getAttribute("data-y")).toBe("0");

    act(() => vi.advanceTimersByTime(299));
    expect(screen.getByTestId("grid-b").getAttribute("data-y")).toBe("0");

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByTestId("grid-b").getAttribute("data-y")).toBe("2");
  });

  it("restarts the dwell period after entering another grid position", () => {
    renderGrid();
    startAndMoveOverB();

    act(() => vi.advanceTimersByTime(200));
    act(() => {
      dnd.props?.onDragMove({ active: { id: "a" }, delta: { x: 500, y: 0 } });
    });
    act(() => vi.advanceTimersByTime(100));

    expect(screen.getByTestId("grid-b").getAttribute("data-y")).toBe("0");

    act(() => vi.advanceTimersByTime(200));
    expect(screen.getByTestId("grid-b").getAttribute("data-y")).toBe("2");
  });

  it("commits the final position when dropped before the delay elapses", () => {
    const onChange = renderGrid();
    startAndMoveOverB();

    act(() => dnd.props?.onDragEnd({ active: { id: "a" } }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "a", x: 6, y: 0 }),
        expect.objectContaining({ id: "b", x: 6, y: 2 }),
      ]),
    );
  });
});
