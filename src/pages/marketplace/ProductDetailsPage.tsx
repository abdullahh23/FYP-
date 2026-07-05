import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, MessageSquare, PackageCheck, Star, Truck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getProduct, listProductReviews, listRelatedProducts, requestMaterialQuote } from '../../services/suppliers';
import { listProjects } from '../../services/projects';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/card';
import { Select } from '../../components/ui/forms';
import { useToast } from '../../components/ui/toast';
import { formatCurrency } from '../../lib/utils';
import { ChatPanel } from '../../components/chat/ChatPanel';

export function ProductDetailsPage() {
  const { productId } = useParams();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [projectId, setProjectId] = useState('');
  const [chat, setChat] = useState(false);
  const product = useQuery({ queryKey: ['product', productId], queryFn: () => getProduct(productId!), enabled: Boolean(productId) });
  const reviews = useQuery({ queryKey: ['product-reviews', productId], queryFn: () => listProductReviews(productId!), enabled: Boolean(productId) });
  const related = useQuery({ queryKey: ['related-products', productId, product.data?.category], queryFn: () => listRelatedProducts(productId!, product.data!.category), enabled: Boolean(productId && product.data?.category) });
  const projects = useQuery({ queryKey: ['projects', user?.id], queryFn: () => listProjects(user!.id), enabled: Boolean(user?.id && profile?.role === 'homeowner') });

  if (product.isLoading) return <div className="h-96 animate-pulse rounded-lg bg-muted" />;
  if (!product.data) return <p className="rounded-lg border p-10 text-center text-muted-foreground">Product not found.</p>;
  const item = product.data;
  const supplier = item.supplier_profile;
  const finalPrice = item.price * (1 - item.discount / 100);

  async function requestPrice() {
    if (!projectId || !user?.id) return toast({ title: 'Select a project first', type: 'error' });
    try { await requestMaterialQuote({ projectId, homeownerId: user.id, supplierId: item.supplier_id, products: [{ productId: item.id, quantity: 1 }] }); toast({ title: 'Price request sent', type: 'success' }); }
    catch (error) { toast({ title: 'Request failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' }); }
  }

  return <div className="mx-auto max-w-6xl space-y-8">
    <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link>
    <section className="grid gap-8 rounded-lg border bg-card p-5 shadow-panel md:grid-cols-2 sm:p-8">
      <div><img src={item.image_urls[0] || supplier?.banner_url || ''} alt={item.name} className="aspect-square w-full rounded-lg bg-muted object-cover" /><div className="mt-3 grid grid-cols-4 gap-2">{item.image_urls.slice(1, 5).map((url) => <img key={url} src={url} alt="" className="aspect-square rounded-lg object-cover" />)}</div></div>
      <div><p className="text-sm font-semibold text-primary">{item.brand}</p><h1 className="mt-2 text-3xl font-bold">{item.name}</h1><div className="mt-3 flex items-center gap-3"><Badge>{item.category}</Badge><span className="flex items-center gap-1 text-sm"><Star className="h-4 w-4 text-amber-500" /> {supplier?.average_rating?.toFixed(1) ?? 'New'}</span></div><p className="mt-5 text-3xl font-bold text-primary">{formatCurrency(finalPrice)} <span className="text-sm font-normal text-muted-foreground">/{item.unit}</span></p>{item.discount > 0 && <p className="mt-1 text-sm text-muted-foreground"><s>{formatCurrency(item.price)}</s> · {item.discount}% off</p>}<p className="mt-6 leading-7 text-muted-foreground">{item.description}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2"><p className="flex items-center gap-2 text-sm"><PackageCheck className="h-4 w-4 text-primary" /> {item.stock} available</p><p className="flex items-center gap-2 text-sm"><Truck className="h-4 w-4 text-primary" /> {item.delivery_time ?? 'Delivery on request'}</p><p className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary" /> {item.warranty ?? 'Warranty not listed'}</p></div>
        {profile?.role === 'homeowner' && <div className="mt-7 grid gap-3"><Select value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">Select a project</option>{projects.data?.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</Select><div className="flex gap-2"><Button onClick={requestPrice}>Request price</Button><Button variant="secondary" disabled={!projectId} onClick={() => setChat(true)}><MessageSquare className="h-4 w-4" /> Chat with supplier</Button></div></div>}
      </div>
    </section>
    <section className="grid gap-6 lg:grid-cols-2"><div className="rounded-lg border bg-card p-6"><h2 className="text-xl font-bold">Specifications</h2><dl className="mt-4 divide-y">{Object.entries(item.specifications ?? {}).map(([key, value]) => <div key={key} className="flex justify-between gap-4 py-3 text-sm"><dt className="text-muted-foreground">{key}</dt><dd className="font-semibold">{value}</dd></div>)}</dl></div><div className="rounded-lg border bg-card p-6"><h2 className="text-xl font-bold">Supplier</h2><p className="mt-4 font-bold">{supplier?.company_name}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{supplier?.description}</p><p className="mt-3 text-sm">{supplier?.city} · {supplier?.years_in_business} years in business</p></div></section>
    <section className="rounded-lg border bg-card p-6"><h2 className="text-xl font-bold">Customer reviews</h2><div className="mt-4 grid gap-3">{reviews.data?.length ? reviews.data.map((review: any) => <div key={review.id} className="rounded-lg border p-4"><p className="font-semibold">{review.homeowner?.name ?? 'Homeowner'} · {review.rating}/5</p><p className="mt-2 text-sm text-muted-foreground">{review.review}</p></div>) : <p className="text-sm text-muted-foreground">No reviews yet.</p>}</div></section>
    {related.data?.length ? <section><h2 className="text-xl font-bold">Related products</h2><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{related.data.map((relatedItem) => <Link key={relatedItem.id} to={`/marketplace/products/${relatedItem.id}`} className="rounded-lg border bg-card p-4"><p className="font-bold">{relatedItem.name}</p><p className="mt-2 text-primary">{formatCurrency(relatedItem.price)}</p></Link>)}</div></section> : null}
    {chat && projectId && <ChatPanel projectId={projectId} peerId={item.supplier_id} peerName={supplier?.company_name ?? 'Supplier'} />}
  </div>;
}
