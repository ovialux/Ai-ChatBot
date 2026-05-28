// lib/shopify.ts
import { env } from "@/lib/env";

const STOREFRONT_API_URL = `https://${env.SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;

const PRODUCTS_QUERY = `
  query GetProducts {
    products(first: 10) {
      edges {
        node {
          title
          description(truncateAt: 200)
          tags
        }
      }
    }
  }
`;

interface ShopifyProduct {
  title: string;
  description: string;
  tags: string[];
}

interface ShopifyResponse {
  data: {
    products: {
      edges: { node: ShopifyProduct }[];
    };
  };
}

async function fetchShopifyProducts(): Promise<ShopifyProduct[]> {
  const res = await fetch(STOREFRONT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query: PRODUCTS_QUERY }),
    next: { revalidate: 300, tags: ["shopify-products"] },
  });

  if (!res.ok) {
    throw new Error(`Shopify API error: ${res.status} ${res.statusText}`);
  }

  const json: ShopifyResponse = await res.json();

  return json.data.products.edges.map((edge) => edge.node);
}

function formatProduct(product: ShopifyProduct): string {
  const tags = product.tags.length > 0 ? product.tags.join(", ") : "general";
  const description = product.description.trim() || "No description available.";

  return [
    `Product: ${product.title}`,
    `Tags: ${tags}`,
    `Description: ${description}`,
  ].join("\n");
}

export async function getProducts(): Promise<string> {
  try {
    const products = await fetchShopifyProducts();

    if (products.length === 0) {
      return "";
    }

    return products.map(formatProduct).join("\n\n");
  } catch (err) {
    console.error("[shopify] Failed to fetch products:", err);
    return "";
  }
}
