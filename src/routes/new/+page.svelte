<script>
	import { createDateSeries } from "$lib/utils/genData";
	import { Chart, Svg, Axis, Bars, Tooltip, TooltipItem, Highlight } from "layerchart";
	import { formatDate, PeriodType } from "svelte-ux";
    import {scaleBand} from 'd3-scale';
	import { format } from "date-fns";

    const data = createDateSeries({
    count: 10,
    min: 20,
    max: 100,
    value: 'integer',
    keys: ['value', 'baseline'],
  });
  console.log(data);

</script>
<div class="h-[500px] p-4 border rounded group text-slate-100 ">
    <Chart
      {data}
      x="value"
      xDomain={[0, null]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: "band" }}
      
    >
      <Svg>
        <Axis placement="bottom" grid rule />
        <Axis
          placement="left"
          format={(d) => formatDate(d, PeriodType.Day, { variant: "short" })}
          rule
        />
        <Bars
          radius={4}
          strokeWidth={2}
          class="fill-gray-300 group-hover:fill-gray-100 transition-colors"
        />
        <!-- <Highlight
          area
          bar={{ class: "fill-secondary", strokeWidth: 1, radius: 4 }}
        /> -->
      </Svg>
      <Tooltip header={(data) => format(data.date, "eee, MMMM do")} let:data>
        <TooltipItem label="value" value={data.value} />
      </Tooltip>
    </Chart>
  </div>