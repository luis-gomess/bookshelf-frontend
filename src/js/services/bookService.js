import { apiConfig } from "../config/apiConfig.js";
import { get, post, put, remove } from "../api/httpClient.js";
import { BOOK_STATUS } from "../constants/status.js";

let books = [
  { id: 1, title: "Dom Casmurro", authorId: 1, categoryId: 2, publishedYear: 1899, status: BOOK_STATUS.AVAILABLE },
  { id: 2, title: "Orgulho e Preconceito", authorId: 2, categoryId: 1, publishedYear: 1813, status: BOOK_STATUS.READING },
  { id: 3, title: "1984", authorId: 3, categoryId: 3, publishedYear: 1949, status: BOOK_STATUS.LOANED },
];

let nextBookId = 4;

export async function getBooks() {
  if (!apiConfig.useMocks) {
    return get("/books");
  }

  return [...books];
}

export async function getBookById(id) {
  if (!apiConfig.useMocks) {
    return get(`/books/${id}`);
  }

  return books.find((book) => book.id === Number(id)) || null;
}

export async function createBook(bookData) {
  if (!apiConfig.useMocks) {
    return post("/books", bookData);
  }

  const book = {
    id: nextBookId,
    ...bookData,
    authorId: Number(bookData.authorId),
    categoryId: Number(bookData.categoryId),
    publishedYear: Number(bookData.publishedYear),
  };

  nextBookId += 1;
  books.push(book);
  return book;
}

export async function updateBook(id, bookData) {
  if (!apiConfig.useMocks) {
    return put(`/books/${id}`, bookData);
  }

  const index = books.findIndex((book) => book.id === Number(id));

  if (index < 0) {
    throw new Error("Livro não encontrado.");
  }

  books[index] = {
    ...books[index],
    ...bookData,
    id: Number(id),
    authorId: Number(bookData.authorId),
    categoryId: Number(bookData.categoryId),
    publishedYear: Number(bookData.publishedYear),
  };

  return books[index];
}

export async function updateBookStatus(id, status) {
  const book = await getBookById(id);

  if (!book) {
    throw new Error("Livro não encontrado.");
  }

  return updateBook(id, {
    ...book,
    status,
  });
}

export async function deleteBook(id) {
  if (!apiConfig.useMocks) {
    return remove(`/books/${id}`);
  }

  books = books.filter((book) => book.id !== Number(id));
  return true;
}
