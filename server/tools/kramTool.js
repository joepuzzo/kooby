import { Tool } from "./tool.js";

/**
 * Pushes UI state to the client over the same WebSocket used for chat.
 * The client Kooby handler should forward `data.update` (e.g. to Kram).
 */
export class KramTool extends Tool {
  constructor() {
    super({
      name: "kram",
      description:
        "Control the Kram sidebar navigation. Use when the user wants to jump to or highlight a specific nav item so the UI matches the topic being discussed.",
    });

    this.defineFunction({
      name: "set_selected_nav",
      description:
        "Select a nav item in the Kram sidebar by its flat list index (depth-first order, same order as in the system prompt’s kram nav tree). Updates the client UI immediately.",
      parameters: {
        type: "object",
        properties: {
          selectedNavIndex: {
            type: "integer",
            description:
              "Zero-based index of the nav row in depth-first flatten order (0 = first item).",
            minimum: 0,
          },
        },
        required: ["selectedNavIndex"],
      },
      handler: (args, ctx) => {
        const { ws } = ctx ?? {};
        if (!ws || typeof ws.send !== "function") {
          return { error: "No active WebSocket for this session" };
        }

        const selectedNavIndex = Number(args.selectedNavIndex);
        if (!Number.isInteger(selectedNavIndex) || selectedNavIndex < 0) {
          return { error: "selectedNavIndex must be a non-negative integer" };
        }

        ws.send(
          JSON.stringify({
            update: {
              kram: { selectedNavIndex },
            },
          }),
        );

        return { selectedNavIndex };
      },
    });
  }
}
