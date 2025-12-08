// Import Supabase client (will be loaded from CDN)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Initialize Supabase client
const supabaseUrl = window.ENV?.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = window.ENV?.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload a file to Supabase Storage
 */
async function uploadFile(bucket, path, file) {
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Erreur d'upload: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

/**
 * Upload a file to Supabase Storage and return its public URL
 */
async function uploadToSupabase(file, path) {
  try {
    const url = await uploadFile('mmiart26-uploads', path, file);
    return url;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(`Échec de l'upload de ${file.name}: ${error.message || 'Erreur inconnue'}`);
  }
}

/**
 * Process and upload all images, then return FormData with URLs
 */
async function processFormWithUploads(formData) {
  const processedData = new FormData();
  const uploadPromises = [];
  
  // Generate a temporary artist ID for file paths
  const tempArtistId = crypto.randomUUID();
  
  for (const [key, value] of formData.entries()) {
    if (value instanceof File && value.size > 0) {
      // Handle file uploads
      if (key === 'avatar') {
        // Upload avatar
        const ext = value.name.split('.').pop();
        const path = `artists/${tempArtistId}/avatar.${ext}`;
        uploadPromises.push(
          uploadToSupabase(value, path).then(url => {
            processedData.append('avatar_url', url);
            processedData.append('temp_artist_id', tempArtistId);
          })
        );
      } else if (key.startsWith('work_images_')) {
        // Upload work images
        const workId = key.replace('work_images_', '');
        const images = formData.getAll(key);
        
        images.forEach((img, index) => {
          if (img.size > 0) {
            const ext = img.name.split('.').pop();
            const path = `works/${tempArtistId}/${workId}/${index + 1}.${ext}`;
            uploadPromises.push(
              uploadToSupabase(img, path).then(url => {
                processedData.append(`work_image_url_${workId}_${index}`, url);
              })
            );
          }
        });
      }
    } else if (!(value instanceof File)) {
      // Copy non-file fields as-is
      processedData.append(key, value);
    }
  }
  
  // Wait for all uploads to complete
  await Promise.all(uploadPromises);
  
  return processedData;
}

// Initialize form handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registration-form');
  const submitButton = document.getElementById('submit-button');
  const submitText = document.getElementById('submit-text');
  const submitLoader = document.getElementById('submit-loader');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');
  const errorText = document.getElementById('error-text');

  if (!form) {
    console.error('Form not found');
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Show loader
    if (submitText && submitLoader) {
      submitText.classList.add('hidden');
      submitLoader.classList.remove('hidden');
    }
    submitButton.disabled = true;

    try {
      const formData = new FormData(form);
      
      // Upload files to Supabase Storage first
      const processedData = await processFormWithUploads(formData);

      // Submit processed data with URLs to our API
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: processedData,
      });

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        throw new Error('Erreur serveur : réponse invalide. Veuillez réessayer.');
      }

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Erreur lors de l\'envoi du formulaire');
      }

      // Show success message
      if (successMessage) {
        successMessage.classList.remove('hidden');
        errorMessage?.classList.add('hidden');
      }

      // Reset form after 3 seconds
      setTimeout(() => {
        form.reset();
        successMessage?.classList.add('hidden');
        // Reload page to reset all dynamic content
        window.location.reload();
      }, 3000);

    } catch (error) {
      console.error('Error:', error);
      
      // Show error message
      if (errorMessage && errorText) {
        errorText.textContent = error.message || 'Une erreur est survenue. Veuillez réessayer.';
        errorMessage.classList.remove('hidden');
        successMessage?.classList.add('hidden');
      }
    } finally {
      // Hide loader
      if (submitText && submitLoader) {
        submitText.classList.remove('hidden');
        submitLoader.classList.add('hidden');
      }
      submitButton.disabled = false;
    }
  });
});
