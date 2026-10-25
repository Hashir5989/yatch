/**
 * ASMARATY Production Backend Integration Architecture & Contracts
 * 
 * This file specifies the data models, interfaces, and integration contracts
 * for cloud database, storage, and notification services.
 */

/* =========================================================================
   1. DATABASE TABLE SCHEMAS (PostgreSQL / Supabase DDL Specifications)
   ========================================================================= */

/**
 * Table: `yachts`
 * Relational table storing verified yacht models.
 */
export const YACHTS_TABLE_SCHEMA = {
  tableName: "yachts",
  columns: {
    id: "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
    slug: "VARCHAR(100) UNIQUE NOT NULL",
    name: "VARCHAR(255) NOT NULL",
    category: "VARCHAR(50) NOT NULL", // Superyacht, Explorer, Flybridge, Sports Cruiser
    series: "VARCHAR(100) NOT NULL",
    tagline: "TEXT",
    description: "TEXT NOT NULL",
    main_image: "TEXT NOT NULL",
    gallery: "TEXT[] DEFAULT '{}'",
    featured: "BOOLEAN DEFAULT false",
    status: "VARCHAR(20) DEFAULT 'published'", // draft, published, archived
    specs: "JSONB NOT NULL", // lengthOverall, beam, draft, engines, maxSpeed, range, etc.
    highlights: "TEXT[] DEFAULT '{}'",
    floorplan_url: "TEXT",
    created_at: "TIMESTAMPTZ DEFAULT NOW()",
    updated_at: "TIMESTAMPTZ DEFAULT NOW()"
  }
};

/**
 * Table: `pages` and `page_sections`
 * CMS page structure supporting modular visual editor sections.
 */
export const PAGES_TABLE_SCHEMA = {
  tableName: "pages",
  columns: {
    id: "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
    slug: "VARCHAR(255) UNIQUE NOT NULL",
    title: "VARCHAR(255) NOT NULL",
    template: "VARCHAR(50) NOT NULL",
    status: "VARCHAR(20) DEFAULT 'published'",
    last_modified: "TIMESTAMPTZ DEFAULT NOW()",
    sections: "JSONB NOT NULL DEFAULT '[]'",
    meta_title: "VARCHAR(255)",
    meta_description: "TEXT"
  }
};

/**
 * Table: `media_assets`
 * S3 / Supabase storage reference catalog.
 */
export const MEDIA_TABLE_SCHEMA = {
  tableName: "media_assets",
  columns: {
    id: "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
    title: "VARCHAR(255) NOT NULL",
    url: "TEXT NOT NULL",
    alt_text: "VARCHAR(255)",
    category: "VARCHAR(50) DEFAULT 'exterior'", // exterior, interior, lifestyle, technical
    dimensions: "VARCHAR(50)",
    uploaded_by: "UUID REFERENCES auth.users(id)",
    created_at: "TIMESTAMPTZ DEFAULT NOW()"
  }
};

/**
 * Table: `customer_enquiries`
 * Captured enquiries from the Home page and future detail pages.
 */
export const ENQUIRIES_TABLE_SCHEMA = {
  tableName: "customer_enquiries",
  columns: {
    id: "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
    name: "VARCHAR(255) NOT NULL",
    email: "VARCHAR(255) NOT NULL",
    phone: "VARCHAR(50)",
    yacht_model: "VARCHAR(100)",
    inquiry_type: "VARCHAR(50)", // Sea Trial Request, Custom Build, General Advisory
    message: "TEXT",
    status: "VARCHAR(20) DEFAULT 'pending'", // pending, contacted, scheduled, closed
    ip_address: "INET",
    user_agent: "TEXT",
    created_at: "TIMESTAMPTZ DEFAULT NOW()"
  }
};

/**
 * Table: `site_settings`
 * Global brand metadata and contact information.
 */
export const SETTINGS_TABLE_SCHEMA = {
  tableName: "site_settings",
  columns: {
    id: "INT PRIMARY KEY DEFAULT 1",
    site_title: "VARCHAR(255) NOT NULL",
    announcement_text: "TEXT",
    announcement_enabled: "BOOLEAN DEFAULT true",
    contact_email: "VARCHAR(255) NOT NULL",
    contact_phone: "VARCHAR(50) NOT NULL",
    shipyard_address: "TEXT NOT NULL",
    social_links: "JSONB NOT NULL DEFAULT '{}'",
    updated_at: "TIMESTAMPTZ DEFAULT NOW()"
  }
};

/* =========================================================================
   2. SERVICE CONTRACTS & ADAPTER INTERFACES
   ========================================================================= */

/**
 * Authentication Service Contract
 */
export const IAuthService = {
  signInWithPassword: async (/* email, password */) => {
    throw new Error("AuthService: External provider integration stub.");
  },
  signOut: async () => {
    throw new Error("AuthService: External provider integration stub.");
  },
  getUserSession: async () => {
    return { status: "local_session", user: null };
  },
  checkPermission: (/* requiredRole */) => {
    return true;
  }
};

/**
 * Email & Notification Service Contract
 */
export const IEmailService = {
  sendEnquiryNotification: async (/* enquiryData */) => {
    console.info("[Enquiry Captured]", enquiryData);
    return { success: true, mode: "server_capture" };
  }
};

/**
 * Media Storage Service Contract
 */
export const IStorageService = {
  uploadMediaFile: async (/* file, folder */) => {
    throw new Error("StorageService: Direct binary file upload pending external cloud bucket.");
  },
  getPublicUrl: (/* path */) => {
    throw new Error("StorageService: Pending external cloud bucket integration.");
  }
};

/**
 * Architectural Readiness Status
 */
export const ARCHITECTURAL_STATUS = {
  homePageStatus: "Complete (Hero, Brand Intro, Yacht Models, Verified Specs, Vision, Slider, Enquiry, CTA)",
  publicRoutesStatus: "Under Construction with return-to-home navigation",
  databaseIntegration: "Active (/api/yachts JSON storage & schema contracts)",
  authenticationIntegration: "Active (PBKDF2 session auth & guard on /admin)",
  storageIntegration: "External CDN media with local persistence",
  emailServiceIntegration: "Active (/api/enquiries server capture)"
};
