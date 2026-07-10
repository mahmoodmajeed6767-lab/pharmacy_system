import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export function UserList() {
  const { isAdmin, user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ role_id: 1, username: '', email: '', password: '', full_name: '', phone: '' });

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await userService.list();
      const data = res.data;
      const list = Array.isArray(data) ? data : data.data || [];
      setUsers(list);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const roles = [
    { value: 1, label: 'Admin' },
    { value: 2, label: 'Pharmacist' },
    { value: 3, label: 'Cashier' },
  ];

  const handleSave = async () => {
    if (!form.username || !form.email) return toast.error('Username and email required');
    if (!editing && !form.password) return toast.error('Password required for new user');
    try {
      if (editing?.id) {
        const payload = { ...form };
        delete payload.password;
        if (!payload.password) delete payload.password;
        await userService.update(editing.id, payload);
        toast.success('User updated');
      } else {
        await userService.create(form);
        toast.success('User created');
      }
      setShowModal(false);
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Error saving user');
    }
  };

  const columns = [
    { key: 'username', header: 'Username' },
    { key: 'email', header: 'Email' },
    { key: 'full_name', header: 'Full Name' },
    { key: 'role', header: 'Role', render: (_: any, row: any) => <Badge>{row.role?.name || 'N/A'}</Badge> },
    { key: 'is_active', header: 'Status', render: (v: boolean) => v ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Inactive</Badge> },
    { key: 'actions', header: '', render: (_: any, row: any) => {
      if (!isAdmin) return null;
      const isSelf = row.id === user?.id;
      return (
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={() => { setEditing(row); setForm({ ...row, password: '' }); setShowModal(true); }}>Edit</Button>
          <Button size="sm" variant="danger" disabled={isSelf} onClick={async () => { if (!confirm('Delete this user?')) return; try { await userService.delete(row.id); toast.success('User deleted'); fetch(); } catch { toast.error('Delete failed'); } }}>{isSelf ? 'You' : 'Del'}</Button>
        </div>
      );
    } },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
        {isAdmin && <Button onClick={() => { setEditing(null); setForm({ role_id: 1, username: '', email: '', password: '', full_name: '', phone: '' }); setShowModal(true); }}>+ Add User</Button>}
      </div>
      <Table columns={columns} data={users} loading={loading} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit User' : 'Add User'}>
        <div className="space-y-3">
          <Input label="Username *" value={form.username || ''} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <Input label="Email *" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {!editing && <Input label="Password *" type="password" value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} />}
          <Input label="Full Name" value={form.full_name || ''} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <Input label="Phone" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Select label="Role" value={form.role_id || 1} onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })} options={roles} />
          {editing && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active !== false} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              Active
            </label>
          )}
          <Button onClick={handleSave} className="w-full">{editing ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>
    </div>
  );
}
