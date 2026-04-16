import { backendFetch } from "./backend";
export type { CategoryOption, CategoryRecord } from "./category-types";
import type { CategoryRecord, CategoryOption } from "./category-types";

async function loadCategories() {
  const response = await backendFetch("/categories");

  if (!response.ok) {
    throw new Error("Unable to load categories");
  }

  return (await response.json()) as CategoryRecord[];
}

export async function getCategories() {
  const categories = await loadCategories();
  return categories.filter((category) => category.isActive);
}

export async function getAllCategories() {
  return loadCategories();
}
