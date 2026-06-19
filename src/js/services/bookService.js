import { get, post, put, remove } from "../api/httpClient.js";

export async function getBooks() {
  const books = await get("/livros");

  if (!Array.isArray(books)) {
    throw new Error("A API retornou um formato inválido para a lista de livros.");
  }

  return books.map(mapBookFromApi);
}

export async function getBookById(id) {
  return mapBookFromApi(await get(`/livros/${id}`));
}

export async function createBook(bookData) {
  return mapBookFromApi(await post("/livros", mapBookToApi(bookData)));
}

export async function updateBook(id, bookData) {
  const currentBook = await getBookById(id);
  const updatedBook = {
    ...currentBook,
    ...bookData,
    id: Number(id),
  };

  return mapBookFromApi(await put(`/livros/${id}`, mapBookToApi(updatedBook)));
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
  return remove(`/livros/${id}`);
}

function mapBookFromApi(book) {
  if (!book) {
    return null;
  }

  return {
    id: book.id,
    title: book.titulo,
    isbn: book.isbn ?? "",
    publishedYear: book.anoPublicacao,
    status: book.statusLeitura,
    note: book.nota ?? null,
    observation: book.observacao ?? "",
    authorId: book.autor?.id ?? book.autorId ?? null,
    categoryId: book.categoria?.id ?? book.categoriaId ?? null,
    authorName: book.autor?.nome ?? null,
    categoryName: book.categoria?.nome ?? null,
  };
}

function mapBookToApi(bookData) {
  return {
    titulo: bookData.title,
    isbn: bookData.isbn ?? "",
    anoPublicacao: Number(bookData.publishedYear),
    statusLeitura: bookData.status,
    nota: bookData.note === "" || bookData.note == null ? null : Number(bookData.note),
    observacao: bookData.observation ?? "",
    autorId: Number(bookData.authorId),
    categoriaId: Number(bookData.categoryId),
  };
}
