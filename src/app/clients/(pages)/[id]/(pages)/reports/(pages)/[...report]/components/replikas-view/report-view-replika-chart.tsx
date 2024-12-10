"use client"
import {
  IClientReportReplicaDistribution
} from "@/lib/interfaces/cdp/cdp.interface";
import {Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis} from "recharts";
import {palette} from "@/lib/utils";
import React from "react";

interface IReportViewReplicaChart {
  replikasList: IClientReportReplicaDistribution[]
}

const ReportViewReplicaChart = ({replikasList}: IReportViewReplicaChart) => {

  return <div className="pt-4">
    <div className="w-full flex flex-col md:flex-row md:gap-2 items-center justify-center">
      <div className="flex items-center">
        <div className={"w-5 h-3 mr-1 rounded"} style={{backgroundColor: palette(1)}}/>
        Low provider count
      </div>
      <div className="flex items-center">
        <div className={"w-5 h-3 mr-1 rounded"} style={{backgroundColor: palette(0)}}/>
        Sufficient provider count
      </div>
    </div>
    <ResponsiveContainer width={'100%'} maxHeight={800} aspect={1} debounce={50}>
      <BarChart
        data={replikasList}
        margin={{ top: 0, right: 20, left: 20, bottom: 50 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="num_of_replicas" />
        <YAxis tickFormatter={value => `${value} %`} />
        <Bar dataKey="percentage">
          {replikasList.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={palette(+(+entry.num_of_replicas <= 3))} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
}

export {ReportViewReplicaChart}