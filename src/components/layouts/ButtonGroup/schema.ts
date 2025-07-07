import type { HTMLAttributes } from "astro/types";
import { z } from "zod/v4";

// Create a type that extends HTMLAttributes for the div element
type ButtonGroupHTMLAttributes = HTMLAttributes<"div">;

export const buttonGroupSchema = z
  .object({
    direction: z
      .enum(["row", "column"])
      .meta({ description: "Direction of button layout." })
      .default("row"),

    align: z
      .enum(["start", "center", "end"])
      .meta({ description: "Alignment of buttons within the group." })
      .default("start"),

    button_blocks: z
      .array(z.any())
      .meta({ description: "Array of button components to render within the group." })
      .optional(),
  })
  .catchall(z.any())
  .meta({
    title: "ButtonGroup",
    description: "A container for grouping multiple buttons with consistent spacing and alignment.",
  });

// Export a combined type that includes both our custom props and HTML attributes
export type ButtonGroupProps = z.infer<typeof buttonGroupSchema> & ButtonGroupHTMLAttributes;
