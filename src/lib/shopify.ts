const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!;
const api = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION!;

export interface ShopifyImageNode {
  url: string;
  altText: string | null;
}

export interface ShopifyVariantNode {
  id: string;
  title?: string;
  availableForSale?: boolean;
  price?: { amount: string; currencyCode: string };
}

export interface ShopifyProductNode {
  id: string;
  handle: string;
  title: string;
  description?: string;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  images: { edges: { node: ShopifyImageNode }[] };
  collections: { edges: { node: { title: string } }[] };
  tags: string[];
  variants: { edges: { node: ShopifyVariantNode }[] };
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<GraphQLResponse<T>> {
  const res = await fetch(`https://${domain}/api/${api}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });
  return res.json() as Promise<GraphQLResponse<T>>;
}

export async function getAllProducts(): Promise<ShopifyProductNode[]> {
  const { data } = await shopifyFetch<{
    products: { edges: { node: ShopifyProductNode }[] };
  }>(`{
    products(first: 20) {
      edges {
        node {
          id handle title
          priceRange { minVariantPrice { amount currencyCode } }
          images(first: 1) { edges { node { url altText } } }
          collections(first: 1) { edges { node { title } } }
          tags
          variants(first: 1) {
            edges { node { id availableForSale } }
          }
        }
      }
    }
  }`);
  return data?.products?.edges?.map((e) => e.node) ?? [];
}

export async function getProduct(
  handle: string
): Promise<ShopifyProductNode | null> {
  const { data } = await shopifyFetch<{
    productByHandle: ShopifyProductNode | null;
  }>(
    `
    query getProduct($handle: String!) {
      productByHandle(handle: $handle) {
        id handle title description
        priceRange { minVariantPrice { amount currencyCode } }
        images(first: 6) { edges { node { url altText } } }
        collections(first: 1) { edges { node { title } } }
        tags
        variants(first: 10) {
          edges {
            node {
              id title availableForSale
              selectedOptions { name value }
              price { amount currencyCode }
            }
          }
        }
      }
    }
  `,
    { handle }
  );
  return data?.productByHandle ?? null;
}

export async function createCart() {
  const { data } = await shopifyFetch<{
    cartCreate: { cart: { id: string; checkoutUrl: string } };
  }>(`
    mutation {
      cartCreate {
        cart { id checkoutUrl }
      }
    }
  `);
  return data?.cartCreate?.cart;
}

export async function addToCart(cartId: string, variantId: string, qty = 1) {
  const { data } = await shopifyFetch<{
    cartLinesAdd: {
      cart: {
        id: string;
        checkoutUrl: string;
        totalQuantity: number;
      };
    };
  }>(
    `
    mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id checkoutUrl totalQuantity
          lines(first: 20) {
            edges {
              node {
                id quantity
                merchandise {
                  ... on ProductVariant {
                    id title
                    product { title }
                    price { amount }
                    image { url }
                  }
                }
              }
            }
          }
          cost { totalAmount { amount currencyCode } }
        }
      }
    }
  `,
    { cartId, lines: [{ merchandiseId: variantId, quantity: qty }] }
  );
  return data?.cartLinesAdd?.cart;
}
