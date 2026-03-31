import { Outlet } from "react-router-dom";
import AdminNav from "../../components/admin/AdminNav";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminNav />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
