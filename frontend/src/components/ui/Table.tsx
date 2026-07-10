import { useLanguage } from '../../context/LanguageContext';

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  onRowClick?: (row: any) => void;
}

export function Table({ columns, data, loading, onRowClick }: TableProps) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <svg className="animate-spin h-8 w-8 text-[#1a5c7a]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!data.length) {
    return <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">{t.common.noData}</div>;
  }

  return (
    <div className="overflow-x-auto -mx-5">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-700">
            {columns.map((col) => (
              <th key={col.key} className="px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id || i}
              className={`border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-5 py-3.5 text-gray-900 dark:text-white">
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
