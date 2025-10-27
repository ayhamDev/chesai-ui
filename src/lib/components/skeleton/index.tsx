import { clsx } from "clsx";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-md bg-graphite-secondary",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
