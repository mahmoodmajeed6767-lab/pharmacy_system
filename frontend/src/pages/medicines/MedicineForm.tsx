import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { medicineService } from '../../services/medicineService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import toast from 'react-hot-toast';

interface Props {
  initial?: any;
  onSuccess: () => void;
}

export function MedicineForm({ initial, onSuccess }: Props) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: initial || {},
  });

  useEffect(() => {
    medicineService.listCategories().then((res) => setCategories(res.data || []));
  }, []);

  useEffect(() => { reset(initial || {}); }, [initial]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Clean up form data before sending
      const payload = {
        ...data,
        category_id: data.category_id ? Number(data.category_id) : null,
        purchase_price: Number(data.purchase_price) || 0,
        selling_price: Number(data.selling_price) || 0,
        tax: Number(data.tax) || 0,
        quantity: Number(data.quantity) || 0,
        min_stock: Number(data.min_stock) || 10,
        max_stock: Number(data.max_stock) || 100,
      };
      if (initial?.id) {
        await medicineService.update(initial.id, payload);
        toast.success('Medicine updated');
      } else {
        await medicineService.create(payload);
        toast.success('Medicine created');
      }
      onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Error saving medicine';
      toast.error(typeof msg === 'string' ? msg : msg.join(', '));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
      <Input label="Medicine Name *" {...register('name', { required: true })} error={errors.name ? 'Required' : ''} />
      <Input label="Generic Name" {...register('generic_name')} />
      <Input label="Brand" {...register('brand')} />
      <Select label="Category" options={categories.map((c: any) => ({ value: c.id, label: c.name }))} {...register('category_id')} />
      <Input label="Manufacturer" {...register('manufacturer')} />
      <Input label="Batch Number" {...register('batch_number')} />
      <Input label="Barcode" {...register('barcode')} />
      <Input label="SKU" {...register('sku')} />
      <Input label="Purchase Price" type="number" step="0.01" {...register('purchase_price')} />
      <Input label="Selling Price" type="number" step="0.01" {...register('selling_price')} />
      <Input label="Tax (%)" type="number" step="0.01" {...register('tax')} />
      <Input label="Quantity" type="number" step="0.01" {...register('quantity')} />
      <Input label="Min Stock" type="number" step="0.01" {...register('min_stock')} />
      <Input label="Max Stock" type="number" step="0.01" {...register('max_stock')} />
      <Input label="Manufacturing Date" type="date" {...register('manufacturing_date')} />
      <Input label="Expiry Date" type="date" {...register('expiry_date')} />
      <Input label="Rack Number" {...register('rack_number')} />
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" rows={3} {...register('description')} />
      </div>
      <div className="col-span-2 flex justify-end gap-2 mt-2">
        <Button type="submit" loading={loading}>{initial?.id ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
}
