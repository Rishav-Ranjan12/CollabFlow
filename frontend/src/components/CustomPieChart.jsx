import React from "react"
import {
  Pie,
  PieChart,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts"
import CustomTooltip from "./CustomTooltip"
import CustomLegend from "./CustomLegend"

const CustomPieChart = ({ data, colors }) => {
  const total = (data || []).reduce((a, b) => a + (b.count || 0), 0)
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-0 right-0 top-[46%] -translate-y-1/2 text-center">
        <p className="font-brand text-4xl font-bold leading-none text-slate-900">{total}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Tasks</p>
      </div>
    <ResponsiveContainer width={"100%"} height={300}>
      <PieChart>
        <Pie
          data={data}
          cx={"50%"}
          cy={"46%"}
          labelLine={false}
          outerRadius={106}
          innerRadius={80}
          paddingAngle={3}
          cornerRadius={6}
          stroke="none"
          fill="#8884d8"
          dataKey="count"
          nameKey={"status"}
        >
          {data?.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>

        <Tooltip content={<CustomTooltip />} />

        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
    </div>
  )
}

export default CustomPieChart
