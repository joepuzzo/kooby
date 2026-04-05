/** Example nav tree for the Kram demo on App.jsx */

/**
 * Generate instructions for a component that loads information from data
 * @param {Object} config - Configuration object
 * @param {string} config.entityName - Display name (e.g., "People", "Projects")
 * @param {string} config.tag - HTML-like tag name (e.g., "people", "projects")
 * @param {Object} config.data - Data object to be included in the response (e.g., {endpoint: "/people"})
 * @param {string} [config.context] - Additional context (e.g., "Under About")
 */
function createEndpointInstructions({ entityName, tag, data, context = "" }) {
  let instructions = `
  When the user or system context asks about ${entityName} (e.g. prompt \`Display information about ${entityName}\`), reply with a short message and exactly one \`<${tag}>JSON</${tag}>\` block.
  
  The inner JSON must include \`${JSON.stringify(data)}\` (raw JSON, no code fences).
  
  The client will load the data via an API call using that path.
  
  Example: \`<${tag}>${JSON.stringify(data)}</${tag}>\`
  
  REMEMBER TO always navigate to the ${entityName} page first.
  
  ${context}
  `;

  return instructions;
}

function createJsonInstructions({ entityName, tag, context = "" }) {
  let instructions = `
  When the user or system context asks about ${entityName} (e.g. prompt \`Display information about ${entityName}\`), reply with a short message and exactly one \`<${tag}>JSON</${tag}>\` block. 
  
  The inner JSON must include (raw JSON, no code fences). 
  
  You will load the JSON from a tool
  
  Example: \`<${tag}>{"id": "7"}</${tag}>\`
  
  REMEMBER TO always navigate to the ${entityName} page first.
  
  ${context}
  `;

  return instructions;
}

// Generate instructions using the helper functions
const PRODUCT_INSTRUCTIONS = createJsonInstructions({
  entityName: "product",
  tag: "products",
});

const PEOPLE_INSTRUCTIONS = createEndpointInstructions({
  entityName: "people",
  tag: "people",
  data: { endpoint: "/people" },
});

export const kramNav = {
  items: [
    {
      label: "Home",
      href: "#",
      items: [
        {
          label: "Products",
          href: "#products",
          items: [
            {
              label: "Product 1",
              id: 1,
              href: "#products/1",
              instructions: PRODUCT_INSTRUCTIONS,
            },
            {
              label: "Product 2",
              id: 2,
              href: "#products/2",
              instructions: PRODUCT_INSTRUCTIONS,
            },
            {
              label: "Product 3",
              id: 3,
              href: "#products/3",
              instructions: PRODUCT_INSTRUCTIONS,
            },
          ],
        },
        {
          label: "Services",
          href: "#services",
          items: [
            { label: "Service 1", href: "#services/1" },
            { label: "Service 2", href: "#services/2" },
            { label: "Consulting", href: "#services/consulting" },
          ],
        },
        { label: "Portfolio", href: "#portfolio" },
        { label: "Case studies", href: "#case-studies" },
      ],
    },
    {
      label: "About",
      href: "#about",
      items: [
        {
          label: "People",
          href: "#about/people",
          instructions: PEOPLE_INSTRUCTIONS,
        },
        { label: "Projects", href: "#about/projects" },
        { label: "Events", href: "#about/events" },
        { label: "News", href: "#about/news" },
        { label: "Contact", href: "#about/contact" },
        { label: "Careers", href: "#about/careers" },
      ],
    },
    {
      label: "Blog",
      href: "#blog",
      items: [
        { label: "Latest", href: "#blog/latest" },
        { label: "Archive", href: "#blog/archive" },
        { label: "Tags", href: "#blog/tags" },
      ],
    },
    {
      label: "Support",
      href: "#support",
      items: [
        {
          label: "Help center",
          href: "#support/help",
          items: [
            { label: "Getting started", href: "#support/help/getting-started" },
            { label: "FAQ", href: "#support/help/faq" },
            { label: "Troubleshooting", href: "#support/help/troubleshooting" },
          ],
        },
        { label: "Status", href: "#support/status" },
        { label: "API docs", href: "#support/api-docs" },
      ],
    },
    {
      label: "Account",
      href: "#account",
      items: [
        { label: "Sign in", href: "#account/signin" },
        { label: "Settings", href: "#account/settings" },
        { label: "Billing", href: "#account/billing" },
        { label: "Team", href: "#account/team" },
      ],
    },
  ],
};
