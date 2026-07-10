export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  is_active: boolean;
  role_id: number;
  role?: Role;
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Record<string, string[]>;
}

export interface Medicine {
  id: number;
  name: string;
  generic_name: string;
  brand: string;
  category_id: number;
  category?: MedicineCategory;
  manufacturer: string;
  batch_number: string;
  barcode: string;
  qr_code: string;
  sku: string;
  purchase_price: number;
  selling_price: number;
  tax: number;
  quantity: number;
  min_stock: number;
  max_stock: number;
  manufacturing_date: string;
  expiry_date: string;
  rack_number: string;
  description: string;
  image: string;
  is_active: number;
}

export interface MedicineCategory {
  id: number;
  name: string;
  description: string;
}

export interface Supplier {
  id: number;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  tax_number: string;
  outstanding_balance: number;
  is_active: number;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  date_of_birth: string;
  gender: string;
  loyalty_points: number;
  total_purchases: number;
  is_active: number;
}

export interface Purchase {
  id: number;
  invoice_number: string;
  supplier_id: number;
  supplier?: Supplier;
  user_id: number;
  user?: User;
  purchase_date: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_status: string;
  notes: string;
  items?: PurchaseItem[];
  created_at: string;
}

export interface PurchaseItem {
  id: number;
  purchase_id: number;
  medicine_id: number;
  medicine?: Medicine;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  subtotal: number;
  batch_number: string;
  expiry_date: string;
}

export interface Sale {
  id: number;
  invoice_number: string;
  customer_id: number;
  customer?: Customer;
  user_id: number;
  user?: User;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paid_amount: number;
  change_amount: number;
  payment_method: string;
  payment_status: string;
  notes: string;
  items?: SaleItem[];
  created_at: string;
}

export interface SaleItem {
  id: number;
  sale_id: number;
  medicine_id: number;
  medicine?: Medicine;
  quantity: number;
  unit_price: number;
  discount: number;
  tax: number;
  subtotal: number;
}

export interface Prescription {
  id: number;
  customer_id: number;
  customer?: Customer;
  uploaded_by: number;
  uploader?: User;
  approved_by: number;
  approver?: User;
  image_path: string;
  notes: string;
  status: string;
  rejection_reason: string;
  created_at: string;
}

export interface InventoryLog {
  id: number;
  medicine_id: number;
  medicine?: Medicine;
  user_id: number;
  user?: User;
  action: string;
  quantity_change: number;
  before_quantity: number;
  after_quantity: number;
  reference_type: string;
  reference_id: number;
  notes: string;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  reference_type: string;
  reference_id: number;
  is_read: boolean;
  created_at: string;
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  group: string;
}

export interface DashboardStats {
  total_sales_today: number;
  total_sales_this_month: number;
  total_revenue_today: number;
  monthly_revenue: number;
  total_medicines: number;
  low_stock_medicines: number;
  expired_medicines: number;
  total_customers: number;
  total_suppliers: number;
  recent_sales: Sale[];
  inventory_value: number;
  profit_overview: { revenue: number; profit: number; date: string }[];
  category_distribution?: { name: string; count: number }[];
}

export interface PaginatedResponse<T> {
  status: string;
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}
