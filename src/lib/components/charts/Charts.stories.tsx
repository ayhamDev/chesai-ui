import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../card";
import { Grid, GridItem } from "../layouts/grid";
import { Typography } from "../typography";
import { AreaChart } from "./area-chart";
import { BarChart } from "./bar-chart";
import { LineChart } from "./line-chart";
import { PieChart } from "./pie-chart";
import { HeatmapChart } from "./heatmap-chart";

const meta: Meta = {
  title: "Components/Data/Charts",
  parameters: {
    layout: "padded",
  },
};

export default meta;

const salesData = [
  { month: "Jan", sales: 4000, profit: 2400 },
  { month: "Feb", sales: 3000, profit: 1398 },
  { month: "Mar", sales: 2000, profit: 9800 },
  { month: "Apr", sales: 2780, profit: 3908 },
  { month: "May", sales: 1890, profit: 4800 },
  { month: "Jun", sales: 2390, profit: 3800 },
  { month: "Jul", sales: 3490, profit: 4300 },
];

const deviceData = [
  { name: "Desktop", value: 400 },
  { name: "Mobile", value: 300 },
  { name: "Tablet", value: 300 },
  { name: "Other", value: 200 },
];

export const ChartShowcase: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      <Typography variant="display-small">
        Charts & Data Visualization
      </Typography>
      <Typography variant="body-medium">
        Charts automatically adapt to the theme tokens (`primary`, `secondary`,
        `tertiary`, `error`). Switch themes to see colors update instantly.
      </Typography>

      {/* --- ROW 1: PRIMARY CHARTS --- */}
      <Typography variant="title-small" className="mt-8">
        Primary Variants (Detailed)
      </Typography>
      <Grid columns={{ default: 1, lg: 2 }} gap="lg">
        <GridItem>
          <Card className="p-6">
            <Typography variant="title-small" className="mb-4">
              Revenue Trend (Area)
            </Typography>
            <AreaChart
              data={salesData}
              index="month"
              categories={["sales", "profit"]}
              valueFormatter={(v) => `$${v}`}
              shape="minimal"
            />
          </Card>
        </GridItem>
        <GridItem>
          <Card className="p-6">
            <Typography variant="title-small" className="mb-4">
              Monthly Comparisons (Bar)
            </Typography>
            <BarChart
              data={salesData}
              index="month"
              scrollable={true}
              categories={["sales", "profit"]}
              valueFormatter={(v) => `$${v},`}
              minWidth={1000}
              shape="full"
            />
          </Card>
        </GridItem>
      </Grid>

      {/* --- ROW 2: SECONDARY VARIANTS --- */}
      <Typography variant="title-small" className="mt-8">
        Secondary Variants (Simplified)
      </Typography>
      <Grid columns={{ default: 1, md: 3 }} gap="md">
        <GridItem>
          <Card className="p-4" variant="secondary">
            <Typography
              variant="body-small"
              className="font-bold opacity-70 mb-2"
            >
              Sales Velocity
            </Typography>
            <LineChart
              variant="secondary"
              data={salesData}
              index="month"
              categories={["sales"]}
              height={150}
            />
          </Card>
        </GridItem>
        <GridItem>
          <Card className="p-4" variant="secondary">
            <Typography
              variant="body-small"
              className="font-bold opacity-70 mb-2"
            >
              Profit Margins
            </Typography>
            <BarChart
              shape="full"
              variant="secondary"
              data={salesData}
              index="month"
              categories={["profit"]}
              height={150}
            />
          </Card>
        </GridItem>
        <GridItem>
          <Card className="p-4" variant="secondary">
            <Typography
              variant="body-small"
              className="font-bold opacity-70 mb-2"
            >
              Device Share
            </Typography>
            <PieChart
              variant="secondary"
              donut
              data={deviceData}
              category="value"
              index="name"
              height={150}
              shape="full"
            />
          </Card>
        </GridItem>
      </Grid>

      {/* --- ROW 3: GHOST VARIANTS (STATUS CARDS) --- */}
      <Typography variant="title-small" className="mt-8">
        Ghost Variants (Backgrounds / Sparklines)
      </Typography>
      <Grid columns={{ default: 2, md: 4 }} gap="md">
        <GridItem>
          <Card
            className="relative overflow-hidden h-32 flex flex-col justify-between"
            padding="md"
          >
            <div className="relative z-10">
              <Typography variant="title-medium">$12,403</Typography>
              <Typography
                variant="body-small"
                className="text-green-600 font-bold"
              >
                +12%
              </Typography>
            </div>
            <div className="absolute inset-0 z-0 opacity-20">
              <AreaChart
                variant="ghost"
                data={salesData}
                index="month"
                categories={["sales"]}
                height="100%"
              />
            </div>
          </Card>
        </GridItem>

        <GridItem>
          <Card
            className="relative overflow-hidden h-32 flex flex-col justify-between"
            padding="md"
          >
            <div className="relative z-10">
              <Typography variant="title-medium">84.3%</Typography>
              <Typography
                variant="body-small"
                className="text-primary font-bold"
              >
                Uptime
              </Typography>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-16 z-0 opacity-30">
              <BarChart
                variant="ghost"
                data={salesData}
                index="month"
                categories={["profit"]}
                height="100%"
                shape="sharp"
              />
            </div>
          </Card>
        </GridItem>

        <GridItem>
          <Card
            className="relative overflow-hidden h-32 flex flex-col justify-between bg-error-container text-on-error-container"
            padding="md"
          >
            <div className="relative z-10">
              <Typography variant="title-medium" className="text-inherit">
                3 Errors
              </Typography>
              <Typography variant="body-small" className="opacity-80">
                Last 24h
              </Typography>
            </div>
            <div className="absolute inset-0 z-0 opacity-30 mix-blend-multiply">
              <LineChart
                variant="ghost"
                data={salesData}
                index="month"
                categories={["sales"]}
                height="100%"
                colors={["var(--md-sys-color-on-error-container)"]}
              />
            </div>
          </Card>
        </GridItem>

        <GridItem>
          <Card className="h-32 flex items-center gap-4" padding="md">
            <div className="h-20 w-20 flex-shrink-0">
              <PieChart
                variant="ghost"
                donut
                data={deviceData}
                category="value"
                index="name"
                height="100%"
              />
            </div>
            <div>
              <Typography variant="large" className="font-bold">
                Traffic
              </Typography>
              <Typography variant="body-small" muted={true} className="text-xs">
                Source breakdown
              </Typography>
            </div>
          </Card>
        </GridItem>
      </Grid>
    </div>
  ),
};

