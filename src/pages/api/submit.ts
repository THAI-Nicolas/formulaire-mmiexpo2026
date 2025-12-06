import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();

    // 1. Insert artist
    const { data: artist, error: artistError } = await supabase
      .from("artists")
      .insert({
        name: formData.get("name") as string,
        mmi_year: formData.get("mmiyear") as string,
        age: parseInt(formData.get("age") as string),
        email: formData.get("email") as string,
        bio: formData.get("bio") as string,
      })
      .select()
      .single();

    if (artistError) {
      console.error("Artist insert error:", artistError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de l'insertion de l'artiste" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const artistId = artist.id;

    // 2. Upload avatar
    const avatarFile = formData.get("avatar") as File;
    if (avatarFile && avatarFile.size > 0) {
      const avatarExt = avatarFile.name.split(".").pop();
      const avatarPath = `artists/${artistId}/avatar.${avatarExt}`;

      const { error: avatarUploadError } = await supabase.storage
        .from("mmiart26-uploads")
        .upload(avatarPath, avatarFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (avatarUploadError) {
        console.error("Avatar upload error:", avatarUploadError);
      } else {
        // Get public URL
        const { data: avatarUrlData } = supabase.storage
          .from("mmiart26-uploads")
          .getPublicUrl(avatarPath);

        // Update artist with avatar URL
        await supabase
          .from("artists")
          .update({ avatar_url: avatarUrlData.publicUrl })
          .eq("id", artistId);
      }
    }

    // 3. Insert social links
    const socialPlatforms = Array.from(formData.keys()).filter((key) =>
      key.startsWith("social_platform_")
    );

    if (socialPlatforms.length > 0) {
      const socialLinksData = socialPlatforms
        .map((key) => {
          const id = key.replace("social_platform_", "");
          const platform = formData.get(key) as string;
          const link = formData.get(`social_link_${id}`) as string;

          if (platform && link) {
            return {
              artist_id: artistId,
              platform,
              link,
            };
          }
          return null;
        })
        .filter((item) => item !== null);

      if (socialLinksData.length > 0) {
        const { error: socialError } = await supabase
          .from("social_links")
          .insert(socialLinksData);

        if (socialError) {
          console.error("Social links insert error:", socialError);
        }
      }
    }

    // 4. Insert works with images
    const workTitles = Array.from(formData.keys()).filter((key) =>
      key.startsWith("work_title_")
    );

    for (const titleKey of workTitles) {
      const workId = titleKey.replace("work_title_", "");

      const { data: workData, error: workError } = await supabase
        .from("works")
        .insert({
          artist_id: artistId,
          title: formData.get(titleKey) as string,
          year: parseInt(formData.get(`work_year_${workId}`) as string),
          category: formData.get(`work_category_${workId}`) as string,
          technique: formData.get(`work_technique_${workId}`) as string,
          description: formData.get(`work_description_${workId}`) as string,
        })
        .select()
        .single();

      if (workError) {
        console.error("Work insert error:", workError);
        continue;
      }

      // Upload work images
      const workImages = formData.getAll(`work_images_${workId}`) as File[];
      const imageUrls: string[] = [];

      for (let i = 0; i < workImages.length; i++) {
        const imageFile = workImages[i];
        if (imageFile && imageFile.size > 0) {
          const imageExt = imageFile.name.split(".").pop();
          const imagePath = `works/${workData.id}/${i + 1}.${imageExt}`;

          const { error: imageUploadError } = await supabase.storage
            .from("mmiart26-uploads")
            .upload(imagePath, imageFile, {
              cacheControl: "3600",
              upsert: true,
            });

          if (imageUploadError) {
            console.error("Image upload error:", imageUploadError);
          } else {
            const { data: imageUrlData } = supabase.storage
              .from("mmiart26-uploads")
              .getPublicUrl(imagePath);

            imageUrls.push(imageUrlData.publicUrl);
          }
        }
      }

      // Insert image URLs into work_images table
      if (imageUrls.length > 0) {
        const imageData = imageUrls.map((url) => ({
          work_id: workData.id,
          image_url: url,
        }));

        const { error: imageError } = await supabase
          .from("work_images")
          .insert(imageData);

        if (imageError) {
          console.error("Work images insert error:", imageError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        artistId,
        message: "Informations enregistrées avec succès !",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
