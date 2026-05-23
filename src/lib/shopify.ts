import { createStorefrontApiClient } from "@shopify/storefront-api-client";

const storeDomain =
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? "parve-7.myshopify.com";
const apiVersion =
  process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ?? "2025-10";
const publicAccessToken =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? "";

if (!publicAccessToken) {
  console.warn(
    "[Shopify] Missing NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN — products will not load."
  );
}

export const shopifyClient = createStorefrontApiClient({
  storeDomain,
  apiVersion,
  publicAccessToken,
});

export interface ShopifyImage {
  url: string;
  altText: string | null;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: { amount: string };
  availableForSale: boolean;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  tags: string[];
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: { edges: { node: ShopifyImage }[] };
  variants: { edges: { node: ShopifyVariant }[] };
}

export interface ShopifyFetchResult {
  products: ShopifyProduct[];
  connected: boolean;
  shopName?: string;
  error?: string;
  apiVersion: string;
}

interface ProductsQueryData {
  products: { edges: { node: ShopifyProduct }[] };
}

interface ShopQueryData {
  shop: { name: string };
}

interface ProductQueryData {
  product: ShopifyProduct | null;
}

interface CartCreateData {
  cartCreate: {
    cart: ShopifyCart | null;
  };
}

interface CartLinesAddData {
  cartLinesAdd: {
    cart: ShopifyCart | null;
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  lines: {
    edges: {
      node: {
        id: string;
        quantity: number;
        merchandise: {
          id: string;
          title: string;
          price: { amount: string };
          product: { title: string };
        };
      };
    }[];
  };
  cost: {
    totalAmount: { amount: string; currencyCode: string };
  };
}

const PRODUCTS_QUERY = `
  query GetProducts {
    products(first: 20) {
      edges {
        node {
          id
          title
          handle
          description
          tags
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 3) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 5) {
            edges {
              node {
                id
                title
                price {
                  amount
                }
                availableForSale
              }
            }
          }
        }
      }
    }
  }
`;

const SHOP_QUERY = `
  query GetShop {
    shop {
      name
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      tags
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 5) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            price {
              amount
            }
            availableForSale
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id
        checkoutUrl
        lines(first: 10) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price { amount }
                  product { title }
                }
              }
            }
          }
        }
        cost {
          totalAmount { amount currencyCode }
        }
      }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        lines(first: 10) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price { amount }
                  product {
                    title
                    images(first: 1) {
                      edges {
                        node { url }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount { amount currencyCode }
        }
      }
    }
  }
`;

function formatClientErrors(errors: unknown): string {
  if (!errors) return "Unknown Shopify error";
  if (typeof errors === "string") return errors;
  if (Array.isArray(errors)) {
    return errors
      .map((e) =>
        typeof e === "object" && e !== null && "message" in e
          ? String((e as { message: string }).message)
          : JSON.stringify(e)
      )
      .join("; ");
  }
  if (typeof errors === "object" && errors !== null) {
    if ("message" in errors) return String((errors as { message: string }).message);
    if ("graphQLErrors" in errors) {
      return formatClientErrors((errors as { graphQLErrors: unknown }).graphQLErrors);
    }
  }
  return JSON.stringify(errors);
}

/** Full status for debugging — connection vs empty catalog */
export async function fetchShopifyCatalog(): Promise<ShopifyFetchResult> {
  if (!publicAccessToken) {
    return {
      products: [],
      connected: false,
      error: "Missing NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN",
      apiVersion,
    };
  }

  try {
    const shopRes = await shopifyClient.request<ShopQueryData>(SHOP_QUERY);
    const shopErrors = shopRes.errors;
    if (shopErrors) {
      return {
        products: [],
        connected: false,
        error: formatClientErrors(shopErrors),
        apiVersion,
      };
    }

    const shopName = shopRes.data?.shop?.name;

    const productsRes = await shopifyClient.request<ProductsQueryData>(
      PRODUCTS_QUERY
    );

    if (productsRes.errors) {
      return {
        products: [],
        connected: false,
        shopName,
        error: formatClientErrors(productsRes.errors),
        apiVersion,
      };
    }

    const products =
      productsRes.data?.products?.edges?.map((e) => e.node) ?? [];

    return {
      products,
      connected: true,
      shopName,
      apiVersion,
    };
  } catch (error) {
    return {
      products: [],
      connected: false,
      error: error instanceof Error ? error.message : "Shopify request failed",
      apiVersion,
    };
  }
}

export async function getAllProducts(): Promise<ShopifyProduct[]> {
  const result = await fetchShopifyCatalog();
  if (result.error && !result.connected) {
    throw new Error(result.error);
  }
  return result.products;
}

export async function getProductByHandle(
  handle: string
): Promise<ShopifyProduct | null> {
  const { data, errors } = await shopifyClient.request<ProductQueryData>(
    PRODUCT_BY_HANDLE_QUERY,
    { variables: { handle } }
  );

  if (errors) {
    throw new Error(formatClientErrors(errors));
  }

  return data?.product ?? null;
}

export const getProduct = getProductByHandle;

export async function createCart(
  variantId: string,
  quantity: number
): Promise<ShopifyCart | null> {
  const { data, errors } = await shopifyClient.request<CartCreateData>(
    CART_CREATE_MUTATION,
    {
      variables: {
        lines: [{ merchandiseId: variantId, quantity }],
      },
    }
  );

  if (errors) {
    throw new Error(formatClientErrors(errors));
  }

  return data?.cartCreate?.cart ?? null;
}

export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number
): Promise<ShopifyCart | null> {
  const { data, errors } = await shopifyClient.request<CartLinesAddData>(
    CART_LINES_ADD_MUTATION,
    {
      variables: {
        cartId,
        lines: [{ merchandiseId: variantId, quantity }],
      },
    }
  );

  if (errors) {
    throw new Error(formatClientErrors(errors));
  }

  return data?.cartLinesAdd?.cart ?? null;
}
