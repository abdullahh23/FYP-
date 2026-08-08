import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Star, Building2, Check, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Badge } from '../../components/ui/card';

export function ContractorProfilePage() {
  const { id } = useParams();

  const profile = useQuery({
    queryKey: ['contractor-profile', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          contractor_profiles (*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: Boolean(id)
  });

  if (profile.isLoading) {
    return <div className="p-8 text-center animate-pulse">Loading profile...</div>;
  }

  if (!profile.data || profile.isError) {
    return (
      <div className="mx-auto max-w-xl p-10 text-center">
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="mt-2 text-muted-foreground">The contractor you are looking for does not exist or was removed.</p>
        <Link to="/dashboard" className="mt-5 inline-block text-primary hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const user = profile.data;
  const details = user.contractor_profiles?.[0];

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6">
      <Link to={-1 as any} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Go back
      </Link>

      <div className="overflow-hidden rounded-xl border bg-card shadow-panel">
        <div className="h-32 bg-primary/10 sm:h-48"></div>
        <div className="relative px-6 pb-6 sm:px-8 sm:pb-8">
          <div className="-mt-16 flex items-end justify-between">
            <div className="grid h-32 w-32 place-items-center rounded-xl border-4 border-card bg-primary text-4xl font-bold text-primary-foreground shadow-sm">
              {user.name?.slice(0, 2).toUpperCase()}
            </div>
            {details?.average_rating && (
              <Badge tone="success" className="mb-2 flex items-center gap-1 px-3 py-1 text-sm">
                <Star className="h-4 w-4 fill-current" /> {details.average_rating.toFixed(1)} Rating
              </Badge>
            )}
          </div>

          <div className="mt-6">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="mt-2 flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" /> {user.city || 'Pakistan'} · {details?.specialization || 'General Contractor'}
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Experience</p>
              <p className="mt-1 text-xl font-bold">{details?.experience_years || 0} Years</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Projects Completed</p>
              <p className="mt-1 text-xl font-bold">{details?.completed_projects || 0}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Quality Preference</p>
              <p className="mt-1 text-xl font-bold">{details?.material_quality_preferences?.[0] || 'A Grade'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section className="rounded-xl border bg-card p-6 shadow-panel">
            <h2 className="text-xl font-bold flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> About the Contractor</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              {details?.bio || `${user.name} is a highly rated professional contractor based in ${user.city || 'Pakistan'}. Specializing in ${details?.specialization || 'construction'}, they have successfully completed over ${details?.completed_projects || 0} projects with a strong focus on quality and client satisfaction.`}
            </p>
          </section>

          {details?.portfolio_urls && details.portfolio_urls.length > 0 && (
            <section className="rounded-xl border bg-card p-6 shadow-panel">
              <h2 className="text-xl font-bold flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" /> Portfolio</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {details.portfolio_urls.map((url: string, index: number) => (
                  <img key={index} src={url} alt={`Portfolio ${index + 1}`} className="aspect-[4/3] w-full rounded-lg object-cover shadow-sm transition-transform hover:scale-[1.02]" />
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-panel">
            <h3 className="font-bold">Contact Info</h3>
            <ul className="mt-4 space-y-4 text-sm text-muted-foreground">
              {user.phone && (
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" /> Phone: {user.phone}</li>
              )}
              {user.email && (
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" /> Email: {user.email}</li>
              )}
              <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" /> Account Status: Active</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
