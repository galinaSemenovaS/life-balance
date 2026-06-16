export type ChecklistItem = {
  id: string;
  completed: boolean;
  order: number;
};

/** Невыполненные сверху, выполненные внизу; внутри группы — исходный порядок */
export function sortChecklist<T extends ChecklistItem>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.order - b.order;
  });
}

export function withChecklistOrder<T extends { id: string; completed: boolean }>(
  items: T[],
  orderById?: Map<string, number>
): (T & { order: number })[] {
  return items.map((item, index) => ({
    ...item,
    order: orderById?.get(item.id) ?? index,
  }));
}

export function toggleChecklistItem<T extends ChecklistItem>(
  items: T[],
  id: string,
  completed: boolean
): T[] {
  return sortChecklist(
    items.map((item) => (item.id === id ? { ...item, completed } : item))
  );
}
