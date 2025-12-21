
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setupStorage() {
  console.log('--- SETTING UP STORAGE ---');
  
  const bucketName = 'hotel-images';

  // 1. Check if bucket exists
  const { data: buckets, error: listError } = await supabase
    .storage
    .listBuckets();

  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }

  const bucketExists = buckets.find(b => b.name === bucketName);

  if (bucketExists) {
    console.log(`Bucket '${bucketName}' already exists.`);
  } else {
    console.log(`Creating bucket '${bucketName}'...`);
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
    });

    if (error) {
      console.error('Error creating bucket:', error);
    } else {
      console.log('Bucket created successfully.');
    }
  }

  console.log('--- STORAGE SETUP COMPLETE ---');
  console.log('Note: You may still need to configure Row Level Security (RLS) policies for the storage.objects table if you encounter permission issues from the client side.');
}

setupStorage();
