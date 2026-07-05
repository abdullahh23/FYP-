import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard, Package, PackagePlus, ClipboardList,
  MessageSquareText, Bell, User, Settings, LogOut,
  ChevronRight, X, Menu, Trash2, Pencil
} from 'lucide-react';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Field, Input, Select, Textarea, Toggle } from '../../components/ui/forms';
import { productCategories, productTags, productUnits } from '../../lib/constants';
import { useAuth } from '../../contexts/AuthContext';
import {
  createProduct, getSupplierProfile, listMaterialQuoteRequests,
  listProducts, respondToMaterialQuote, upsertSupplierProfile,
  updateProduct, deleteProduct
} from '../../services/suppliers';
import { uploadToBucket } from '../../services/storage';
import { useToast } from '../../components/ui/toast';
import { formatCurrency } from '../../lib/utils';
import { ChatPanel } from '../../components/chat/ChatPanel';
import { listConversationsForUser } from '../../services/chat';

type SupplierForm = {
  company_name: string; description: string; years_in_business: number;
  city: string; address: string; contact_number: string; whatsapp: string;
  website: string; delivery_available: boolean; minimum_order: number;
};
type ProductForm = {
  name: string; brand: string; category: string; description: string;
  unit: string; price: number; discount: number; stock: number;
  delivery_time: string; warranty: string; quality_grade: string;
  manufacturer: string; specifications: string; tags: string; is_featured: boolean;
};
type ResponseForm = { total_price: number; delivery_time: string; discount: number; notes: string };

type Section = 'dashboard' | 'products' | 'add-product' | 'orders' | 'messages' | 'notifications' | 'profile' | 'settings';

const navItems: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'products',     label: 'My Products',   icon: Package },
  { id: 'add-product',  label: 'Add Product',   icon: PackagePlus },
  { id: 'orders',       label: 'Orders',        icon: ClipboardList },
  { id: 'messages',     label: 'Messages',      icon: MessageSquareText },
  { id: 'notifications',label: 'Notifications', icon: Bell },
  { id: 'profile',      label: 'Profile',       icon: User },
  { id: 'settings',     label: 'Settings',      icon: Settings },
];

