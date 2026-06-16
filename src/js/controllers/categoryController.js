import { renderSidebar } from "../components/sidebar.js";
import { showToast } from "../components/toast.js";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../services/categoryService.js";
import { escapeHtml, formatText } from "../utils/formatters.js";
import { requireFields } from "../utils/validators.js";

let categories = [];

document.addEventListener("DOMContentLoaded", initCategoryPage);

async function initCategoryPage() {
  renderSidebar("categories", "..");
  bindCategoryEvents();
  await refreshCategories();
}

function bindCategoryEvents() {
  document.querySelector("#addCategoryButton").addEventListener("click", handleAddCategoryClick);
  document.querySelector("#categoryForm").addEventListener("submit", handleCategorySubmit);
  document.querySelector("#categoryCancelButton").addEventListener("click", handleCategoryCancel);
  document.querySelector("#categoriesTable").addEventListener("click", handleCategoryTableClick);
  document.querySelector("#categoryModal").addEventListener("hidden.bs.modal", resetCategoryForm);
}

async function refreshCategories() {
  categories = await getCategories();
  renderCategories();
}

function renderCategories() {
  const table = document.querySelector("#categoriesTable");

  if (!categories.length) {
    table.innerHTML = `<tr><td class="empty-row" colspan="4">Nenhuma categoria cadastrada.</td></tr>`;
    return;
  }

  table.innerHTML = categories
    .map(
      (category) => `
        <tr>
          <td>${escapeHtml(category.name)}</td>
          <td>${escapeHtml(formatText(category.description))}</td>
          <td><span class="color-swatch" style="background:${escapeHtml(category.color)}"></span> ${escapeHtml(category.color)}</td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-sm btn-outline-primary" type="button" data-action="edit" data-id="${category.id}">Editar</button>
              <button class="btn btn-sm btn-outline-danger" type="button" data-action="delete" data-id="${category.id}">Excluir</button>
            </div>
          </td>
        </tr>
      `,
    )
    .join("");
}

async function handleCategorySubmit(event) {
  event.preventDefault();

  const categoryData = {
    name: document.querySelector("#categoryName").value.trim(),
    color: document.querySelector("#categoryColor").value,
    description: document.querySelector("#categoryDescription").value.trim(),
  };

  try {
    requireFields(categoryData, ["name", "color"]);

    const categoryId = document.querySelector("#categoryId").value;

    if (categoryId) {
      await updateCategory(categoryId, categoryData);
      showToast("Categoria atualizada com sucesso.");
    } else {
      await createCategory(categoryData);
      showToast("Categoria cadastrada com sucesso.");
    }

    closeModal("categoryModal");
    await refreshCategories();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function handleCategoryTableClick(event) {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const categoryId = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "edit") {
    fillCategoryForm(categoryId);
    openModal("categoryModal");
  }

  if (action === "delete") {
    await deleteCategory(categoryId);
    showToast("Categoria excluída com sucesso.");
    await refreshCategories();
  }
}

function handleAddCategoryClick() {
  resetCategoryForm();
  openModal("categoryModal");
}

function handleCategoryCancel() {
  closeModal("categoryModal");
}

function fillCategoryForm(categoryId) {
  const category = categories.find((item) => item.id === categoryId);

  if (!category) {
    showToast("Categoria não encontrada.", "error");
    return;
  }

  document.querySelector("#categoryFormTitle").textContent = "Editar categoria";
  document.querySelector("#categoryId").value = category.id;
  document.querySelector("#categoryName").value = category.name;
  document.querySelector("#categoryColor").value = category.color;
  document.querySelector("#categoryDescription").value = category.description;
}

function resetCategoryForm() {
  document.querySelector("#categoryFormTitle").textContent = "Nova categoria";
  document.querySelector("#categoryForm").reset();
  document.querySelector("#categoryColor").value = "#2563eb";
  document.querySelector("#categoryId").value = "";
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
