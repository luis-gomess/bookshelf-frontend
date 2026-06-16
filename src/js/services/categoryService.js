import { apiConfig } from "../config/apiConfig.js";
import { get, post, put, remove } from "../api/httpClient.js";

let categories = [
  { id: 1, name: "Romance", description: "Narrativas de ficcao e relacoes humanas", color: "#7c3aed" },
  { id: 2, name: "Classico", description: "Obras de referencia literaria", color: "#2563eb" },
  { id: 3, name: "Distopia", description: "Sociedades imaginarias e criticas sociais", color: "#db2777" },
];

let nextCategoryId = 4;

export async function getCategories() {
  if (!apiConfig.useMocks) {
    return get("/categories");
  }

  return [...categories];
}

export async function getCategoryById(id) {
  if (!apiConfig.useMocks) {
    return get(`/categories/${id}`);
  }

  return categories.find((category) => category.id === Number(id)) || null;
}

export async function createCategory(categoryData) {
  if (!apiConfig.useMocks) {
    return post("/categories", categoryData);
  }

  const category = {
    id: nextCategoryId,
    ...categoryData,
  };

  nextCategoryId += 1;
  categories.push(category);
  return category;
}

export async function updateCategory(id, categoryData) {
  if (!apiConfig.useMocks) {
    return put(`/categories/${id}`, categoryData);
  }

  const index = categories.findIndex((category) => category.id === Number(id));

  if (index < 0) {
    throw new Error("Categoria não encontrada.");
  }

  categories[index] = {
    ...categories[index],
    ...categoryData,
    id: Number(id),
  };

  return categories[index];
}

export async function deleteCategory(id) {
  if (!apiConfig.useMocks) {
    return remove(`/categories/${id}`);
  }

  categories = categories.filter((category) => category.id !== Number(id));
  return true;
}
