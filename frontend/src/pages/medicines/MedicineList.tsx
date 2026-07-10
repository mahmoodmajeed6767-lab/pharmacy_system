import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { medicineService } from '../../services/medicineService';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { MedicineForm } from './MedicineForm';
import { useAuth } from '../../hooks/useAuth';
import { formatPrice } from '../../utils/format';

export function MedicineList() {
  const { isAdmin, isPharmacist } = useAuth();
  const canEdit = isAdmin || isPharmacist;
  const [searchParams, setSearchParams] = useSearchParams();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const categoryParam = searchParams.get('category') || '';

  const fetchMedicines = () => {
    setLoading(true);
    const params: any = { page, limit: 10, search };
    if (categoryParam) {
      params.category = categoryParam;
    }
    medicineService.list(params).then((res) => {
      setMedicines(res.data.data || []);
      setTotalPages(res.data.total_pages || 1);
      setTotal(res.data.total || 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchMedicines(); }, [page, search, categoryParam]);

  const clearCategoryFilter = () => {
    setSearchParams({});
    setPage(1);
  };

  const handleEdit = (row: any) => {
    setEditing(row);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Deactivate this medicine?')) {
      await medicineService.delete(id);
      fetchMedicines();
    }
  };

  const stockBadge = (row: any) => {
    if (row.quantity <= 0) return <Badge variant="danger">Out of Stock</Badge>;
    if (row.quantity <= row.min_stock) return <Badge variant="warning">Low ({row.quantity})</Badge>;
    return <Badge variant="success">{row.quantity}</Badge>;
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'barcode', header: 'Barcode' },
    { key: 'selling_price', header: 'Price', render: (v: number) => formatPrice(v) },
    { key: 'quantity', header: 'Stock', render: (_: any, row: any) => stockBadge(row) },
    { key: 'expiry_date', header: 'Expiry' },
    { key: 'actions', header: 'Actions', render: (_: any, row: any) => (
      <div className="flex gap-1">
        {canEdit && <Button size="sm" variant="secondary" onClick={() => handleEdit(row)}>Edit</Button>}
        {isAdmin && <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>Del</Button>}
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {categoryParam ? `${categoryParam} Medicines` : `All Medicines`}
          <span className="text-base font-normal text-gray-500 ml-2">({total})</span>
        </h1>
        <div className="flex items-center gap-2">
          {categoryParam && (
            <Button size="sm" variant="secondary" onClick={clearCategoryFilter}>
              Clear Filter
            </Button>
          )}
          {canEdit && <Button onClick={() => { setEditing(null); setShowModal(true); }}>+ Add Medicine</Button>}
        </div>
      </div>

      {categoryParam && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1a5c7a]/5 border border-[#1a5c7a]/20 text-sm text-[#1a5c7a] dark:text-[#48c9b0]">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtered by category: <strong>{categoryParam}</strong>
          <button onClick={clearCategoryFilter} className="ml-1 text-[#1a5c7a]/70 hover:text-[#1a5c7a] dark:text-[#48c9b0]/70 dark:hover:text-[#48c9b0] underline">show all</button>
        </div>
      )}

      <SearchInput value={search} onChange={setSearch} placeholder="Search by name, barcode, SKU..." />
      {!loading && medicines.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <p className="text-lg font-medium">{categoryParam ? `No medicines found in "${categoryParam}".` : 'No medicines found.'}</p>
          {categoryParam && (
            <Button size="sm" variant="secondary" onClick={clearCategoryFilter} className="mt-3">
              Clear Filter & Show All
            </Button>
          )}
        </div>
      ) : (
        <Table columns={columns} data={medicines} loading={loading} />
      )}
      {medicines.length > 0 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Medicine' : 'Add Medicine'} size="lg">
        <MedicineForm initial={editing} onSuccess={() => { setShowModal(false); setEditing(null); fetchMedicines(); }} />
      </Modal>
    </div>
  );
}
