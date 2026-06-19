import { get, post, put, remove } from "../api/httpClient.js";

export async function getAuthors() {
  const authors = await get("/autores");
  return authors.map(mapAuthorFromApi);
}

export async function getAuthorById(id) {
  return mapAuthorFromApi(await get(`/autores/${id}`));
}

export async function createAuthor(authorData) {
  return mapAuthorFromApi(await post("/autores", mapAuthorToApi(authorData)));
}

export async function updateAuthor(id, authorData) {
  return mapAuthorFromApi(await put(`/autores/${id}`, mapAuthorToApi(authorData)));
}

export async function deleteAuthor(id) {
  return remove(`/autores/${id}`);
}

function mapAuthorFromApi(author) {
  if (!author) {
    return null;
  }

  return {
    id: author.id,
    name: author.nome,
    country: author.nacionalidade,
  };
}

function mapAuthorToApi(authorData) {
  return {
    nome: authorData.name,
    nacionalidade: authorData.country,
  };
}
