import { renderSidebar } from "../components/sidebar.js";
import { showToast } from "../components/toast.js";
import { getAuthors } from "../services/authorService.js";
import { getCategories } from "../services/categoryService.js";
import { createBook, deleteBook, getBooks, updateBook } from "../services/bookService.js";
import { BOOK_STATUS, BOOK_STATUS_LABELS } from "../constants/status.js";
import { escapeHtml } from "../utils/formatters.js";
import { requireFields, requirePositiveYear } from "../utils/validators.js";

let books = [];
let authors = [];
let categories = [];

document.addEventListener("DOMContentLoaded", initBookPage);

async function initBookPage() {
  renderSidebar("books", "..");
  bindBookEvents();

  try {
    await refreshBookData();
  } catch (error) {
    showToast(error.message, "error");
  }
}

function bindBookEvents() {
  document.querySelector("#addBookButton").addEventListener("click", handleAddBookClick);
  document.querySelector("#bookForm").addEventListener("submit", handleBookSubmit);
  document.querySelector("#bookCancelButton").addEventListener("click", handleBookCancel);
  document.querySelector("#booksTable").addEventListener("click", handleBookTableClick);
  document.querySelector("#bookModal").addEventListener("hidden.bs.modal", resetBookForm);
}

async function refreshBookData() {
  [books, authors, categories] = await Promise.all([getBooks(), getAuthors(), getCategories()]);
  renderBookOptions();
  renderBooks();
}

function renderBookOptions() {
  document.querySelector("#bookAuthorId").innerHTML = authors
    .map((author) => `<option value="${author.id}">${escapeHtml(author.name)}</option>`)
    .join("");

  document.querySelector("#bookCategoryId").innerHTML = categories
    .map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
    .join("");

  document.querySelector("#bookStatus").innerHTML = Object.values(BOOK_STATUS)
    .map((status) => `<option value="${status}">${BOOK_STATUS_LABELS[status]}</option>`)
    .join("");
}

function renderBooks() {
  const table = document.querySelector("#booksTable");

  if (!books.length) {
    table.innerHTML = `<tr><td class="empty-row" colspan="6">Nenhum livro cadastrado.</td></tr>`;
    return;
  }

  table.innerHTML = books
    .map((book) => {
      const author = authors.find((item) => item.id === book.authorId);
      const category = categories.find((item) => item.id === book.categoryId);
      const authorName = book.authorName || author?.name || "-";
      const categoryName = book.categoryName || category?.name || "-";

      return `
        <tr>
          <td>${escapeHtml(book.title)}</td>
          <td>${escapeHtml(authorName)}</td>
          <td>${escapeHtml(categoryName)}</td>
          <td>${book.publishedYear}</td>
          <td>${renderBookStatus(book.status)}</td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-sm btn-outline-primary" type="button" data-action="edit" data-id="${book.id}">Editar</button>
              <button class="btn btn-sm btn-outline-danger" type="button" data-action="delete" data-id="${book.id}">Excluir</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function handleBookSubmit(event) {
  event.preventDefault();

  const bookData = {
    title: document.querySelector("#bookTitle").value.trim(),
    isbn: document.querySelector("#bookIsbn").value.trim(),
    authorId: document.querySelector("#bookAuthorId").value,
    categoryId: document.querySelector("#bookCategoryId").value,
    status: document.querySelector("#bookStatus").value,
    publishedYear: document.querySelector("#bookPublishedYear").value,
    note: document.querySelector("#bookNote").value,
    observation: document.querySelector("#bookObservation").value.trim(),
  };

  try {
    requireFields(bookData, ["title", "isbn", "authorId", "categoryId", "status", "publishedYear"]);
    requirePositiveYear(bookData.publishedYear);
    validateBookNote(bookData.note);
    bookData.note = bookData.note === "" ? null : Number(bookData.note);

    const bookId = document.querySelector("#bookId").value;

    if (bookId) {
      await updateBook(bookId, bookData);
      showToast("Livro atualizado com sucesso.");
    } else {
      await createBook(bookData);
      showToast("Livro cadastrado com sucesso.");
    }

    closeModal("bookModal");
    await refreshBookData();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function handleBookTableClick(event) {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const bookId = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "edit") {
    fillBookForm(bookId);
    openModal("bookModal");
  }

  if (action === "delete") {
    try {
      await deleteBook(bookId);
      showToast("Livro excluído com sucesso.");
      await refreshBookData();
    } catch (error) {
      showToast(error.message, "error");
    }
  }
}

function handleAddBookClick() {
  resetBookForm();
  openModal("bookModal");
}

function handleBookCancel() {
  closeModal("bookModal");
}

function fillBookForm(bookId) {
  const book = books.find((item) => item.id === bookId);

  if (!book) {
    showToast("Livro não encontrado.", "error");
    return;
  }

  document.querySelector("#bookFormTitle").textContent = "Editar livro";
  document.querySelector("#bookId").value = book.id;
  document.querySelector("#bookTitle").value = book.title;
  document.querySelector("#bookIsbn").value = book.isbn;
  document.querySelector("#bookAuthorId").value = book.authorId;
  document.querySelector("#bookCategoryId").value = book.categoryId;
  document.querySelector("#bookStatus").value = book.status;
  document.querySelector("#bookPublishedYear").value = book.publishedYear;
  document.querySelector("#bookNote").value = book.note ?? "";
  document.querySelector("#bookObservation").value = book.observation ?? "";
}

function resetBookForm() {
  document.querySelector("#bookFormTitle").textContent = "Novo livro";
  document.querySelector("#bookForm").reset();
  document.querySelector("#bookId").value = "";
}

function renderBookStatus(status) {
  const className = `status-badge status-badge-${getBookStatusStyle(status)}`;
  return `<span class="${className}">${BOOK_STATUS_LABELS[status] || status}</span>`;
}

function getBookStatusStyle(status) {
  const styles = {
    [BOOK_STATUS.NOT_READ]: "available",
    [BOOK_STATUS.READING]: "reading",
    [BOOK_STATUS.READ]: "returned",
  };

  return styles[status] || "available";
}

function validateBookNote(note) {
  if (note === "") {
    return;
  }

  const numericNote = Number(note);

  if (!Number.isFinite(numericNote) || numericNote < 0 || numericNote > 10) {
    throw new Error("A nota deve estar entre 0 e 10.");
  }
}

function openModal(modalId) {
  const modalElement = document.querySelector(`#${modalId}`);
  const Modal = getModalApi();

  if (Modal && modalElement) {
    Modal.getOrCreateInstance(modalElement).show();
    return;
  }

  showModalFallback(modalElement);
}

function closeModal(modalId) {
  const modalElement = document.querySelector(`#${modalId}`);
  const Modal = getModalApi();

  if (Modal && modalElement) {
    Modal.getOrCreateInstance(modalElement).hide();
    return;
  }

  hideModalFallback(modalElement);
}

function getModalApi() {
  return window.bootstrap?.Modal || window.tabler?.bootstrap?.Modal;
}

function showModalFallback(modalElement) {
  if (!modalElement) {
    return;
  }

  modalElement.classList.add("show");
  modalElement.style.display = "block";
  modalElement.removeAttribute("aria-hidden");
  document.body.classList.add("modal-open");
}

function hideModalFallback(modalElement) {
  if (!modalElement) {
    return;
  }

  modalElement.classList.remove("show");
  modalElement.style.display = "none";
  modalElement.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  modalElement.dispatchEvent(new Event("hidden.bs.modal"));
}
