import { useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts@2.15.2";
import { useSpotifyData } from "../hooks/useSpotifyData";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-900 border-2 border-gray-600 p-4 rounded-lg shadow-xl">
        <p className="font-semibold mb-2 text-lg whitespace-pre-line">
          {label}
        </p>
        <p className="text-green-400">
          Πληρωμένο μέχρι:{" "}
          <span className="font-semibold">{data.paidUntilLabel}</span>
        </p>
      </div>
    );
  }
  return null;
};

interface CustomYAxisTickProps {
  x: number;
  y: number;
  payload: any;
  periods: any[];
}

const CustomYAxisTick = ({ x, y, payload, periods }: CustomYAxisTickProps) => {
  const period = periods[payload.value];
  const isPriceChange = period?.isSep2023 || period?.isSep2025;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-10}
        y={0}
        dy={4}
        textAnchor="end"
        fill={isPriceChange ? "#fbbf24" : "#fff"}
        fontSize={13}
        fontWeight={isPriceChange ? "bold" : "normal"}
      >
        {period?.label || ""}
      </text>
    </g>
  );
};

export function PaymentChart() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data, loading, error, processedPeriods } = useSpotifyData();

  useEffect(() => {
    // On mobile, scroll to show the current time (right side of the chart)
    if (scrollRef.current && window.innerWidth < 768) {
      const scrollElement = scrollRef.current;
      // Scroll to the right to show current period
      scrollElement.scrollLeft =
        scrollElement.scrollWidth - scrollElement.clientWidth;
    }
  }, [data]);

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 md:p-6 shadow-xl">
        <h2 className="text-2xl md:text-3xl mb-4 md:mb-8 text-center">
          Κατάσταση Πληρωμών
        </h2>
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-gray-400">Φόρτωση δεδομένων...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 md:p-6 shadow-xl">
        <h2 className="text-2xl md:text-3xl mb-4 md:mb-8 text-center">
          Payment History Chart
        </h2>
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-red-400">Error Loading Data</div>
        </div>
      </div>
    );
  }

  // Find the last paid period index for each member
  const chartData = data.members.map((member) => {
    // Find the last index where data is 1
    let lastPaidIndex = -1;
    for (let i = member.data.length - 1; i >= 0; i--) {
      if (member.data[i] === 1) {
        lastPaidIndex = i;
        break;
      }
    }

    const paidUntilIndex = lastPaidIndex + 1;

    return {
      name: member.name,
      value: lastPaidIndex >= 0 ? paidUntilIndex : 0,
      paidUntilLabel:
        lastPaidIndex >= 0
          ? processedPeriods[paidUntilIndex]?.label ?? "Πλήρως Εξοφλημένο"
          : "Καμία πληρωμή",
    };
  });

  // Find positions for price change reference lines
  const sep23Index = processedPeriods.findIndex((p) => p.isSep2023);
  const sep25Index = processedPeriods.findIndex((p) => p.isSep2025);

  // Generate ticks for Y-axis
  const yAxisTicks = processedPeriods.map((_, index) => index);

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 md:p-6 shadow-xl">
      <div ref={scrollRef} className="w-full overflow-x-auto overflow-y-hidden">
        <div className="min-w-[600px] md:min-w-0">
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
              data={chartData}
              margin={{
                top: 60,
                right: 30,
                left: 80,
                bottom: 80,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />

              {/* X-axis shows person names */}
              <XAxis
                dataKey="name"
                tick={{ fill: "#fff", fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />

              {/* Y-axis shows the semesters */}
              <YAxis
                type="number"
                domain={[0, processedPeriods.length]}
                ticks={yAxisTicks}
                tick={(props) => (
                  <CustomYAxisTick {...props} periods={processedPeriods} />
                )}
                width={70}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
              />

              {/* Reference lines for price changes */}
              {sep23Index >= 0 && (
                <ReferenceLine
                  y={sep23Index}
                  stroke="#fbbf24"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{
                    value: "13€",
                    position: "right",
                    fill: "#fbbf24",
                    fontSize: 16,
                    fontWeight: "bold",
                    offset: 10,
                  }}
                />
              )}
              {sep25Index >= 0 && (
                <ReferenceLine
                  y={sep25Index}
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{
                    value: "15€",
                    position: "right",
                    fill: "#f59e0b",
                    fontSize: 16,
                    fontWeight: "bold",
                    offset: 10,
                  }}
                />
              )}

              {/* The bar showing payment status */}
              <Bar dataKey="value" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend */}

      <div className="p-3 md:p-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg border border-yellow-600/30">
        <div className="flex sm:flex-row gap-3 md:gap-4 justify-center">
          {sep23Index >= 0 && (
            <div className="flex items-center gap-2">
              <div className="w-0.5 h-6 md:h-8 bg-yellow-400"></div>
              <div>
                <span className="text-yellow-400 font-semibold text-sm md:text-base">
                  Σεπ 2023
                </span>
                <p className="text-xs md:text-sm text-gray-300">
                  Αύξηση σε 13€
                </p>
              </div>
            </div>
          )}
          {sep25Index >= 0 && (
            <div className="flex items-center gap-2">
              <div className="w-0.5 h-6 md:h-8 bg-orange-500"></div>
              <div>
                <span className="text-orange-400 font-semibold text-sm md:text-base">
                  Σεπ 2025
                </span>
                <p className="text-xs md:text-sm text-gray-300">
                  Αύξηση σε 15€
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
