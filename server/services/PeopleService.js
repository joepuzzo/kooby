/** Demo paginated people list for People.jsx + people_get tool */
const PEOPLE_SEED = [
  {
    id: "1",
    name: "Avery Chen",
    title: "Engineering Lead",
    email: "avery@example.com",
  },
  {
    id: "2",
    name: "Jordan Mills",
    title: "Product Designer",
    email: "jordan@example.com",
  },
  {
    id: "3",
    name: "Sam Rivera",
    title: "Developer Relations",
    email: "sam@example.com",
  },
  {
    id: "4",
    name: "Riley Park",
    title: "Backend Engineer",
    email: "riley@example.com",
  },
  {
    id: "5",
    name: "Casey Wu",
    title: "Frontend Engineer",
    email: "casey@example.com",
  },
  {
    id: "6",
    name: "Morgan Lee",
    title: "People Ops",
    email: "morgan@example.com",
  },
  {
    id: "7",
    name: "Quinn Foster",
    title: "Security",
    email: "quinn@example.com",
  },
  {
    id: "8",
    name: "Sky Patel",
    title: "Data Science",
    email: "sky@example.com",
  },
  {
    id: "9",
    name: "Drew Okonkwo",
    title: "Support Lead",
    email: "drew@example.com",
  },
  {
    id: "10",
    name: "Jamie Ortiz",
    title: "Marketing",
    email: "jamie@example.com",
  },
  { id: "11", name: "Taylor Kim", title: "Sales", email: "taylor@example.com" },
  {
    id: "12",
    name: "Reese Adams",
    title: "Finance",
    email: "reese@example.com",
  },
];

export class PeopleService {
  /**
   * Get paginated list of people
   * @param {number} page - Page number (1-indexed)
   * @param {number} limit - Number of items per page
   * @returns {Object} Paginated people data
   */
  static getPeople(page = 1, limit = 5) {
    const normalizedPage = Math.max(1, page);
    const normalizedLimit = Math.min(50, Math.max(1, limit));
    const total = PEOPLE_SEED.length;
    const start = (normalizedPage - 1) * normalizedLimit;
    const people = PEOPLE_SEED.slice(start, start + normalizedLimit);
    const hasMore = start + people.length < total;

    return {
      people,
      page: normalizedPage,
      limit: normalizedLimit,
      total,
      hasMore,
    };
  } /**
   * Get a person by ID
   * @param {string} id - Person ID
   * @returns {Object|null} Person object or null if not found
   */

  static getPersonById(id) {
    return PEOPLE_SEED.find((p) => p.id === id) || null;
  } /**
   * Get a person by name (case-insensitive partial match)
   * @param {string} name - Person name or partial name
   * @returns {Object|null} Person object or null if not found
   */

  static getPersonByName(name) {
    const searchName = name.toLowerCase();
    return (
      PEOPLE_SEED.find((p) => p.name.toLowerCase().includes(searchName)) || null
    );
  }
}
