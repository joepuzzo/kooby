import { Tool } from "./tool.js";

const PREVIEW = "/public/preview.png";
const THUMBNAIL = "/public/logo.svg";

/** Hard-coded catalog for the demo (ids 1–3 match kram nav product items). */
const PRODUCTS = {
  1: {
    title: "Product 1",
    label: "Product 1",
    description:
      "Our entry bundle: solid basics, fast onboarding, and email support.",
    preview: PREVIEW,
    thumbnail: THUMBNAIL,
  },
  2: {
    title: "Product 2",
    label: "Product 2",
    description:
      "Mid-tier: collaboration features, SLA-backed uptime, and priority support.",
    preview: PREVIEW,
    thumbnail: THUMBNAIL,
  },
  3: {
    title: "Product 3",
    label: "Product 3",
    description:
      "Enterprise: dedicated success manager, custom integrations, and audit logs.",
    preview: PREVIEW,
    thumbnail: THUMBNAIL,
  },
};

export function getProductRecord(productId) {
  return PRODUCTS[productId] ?? null;
}

export class ProductTool extends Tool {
  constructor() {
    super({
      name: "product",
      description:
        "Look up demo product details by id (1, 2, or 3). Use when the user asks about a product or when kram context refers to Product 1/2/3. After calling, your reply must include a single <product>…</product> tag whose inner text is JSON with title, description, preview, and thumbnail from this tool result.",
    });

    this.defineFunction({
      name: "get_by_id",
      description:
        "Returns title, label, description, preview URL, and thumbnail URL for the given product id.",
      parameters: {
        type: "object",
        properties: {
          product_id: {
            type: "integer",
            description: "Product id: 1, 2, or 3.",
            enum: [1, 2, 3],
          },
        },
        required: ["product_id"],
      },
      handler: (args) => {
        const id = Number(args.product_id);
        const product = getProductRecord(id);
        if (!product) {
          return { error: "Unknown product_id; use 1, 2, or 3." };
        }
        return {
          product,
          render_instructions:
            'In your assistant message, include exactly one block: <product>JSON</product> where JSON is a single JSON object (no code fences) with keys title, description, preview, thumbnail copied from the product object above. Example shape: <product>{"title":"...","description":"...","preview":"...","thumbnail":"..."}</product>',
        };
      },
    });
  }
}
