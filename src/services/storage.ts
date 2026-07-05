import { supabase } from '../lib/supabase';

export async function uploadToBucket(bucket: string, path: string, file: File) {
  const extension = file.name.split('.').pop() || 'bin';
  const cleanPath = `${path}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(cleanPath, file, {
    cacheControl: '3600',
    upsert: false
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(cleanPath);
  return data.publicUrl;
}