export function SupplierDashboard() {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [section, setSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [logo, setLogo] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [chatRequest, setChatRequest] = useState<{ projectId: string; homeownerId: string } | null>(null);

  const supplierProfile = useQuery({ queryKey: ['supplier-profile', user?.id], queryFn: () => getSupplierProfile(user!.id), enabled: Boolean(user?.id) });
  const products = useQuery({ queryKey: ['products', user?.id], queryFn: () => listProducts(user!.id), enabled: Boolean(user?.id) });
  const quoteRequests = useQuery({ queryKey: ['material-requests', user?.id], queryFn: () => listMaterialQuoteRequests(user!.id, 'supplier'), enabled: Boolean(user?.id) });
  const conversations = useQuery({ queryKey: ['conversations', user?.id], queryFn: () => listConversationsForUser(user!.id), enabled: Boolean(user?.id) });

  const profileForm = useForm<SupplierForm>({
    values: {
      company_name: supplierProfile.data?.company_name ?? profile?.name ?? '',
      description: supplierProfile.data?.description ?? '',
      years_in_business: supplierProfile.data?.years_in_business ?? 0,
      city: supplierProfile.data?.city ?? profile?.city ?? '',
      address: supplierProfile.data?.address ?? '',
      contact_number: supplierProfile.data?.contact_number ?? profile?.phone ?? '',
      whatsapp: supplierProfile.data?.whatsapp ?? '',
      website: supplierProfile.data?.website ?? '',
      delivery_available: supplierProfile.data?.delivery_available ?? false,
      minimum_order: supplierProfile.data?.minimum_order ?? 0,
    }
  });
  const productForm = useForm<ProductForm>({
    defaultValues: {
      name: '', brand: '', category: 'Cement', description: '', unit: 'piece',
      price: 0, discount: 0, stock: 0, delivery_time: '', warranty: '',
      quality_grade: 'Standard', manufacturer: '', specifications: '',
      tags: 'standard, cement', is_featured: false,
    }
  });
  const responseForm = useForm<ResponseForm>({ defaultValues: { total_price: 0, delivery_time: '', discount: 0, notes: '' } });

  const saveProfile = useMutation({
    mutationFn: async (values: SupplierForm) => {
      const logo_url = logo ? await uploadToBucket('supplier-assets', `${user!.id}/logo`, logo) : supplierProfile.data?.logo_url ?? null;
      const banner_url = banner ? await uploadToBucket('supplier-assets', `${user!.id}/banner`, banner) : supplierProfile.data?.banner_url ?? null;
      await upsertSupplierProfile(user!.id, { ...values, logo_url, banner_url, average_rating: supplierProfile.data?.average_rating ?? 0 });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['supplier-profile', user?.id] }); toast({ title: 'Profile saved', type: 'success' }); },
    onError: (e) => toast({ title: 'Profile save failed', description: e instanceof Error ? e.message : 'Try again.', type: 'error' }),
  });

  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const saveProduct = useMutation({
    mutationFn: async (values: ProductForm) => {
      const image_urls = productImages.length
        ? await Promise.all(productImages.map((img) => uploadToBucket('product-images', user!.id, img)))
        : undefined;
      const specifications = Object.fromEntries(
        values.specifications.split('\n').map((l) => l.split(':').map((p) => p.trim())).filter((p) => p.length === 2 && p[0])
      );

      if (editingProductId) {
        const payload: any = {
          ...values,
          specifications,
          tags: values.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
        };
        if (image_urls) {
          payload.image_urls = image_urls;
        }
        await updateProduct(editingProductId, payload);
      } else {
        await createProduct({
          supplier_id: user!.id,
          ...values,
          specifications,
          image_urls: image_urls ?? [],
          tags: values.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
          is_active: true
        });
      }
    },
    onSuccess: () => {
      productForm.reset();
      setProductImages([]);
      setEditingProductId(null);
      queryClient.invalidateQueries({ queryKey: ['products', user?.id] });
      toast({ title: editingProductId ? 'Product updated' : 'Product published', type: 'success' });
      setSection('products');
    },
    onError: (e) => toast({ title: 'Product save failed', description: e instanceof Error ? e.message : 'Try again.', type: 'error' }),
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      await deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', user?.id] });
      toast({ title: 'Product deleted successfully', type: 'success' });
    },
    onError: (e) => toast({ title: 'Product delete failed', description: e instanceof Error ? e.message : 'Try again.', type: 'error' }),
  });

  async function respond(requestId: string, values: ResponseForm) {
    try { await respondToMaterialQuote(requestId, values); quoteRequests.refetch(); toast({ title: 'Quotation sent', type: 'success' }); }
    catch (e) { toast({ title: 'Response failed', description: e instanceof Error ? e.message : 'Try again.', type: 'error' }); }
  }

  const overviewStats = [
    { label: 'Products', value: products.data?.length ?? 0 },
    { label: 'Active Orders', value: quoteRequests.data?.filter((r) => r.status === 'pending').length ?? 0 },
    { label: 'Conversations', value: conversations.data?.length ?? 0 },
    { label: 'Avg Rating', value: supplierProfile.data?.average_rating ? supplierProfile.data.average_rating.toFixed(1) : '—' },
  ];

  function NavItem({ item }: { item: typeof navItems[number] }) {
    const active = section === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => { setSection(item.id); setSidebarOpen(false); }}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${active ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {item.label}
        {active && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />}
      </button>
    );
  }

  const Sidebar = () => (
    <aside className="flex h-full flex-col gap-1 p-4">
      <div className="mb-4 px-2">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">BuildWise</p>
        <p className="mt-1 text-base font-bold">{supplierProfile.data?.company_name ?? profile?.name ?? 'Supplier'}</p>
        <p className="text-xs text-muted-foreground">Supplier</p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5">
        {navItems.map((item) => <NavItem key={item.id} item={item} />)}
      </nav>
      <button
        type="button"
        onClick={() => signOut()}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </aside>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden w-64 shrink-0 border-r bg-card md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 border-r bg-card">
            <div className="flex items-center justify-end p-3">
              <Button type="button" variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b bg-card p-4 md:hidden">
          <Button type="button" variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}><Menu className="h-5 w-5" /></Button>
          <p className="font-bold">{navItems.find((n) => n.id === section)?.label}</p>
          <div className="w-9" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* DASHBOARD */}
          {section === 'dashboard' && (
            <div className="grid gap-6">
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">Supplier Dashboard</h1>
                <p className="mt-1 text-muted-foreground">Overview of your marketplace performance.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {overviewStats.map((stat) => (
                  <Card key={stat.label}><CardContent className="p-5"><p className="text-xs font-semibold uppercase text-muted-foreground">{stat.label}</p><p className="mt-2 text-3xl font-bold">{stat.value}</p></CardContent></Card>
                ))}
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle>Recent Products</CardTitle></CardHeader>
                  <CardContent className="grid gap-3">
                    {products.data?.slice(0, 4).map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div><p className="font-semibold">{p.name}</p><p className="text-sm text-muted-foreground">{p.category} · Stock {p.stock}</p></div>
                        <p className="font-bold text-primary">{formatCurrency(p.price)}</p>
                      </div>
                    )) ?? <p className="text-sm text-muted-foreground">No products yet.</p>}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
                  <CardContent className="grid gap-3">
                    {quoteRequests.data?.slice(0, 4).map((r) => (
                      <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div><p className="font-semibold">{r.items?.length ?? 0} items</p><p className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p></div>
                        <Badge>{r.status}</Badge>
                      </div>
                    )) ?? <p className="text-sm text-muted-foreground">No orders yet.</p>}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* MY PRODUCTS */}
          {section === 'products' && (
            <div className="grid gap-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">My Products</h1>
                <Button onClick={() => { setEditingProductId(null); productForm.reset(); setSection('add-product'); }}>Add Product</Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.data?.length ? products.data.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    {product.image_urls?.[0] && <img src={product.image_urls[0]} alt={product.name} className="h-40 w-full object-cover" />}
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div><p className="font-bold">{product.name}</p><p className="text-sm text-muted-foreground">{product.brand} · {product.category}</p></div>
                        <p className="shrink-0 font-bold text-primary">{formatCurrency(product.price * (1 - product.discount / 100))}</p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Stock: {product.stock} · {product.unit}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">{product.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
                      <div className="mt-3 flex gap-2 border-t pt-3">
                        <Button size="sm" variant="secondary" onClick={() => { setEditingProductId(product.id); productForm.reset({ name: product.name, brand: product.brand ?? '', category: product.category, description: product.description ?? '', unit: product.unit, price: product.price, discount: product.discount, stock: product.stock, delivery_time: product.delivery_time ?? '', warranty: product.warranty ?? '', quality_grade: product.quality_grade, manufacturer: product.manufacturer ?? '', specifications: Object.entries(product.specifications ?? {}).map(([k,v]) => `${k}: ${v}`).join('\n'), tags: product.tags.join(', '), is_featured: product.is_featured }); setSection('add-product'); }}><Pencil className="h-3.5 w-3.5 mr-1" />Edit</Button>
                        <Button size="sm" variant="secondary" className="text-red-600 hover:bg-red-50" onClick={() => deleteProductMutation.mutate(product.id)} disabled={deleteProductMutation.isPending}><Trash2 className="h-3.5 w-3.5 mr-1" />Delete</Button>
                      </div>
                    </CardContent>
                  </Card>
                )) : <Card><CardContent className="p-10 text-center text-muted-foreground">No products yet. Add your first product!</CardContent></Card>}
              </div>
            </div>
          )}

          {/* ADD PRODUCT */}
          {section === 'add-product' && (
            <div className="grid gap-6">
              <h1 className="text-2xl font-bold">{editingProductId ? 'Edit Product' : 'Add Product'}</h1>
              <Card>
                <CardHeader><CardTitle>Product details</CardTitle><CardDescription>Detailed product data powers accurate homeowner recommendations.</CardDescription></CardHeader>
                <CardContent>
                  <form className="grid gap-4" onSubmit={productForm.handleSubmit((v) => saveProduct.mutate(v))}>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <Field label="Product name"><Input {...productForm.register('name', { required: true })} /></Field>
                      <Field label="Brand"><Input {...productForm.register('brand')} /></Field>
                      <Field label="Category"><Select {...productForm.register('category')}>{productCategories.map((c) => <option key={c}>{c}</option>)}</Select></Field>
                      <Field label="Unit"><Select {...productForm.register('unit')}>{productUnits.map((u) => <option key={u}>{u}</option>)}</Select></Field>
                      <Field label="Price (PKR)"><Input type="number" {...productForm.register('price', { valueAsNumber: true })} /></Field>
                      <Field label="Discount %"><Input type="number" {...productForm.register('discount', { valueAsNumber: true })} /></Field>
                      <Field label="Available stock"><Input type="number" {...productForm.register('stock', { valueAsNumber: true })} /></Field>
                      <Field label="Delivery time"><Input placeholder="e.g. 3-5 days" {...productForm.register('delivery_time')} /></Field>
                      <Field label="Warranty"><Input placeholder="e.g. 1 year" {...productForm.register('warranty')} /></Field>
                      <Field label="Quality grade"><Select {...productForm.register('quality_grade')}><option>Economy</option><option>Standard</option><option>Premium</option><option>Luxury</option></Select></Field>
                      <Field label="Manufacturer"><Input {...productForm.register('manufacturer')} /></Field>
                      <Field label="Tags"><Input list="ptags" {...productForm.register('tags')} /><datalist id="ptags">{productTags.map((t) => <option key={t}>{t}</option>)}</datalist></Field>
                    </div>
                    <Field label="Description"><Textarea {...productForm.register('description')} /></Field>
                    <Field label="Specifications (Key: Value per line)"><Textarea {...productForm.register('specifications')} /></Field>
                    <Field label="Product images"><Input type="file" multiple accept="image/*" onChange={(e) => setProductImages(Array.from(e.target.files ?? []))} /></Field>
                    <Toggle label="Featured product" checked={productForm.watch('is_featured')} onChange={(v) => productForm.setValue('is_featured', v)} />
                    <div className="flex gap-3">
                      <Button type="button" variant="secondary" onClick={() => { setEditingProductId(null); setSection('products'); }}>Cancel</Button>
                      <Button loading={saveProduct.isPending}>{editingProductId ? 'Update Product' : 'Publish Product'}</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ORDERS */}
          {section === 'orders' && (
            <div className="grid gap-6">
              <h1 className="text-2xl font-bold">Material Quote Requests</h1>
              <div className="grid gap-4">
                {quoteRequests.data?.length ? quoteRequests.data.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                        <div><p className="font-bold">{request.items?.length ?? 0} items requested</p><p className="text-sm text-muted-foreground">{new Date(request.created_at).toLocaleDateString()}</p></div>
                        <div className="flex items-center gap-2"><Badge>{request.status}</Badge><Button type="button" size="sm" variant="secondary" onClick={() => setChatRequest({ projectId: request.project_id, homeownerId: request.homeowner_id })}><MessageSquareText className="h-3.5 w-3.5 mr-1" />Chat</Button></div>
                      </div>
                      <form className="mt-4 grid gap-3" onSubmit={responseForm.handleSubmit((v) => respond(request.id, v))}>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="Final price (PKR)"><Input type="number" {...responseForm.register('total_price', { valueAsNumber: true })} /></Field>
                          <Field label="Discount %"><Input type="number" {...responseForm.register('discount', { valueAsNumber: true })} /></Field>
                          <Field label="Delivery time"><Input placeholder="e.g. 2-3 days" {...responseForm.register('delivery_time')} /></Field>
                        </div>
                        <Field label="Notes"><Textarea {...responseForm.register('notes')} /></Field>
                        <Button size="sm" className="w-fit">Send Quotation</Button>
                      </form>
                    </CardContent>
                  </Card>
                )) : <Card><CardContent className="p-10 text-center text-muted-foreground">No material quote requests yet.</CardContent></Card>}
              </div>
              {chatRequest && <ChatPanel projectId={chatRequest.projectId} peerId={chatRequest.homeownerId} peerName="Homeowner" />}
            </div>
          )}

          {/* MESSAGES */}
          {section === 'messages' && (
            <div className="grid gap-6">
              <h1 className="text-2xl font-bold">Messages</h1>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {conversations.data?.length ? conversations.data.map((thread) => (
                  <button key={thread.id} type="button" className="rounded-xl border bg-card p-4 text-left hover:bg-muted transition-colors" onClick={() => setChatRequest({ projectId: thread.project_id, homeownerId: thread.homeowner_id })}>
                    <p className="font-semibold">{thread.homeowner?.name ?? 'Homeowner'}</p>
                    <p className="text-sm text-muted-foreground">{thread.projects?.title ?? 'Project conversation'}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{new Date(thread.last_message_at).toLocaleString()}</p>
                  </button>
                )) : <p className="rounded-xl border p-6 text-center text-muted-foreground">No conversations yet.</p>}
              </div>
              {chatRequest && <ChatPanel projectId={chatRequest.projectId} peerId={chatRequest.homeownerId} peerName="Homeowner" />}
            </div>
          )}

          {/* NOTIFICATIONS */}
          {section === 'notifications' && (
            <div className="grid gap-6">
              <h1 className="text-2xl font-bold">Notifications</h1>
              <Card><CardContent className="p-10 text-center text-muted-foreground">No new notifications.</CardContent></Card>
            </div>
          )}

          {/* PROFILE */}
          {section === 'profile' && (
            <div className="grid gap-6">
              <h1 className="text-2xl font-bold">Company Profile</h1>
              <Card>
                <CardHeader><CardTitle>Marketplace profile</CardTitle><CardDescription>Your profile is visible to homeowners and contractors.</CardDescription></CardHeader>
                <CardContent>
                  <form className="grid gap-4" onSubmit={profileForm.handleSubmit((v) => saveProfile.mutate(v))}>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <Field label="Company name"><Input {...profileForm.register('company_name', { required: true })} /></Field>
                      <Field label="Years in business"><Input type="number" {...profileForm.register('years_in_business', { valueAsNumber: true })} /></Field>
                      <Field label="City"><Input {...profileForm.register('city')} /></Field>
                      <Field label="Contact number"><Input {...profileForm.register('contact_number')} /></Field>
                      <Field label="WhatsApp"><Input {...profileForm.register('whatsapp')} /></Field>
                      <Field label="Website"><Input type="url" {...profileForm.register('website')} /></Field>
                      <Field label="Address"><Input {...profileForm.register('address')} /></Field>
                      <Field label="Minimum order (PKR)"><Input type="number" {...profileForm.register('minimum_order', { valueAsNumber: true })} /></Field>
                      <div><p className="mb-2 text-sm font-medium">Delivery</p><Toggle label="Delivery available" checked={profileForm.watch('delivery_available')} onChange={(v) => profileForm.setValue('delivery_available', v)} /></div>
                    </div>
                    <Field label="Company description"><Textarea {...profileForm.register('description')} /></Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Company logo"><Input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] ?? null)} /></Field>
                      <Field label="Banner image"><Input type="file" accept="image/*" onChange={(e) => setBanner(e.target.files?.[0] ?? null)} /></Field>
                    </div>
                    <Button loading={saveProfile.isPending}>Save Profile</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SETTINGS */}
          {section === 'settings' && (
            <div className="grid gap-6">
              <h1 className="text-2xl font-bold">Settings</h1>
              <Card><CardContent className="p-10 text-center text-muted-foreground">Settings coming soon.</CardContent></Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
