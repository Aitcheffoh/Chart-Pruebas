import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const dates = [];
const numbers = [];
/*const volume = [];*/

for (let i = 0; i < 200; i++){
  const date = new Date();
  date.setDate(date.getDate() + i);
  dates.push(date.setHours(0,0,0,0));
  numbers.push(Math.random() * 10);
  /*volume.push(Math.random() * 100);*/
}

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Chart.js Bar Chart',
    },
  },
};

export const data = {
  labels :dates,
  datasets: [{
    label: 'Weekly Sales',
    data: numbers,
    fill: {
      target: {
        value: numbers[0]
      },
      below: (context) => {
        const chart = context.chart;
        const {ctx, chartArea, data, scales} = chart;
        if (!chartArea) {
          return null;
        }
        return belowGradient(ctx, chartArea, data, scales)
      },
      above: (context) => {
        const chart = context.chart;
        const {ctx, chartArea, data, scales} = chart;
        if (!chartArea) {
          return null;
        }
        return aboveGradient(ctx, chartArea, data, scales)
      },
    },
    borderColor:(context) => {
      const chart = context.chart;
      const { ctx, chartArea, data, scales } = chart;
      if(!chartArea) {
        return null;
      }
      return getGradient( ctx, chartArea, data, scales )
    },
  }]
};

function getGradient( ctx, chartArea, data, scales ){
  const {left,right,top,bottom,width,height} = chartArea;
  const {x,y} = scales;
  const gradientBorder = ctx.createLinearGradient(0,0,0,bottom);
  let shift = y.getPixelForValue(data.datasets[0].data[0]) /bottom;

  if (shift > 1){
    shift = 1;
  }

  if (shift < 0){
    shift = 0;
  }

  gradientBorder.addColorStop(0, 'rgba(75, 192, 192, 1)');
  gradientBorder.addColorStop(shift, 'rgba(75, 192, 192, 1)');
  gradientBorder.addColorStop(shift, 'rgba(255, 26, 104, 1)');
  gradientBorder.addColorStop(1, 'rgba(255, 26, 104, 1)');
  return gradientBorder
}

function belowGradient( ctx, chartArea, data, scales ){
  const {left,right,top,bottom,width,height} = chartArea;
  const {x,y} = scales;
  const gradientBackground = ctx.createLinearGradient(0,y.getPixelForValue(data.datasets[0].data[0]),
      0, bottom);
  gradientBackground.addColorStop(0, 'rgba(255, 26, 104, 0)')
  gradientBackground.addColorStop(1, 'rgba(255, 26, 104, 0.5)')
  return gradientBackground;
}

function aboveGradient( ctx, chartArea, data, scales ){
  const {left,right,top,bottom,width,height} = chartArea;
  const {x,y} = scales;
  const gradientBackground = ctx.createLinearGradient(0,y.getPixelForValue(data.datasets[0].data[0]),
      0, top);
  gradientBackground.addColorStop(0, 'rgba(75, 192, 192, 0)')
  gradientBackground.addColorStop(1, 'rgba(75, 192, 192, 0.5)')
  return gradientBackground;
}

export function App() {
  return <Line options={options} data={data} />;
}
