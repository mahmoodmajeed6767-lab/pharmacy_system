import { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
  labels: string[];
  values: number[];
  height?: number;
  onSegmentClick?: (label: string) => void;
}

const COLORS = ['#1a5c7a', '#2d8bae', '#48c9b0', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

export function DoughnutChart({ labels, values, height = 250, onSegmentClick }: DoughnutChartProps) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: COLORS.slice(0, labels.length),
        borderWidth: 0,
        hoverOffset: 12,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    onClick: (_: any, elements: any[]) => {
      if (elements.length > 0 && onSegmentClick) {
        const idx = elements[0].index;
        onSegmentClick(labels[idx]);
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: dark ? '#cbd5e1' : '#64748b',
          padding: 14,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 11 },
        },
        onClick: (_: any, legendItem: any) => {
          if (onSegmentClick) {
            onSegmentClick(legendItem.text);
          }
        },
      },
      tooltip: {
        backgroundColor: dark ? '#1e293b' : '#ffffff',
        titleColor: dark ? '#f1f5f9' : '#0f172a',
        bodyColor: dark ? '#cbd5e1' : '#334155',
        borderColor: dark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
  };

  return (
    <div style={{ height }} className="cursor-pointer">
      <Doughnut data={data} options={options} />
    </div>
  );
}
