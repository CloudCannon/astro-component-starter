type SlotCollection = {
  has: (name: string) => boolean;
  render: (name: string) => Promise<string>;
};

export const hasMeaningfulSlotContent = async (
  slots: SlotCollection,
  name = "default"
): Promise<boolean> => {
  if (!slots.has(name)) return false;

  const rendered = await slots.render(name);
  return (rendered?.toString().trim().length ?? 0) > 0;
};
