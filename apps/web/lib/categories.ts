import { backendFetch } from "./backend";

export interface CategoryOption {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export async function getCategories() {
  const response = await backendFetch("/categories");

  if (!response.ok) {
    throw new Error("Unable to load categories");
  }

  const categories = (await response.json()) as CategoryOption[];
  return categories.filter((category) => category.isActive);
}
