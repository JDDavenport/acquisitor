'use server';

import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role for server uploads
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function uploadDocumentToSupabase(
  dealId: string,
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string
) {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    // Create a unique file path
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `deals/${dealId}/${timestamp}-${sanitizedFileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('[Upload] Supabase upload error:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      return { success: false, error: 'Failed to generate public URL' };
    }

    return {
      success: true,
      fileUrl: urlData.publicUrl,
      filePath,
      fileSize: fileBuffer.length,
      mimeType,
    };
  } catch (error) {
    console.error('[Upload] Error uploading file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function deleteDocumentFromSupabase(filePath: string) {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    const { error } = await supabase.storage
      .from('documents')
      .remove([filePath]);

    if (error) {
      console.error('[Delete] Supabase delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[Delete] Error deleting file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
