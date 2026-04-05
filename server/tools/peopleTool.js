import { Tool } from "./tool.js";
import { PeopleService } from "../services/PeopleService.js";

export class PeopleTool extends Tool {
  constructor() {
    super({
      name: "people",
      description:
        "Get information about people in the team directory. Use when the user asks about a specific person by name or ID.",
    });

    this.defineFunction({
      name: "get_by_id",
      description:
        "Retrieves detailed information about a specific person by their ID.",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The unique identifier of the person to retrieve",
          },
        },
        required: ["id"],
      },
      handler: ({ id }) => {
        const person = PeopleService.getPersonById(id);

        if (!person) {
          return { error: "Person not found", id };
        }

        return { person };
      },
    });

    this.defineFunction({
      name: "get_by_name",
      description:
        "Retrieves detailed information about a specific person by their name. Performs a case-insensitive partial match.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name or partial name of the person to search for",
          },
        },
        required: ["name"],
      },
      handler: ({ name }) => {
        const person = PeopleService.getPersonByName(name);

        if (!person) {
          return { error: "Person not found", name };
        }

        return { person };
      },
    });
  }
}
