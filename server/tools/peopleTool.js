import { Tool } from "./tool.js";

const PEOPLE_ENDPOINT = "/people";

export class PeopleTool extends Tool {
  constructor() {
    super({
      name: "people",
      description:
        "Returns the API endpoint for listing people (team directory). Use when the user asks about People, the team, or when kram/context refers to the People nav item (About → People). After calling, your reply must include a single <people>…</people> tag whose inner text is JSON with an endpoint field.",
    });

    this.defineFunction({
      name: "get",
      description:
        "Returns the REST path used to load paginated people data for the UI.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
      handler: () => {
        return {
          people: { endpoint: PEOPLE_ENDPOINT },
          render_instructions:
            'In your assistant message, include exactly one block: <people>JSON</people> where JSON is a single JSON object (no code fences) with key "endpoint" set to "/people". Example: <people>{"endpoint":"/people"}</people>',
        };
      },
    });
  }
}
