import { useLanguage } from '../../context/LanguageContext';
import { formatTpl } from '../../translations';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const { t } = useLanguage();
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-gray-500">{formatTpl(t.common.page, { page, total: totalPages })}</p>
      <div className="flex gap-1">
        <button
          className="px-3 py-1 text-sm rounded border dark:border-gray-600 disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          {t.common.prev}
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const start = Math.max(1, Math.min(page - 2, totalPages - 4));
          const pageNum = start + i;
          if (pageNum > totalPages) return null;
          return (
            <button
              key={pageNum}
              className={`px-3 py-1 text-sm rounded ${pageNum === page ? 'bg-blue-600 text-white' : 'border dark:border-gray-600'}`}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          className="px-3 py-1 text-sm rounded border dark:border-gray-600 disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {t.common.next}
        </button>
      </div>
    </div>
  );
}
