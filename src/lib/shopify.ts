import { createStorefrontApiClient } from "@shopify/storefront-api-client";

const storeDomain =
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? "parve-7.myshopify.com";
const apiVersion =
  process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ?? "2025-01";
const publicAccessToken =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ??
  "b4d48e18e3f03174e104efad206d042e";

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

interface ProductsQueryData {
  products: { edges: { node: ShopifyProduct }[] };
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

export async function getAllProducts(): Promise<ShopifyProduct[]> {
  const { data, errors } = await shopifyClient.request<ProductsQueryData>(
    PRODUCTS_QUERY
  );

  if (errors) {
    const message =
      typeof errors === "object" && errors !== null && "message" in errors
        ? String((errors as { message: string }).message)
        : JSON.stringify(errors);
    throw new Error(message);
  }

  return data?.products?.edges?.map((e) => e.node) ?? [];
}

export async function getProductByHandle(
  handle: string
): Promise<ShopifyProduct | null> {
  const { data, errors } = await shopifyClient.request<ProductQueryData>(
    PRODUCT_BY_HANDLE_QUERY,
    { variables: { handle } }
  );

  if (errors) {
    const message =
      typeof errors === "object" && errors !== null && "message" in errors
        ? String((errors as { message: string }).message)
        : JSON.stringify(errors);
    throw new Error(message);
  }

  return data?.product ?? null;
}

/** @deprecated Use getProductByHandle */
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
    throw new Error(JSON.stringify(errors));
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
    throw new Error(JSON.stringify(errors));
  }

  return data?.cartLinesAdd?.cart ?? null;
}
