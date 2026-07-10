import { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { saleService } from '../../services/saleService';
import { medicineService } from '../../services/medicineService';
import { settingService } from '../../services/settingService';
import { customerService } from '../../services/customerService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/format';
import api from '../../services/api';

export function POS() {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [medicines, setMedicines] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paidAmount, setPaidAmount] = useState(0);
  const [globalTax, setGlobalTax] = useState(0);
  const barcodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    medicineService.list({ limit: 100 }).then((res) => setMedicines(res.data.data || []));
    customerService.list({ limit: 100 }).then((res) => setCustomers(res.data.data || []));
    // Load global tax_percentage setting
    settingService.get().then((res) => {
      const data = res.data.data || {};
      setGlobalTax(parseFloat(data['tax_percentage']) || 0);
    });
    barcodeRef.current?.focus();
  }, []);

  useEffect(() => {
    if (search.length >= 2) {
      medicineService.list({ search, limit: 20 }).then((res) => setMedicines(res.data.data || []));
    }
  }, [search]);

  const handleBarcodeScan = async (barcode: string) => {
    if (!barcode) return;
    try {
      const res = await medicineService.getByBarcode(barcode);
      addToCart(res.data);
    } catch {
      toast.error(t.pos.medicineNotFound);
    }
    if (barcodeRef.current) barcodeRef.current.value = '';
  };

  const addToCart = (med: any) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.medicine_id === med.id);
      if (existing) {
        return prev.map((c) => c.medicine_id === med.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      const effectiveTax = globalTax || 0; // Global tax from settings applies to ALL items
      return [...prev, { medicine_id: med.id, name: med.name, unit_price: med.selling_price, quantity: 1, discount: 0, tax: effectiveTax }];
    });
  };

  const updateQty = (index: number, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((_, i) => i !== index));
    } else {
      setCart((prev) => prev.map((c, i) => i === index ? { ...c, quantity: qty } : c));
    }
  };

  const subtotal = cart.reduce((s, c) => s + c.unit_price * c.quantity, 0);
  const totalTax = cart.reduce((s, c) => s + (c.unit_price * c.quantity * (c.tax || 0)) / 100, 0);
  const total = subtotal + totalTax;
  const change = Math.max(0, paidAmount - total);

  const handleCheckout = async () => {
    if (!cart.length) return toast.error(t.pos.cartEmpty);
    const payload = {
      customer_id: customerId ? Number(customerId) : null,
      items: cart.map((c) => ({
        medicine_id: c.medicine_id,
        quantity: c.quantity,
        unit_price: c.unit_price,
        discount: c.discount,
        tax: (c.unit_price * c.quantity * (c.tax || 0)) / 100,
        subtotal: c.unit_price * c.quantity,
      })),
      subtotal,
      tax: totalTax,
      discount: 0,
      total,
      paid_amount: paidAmount || total,
      payment_method: paymentMethod,
    };
    try {
      const res = await saleService.create(payload);
      toast.success(t.pos.saleCompleted);
      setCart([]);
      setPaidAmount(0);
      api.get(`/sales/${res.data.id}/invoice`, { responseType: 'blob' }).then((r) => {
        const url = URL.createObjectURL(r.data);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || t.pos.checkoutFailed);
    }
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
          <h2 className="font-semibold mb-3 text-gray-900 dark:text-white">{t.pos.scanBarcode}</h2>
          <input
            ref={barcodeRef}
            onKeyDown={(e) => { if (e.key === 'Enter') { handleBarcodeScan((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }}
            placeholder={t.pos.scanPlaceholder}
            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
          <h2 className="font-semibold mb-3 text-gray-900 dark:text-white">{t.pos.searchMedicines}</h2>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.pos.searchPlaceholder} />
          <div className="mt-2 grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {medicines.filter((m) => m.quantity > 0).map((m) => (
              <button key={m.id} onClick={() => addToCart(m)} className="text-left p-2 rounded border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                <span className="font-medium text-gray-900 dark:text-white">{m.name}</span>
                <span className="text-gray-500 ml-1">- {formatPrice(m.selling_price)}</span>
                <span className="text-xs text-gray-400 ml-1">({t.pos.inStock.replace('{qty}', m.quantity)})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-96 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">{t.pos.cart}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                <p className="text-xs text-gray-500">{formatPrice(item.unit_price)} x {item.quantity}</p>
              </div>
              <input type="number" min="1" value={item.quantity} onChange={(e) => updateQty(i, Number(e.target.value))} className="w-16 px-2 py-1 border rounded text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white" />
              <button onClick={() => setCart((prev) => prev.filter((_, j) => j !== i))} className="text-red-500 text-sm">✕</button>
            </div>
          ))}
          {!cart.length && <p className="text-gray-400 text-sm text-center py-4">{t.pos.cartEmpty}</p>}
        </div>

        <div className="p-4 border-t dark:border-gray-700 space-y-3">
          <Select label={t.pos.customer} value={customerId} onChange={(e) => setCustomerId(e.target.value)} options={customers.map((c) => ({ value: c.id, label: c.name }))} />
          <Select label={t.pos.payment} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} options={[
            { value: 'cash', label: 'Cash' },
            { value: 'credit_card', label: 'Credit Card' },
            { value: 'debit_card', label: 'Debit Card' },
            { value: 'mobile_wallet', label: 'Mobile Wallet' },
          ]} />

          <div className="text-sm space-y-1">
            <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>{t.pos.subtotal}</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>{t.pos.tax}</span><span>{formatPrice(totalTax)}</span></div>
            <div className="flex justify-between font-bold text-gray-900 dark:text-white text-lg"><span>{t.pos.total}</span><span>{formatPrice(total)}</span></div>
          </div>

          <Input label={t.pos.amountPaid} type="number" value={paidAmount} onChange={(e) => setPaidAmount(Number(e.target.value))} />
          {paidAmount > 0 && <p className="text-sm text-green-600 font-medium">{t.pos.change} {formatPrice(change)}</p>}

          <Button onClick={handleCheckout} className="w-full" disabled={!cart.length}>{t.pos.checkout}</Button>
        </div>
      </div>
    </div>
  );
}
