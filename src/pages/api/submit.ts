import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();

    // Validate input lengths before inserting
    const name = (formData.get("name") as string) || "";
    const email = (formData.get("email") as string) || "";
    const bio = (formData.get("bio") as string) || "";

    if (name.length > 255) {
      return new Response(
        JSON.stringify({
          error: "Le nom est trop long",
          details: "Le nom ne peut pas dépasser 255 caractères",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (email.length > 255) {
      return new Response(
        JSON.stringify({
          error: "L'email est trop long",
          details: "L'email ne peut pas dépasser 255 caractères",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1. Insert artist with avatar URL (already uploaded by client)
    const avatarUrl = formData.get("avatar_url") as string;

    // @ts-ignore - Supabase types issue
    const { data: artist, error: artistError } = await supabase
      .from("artists")
      .insert({
        name,
        mmi_year: formData.get("mmiyear") as string,
        age: parseInt(formData.get("age") as string),
        email,
        bio,
        avatar_url: avatarUrl || null,
      })
      .select()
      .single();

    if (artistError) {
      console.error("Artist insert error:", artistError);

      // Provide user-friendly error messages
      let errorMessage = "Erreur lors de l'inscription";
      if (
        artistError.message.includes("duplicate") ||
        artistError.message.includes("unique")
      ) {
        errorMessage = "Cet email est déjà utilisé";
      } else if (artistError.message.includes("too long")) {
        errorMessage = "Un champ est trop long";
      }

      return new Response(
        JSON.stringify({
          error: errorMessage,
          details: artistError.message,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const artistId = (artist as any).id;

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
        // @ts-ignore - Supabase types issue
        const { error: socialError } = await supabase
          .from("social_links")
          .insert(socialLinksData);
        if (socialError) {
          console.error("Social links insert error:", socialError);
        }
      }
    }

    // 4. Insert works with images (images already uploaded by client)
    const workTitles = Array.from(formData.keys()).filter((key) =>
      key.startsWith("work_title_")
    );

    for (const titleKey of workTitles) {
      const workId = titleKey.replace("work_title_", "");

      // @ts-ignore - Supabase types issue
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

      // Collect work image URLs that were uploaded by client
      const imageUrlKeys = Array.from(formData.keys()).filter((key) =>
        key.startsWith(`work_image_url_${workId}_`)
      );

      if (imageUrlKeys.length > 0) {
        const imageData = imageUrlKeys
          .map((key) => {
            const imageUrl = formData.get(key) as string;
            if (imageUrl) {
              return {
                work_id: workData.id,
                image_url: imageUrl,
              };
            }
            return null;
          })
          .filter((item) => item !== null);

        if (imageData.length > 0) {
          // @ts-ignore - Supabase types issue
          const { error: imageError } = await supabase
            .from("work_images")
            .insert(imageData);

          if (imageError) {
            console.error("Work images insert error:", imageError);
          }
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
