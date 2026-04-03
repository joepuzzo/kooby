/** Example nav tree for the Kram demo on App.jsx */
export const kramNav = {
  items: [
    {
      label: "Home",
      items: [
        {
          label: "Products",
          items: [
            { label: "Product 1", id: 1 },
            { label: "Product 2", id: 2 },
            { label: "Product 3", id: 3 },
          ],
        },
        {
          label: "Services",
          items: [
            { label: "Service 1" },
            { label: "Service 2" },
            { label: "Consulting" },
          ],
        },
        { label: "Portfolio" },
        { label: "Case studies" },
      ],
    },
    {
      label: "About",
      items: [
        { label: "People" },
        { label: "Projects" },
        { label: "Events" },
        { label: "News" },
        { label: "Contact" },
        { label: "Careers" },
      ],
    },
    {
      label: "Blog",
      items: [{ label: "Latest" }, { label: "Archive" }, { label: "Tags" }],
    },
    {
      label: "Support",
      items: [
        {
          label: "Help center",
          items: [
            { label: "Getting started" },
            { label: "FAQ" },
            { label: "Troubleshooting" },
          ],
        },
        { label: "Status" },
        { label: "API docs" },
      ],
    },
    {
      label: "Account",
      items: [
        { label: "Sign in" },
        { label: "Settings" },
        { label: "Billing" },
        { label: "Team" },
      ],
    },
  ],
};
