import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicineService } from '../../services/medicineService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { MedicineForm } from './MedicineForm';
import { formatPrice } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';

export function MedicineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isPharmacist } = useAuth();
  const [medicine, setMedicine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  const fetchMedicine = () => {
    if (!id) return;
    setLoading(true);
    medicineService.get(Number(id)).then((res) => {
      setMedicine(res.data.data || res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchMedicine(); }, [id]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!medicine) return <div className="text-center py-12 text-gray-500">Medicine not found</div>;

  const statusBadge = () => {
    if (medicine.quantity <= 0) return <Badge variant="danger">Out of Stock</Badge>;
    if (medicine.quantity <= medicine.min_stock) return <Badge variant="warning">Low Stock ({medicine.quantity})</Badge>;
    return <Badge variant="success">In Stock ({medicine.quantity})</Badge>;
  };

  const isExpired = medicine.expiry_date && new Date(medicine.expiry_date) < new Date();
  const canEdit = isAdmin || isPharmacist;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{medicine.name}</h1>
        <div className="ml-auto">{statusBadge()}</div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Barcode</p>
            <p className="text-sm text-gray-900 dark:text-white mt-1">{medicine.barcode || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SKU</p>
            <p className="text-sm text-gray-900 dark:text-white mt-1">{medicine.sku || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</p>
            <p className="text-sm text-gray-900 dark:text-white mt-1">{medicine.category?.name || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Manufacturer</p>
            <p className="text-sm text-gray-900 dark:text-white mt-1">{medicine.manufacturer || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Selling Price</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{formatPrice(medicine.selling_price)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Purchase Price</p>
            <p className="text-sm text-gray-900 dark:text-white mt-1">{formatPrice(medicine.purchase_price)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Stock</p>
            <p className="text-sm text-gray-900 dark:text-white mt-1 font-medium">{medicine.quantity}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Min Stock Level</p>
            <p className="text-sm text-gray-900 dark:text-white mt-1">{medicine.min_stock}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expiry Date</p>
            <p className={`text-sm mt-1 ${isExpired ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-900 dark:text-white'}`}>
              {medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : '-'}
              {isExpired && ' (Expired)'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rack #</p>
            <p className="text-sm text-gray-900 dark:text-white mt-1">{medicine.rack_number || '-'}</p>
          </div>
        </div>

        {medicine.description && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Description</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{medicine.description}</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate('/medicines')} className="text-sm text-[#1a5c7a] hover:underline">
          ← Back to Medicines
        </button>
        {canEdit && (
          <button
            onClick={() => setShowEdit(true)}
            className="ml-auto text-sm px-4 py-2 bg-[#1a5c7a] text-white rounded-lg hover:bg-[#0f2b4a] transition-colors"
          >
            Edit Medicine
          </button>
        )}
      </div>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Medicine" size="lg">
        <MedicineForm initial={medicine} onSuccess={() => { setShowEdit(false); fetchMedicine(); }} />
      </Modal>
    </div>
  );
}
