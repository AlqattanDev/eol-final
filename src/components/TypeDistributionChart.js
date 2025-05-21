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
        backgroundColor: [
          'rgba(14, 165, 233, 0.7)',
          'rgba(168, 85, 247, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(34, 197, 94, 0.7)',
        ],
        borderColor: [
          'rgb(14, 165, 233)',
          'rgb(168, 85, 247)',
          'rgb(249, 115, 22)',
          'rgb(34, 197, 94)',
        ],
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: [
          'rgba(14, 165, 233, 0.9)',
          'rgba(168, 85, 247, 0.9)',
          'rgba(249, 115, 22, 0.9)',
          'rgba(34, 197, 94, 0.9)',
        ],
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
          duration: 400,
          easing: 'easeOutQuart'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
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