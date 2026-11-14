import { getYachtsServer, getArticlesServer, getEventsServer, getPagesServer } from "./db.js";

/**
 * Checks whether a given media URL or file name is referenced by active CMS content:
 * - Pages (sections, hero images, gallery slides)
 * - Yachts (mainImage, primaryImage, heroImage, heroImages, gallery, full_data)
 * - News Articles (featuredImage, gallery, content)
 * - Event Showcases (featuredImage, photos, description)
 *
 * FAILS CLOSED: If any CMS entity cannot be loaded or database query fails,
 * this function throws an error to ensure unverified media items are NEVER deleted.
 *
 * @param {string} urlOrId - Public URL or identifier of the media item
 * @returns {Promise<{ isReferenced: boolean, references: string[] }>}
 */
export async function findMediaReferences(urlOrId) {
  if (!urlOrId || typeof urlOrId !== "string") {
    return { isReferenced: false, references: [] };
  }

  const cleanTarget = urlOrId.split("?")[0].split("#")[0].trim();
  const fileName = cleanTarget.split("/").pop();
  const references = [];

  const matchesUrl = (str) => {
    if (!str || typeof str !== "string") return false;
    return str.includes(cleanTarget) || (fileName && fileName.length > 5 && str.includes(fileName));
  };

  // 1. Check Yachts (fail closed if database query fails)
  try {
    const yachts = await getYachtsServer(false);
    for (const y of yachts || []) {
      const yachtName = y.name || y.slug || y.id;
      if (matchesUrl(y.mainImage) || matchesUrl(y.primaryImage) || matchesUrl(y.heroImage)) {
        references.push(`Yacht: "${yachtName}" (Primary/Hero Image)`);
      }
      if (Array.isArray(y.heroImages)) {
        for (const h of y.heroImages) {
          if (matchesUrl(h?.src || h?.url)) {
            references.push(`Yacht: "${yachtName}" (Hero Banner Slides)`);
            break;
          }
        }
      }
      if (Array.isArray(y.gallery)) {
        for (const g of y.gallery) {
          if (matchesUrl(g?.src || g?.url)) {
            references.push(`Yacht: "${yachtName}" (Gallery Photo)`);
            break;
          }
        }
      }
      if (y.full_data && typeof y.full_data === "object") {
        const fullStr = JSON.stringify(y.full_data);
        if (matchesUrl(fullStr) && !references.some((r) => r.startsWith(`Yacht: "${yachtName}"`))) {
          references.push(`Yacht: "${yachtName}" (Specifications/Dossier Data)`);
        }
      }
    }
  } catch (err) {
    console.error("[mediaReferences] Failed to inspect yachts for references:", err);
    throw new Error(`Media reference scan failed inspecting yachts: ${err.message}`);
  }

  // 2. Check News Articles (fail closed if database query fails)
  try {
    const articles = await getArticlesServer(false);
    for (const a of articles || []) {
      const artTitle = a.title || a.slug || a.id;
      if (matchesUrl(a.featuredImage)) {
        references.push(`News Article: "${artTitle}" (Featured Cover)`);
      }
      if (Array.isArray(a.gallery)) {
        for (const g of a.gallery) {
          if (matchesUrl(g?.src || g?.url)) {
            references.push(`News Article: "${artTitle}" (Article Gallery)`);
            break;
          }
        }
      }
      if (matchesUrl(a.content)) {
        references.push(`News Article: "${artTitle}" (Embedded Body Content)`);
      }
    }
  } catch (err) {
    console.error("[mediaReferences] Failed to inspect news articles for references:", err);
    throw new Error(`Media reference scan failed inspecting news articles: ${err.message}`);
  }

  // 3. Check Event Showcases (fail closed if database query fails)
  try {
    const events = await getEventsServer(false);
    for (const e of events || []) {
      const evTitle = e.title || e.slug || e.id;
      if (matchesUrl(e.featuredImage)) {
        references.push(`Event Showcase: "${evTitle}" (Featured Image)`);
      }
      if (Array.isArray(e.photos)) {
        for (const p of e.photos) {
          if (matchesUrl(p?.url || p?.src)) {
            references.push(`Event Showcase: "${evTitle}" (Exhibition Photo)`);
            break;
          }
        }
      }
      if (matchesUrl(e.description) || matchesUrl(e.excerpt)) {
        references.push(`Event Showcase: "${evTitle}" (Description Content)`);
      }
    }
  } catch (err) {
    console.error("[mediaReferences] Failed to inspect event showcases for references:", err);
    throw new Error(`Media reference scan failed inspecting event showcases: ${err.message}`);
  }

  // 4. Check Pages (fail closed if database query fails)
  try {
    const pages = await getPagesServer();
    for (const p of pages || []) {
      const pageTitle = p.title || p.slug || p.id;
      const sectionsStr = JSON.stringify(p.sections || []);
      if (matchesUrl(sectionsStr)) {
        references.push(`Page: "${pageTitle}" (${p.slug})`);
      }
    }
  } catch (err) {
    console.error("[mediaReferences] Failed to inspect pages for references:", err);
    throw new Error(`Media reference scan failed inspecting pages: ${err.message}`);
  }

  return {
    isReferenced: references.length > 0,
    references,
  };
}
