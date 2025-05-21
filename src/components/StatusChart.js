import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import useChartAnimation from '../hooks/useChartAnimation';
import ChartCard from './ui/ChartCard';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * StatusChart component shows a doughnut chart of resource statuses with animation
 */
const StatusChart = ({ data }) => {
  // Memoize the data array to prevent recreation on each render
  const dataArray = useMemo(() => [
    data.expired, 
    data.expiring, 
    data.supported
  ], [data.expired, data.expiring, data.supported]);
  
  // Get animated data using our custom hook
  const { animatedData } = useChartAnimation(
    dataArray,
    { 
      duration: 1000,
      easingType: 'cubic'
    }
  );

  const chartData = {
    labels: ['Expired', 'Expiring Soon', 'Supported'],
    datasets: [
      {
        data: animatedData,
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(34, 197, 94, 0.7)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
          'rgb(34, 197, 94)',
        ],
        borderWidth: 1,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        },
        animation: {
          duration: 400,
          easing: 'easeOutQuart'
        }
      }
    },
    cutout: '70%',
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutCubic'
    }
  };

  return (
    <ChartCard title="Resource Status Distribution">
      <Doughnut data={chartData} options={options} />
    </ChartCard>
  );
};

export default StatusChart;