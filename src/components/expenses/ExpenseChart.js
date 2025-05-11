import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const ExpenseChart = ({ categoryTotals }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Define colors for different categories
  const categoryColors = {
    Food: 'rgba(54, 162, 235, 0.8)',
    Transport: 'rgba(255, 99, 132, 0.8)',
    Books: 'rgba(255, 206, 86, 0.8)',
    Entertainment: 'rgba(75, 192, 192, 0.8)',
    Utilities: 'rgba(153, 102, 255, 0.8)',
    Others: 'rgba(255, 159, 64, 0.8)'
  };

  useEffect(() => {
    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      
      const labels = Object.keys(categoryTotals);
      const data = Object.values(categoryTotals);
      
      // Get colors for each category, defaulting to gray if not in our predefined colors
      const colors = labels.map(category => 
        categoryColors[category] || 'rgba(128, 128, 128, 0.8)'
      );
      
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: colors,
              borderColor: colors.map(color => color.replace('0.8', '1')),
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                font: {
                  size: 12
                },
                padding: 20
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
    
    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [categoryTotals]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Expense Breakdown</h2>
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default ExpenseChart;
