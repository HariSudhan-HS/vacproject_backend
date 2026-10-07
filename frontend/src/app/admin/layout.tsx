import Link from "next/link";
import { Protected } from "@/components/protected";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <Protected admin><main className="page-container"><div className="page-heading"><span className="eyebrow">Crave operations</span><h1>Admin studio</h1><p>Keep the kitchen running smoothly.</p></div><div className="admin-layout"><nav className="admin-nav"><Link href="/admin">Overview</Link><Link href="/admin/foods">Food menu</Link><Link href="/admin/orders">Orders</Link><Link href="/admin/users">Customers</Link></nav><section>{children}</section></div></main></Protected>;
}
