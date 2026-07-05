import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Field, Input, Select, Textarea } from '../../components/ui/forms';
import { productTags } from '../../lib/constants';
import { useAuth } from '../../contexts/AuthContext';
import { createProduct, createPromotion, listProducts, listPromotions } from '../../services/suppliers';
import { uploadToBucket } from '../../services/storage';
import { useToast } from '../../components/ui/toast';
import { formatCurrency } from '../../lib/utils';

type ProductForm = {
  name: string;
  category: string;
  price: number;
  discount: number;
  stock: number;
  tag: string;
};

type PromotionForm = {
  product_id: string;
  title: string;
  description: string;
  tag: string;
  starts_at: string;
  ends_at: string;
};

export function SupplierDashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [productImage, setProductImage] = useState<File | null>(null);
  const products = useQuery({ queryKey: ['products', user?.id], queryFn: () => listProducts(user!.id), enabled: Boolean(user?.id) });
  const promotions = useQuery({ queryKey: ['supplier-promotions', user?.id], queryFn: () => listPromotions(user!.id), enabled: Boolean(user?.id) });
  const productForm = useForm<ProductForm>({ defaultValues: { name: '', category: 'Finishing', price: 0, discount: 0, stock: 0, tag: 'finishing' } });
  const promotionForm = useForm<PromotionForm>({
    defaultValues: { product_id: '', title: '', description: '', tag: 'premium', starts_at: new Date().toISOString().slice(0, 10), ends_at: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10) }
  });

  const addProduct = useMutation({
    mutationFn: async (values: ProductForm) => {
      const image_urls = productImage ? [await uploadToBucket('product-images', user!.id, productImage)] : [];
      await createProduct({ supplier_id: user!.id, name: values.name, category: values.category, price: values.price, discount: values.discount, stock: values.stock, image_urls, tags: [values.tag] });
    },
    onSuccess: () => {
      productForm.reset();
      setProductImage(null);
      queryClient.invalidateQueries({ queryKey: ['products', user?.id] });
      toast({ title: 'Product saved', type: 'success' });
    },
    onError: (error) => toast({ title: 'Product save failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' })
  });

  const addPromotion = useMutation({
    mutationFn: async (values: PromotionForm) => createPromotion({ supplier_id: user!.id, product_id: values.product_id, title: values.title, description: values.description, starts_at: values.starts_at, ends_at: values.ends_at, tags: [values.tag], is_active: true }),
    onSuccess: () => {
      promotionForm.reset();
      queryClient.invalidateQueries({ queryKey: ['supplier-promotions', user?.id] });
      toast({ title: 'Promotion created', description: 'It will appear only for matching project tags.', type: 'success' });
    },
    onError: (error) => toast({ title: 'Promotion failed', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' })
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold">Supplier Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Manage products and tag-based promotional campaigns for relevant homeowner projects.</p>
      </div>
      {!profile?.is_verified && <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/30"><CardContent className="pt-5 text-sm font-semibold text-amber-800 dark:text-amber-200">Your supplier account will stay hidden from public marketplace views until future admin verification.</CardContent></Card>}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add product</CardTitle>
            <CardDescription>Products support tags for relevance matching.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={productForm.handleSubmit((values) => addProduct.mutate(values))}>
              <Field label="Name"><Input {...productForm.register('name', { required: true })} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category"><Input {...productForm.register('category', { required: true })} /></Field>
                <Field label="Tag">
                  <Select {...productForm.register('tag')}>
                    {productTags.map((tag) => <option key={tag}>{tag}</option>)}
                  </Select>
                </Field>
                <Field label="Price"><Input type="number" {...productForm.register('price', { valueAsNumber: true })} /></Field>
                <Field label="Discount %"><Input type="number" {...productForm.register('discount', { valueAsNumber: true })} /></Field>
                <Field label="Stock"><Input type="number" {...productForm.register('stock', { valueAsNumber: true })} /></Field>
              </div>
              <Field label="Product image">
                <Input type="file" accept="image/*" onChange={(event) => setProductImage(event.target.files?.[0] ?? null)} />
              </Field>
              <Button loading={addProduct.isPending}>Save product</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Create promotion</CardTitle>
            <CardDescription>Promotions are shown through project tag matching, not random placement.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={promotionForm.handleSubmit((values) => addPromotion.mutate(values))}>
              <Field label="Product">
                <Select {...promotionForm.register('product_id', { required: true })}>
                  <option value="">Select product</option>
                  {products.data?.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                </Select>
              </Field>
              <Field label="Title"><Input {...promotionForm.register('title', { required: true })} /></Field>
              <Field label="Description"><Textarea {...promotionForm.register('description')} /></Field>
              <Field label="Matching tag">
                <Select {...promotionForm.register('tag')}>
                  {productTags.map((tag) => <option key={tag}>{tag}</option>)}
                </Select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Starts"><Input type="date" {...promotionForm.register('starts_at')} /></Field>
                <Field label="Ends"><Input type="date" {...promotionForm.register('ends_at')} /></Field>
              </div>
              <Button loading={addPromotion.isPending}>Create promotion</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Products</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {products.data?.length ? products.data.map((product) => (
              <div key={product.id} className="rounded-xl border p-4">
                <p className="font-bold">{product.name}</p>
                <p className="text-sm text-muted-foreground">{product.category} - {formatCurrency(product.price)} - Stock {product.stock}</p>
                <div className="mt-2 flex flex-wrap gap-2">{product.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
              </div>
            )) : <p className="rounded-xl border p-6 text-center text-muted-foreground">No products yet.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Promotions</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {promotions.data?.length ? promotions.data.map((promo) => (
              <div key={promo.id} className="rounded-xl border p-4">
                <p className="font-bold">{promo.title}</p>
                <p className="text-sm text-muted-foreground">{promo.description}</p>
                <div className="mt-2 flex flex-wrap gap-2">{promo.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
              </div>
            )) : <p className="rounded-xl border p-6 text-center text-muted-foreground">No promotions yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
