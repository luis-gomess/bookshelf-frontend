import { apiConfig } from "../config/apiConfig.js";
import { get, post, put, remove } from "../api/httpClient.js";

let authors = [
  { id: 1, name: "Machado de Assis", country: "Brasil", notes: "Literatura brasileira" },
  { id: 2, name: "Jane Austen", country: "Reino Unido", notes: "Romances classicos" },
  { id: 3, name: "George Orwell", country: "Reino Unido", notes: "Ficcao politica" },
];

let nextAuthorId = 4;

export async function getAuthors() {
  if (!apiConfig.useMocks) {
    return get("/authors");
  }

  return [...authors];
}

export async function getAuthorById(id) {
  if (!apiConfig.useMocks) {
    return get(`/authors/${id}`);
  }

  return authors.find((author) => author.id === Number(id)) || null;
}

export async function createAuthor(authorData) {
  if (!apiConfig.useMocks) {
    return post("/authors", authorData);
  }

  const author = {
    id: nextAuthorId,
    ...authorData,
  };

  nextAuthorId += 1;
  authors.push(author);
  return author;
}

export async function updateAuthor(id, authorData) {
  if (!apiConfig.useMocks) {
    return put(`/authors/${id}`, authorData);
  }

  const index = authors.findIndex((author) => author.id === Number(id));

  if (index < 0) {
    throw new Error("Autor não encontrado.");
  }

  authors[index] = {
    ...authors[index],
    ...authorData,
    id: Number(id),
  };

  return authors[index];
}

export async function deleteAuthor(id) {
  if (!apiConfig.useMocks) {
    return remove(`/authors/${id}`);
  }

  authors = authors.filter((author) => author.id !== Number(id));
  return true;
}
