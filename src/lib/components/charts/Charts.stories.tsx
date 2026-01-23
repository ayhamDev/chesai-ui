import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../card";
import { Grid, GridItem } from "../layout/grid";
import { Typography } from "../typography";
import { AreaChart } from "./area-chart";
import { BarChart } from "./bar-chart";
import { LineChart } from "./line-chart";
import { PieChart } from "./pie-chart";

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
      <Typography variant="h2">Charts & Data Visualization</Typography>
      <Typography variant="p">
        Charts automatically adapt to the theme tokens (`primary`, `secondary`,
        `tertiary`, `error`). Switch themes to see colors update instantly.
      </Typography>

      {/* --- ROW 1: PRIMARY CHARTS --- */}
      <Typography variant="h4" className="mt-8">
        Primary Variants (Detailed)
      </Typography>
      <Grid columns={{ default: 1, lg: 2 }} gap="lg">
        <GridItem>
          <Card className="p-6">
            <Typography variant="h4" className="mb-4">
              Revenue Trend (Area)
            </Typography>
            <AreaChart
              data={salesData}
              index="month"
              categories={["sales", "profit"]}
              valueFormatter={(v) => `$${v}`}
            />
          </Card>
        </GridItem>
        <GridItem>
          <Card className="p-6">
            <Typography variant="h4" className="mb-4">
              Monthly Comparisons (Bar)
            </Typography>
            <BarChart
              data={salesData}
              index="month"
              categories={["sales", "profit"]}
              valueFormatter={(v) => `$${v},`}
            />
          </Card>
        </GridItem>
      </Grid>

      {/* --- ROW 2: SECONDARY VARIANTS --- */}
      <Typography variant="h4" className="mt-8">
        Secondary Variants (Simplified)
      </Typography>
      <Grid columns={{ default: 1, md: 3 }} gap="md">
        <GridItem>
          <Card className="p-4" variant="secondary">
            <Typography variant="small" className="font-bold opacity-70 mb-2">
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
            <Typography variant="small" className="font-bold opacity-70 mb-2">
              Profit Margins
            </Typography>
            <BarChart
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
            <Typography variant="small" className="font-bold opacity-70 mb-2">
              Device Share
            </Typography>
            <PieChart
              variant="secondary"
              donut
              data={deviceData}
              category="value"
              index="name"
              height={150}
            />
          </Card>
        </GridItem>
      </Grid>

      {/* --- ROW 3: GHOST VARIANTS (STATUS CARDS) --- */}
      <Typography variant="h4" className="mt-8">
        Ghost Variants (Backgrounds / Sparklines)
      </Typography>
      <Grid columns={{ default: 2, md: 4 }} gap="md">
        <GridItem>
          <Card
            className="relative overflow-hidden h-32 flex flex-col justify-between"
            padding="md"
          >
            <div className="relative z-10">
              <Typography variant="h3">$12,403</Typography>
              <Typography variant="small" className="text-green-600 font-bold">
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
              <Typography variant="h3">84.3%</Typography>
              <Typography variant="small" className="text-primary font-bold">
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
              <Typography variant="h3" className="text-inherit">
                3 Errors
              </Typography>
              <Typography variant="small" className="opacity-80">
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
              <Typography variant="muted" className="text-xs">
                Source breakdown
              </Typography>
            </div>
          </Card>
        </GridItem>
      </Grid>
    </div>
  ),
};