// ... inside src/lib/components/charts/Charts.stories.tsx ...

const stepsData = [
  { day: "M", steps: 6200, reachedGoal: false },
  { day: "T", steps: 8400, reachedGoal: false },
  { day: "W", steps: 11200, reachedGoal: true },
  { day: "T", steps: 3500, reachedGoal: false },
  { day: "F", steps: 14100, reachedGoal: true },
  { day: "S", steps: 7200, reachedGoal: false },
  { day: "S", steps: 10800, reachedGoal: true },
];

export const WeeklyStepsTracker: StoryObj = {
  name: "Highlight Feature (Steps Tracker)",
  render: () => (
    <div className="w-full max-w-md mx-auto">
      <Card className="p-6 bg-slate-50 dark:bg-zinc-900 border-none shadow-md">
        <div className="mb-6">
          <Typography variant="display-small" className="font-bold">
            8,350
          </Typography>
          <Typography variant="body-small" className="font-medium opacity-70">
            steps per day (avg)
          </Typography>
          <Typography variant="body-small" muted className="mt-2 block">
            You hit your goal on 3 days, and took a total of 49,798 steps
          </Typography>
        </div>

        <BarChart
          data={stepsData}
          index="day"
          categories={["steps"]}
          colors={["var(--md-sys-color-primary, #6366F1)"]} // standard columns (purple / primary)
          shape="full" // Round column pill shape
          height={260}
          valueFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          highlightKey="reachedGoal" // Tells chart to inspect reachedGoal parameter
          highlightColor="#4ADE80" // Luminous green for achievers
          highlightShape="clover8" // Overlays flower shape from shapes paths
        />
      </Card>
    </div>
  ),
};

// ... at the end of src/lib/components/charts/Charts.stories.tsx ...

