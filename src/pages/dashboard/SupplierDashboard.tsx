import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Field, Input, Select, Textarea, Toggle } from '../../components/ui/forms';
import { productCategories, productTags, productUnits } from '../../lib/constants';
import { useAuth } from '../../contexts/AuthContext';
import { createProduct, getSupplierProfile, listMaterialQuoteRequests, listProducts, respondToMaterialQuote, upsertSupplierProfile } from '../../services/suppliers';
import { uploadToBucket } from '../../services/storage';
import { useToast } from '../../components/ui/toast';
import { formatCurrency } from '../../lib/utils';
import { ChatPanel } from '../../components/chat/ChatPanel';

type SupplierForm = { company_name: string; description: string; years_in_business: number; city: string; address: string; contact_number: string; whatsapp: string; website: string; delivery_available: boolean; minimum_order: number };
type ProductForm = { name: string; brand: string; category: string; description: string; unit: string; price: number; discount: number; stock: number; delivery_time: string; warranty: string; quality_grade: string; manufacturer: string; specifications: string; tags: string; is_featured: boolean };
type ResponseForm = { total_price: number; delivery_time: string; discount: number; notes: string };

export function SupplierDashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [productImages, setProductImages] = useState<File[]>([]);
  const [logo, setLogo] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [chatRequest, setChatRequest] = useState<{ projectId: string; homeownerId: string } | null>(null);
  const supplierProfile = useQuery({ queryKey: ['supplier-profile', user?.id], queryFn: () => getSupplierProfile(user!.id), enabled: Boolean(user?.id) });
  const products = useQuery({ queryKey: ['products', user?.id], queryFn: () => listProducts(user!.id), enabled: Boolean(user?.id) });
  const quoteRequests = useQuery({ queryKey: ['material-requests', user?.id], queryFn: () => listMaterialQuoteRequests(user!.id, 'supplier'), enabled: Boolean(user?.id) });
  const profileForm = useForm<SupplierForm>({ values: {
    company_name: supplierProfile.data?.company_name ?? profile?.name ?? '', description: supplierProfile.data?.description ?? '', years_in_business: supplierProfile.data?.years_in_business ?? 0,
    city: supplierProfile.data?.city ?? profile?.city ?? '', address: supplierProfile.data?.address ?? '', contact_number: supplierProfile.data?.contact_number ?? profile?.phone ?? '', whatsapp: supplierProfile.data?.whatsapp ?? '', website: supplierProfile.data?.website ?? '', delivery_available: supplierProfile.data?.delivery_available ?? false, minimum_order: supplierProfile.data?.minimum_order ?? 0
  }});
  const productForm = useForm<ProductForm>({ defaultValues: { name: '', brand: '', category: 'Cement', description: '', unit: 'piece', price: 0, discount: 0, stock: 0, delivery_time: '', warranty: '', quality_grade: 'Standard', manufacturer: '', specifications: '', tags: 'standard, cement', is_featured: false } });
  const responseForm = useForm<ResponseForm>({ defaultValues: { total_price: 0, delivery_time: '', discount: 0, notes: '' } });

  const saveProfile = useMutation({
    mutationFn: async (values: SupplierForm) => {
      const logo_url = logo ? await uploadToBucket('supplier-assets', `${user!.id}/logo`, logo) : supplierProfile.data?.logo_url ?? null;
      const banner_url = banner ? await uploadToBucket('supplier-assets', `${user!.id}/banner`, banner) : supplierProfile.data?.banner_url ?? null;
      await upsertSupplierProfile(user!.id, { ...values, logo_url, banner_url, average_rating: supplierProfile.data?.average_rating ?? 0 });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['supplier-profile', user?.id] }); toast({ title: 'Marketplace profile saved', type: 'success' }); },
    onError: (error) => toast({ title: 'Profile save failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' })
  });

  const addProduct = useMutation({
    mutationFn: async (values: ProductForm) => {
      const image_urls = await Promise.all(productImages.map((image) => uploadToBucket('product-images', user!.id, image)));
      const specifications = Object.fromEntries(values.specifications.split('\n').map((line) => line.split(':').map((part) => part.trim())).filter((parts) => parts.length === 2 && parts[0]));
      await createProduct({ supplier_id: user!.id, ...values, specifications, image_urls, tags: values.tags.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean), is_active: true });
    },
    onSuccess: () => { productForm.reset(); setProductImages([]); queryClient.invalidateQueries({ queryKey: ['products', user?.id] }); toast({ title: 'Product published', type: 'success' }); },
    onError: (error) => toast({ title: 'Product save failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' })
  });

  async function respond(requestId: string, values: ResponseForm) {
    try { await respondToMaterialQuote(requestId, values); await quoteRequests.refetch(); toast({ title: 'Material quotation sent', type: 'success' }); }
    catch (error) { toast({ title: 'Response failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' }); }
  }

  return (
    <div className="grid gap-6">
      <div><h1 className="text-3xl font-bold">Supplier Marketplace</h1><p className="mt-1 text-muted-foreground">Manage your public company profile, product catalog, and material quote requests.</p></div>
      <Card>
        <CardHeader><CardTitle>Company profile</CardTitle><CardDescription>Your profile becomes visible as soon as it is complete.</CardDescription></CardHeader>
        <CardContent><form className="grid gap-4" onSubmit={profileForm.handleSubmit((values) => saveProfile.mutate(values))}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Company name"><Input {...profileForm.register('company_name', { required: true })} /></Field><Field label="Years in business"><Input type="number" {...profileForm.register('years_in_business', { valueAsNumber: true })} /></Field><Field label="City"><Input {...profileForm.register('city')} /></Field>
            <Field label="Contact number"><Input {...profileForm.register('contact_number')} /></Field><Field label="WhatsApp"><Input {...profileForm.register('whatsapp')} /></Field><Field label="Website"><Input type="url" {...profileForm.register('website')} /></Field>
            <Field label="Address"><Input {...profileForm.register('address')} /></Field><Field label="Minimum order"><Input type="number" {...profileForm.register('minimum_order', { valueAsNumber: true })} /></Field><div><p className="mb-2 text-sm font-medium">Delivery</p><Toggle label="Delivery available" checked={profileForm.watch('delivery_available')} onChange={(value) => profileForm.setValue('delivery_available', value)} /></div>
          </div>
          <Field label="Company description"><Textarea {...profileForm.register('description')} /></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Logo"><Input type="file" accept="image/*" onChange={(event) => setLogo(event.target.files?.[0] ?? null)} /></Field><Field label="Banner"><Input type="file" accept="image/*" onChange={(event) => setBanner(event.target.files?.[0] ?? null)} /></Field></div>
          <Button loading={saveProfile.isPending}>Save company profile</Button>
        </form></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Add product</CardTitle><CardDescription>Detailed product data powers accurate homeowner recommendations.</CardDescription></CardHeader>
        <CardContent><form className="grid gap-4" onSubmit={productForm.handleSubmit((values) => addProduct.mutate(values))}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Product name"><Input {...productForm.register('name', { required: true })} /></Field><Field label="Brand"><Input {...productForm.register('brand')} /></Field><Field label="Category"><Select {...productForm.register('category')}>{productCategories.map((category) => <option key={category}>{category}</option>)}</Select></Field>
            <Field label="Unit"><Select {...productForm.register('unit')}>{productUnits.map((unit) => <option key={unit}>{unit}</option>)}</Select></Field><Field label="Price"><Input type="number" {...productForm.register('price', { valueAsNumber: true })} /></Field><Field label="Discount %"><Input type="number" {...productForm.register('discount', { valueAsNumber: true })} /></Field>
            <Field label="Available stock"><Input type="number" {...productForm.register('stock', { valueAsNumber: true })} /></Field><Field label="Delivery time"><Input {...productForm.register('delivery_time')} /></Field><Field label="Warranty"><Input {...productForm.register('warranty')} /></Field>
            <Field label="Quality grade"><Select {...productForm.register('quality_grade')}><option>Economy</option><option>Standard</option><option>Premium</option><option>Luxury</option></Select></Field><Field label="Manufacturer"><Input {...productForm.register('manufacturer')} /></Field><Field label="Tags"><Input list="product-tags" {...productForm.register('tags')} /><datalist id="product-tags">{productTags.map((tag) => <option key={tag}>{tag}</option>)}</datalist></Field>
          </div>
          <Field label="Description"><Textarea {...productForm.register('description')} /></Field><Field label="Specifications (one Key: Value per line)"><Textarea {...productForm.register('specifications')} /></Field><Field label="Product images"><Input type="file" multiple accept="image/*" onChange={(event) => setProductImages(Array.from(event.target.files ?? []))} /></Field>
          <Toggle label="Featured product" checked={productForm.watch('is_featured')} onChange={(value) => productForm.setValue('is_featured', value)} />
          <Button loading={addProduct.isPending}>Publish product</Button>
        </form></CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Product catalog</CardTitle></CardHeader><CardContent className="grid gap-3">{products.data?.length ? products.data.map((product) => <div key={product.id} className="rounded-lg border p-4"><div className="flex justify-between gap-3"><div><p className="font-bold">{product.name}</p><p className="text-sm text-muted-foreground">{product.brand} · {product.category} · Stock {product.stock}</p></div><p className="font-bold text-primary">{formatCurrency(product.price * (1 - product.discount / 100))}</p></div><div className="mt-2 flex flex-wrap gap-2">{product.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div></div>) : <p className="rounded-lg border p-6 text-center text-muted-foreground">No products yet.</p>}</CardContent></Card>
        <Card><CardHeader><CardTitle>Material quote requests</CardTitle></CardHeader><CardContent className="grid gap-4">{quoteRequests.data?.length ? quoteRequests.data.map((request) => <div key={request.id} className="rounded-lg border p-4"><div className="flex justify-between"><p className="font-bold">{request.items?.length ?? 0} requested products</p><Badge>{request.status}</Badge></div><form className="mt-4 grid gap-3" onSubmit={responseForm.handleSubmit((values) => respond(request.id, values))}><div className="grid gap-3 sm:grid-cols-2"><Field label="Final price"><Input type="number" {...responseForm.register('total_price', { valueAsNumber: true })} /></Field><Field label="Discount %"><Input type="number" {...responseForm.register('discount', { valueAsNumber: true })} /></Field></div><Field label="Delivery time"><Input {...responseForm.register('delivery_time')} /></Field><Field label="Notes"><Textarea {...responseForm.register('notes')} /></Field><div className="flex gap-2"><Button size="sm">Send quotation</Button><Button type="button" size="sm" variant="secondary" onClick={() => setChatRequest({ projectId: request.project_id, homeownerId: request.homeowner_id })}>Chat</Button></div></form></div>) : <p className="rounded-lg border p-6 text-center text-muted-foreground">No material requests yet.</p>}</CardContent></Card>
      </div>
      {chatRequest && <ChatPanel projectId={chatRequest.projectId} peerId={chatRequest.homeownerId} peerName="Homeowner" />}
    </div>
  );
}
