import { renderSidebar } from "../components/sidebar.js";
import { showToast } from "../components/toast.js";
import { getBooks } from "../services/bookService.js";
import { getAuthors } from "../services/authorService.js";
import { getCategories } from "../services/categoryService.js";
import { getLoans } from "../services/loanService.js";
import { BOOK_STATUS, BOOK_STATUS_LABELS, LOAN_STATUS } from "../constants/status.js";
import { escapeHtml, formatDate } from "../utils/formatters.js";

document.addEventListener("DOMContentLoaded", initDashboard);

async function initDashboard() {
  renderSidebar("dashboard", ".");

  try {
    const [books, authors, categories, loans] = await Promise.all([
      getBooks(),
      getAuthors(),
      getCategories(),
      getLoans(),
    ]);

    renderSummaryCards({ books, authors, categories, loans });
    renderRecentBooks(books, authors, categories);
    renderActiveLoans(loans, books);
  } catch (error) {
    showToast(error.message, "error");
  }
}

function renderSummaryCards({ books, authors, categories, loans }) {
  const summaryCards = document.querySelector("#summaryCards");
  const activeLoans = loans.filter((loan) => loan.status === LOAN_STATUS.BORROWED).length;

  summaryCards.innerHTML = [
    { label: "Livros", value: books.length },
    { label: "Autores", value: authors.length },
    { label: "Categorias", value: categories.length },
    { label: "Empréstimos ativos", value: activeLoans },
  ]
    .map(
      (item) => `
        <article class="summary-card">
          <span class="text-secondary">${item.label}</span>
          <strong class="summary-value">${item.value}</strong>
        </article>
      `,
    )
    .join("");
}

function renderRecentBooks(books, authors, categories) {
  const table = document.querySelector("#recentBooksTable");
  const rows = books.slice(-5).reverse();

  if (!rows.length) {
    table.innerHTML = `<tr><td class="empty-row" colspan="4">Nenhum livro cadastrado.</td></tr>`;
    return;
  }

  table.innerHTML = rows
    .map((book) => {
      const author = authors.find((item) => item.id === book.authorId);
      const category = categories.find((item) => item.id === book.categoryId);

      return `
        <tr>
          <td>${escapeHtml(book.title)}</td>
          <td>${escapeHtml(book.authorName || author?.name || "-")}</td>
          <td>${escapeHtml(book.categoryName || category?.name || "-")}</td>
          <td><span class="status-badge status-badge-${getBookStatusStyle(book.status)}">${BOOK_STATUS_LABELS[book.status] || book.status}</span></td>
        </tr>
      `;
    })
    .join("");
}

function renderActiveLoans(loans, books) {
  const table = document.querySelector("#activeLoansTable");
  const rows = loans.filter((loan) => loan.status === LOAN_STATUS.BORROWED);

  if (!rows.length) {
    table.innerHTML = `<tr><td class="empty-row" colspan="3">Nenhum empréstimo ativo.</td></tr>`;
    return;
  }

  table.innerHTML = rows
    .map((loan) => {
      const book = books.find((item) => item.id === loan.bookId);

      return `
        <tr>
          <td>${escapeHtml(book?.title || "-")}</td>
          <td>${escapeHtml(loan.borrowerName)}</td>
          <td>${formatDate(loan.loanDate)}</td>
        </tr>
      `;
    })
    .join("");
}

function getBookStatusStyle(status) {
  const styles = {
    [BOOK_STATUS.NOT_READ]: "available",
    [BOOK_STATUS.READING]: "reading",
    [BOOK_STATUS.READ]: "returned",
  };

  return styles[status] || "available";
}