const financialData = [
  { month: "Jan", netCashFlow: 4500, majorAnomaly: false },
  { month: "Feb", netCashFlow: -2800, majorAnomaly: true },
  { month: "Mar", netCashFlow: 8900, majorAnomaly: false },
  { month: "Apr", netCashFlow: -1200, majorAnomaly: false },
  { month: "May", netCashFlow: 14000, majorAnomaly: true },
  { month: "Jun", netCashFlow: -6200, majorAnomaly: true },
  { month: "Jul", netCashFlow: 3100, majorAnomaly: false },
];

export const NegativeBarChartStory: StoryObj = {
  name: "Negative Value Support (Cash Flow)",
  render: () => (
    <div className="w-full max-w-xl mx-auto">
      <Card className="p-6 bg-slate-50 dark:bg-zinc-900 border-none shadow-md">
        <div className="mb-6">
          <Typography variant="title-medium" className="font-bold">
            Net Cash Flow
          </Typography>
          <Typography variant="body-small" className="font-medium opacity-70">
            Monthly balance showing capital surpluses and deficits
          </Typography>
          <Typography variant="body-small" muted className="mt-2 block">
            Highlight badges flag months with extreme anomalies (under -2k or
            over 10k).
          </Typography>
        </div>

        <BarChart
          data={financialData}
          index="month"
          categories={["netCashFlow"]}
          colors={["var(--md-sys-color-primary, #6366F1)"]}
          shape="full"
          height={300}
          valueFormatter={(v) =>
            `${v >= 0 ? "+" : ""}${(v / 1000).toFixed(1)}k`
          }
          highlightKey="majorAnomaly"
          highlightColor="#4ADE80" // Luminous green for achievers
          highlightShape="clover8" // Overlays flower shape from shapes paths
          showBaseline={false}
        />
      </Card>
    </div>
  ),
};
// Append the following imports and definitions to the end of src/lib/components/charts/Charts.stories.tsx

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const hourIntervals = ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM"];

// Generates real-looking mock traffic volume data spanning days of the week by hour segments
const mockHeatmapData = (() => {
  const dataPoints = [];
  for (const day of weekDays) {
    for (const hr of hourIntervals) {
      let traffic = Math.floor(Math.random() * 85) + 15;

      // Simulating higher traffic periods on weekdays and mid-afternoon
      if (
        day !== "Saturday" &&
        day !== "Sunday" &&
        (hr === "12 PM" || hr === "4 PM")
      ) {
        traffic += 110;
      }
      dataPoints.push({ x: hr, y: day, value: traffic });
    }
  }
  return dataPoints;
})();

export const HeatmapShowcase: StoryObj = {
  name: "Heatmap (System Load / Traffic Activity)",
  render: () => (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      <Card className="p-6  border-none shadow-md">
        <div className="mb-6">
          <Typography variant="title-medium" className="font-bold">
            Weekly Server Performance Heatmap
          </Typography>
          <Typography variant="body-small" className="font-medium opacity-70">
            Hourly transaction throughput across standard work weeks.
            Over-capacity surges are indicated by dense color bands.
          </Typography>
        </div>

        <HeatmapChart
          data={mockHeatmapData}
          xLabels={hourIntervals}
          yLabels={weekDays}
          variant="primary"
          shape="minimal"
          height={340}
          valueFormatter={(v) => `${v} req/min`}
        />
      </Card>

      <Card className="p-6 border-none shadow-md">
        <div className="mb-6">
          <Typography variant="title-medium" className="font-bold">
            Risk Mitigation Log (Errors Count)
          </Typography>
          <Typography
            variant="body-small"
            className="font-medium opacity-70 text-error"
          >
            High-density system exceptions logged per cluster nodes. Custom red
            alert scaling mapping.
          </Typography>
        </div>

        <HeatmapChart
          data={mockHeatmapData.map((d) => ({
            ...d,
            value: Math.max(0, d.value - 60),
          }))}
          xLabels={hourIntervals}
          yLabels={weekDays}
          variant="error"
          shape="full"
          height={340}
          valueFormatter={(v) => `${v} exceptions`}
        />
      </Card>
    </div>
  ),
};
