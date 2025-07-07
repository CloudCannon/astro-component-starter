import type { HTMLAttributes } from "astro/types";
import { z } from "zod/v4";

type ButtonHTMLAttributes = HTMLAttributes<"button">;
type AnchorHTMLAttributes = HTMLAttributes<"a">;

export const buttonSchema = z
  .object({
    label: z.string().meta({ description: "The text that goes inside the button." }),
    link: z.string().meta({ description: "The URL that the button should link to." }).optional(),
    iconName: z
      .string()
      .meta({
        description:
          "The name of the icon to display. See the Icon component documentation for more information.",
      })
      .optional(),
    iconPosition: z
      .enum(["before", "after"])
      .meta({ description: "The position of the icon relative to the label." })
      .default("before"),

    hideText: z
      .boolean()
      .meta({ description: "Whether to hide the button text and show only the icon." })
      .default(false),

    variant: z
      .enum(["primary", "secondary", "tertiary", "ghost"])
      .meta({ description: "The presentation of button." })
      .default("ghost"),

    size: z.enum(["sm", "md", "lg"]).meta({ description: "The size of the button." }).default("md"),
  })
  .catchall(z.any())
  .meta({
    title: "Button",
    description:
      "A clickable element that navigates to another page or triggers an action within the current page.",
  });

export type ButtonProps = z.infer<typeof buttonSchema> &
  (ButtonHTMLAttributes | AnchorHTMLAttributes);
