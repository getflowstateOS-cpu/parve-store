import { createStorefrontApiClient } from "@shopify/storefront-api-client";

const client = createStorefrontApiClient({
  storeDomain: "parve-7.myshopify.com",
  apiVersion: "2025-10",
  publicAccessToken: "b4d48e18e3f03174e104efad206d042e",
});

try {
  const result = await client.request(`
    {
      products(first: 5) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
    }
  `);
  console.log("SUCCESS:", JSON.stringify(result, null, 2));
} catch (e) {
  console.error("CATCH:", e.message);
  console.error("CAUSE:", e.cause);
  console.error("graphQLErrors:", e.graphQLErrors);
}
