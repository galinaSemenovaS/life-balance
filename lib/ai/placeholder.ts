/** Заглушка для фазы 3 — генерация планов через ИИ */
export async function generatePlanFromGoal(goalId: string, prompt: string): Promise<never> {
  void goalId;
  void prompt;
  throw new Error("AI plan generation is not available in MVP");
}
