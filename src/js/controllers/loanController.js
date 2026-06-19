import { renderSidebar } from "../components/sidebar.js";
import { showToast } from "../components/toast.js";
import { getBooks } from "../services/bookService.js";
import { createLoan, deleteLoan, getLoans, returnLoan, updateLoan } from "../services/loanService.js";
import { LOAN_STATUS, LOAN_STATUS_LABELS } from "../constants/status.js";
import { escapeHtml, formatDate } from "../utils/formatters.js";
import { requireDateOrder, requireFields } from "../utils/validators.js";

let books = [];
let loans = [];

document.addEventListener("DOMContentLoaded", initLoanPage);

async function initLoanPage() {
  renderSidebar("loans", "..");
  bindLoanEvents();

  try {
    await refreshLoanData();
  } catch (error) {
    showToast(error.message, "error");
  }
}

function bindLoanEvents() {
  document.querySelector("#addLoanButton").addEventListener("click", handleAddLoanClick);
  document.querySelector("#loanForm").addEventListener("submit", handleLoanSubmit);
  document.querySelector("#loanCancelButton").addEventListener("click", handleLoanCancel);
  document.querySelector("#loansTable").addEventListener("click", handleLoanTableClick);
  document.querySelector("#loanModal").addEventListener("hidden.bs.modal", resetLoanForm);
}

async function refreshLoanData() {
  [books, loans] = await Promise.all([getBooks(), getLoans()]);
  renderLoanOptions();
  renderLoans();
}

function renderLoanOptions() {
  document.querySelector("#loanBookId").innerHTML = books
    .map((book) => `<option value="${book.id}">${escapeHtml(book.title)}</option>`)
    .join("");
}

function renderLoans() {
  const table = document.querySelector("#loansTable");

  if (!loans.length) {
    table.innerHTML = `<tr><td class="empty-row" colspan="6">Nenhum empréstimo cadastrado.</td></tr>`;
    return;
  }

  table.innerHTML = loans
    .map((loan) => {
      const book = books.find((item) => item.id === loan.bookId);
      const canReturn = loan.status !== LOAN_STATUS.RETURNED;

      return `
        <tr>
          <td>${escapeHtml(book?.title || "-")}</td>
          <td>${escapeHtml(loan.borrowerName)}</td>
          <td>${formatDate(loan.loanDate)}</td>
          <td>${formatDate(loan.dueDate)}</td>
          <td>${renderLoanStatus(loan.status)}</td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-sm btn-outline-primary" type="button" data-action="edit" data-id="${loan.id}">Editar</button>
              <button class="btn btn-sm btn-outline-success" type="button" data-action="return" data-id="${loan.id}" ${canReturn ? "" : "disabled"}>Devolver</button>
              <button class="btn btn-sm btn-outline-danger" type="button" data-action="delete" data-id="${loan.id}">Excluir</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function handleLoanSubmit(event) {
  event.preventDefault();

  const loanData = {
    bookId: document.querySelector("#loanBookId").value,
    borrowerName: document.querySelector("#loanBorrowerName").value.trim(),
    loanDate: document.querySelector("#loanDate").value,
    dueDate: document.querySelector("#loanDueDate").value,
  };

  try {
    requireFields(loanData, ["bookId", "borrowerName", "loanDate", "dueDate"]);
    requireDateOrder(loanData.loanDate, loanData.dueDate);

    const loanId = document.querySelector("#loanId").value;

    if (loanId) {
      await updateLoan(loanId, loanData);
      showToast("Empréstimo atualizado com sucesso.");
    } else {
      await createLoan(loanData);
      showToast("Empréstimo cadastrado com sucesso.");
    }

    closeModal("loanModal");
    await refreshLoanData();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function handleLoanTableClick(event) {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const loanId = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "edit") {
    fillLoanForm(loanId);
    openModal("loanModal");
  }

  if (action === "return") {
    try {
      await returnLoan(loanId);
      showToast("Empréstimo marcado como devolvido.");
      await refreshLoanData();
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  if (action === "delete") {
    try {
      await deleteLoan(loanId);
      showToast("Empréstimo excluído com sucesso.");
      await refreshLoanData();
    } catch (error) {
      showToast(error.message, "error");
    }
  }
}

function handleAddLoanClick() {
  resetLoanForm();
  openModal("loanModal");
}

function handleLoanCancel() {
  closeModal("loanModal");
}

function fillLoanForm(loanId) {
  const loan = loans.find((item) => item.id === loanId);

  if (!loan) {
    showToast("Empréstimo não encontrado.", "error");
    return;
  }

  document.querySelector("#loanFormTitle").textContent = "Editar empréstimo";
  document.querySelector("#loanId").value = loan.id;
  document.querySelector("#loanBookId").value = loan.bookId;
  document.querySelector("#loanBorrowerName").value = loan.borrowerName;
  document.querySelector("#loanDate").value = loan.loanDate;
  document.querySelector("#loanDueDate").value = loan.dueDate;
}

function resetLoanForm() {
  document.querySelector("#loanFormTitle").textContent = "Novo empréstimo";
  document.querySelector("#loanForm").reset();
  document.querySelector("#loanId").value = "";
}

function renderLoanStatus(status) {
  const style = status === LOAN_STATUS.RETURNED ? "returned" : "active";
  return `<span class="status-badge status-badge-${style}">${LOAN_STATUS_LABELS[status] || status}</span>`;
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
