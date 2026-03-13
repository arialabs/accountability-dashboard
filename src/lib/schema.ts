/**
 * Schema.org structured data utilities for SEO and rich snippets
 */

type JsonLdSchema = Record<string, unknown>;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://accountability-dashboard.pages.dev";

/**
 * Generate Person schema for government officials
 */
export function generatePersonSchema(params: {
  name: string;
  jobTitle: string;
  description?: string;
  image?: string;
  url: string;
  party?: string;
  state?: string;
  district?: string;
  chamber?: "house" | "senate";
  email?: string;
  phone?: string;
  birthDate?: string;
  affiliation?: {
    name: string;
    url: string;
  };
}) {
  const schema: JsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: params.name,
    jobTitle: params.jobTitle,
    url: `${siteUrl}${params.url}`,
  };

  if (params.description) {
    schema.description = params.description;
  }

  if (params.image) {
    schema.image = params.image.startsWith("http") 
      ? params.image 
      : `${siteUrl}${params.image}`;
  }

  if (params.email) {
    schema.email = params.email;
  }

  if (params.phone) {
    schema.telephone = params.phone;
  }

  if (params.birthDate) {
    schema.birthDate = params.birthDate;
  }

  if (params.affiliation) {
    schema.worksFor = {
      "@type": "GovernmentOrganization",
      name: params.affiliation.name,
      url: params.affiliation.url,
    };
  }

  // Additional political metadata
  if (params.party || params.state || params.district) {
    const additionalProperty: Array<Record<string, string>> = [];
    schema.additionalProperty = additionalProperty;
    
    if (params.party) {
      additionalProperty.push({
        "@type": "PropertyValue",
        name: "Political Party",
        value: params.party === "D" ? "Democratic" : params.party === "R" ? "Republican" : "Independent",
      });
    }

    if (params.state) {
      additionalProperty.push({
        "@type": "PropertyValue",
        name: "State",
        value: params.state,
      });
    }

    if (params.district && params.chamber === "house") {
      additionalProperty.push({
        "@type": "PropertyValue",
        name: "District",
        value: params.district,
      });
    }
  }

  return schema;
}

/**
 * Generate GovernmentOrganization schema
 */
export function generateGovernmentOrgSchema(params: {
  name: string;
  description: string;
  url: string;
  parentOrganization?: string;
  logo?: string;
}) {
  const schema: JsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    name: params.name,
    description: params.description,
    url: `${siteUrl}${params.url}`,
  };

  if (params.logo) {
    schema.logo = params.logo.startsWith("http") 
      ? params.logo 
      : `${siteUrl}${params.logo}`;
  }

  if (params.parentOrganization) {
    schema.parentOrganization = {
      "@type": "GovernmentOrganization",
      name: params.parentOrganization,
    };
  }

  return schema;
}

/**
 * Generate Rating schema for alignment scores
 */
export function generateRatingSchema(params: {
  itemReviewed: string;
  ratingValue: number;
  bestRating: number;
  worstRating: number;
  author?: string;
  description?: string;
}) {
  const schema: JsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "Rating",
    ratingValue: params.ratingValue,
    bestRating: params.bestRating,
    worstRating: params.worstRating,
  };

  if (params.author) {
    schema.author = {
      "@type": "Organization",
      name: params.author,
    };
  }

  if (params.description) {
    schema.description = params.description;
  }

  return schema;
}

/**
 * Generate Article schema for deep dive investigations
 */
export function generateArticleSchema(params: {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  url: string;
  image?: string;
  keywords?: string[];
}) {
  const schema: JsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.headline,
    description: params.description,
    datePublished: params.datePublished,
    dateModified: params.dateModified || params.datePublished,
    author: {
      "@type": "Organization",
      name: params.author,
      url: `${siteUrl}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "Accountability Dashboard",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    url: `${siteUrl}${params.url}`,
  };

  if (params.image) {
    schema.image = params.image.startsWith("http") 
      ? params.image 
      : `${siteUrl}${params.image}`;
  }

  if (params.keywords && params.keywords.length > 0) {
    schema.keywords = params.keywords.join(", ");
  }

  return schema;
}

/**
 * Generate BreadcrumbList schema for navigation hierarchy
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  };
}

/**
 * Inject structured data script into page head
 */
export function structuredDataScript(schema: JsonLdSchema) {
  return {
    __html: JSON.stringify(schema),
  };
}
