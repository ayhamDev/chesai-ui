import { describe, expect, it } from "vitest";
import type { CalendarEvent } from "./types";
import {
  expandEvents,
  updateRecurringSeries,
  updateSingleOccurrence,
} from "./utils";

const createWeeklySeries = (): CalendarEvent => ({
  id: "weekly-series",
  title: "Weekly delivery",
  start: new Date(2026, 6, 5, 10),
  end: new Date(2026, 6, 5, 11),
  recurrence: {
    frequency: "weekly",
    interval: 1,
    daysOfWeek: [0],
    endType: "never",
  },
});

const expandJuly = (event: CalendarEvent) =>
  expandEvents(
    [event],
    new Date(2026, 6, 1),
    new Date(2026, 6, 31, 23, 59),
  );

describe("recurring event exceptions", () => {
  it("uses stable occurrence IDs across different view ranges", () => {
    const series = createWeeklySeries();
    const monthOccurrence = expandJuly(series).find(
      event => event.start.getDate() === 12,
    );
    const weekOccurrence = expandEvents(
      [series],
      new Date(2026, 6, 12),
      new Date(2026, 6, 18, 23, 59),
    )[0];

    expect(monthOccurrence?.id).toBe(weekOccurrence.id);
    expect(monthOccurrence?.recurrenceOccurrence?.seriesId).toBe(series.id);
  });

  it("moves one Sunday occurrence to Friday", () => {
    const series = createWeeklySeries();
    const sunday = expandJuly(series).find(event => event.start.getDate() === 12)!;
    const fridayStart = new Date(2026, 6, 10, 10);
    const movedSeries = updateSingleOccurrence(series, {
      ...sunday,
      start: fridayStart,
      end: new Date(2026, 6, 10, 11),
    });
    const starts = expandJuly(movedSeries).map(event => event.start.getDate());

    expect(starts).toContain(10);
    expect(starts).not.toContain(12);
    expect(starts).toContain(5);
    expect(starts).toContain(19);
  });

  it("renders a moved exception when its original date is outside the view", () => {
    const series = createWeeklySeries();
    const sunday = expandJuly(series).find(event => event.start.getDate() === 12)!;
    const movedSeries = updateSingleOccurrence(series, {
      ...sunday,
      start: new Date(2026, 6, 3, 10),
      end: new Date(2026, 6, 3, 11),
    });
    const visible = expandEvents(
      [movedSeries],
      new Date(2026, 6, 1),
      new Date(2026, 6, 4, 23, 59),
    );

    expect(visible).toHaveLength(1);
    expect(visible[0].start.getDate()).toBe(3);
  });

  it("cancels only one occurrence", () => {
    const series = createWeeklySeries();
    const sunday = expandJuly(series).find(event => event.start.getDate() === 12)!;
    const updated = updateSingleOccurrence(series, sunday, true);

    expect(expandJuly(updated).map(event => event.start.getDate())).toEqual([
      5, 19, 26,
    ]);
  });

  it("updates the whole weekly series while preserving exceptions", () => {
    const series = createWeeklySeries();
    const sunday = expandJuly(series).find(event => event.start.getDate() === 12)!;
    const withException = updateSingleOccurrence(series, {
      ...sunday,
      title: "Customized delivery",
    });
    const friday = {
      ...sunday,
      start: new Date(2026, 6, 10, 10),
      end: new Date(2026, 6, 10, 12),
    };
    const updated = updateRecurringSeries(withException, sunday, friday);

    expect(updated.recurrence?.daysOfWeek).toEqual([5]);
    expect(updated.end.getTime() - updated.start.getTime()).toBe(2 * 60 * 60 * 1000);
    expect(updated.recurrenceExceptions).toEqual(withException.recurrenceExceptions);
  });
});
