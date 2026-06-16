import { renderSidebar } from "../components/sidebar.js";
import { showToast } from "../components/toast.js";
import { createAuthor, deleteAuthor, getAuthors, updateAuthor } from "../services/authorService.js";
import { escapeHtml, formatText } from "../utils/formatters.js";
import { requireFields } from "../utils/validators.js";

let authors = [];

document.addEventListener("DOMContentLoaded", initAuthorPage);

async function initAuthorPage() {
  renderSidebar("authors", "..");
  bindAuthorEvents();
  await refreshAuthors();
}

function bindAuthorEvents() {
  document.querySelector("#addAuthorButton").addEventListener("click", handleAddAuthorClick);
  document.querySelector("#authorForm").addEventListener("submit", handleAuthorSubmit);
  document.querySelector("#authorCancelButton").addEventListener("click", handleAuthorCancel);
  document.querySelector("#authorsTable").addEventListener("click", handleAuthorTableClick);
  document.querySelector("#authorModal").addEventListener("hidden.bs.modal", resetAuthorForm);
}

async function refreshAuthors() {
  authors = await getAuthors();
  renderAuthors();
}

function renderAuthors() {
  const table = document.querySelector("#authorsTable");

  if (!authors.length) {
    table.innerHTML = `<tr><td class="empty-row" colspan="4">Nenhum autor cadastrado.</td></tr>`;
    return;
  }

  table.innerHTML = authors
    .map(
      (author) => `
        <tr>
          <td>${escapeHtml(author.name)}</td>
          <td>${escapeHtml(author.country)}</td>
          <td>${escapeHtml(formatText(author.notes))}</td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-sm btn-outline-primary" type="button" data-action="edit" data-id="${author.id}">Editar</button>
              <button class="btn btn-sm btn-outline-danger" type="button" data-action="delete" data-id="${author.id}">Excluir</button>
            </div>
          </td>
        </tr>
      `,
    )
    .join("");
}

async function handleAuthorSubmit(event) {
  event.preventDefault();

  const authorData = {
    name: document.querySelector("#authorName").value.trim(),
    country: document.querySelector("#authorCountry").value.trim(),
    notes: document.querySelector("#authorNotes").value.trim(),
  };

  try {
    requireFields(authorData, ["name", "country"]);

    const authorId = document.querySelector("#authorId").value;

    if (authorId) {
      await updateAuthor(authorId, authorData);
      showToast("Autor atualizado com sucesso.");
    } else {
      await createAuthor(authorData);
      showToast("Autor cadastrado com sucesso.");
    }

    closeModal("authorModal");
    await refreshAuthors();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function handleAuthorTableClick(event) {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const authorId = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "edit") {
    fillAuthorForm(authorId);
    openModal("authorModal");
  }

  if (action === "delete") {
    await deleteAuthor(authorId);
    showToast("Autor excluído com sucesso.");
    await refreshAuthors();
  }
}

function handleAddAuthorClick() {
  resetAuthorForm();
  openModal("authorModal");
}

function handleAuthorCancel() {
  closeModal("authorModal");
}

function fillAuthorForm(authorId) {
  const author = authors.find((item) => item.id === authorId);

  if (!author) {
    showToast("Autor não encontrado.", "error");
    return;
  }

  document.querySelector("#authorFormTitle").textContent = "Editar autor";
  document.querySelector("#authorId").value = author.id;
  document.querySelector("#authorName").value = author.name;
  document.querySelector("#authorCountry").value = author.country;
  document.querySelector("#authorNotes").value = author.notes;
}

function resetAuthorForm() {
  document.querySelector("#authorFormTitle").textContent = "Novo autor";
  document.querySelector("#authorForm").reset();
  document.querySelector("#authorId").value = "";
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
