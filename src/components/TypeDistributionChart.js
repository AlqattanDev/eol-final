import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import useChartAnimation from '../hooks/useChartAnimation';
import ChartCard from './ui/ChartCard';
import { getChartColors, getChartTheme, animation, borderRadius } from '../utils/styleUtils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * TypeDistributionChart shows distribution of resources by type with animations
 */
const TypeDistributionChart = ({ resources }) => {
  // Check if dark mode is active
  const isDarkMode = document.documentElement.classList.contains('dark');
  const chartTheme = getChartTheme(isDarkMode);
  // Calculate data from resources
  const chartInfo = useMemo(() => {
    // Count resources by type
    const typeCounts = resources.reduce((acc, resource) => {
      acc[resource.type] = (acc[resource.type] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(typeCounts),
      values: Object.values(typeCounts)
    };
  }, [resources]);
  
  // Get animated data using our custom hook
  const { animatedData } = useChartAnimation(
    chartInfo.values,
    { 
      duration: 1200,
      easingType: 'elastic'
    }
  );

  const data = {
    labels: chartInfo.labels,
    datasets: [
      {
        label: 'Resources by Type',
        data: animatedData,
        backgroundColor: getChartColors('background', 0.8),
        borderColor: getChartColors('border'),
        borderWidth: 2,
        borderRadius: parseInt(borderRadius.default),
        hoverBackgroundColor: getChartColors('background', 1),
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        animation: {
          duration: parseInt(animation.duration.slow),
          easing: 'easeOutQuart'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: chartTheme.textColor,
          font: {
            size: 12,
            weight: '500'
          }
        },
        grid: {
          display: true,
          color: chartTheme.gridColor,
          drawBorder: false,
        }
      },
      x: {
        ticks: {
          color: chartTheme.textColor,
          font: {
            size: 12,
            weight: '600'
          }
        },
        grid: {
          display: false,
          drawBorder: false,
        }
      }
    },
    maintainAspectRatio: false,
    animation: {
      duration: parseInt(animation.duration.verySlow) * 2.4,
      easing: 'easeOutElastic',
    }
  };

  return (
    <ChartCard title="Resources by Type">
      <Bar data={data} options={options} />
    </ChartCard>
  );
};

export default TypeDistributionChart;