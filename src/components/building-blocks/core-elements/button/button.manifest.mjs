import { defineComponentManifest, field, options } from "../../../../../scripts/manifest/lib.mjs";

export default defineComponentManifest({
  component: "building-blocks/core-elements/button",
  label: "Button",
  icon: "variables",
  description: "Clickable button for calls-to-action and navigation.",
  fields: {
    text: field.text({
      comment: "The text that goes inside the button.",
      hidden: "hideText",
      default: "My Button",
    }),
    link: field.url({
      comment: "The URL to which the button should link.",
      default: "",
    }),
    iconName: field.select({
      comment:
        "The name of the icon to display. Sourced from [Heroicons](https://heroicons.com/). See the Icon component documentation for more information.",
      options: options.icons,
      default: "",
    }),
    iconColor: field.select({
      comment: "The color of the icon.",
      hidden: "!iconName",
      options: options.iconColors,
      default: "default",
    }),
    iconPosition: field.select({
      comment: "The position of the icon relative to the text.",
      hidden: "!iconName",
      options: options.iconPositions,
      default: "before",
    }),
    hideText: field.switch({
      hidden: "!iconName",
      comment: "Whether to hide the button text and show only the icon.",
      default: false,
    }),
    variant: field.select({
      comment: "The presentation of button.",
      options: options.buttonVariants,
      default: "primary",
    }),
    size: field.select({
      comment: "The size of the button.",
      options: options.sizesSml,
      default: "md",
    }),
  },
  preview: { subtextKey: "text" },
});
