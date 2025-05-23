import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import useChartAnimation from '../hooks/useChartAnimation';
import ChartCard from './ui/ChartCard';
import { getStatusColor, getChartTheme, animation } from '../utils/styleUtils';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * StatusChart component shows a doughnut chart of resource statuses with animation
 */
const StatusChart = ({ data }) => {
  // Check if dark mode is active
  const isDarkMode = document.documentElement.classList.contains('dark');
  const chartTheme = getChartTheme(isDarkMode);
  
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
          getStatusColor('expired', 0.8),
          getStatusColor('expiring', 0.8),
          getStatusColor('supported', 0.8),
        ],
        borderColor: [
          getStatusColor('expired', 1),
          getStatusColor('expiring', 1),
          getStatusColor('supported', 1),
        ],
        borderWidth: 2,
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
          },
          color: chartTheme.textColor
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
          duration: parseInt(animation.duration.slow),
          easing: 'easeOutQuart'
        }
      }
    },
    cutout: '70%',
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: parseInt(animation.duration.verySlow) * 2,
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