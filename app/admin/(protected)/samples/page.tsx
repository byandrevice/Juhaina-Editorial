import { SampleContentManager } from "@/components/admin/sample-content-manager";

export default function AdminSamplesPage() {
  return <main className="admin-page">
    <header className="admin-page-header"><div><p className="admin-eyebrow">Launch content</p><h1>Sample content</h1><p>Remove portfolio samples individually as real client work is published. Removed samples can be restored at any time.</p></div></header>
    <SampleContentManager />
  </main>;
}
