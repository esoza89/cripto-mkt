// components/PriceHistoryChart.js
'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import { useRef, useEffect } from 'react';
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

// Register the necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PriceHistoryChart = ({ prices }) => {
  const chartRef = useRef(null);
  const labels = prices.map((_, index) => `T-${prices.length - index}`);
  const data = {
    labels,
    datasets: [
      {
        label: 'Precio',
        data: prices,
        fill: false,
        borderColor: 'rgb(255, 191, 0.82)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: false,
    maintainAspectRatio: true,
    aspectRatio: 1,
    plugins: {
        legend: {
            display: false // Hides the legend
        },
        title: {
            display: true,
            text: 'Ultimos trades',
            color: 'orange',
            font: {
            size: 16,
            weight: 'bold',
            },
        },
        tooltip: {
            callbacks: {
            label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                label += ': ';
                }
                if (context.parsed.y !== null) {
                label += context.parsed.y.toFixed(18); // Adjust the number of decimal places as needed
                }
                return label;
            }
            }
        }
    },
    scales: {
        x: {
            ticks: {
              display: false // Hides x-axis labels
            },
            grid: {
              display: false // Optional: hides x-axis grid lines
            }
          },
          y: {
            beginAtZero: false,
            ticks: {
              display: false // Hides y-axis labels
            },
            grid: {
              display: false // Optional: hides y-axis grid lines
            }
          }
    },
  };

  useEffect(() => {
    chartRef.current.update();
  }, [prices]);
  

  return <Line ref={chartRef}
            data={data}
            options={options}
            height={400}
            width={400}
          />;
};

export default PriceHistoryChart;
