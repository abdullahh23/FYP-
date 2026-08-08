import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Star, Package, Check, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Badge } from '../../components/ui/card';
import { formatCurrency } from '../../lib/utils';

export function SupplierProfilePage() {
  const { id } = useParams();

  const profile = useQuery({
    queryKey: ['supplier-profile', id],
    queryFn: async () => {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select(`*, supplier_profiles (*)`)
        .eq('id', id)
        .single();
      
      if (userError) throw userError;

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', id)
        .eq('is_active', true);
        
      if (productsError) throw productsError;

      return { user, products };
    },
    enabled: Boolean(id)
  });

  if (profile.isLoading) {
    return <div className="p-8 text-center animate-pulse">Loading supplier details...</div>;
  }

  if (!profile.data || profile.isError) {
    return (
      <div className="mx-auto max-w-xl p-10 text-center">
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="mt-2 text-muted-foreground">The supplier you are looking for does not exist or was removed.</p>
        <Link to="/dashboard" className="mt-5 inline-block text-primary hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const { user, products } = profile.data;
  const details = user.supplier_profiles?.[0];

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6">
      <Link to={-1 as any} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Go back
      </Link>

      <div className="overflow-hidden rounded-xl border bg-card shadow-panel">
        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-primary/10 text-2xl font-bold text-primary">
                {details?.company_name?.slice(0, 2).toUpperCase() || user.name?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">{details?.company_name || user.name}</h1>
                <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {details?.city || user.city || 'Pakistan'}
                </p>
              </div>
            </div>
            {details?.average_rating && (
              <Badge tone="success" className="flex items-center gap-1 px-3 py-1 text-sm">
                <Star className="h-4 w-4 fill-current" /> {details.average_rating.toFixed(1)} Rating
              </Badge>
            )}
          </div>

          <div className="mt-8 grid gap-6 border-t pt-8 sm:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Experience</p>
              <p className="mt-1 font-bold">{details?.years_in_business || 0} Years</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Delivery</p>
              <p className="mt-1 font-bold flex items-center gap-1">
                {details?.delivery_available ? <><Check className="h-4 w-4 text-success" /> Available</> : 'Pick-up only'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Products</p>
              <p className="mt-1 font-bold">{products?.length || 0} Listed</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Contact</p>
              <p className="mt-1 font-bold">{details?.contact_number || user.phone || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section className="rounded-xl border bg-card p-6 shadow-panel">
            <h2 className="text-xl font-bold flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Available Products</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {products && products.length > 0 ? products.map((product: any) => (
                <div key={product.id} className="rounded-lg border p-4 transition-shadow hover:shadow-panel">
                  {product.image_urls?.[0] && (
                    <img src={product.image_urls[0]} alt={product.name} className="mb-4 aspect-[16/10] w-full rounded-lg object-cover" />
                  )}
                  <h3 className="font-bold text-base leading-tight">{product.name}</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Badge>{product.category}</Badge>
                    {product.discount > 0 && <Badge tone="success">-{product.discount}%</Badge>}
                  </div>
                  <p className="mt-4 text-xl font-bold text-primary">
                    {formatCurrency(product.price * (1 - product.discount / 100))} <span className="text-xs font-normal text-muted-foreground">/ {product.unit}</span>
                  </p>
                </div>
              )) : (
                <div className="col-span-2 p-8 text-center border rounded-lg text-muted-foreground">
                  No products listed yet.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-panel">
            <h3 className="font-bold flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> About Supplier</h3>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {details?.description || `${details?.company_name || user.name} is a trusted supplier of construction materials based in ${user.city}. Providing quality products to builders and homeowners.`}
            </p>
            
            <h3 className="mt-6 font-bold">Details</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" /> Min Order: {formatCurrency(details?.minimum_order || 0)}</li>
              {details?.whatsapp && <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" /> WhatsApp: {details.whatsapp}</li>}
              {details?.address && <li className="flex items-start gap-3"><MapPin className="h-4 w-4 text-primary mt-0.5" /> <span className="flex-1">{details.address}</span></li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
