import { defineAction, z } from "astro:actions";
import { supabase } from "../lib/supabase";

export const server = {
  submitArtist: defineAction({
    accept: "json",
    input: z.object({
      artist: z.object({
        name: z.string().min(1, "Le nom est requis"),
        mmiyear: z.string().min(1, "L'année MMI est requise"),
        age: z.number().min(16, "Âge minimum : 16 ans").max(99),
        email: z.string().email("Email invalide"),
        avatar: z.any().optional(),
      }),
      bio: z.string().min(10, "La bio doit contenir au moins 10 caractères"),
      socialLinks: z
        .array(
          z.object({
            platform: z.string(),
            link: z.string().url("URL invalide"),
          })
        )
        .optional(),
      works: z
        .array(
          z.object({
            title: z.string().min(1, "Le titre est requis"),
            year: z.number().min(1900).max(new Date().getFullYear()),
            category: z.string().min(1, "La catégorie est requise"),
            technique: z.string().min(1, "La technique est requise"),
            description: z
              .string()
              .min(10, "La description doit contenir au moins 10 caractères"),
            images: z
              .array(z.any())
              .min(1, "Au moins une image est requise")
              .max(3, "Maximum 3 images"),
          })
        )
        .min(1, "Au moins une œuvre est requise"),
    }),
    handler: async (input) => {
      try {
        // 1. Insert artist
        const { data: artist, error: artistError } = await supabase
          .from("artists")
          .insert({
            name: input.artist.name,
            mmi_year: input.artist.mmiyear,
            age: input.artist.age,
            email: input.artist.email,
            bio: input.bio,
          })
          .select()
          .single();

        if (artistError) throw artistError;

        const artistId = artist.id;

        // 2. Upload avatar to Supabase Storage
        if (input.artist.avatar) {
          const avatarFile = input.artist.avatar as File;
          const avatarPath = `artists/${artistId}/avatar.${avatarFile.name.split(".").pop()}`;

          const { error: uploadError } = await supabase.storage
            .from("mmiart26-uploads")
            .upload(avatarPath, avatarFile, {
              cacheControl: "3600",
              upsert: true,
            });

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from("mmiart26-uploads")
            .getPublicUrl(avatarPath);

          // Update artist with avatar URL
          await supabase
            .from("artists")
            .update({ avatar_url: publicUrlData.publicUrl })
            .eq("id", artistId);
        }

        // 3. Insert social links
        if (input.socialLinks && input.socialLinks.length > 0) {
          const socialLinksData = input.socialLinks.map((link) => ({
            artist_id: artistId,
            platform: link.platform,
            link: link.link,
          }));

          const { error: socialError } = await supabase
            .from("social_links")
            .insert(socialLinksData);

          if (socialError) throw socialError;
        }

        // 4. Insert works and images
        for (const work of input.works) {
          // Insert work
          const { data: workData, error: workError } = await supabase
            .from("works")
            .insert({
              artist_id: artistId,
              title: work.title,
              year: work.year,
              category: work.category,
              technique: work.technique,
              description: work.description,
            })
            .select()
            .single();

          if (workError) throw workError;

          const workId = workData.id;

          // Upload work images
          const imageUrls: string[] = [];
          for (let i = 0; i < work.images.length; i++) {
            const imageFile = work.images[i] as File;
            const imagePath = `works/${workId}/${i + 1}.${imageFile.name.split(".").pop()}`;

            const { error: imageUploadError } = await supabase.storage
              .from("mmiart26-uploads")
              .upload(imagePath, imageFile, {
                cacheControl: "3600",
                upsert: true,
              });

            if (imageUploadError) throw imageUploadError;

            // Get public URL
            const { data: imageUrlData } = supabase.storage
              .from("mmiart26-uploads")
              .getPublicUrl(imagePath);

            imageUrls.push(imageUrlData.publicUrl);
          }

          // Insert image URLs
          const imageData = imageUrls.map((url) => ({
            work_id: workId,
            image_url: url,
          }));

          const { error: imageError } = await supabase
            .from("work_images")
            .insert(imageData);

          if (imageError) throw imageError;
        }

        return {
          success: true,
          artistId,
          message: "Inscription réussie !",
        };
      } catch (error) {
        console.error("Error submitting artist:", error);
        throw new Error(
          error instanceof Error
            ? error.message
            : "Erreur lors de l'inscription"
        );
      }
    },
  }),
};
