import { Extension } from "@tiptap/core";

type Align = "left" | "center" | "right" | "justify";

export default Extension.create({
  name: "textAlign",

  addOptions() {
    return {
      types: ["heading", "paragraph"],
      defaultAlignment: null as Align | null,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: this.options.defaultAlignment,
            parseHTML: (element: HTMLElement) => element.style.textAlign || null,
            renderHTML: (attributes: { textAlign?: Align | null }) => {
              if (!attributes.textAlign) return {};
              return { style: `text-align: ${attributes.textAlign}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextAlign:
        (alignment: Align) =>
        ({ commands }: { commands: any }) => {
          let applied = false;
          for (const type of this.options.types as string[]) {
            applied = commands.updateAttributes(type, { textAlign: alignment }) || applied;
          }
          return applied;
        },
      unsetTextAlign:
        () =>
        ({ commands }: { commands: any }) => {
          let applied = false;
          for (const type of this.options.types as string[]) {
            applied = commands.resetAttributes(type, "textAlign") || applied;
          }
          return applied;
        },
    } as any;
  },
});
