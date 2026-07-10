import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
  labels: string[];
  values: number[];
  label?: string;
  height?: number;
}

export function BarChart({ labels, values, label = 'Value', height = 250 }: BarChartProps) {
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
        label,
        data: values,
        backgroundColor: dark ? 'rgba(26, 92, 122, 0.6)' : 'rgba(26, 92, 122, 0.7)',
        hoverBackgroundColor: dark ? 'rgba(26, 92, 122, 0.8)' : 'rgba(26, 92, 122, 0.9)',
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: dark ? '#64748b' : '#94a3b8', font: { size: 11 } },
      },
      y: {
        grid: { color: dark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)' },
        ticks: { color: dark ? '#64748b' : '#94a3b8', font: { size: 11 } },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
}
