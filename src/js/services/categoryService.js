import { get, post, put, remove } from "../api/httpClient.js";

export async function getCategories() {
  const categories = await get("/categorias");
  return categories.map(mapCategoryFromApi);
}

export async function getCategoryById(id) {
  return mapCategoryFromApi(await get(`/categorias/${id}`));
}

export async function createCategory(categoryData) {
  return mapCategoryFromApi(await post("/categorias", mapCategoryToApi(categoryData)));
}

export async function updateCategory(id, categoryData) {
  return mapCategoryFromApi(
    await put(`/categorias/${id}`, mapCategoryToApi(categoryData)),
  );
}

export async function deleteCategory(id) {
  return remove(`/categorias/${id}`);
}

function mapCategoryFromApi(category) {
  if (!category) {
    return null;
  }

  return {
    id: category.id,
    name: category.nome,
    description: category.descricao ?? "",
  };
}

function mapCategoryToApi(categoryData) {
  return {
    nome: categoryData.name,
    descricao: categoryData.description,
  };
}
