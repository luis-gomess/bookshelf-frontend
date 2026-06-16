const menuItems = [
  { key: "dashboard", label: "Dashboard", href: "index.html", icon: "D" },
  { key: "books", label: "Livros", href: "pages/books.html", icon: "L" },
  { key: "authors", label: "Autores", href: "pages/authors.html", icon: "A" },
  { key: "categories", label: "Categorias", href: "pages/categories.html", icon: "C" },
  { key: "loans", label: "Empréstimos", href: "pages/loans.html", icon: "E" },
];

export function renderSidebar(activeKey, basePath = ".") {
  const sidebar = document.querySelector("#sidebar");

  if (!sidebar) {
    return;
  }

  const prefix = basePath === "." ? "." : "..";

  sidebar.innerHTML = `
    <div class="sidebar-top">
      <div class="brand">
        <span class="brand-mark">EP</span>
        <span class="brand-text">Estante Pessoal</span>
      </div>
      <button class="sidebar-toggle" type="button" id="sidebarToggleButton" aria-label="Recolher menu">☰</button>
      <button class="sidebar-close" type="button" id="sidebarCloseButton" aria-label="Fechar menu">×</button>
    </div>
    <nav aria-label="Menu principal">
      <ul class="nav-list">
        ${menuItems
          .map((item) => {
            const href = item.key === "dashboard" ? `${prefix}/index.html` : `${prefix}/${item.href}`;
            const activeClass = item.key === activeKey ? " is-active" : "";

            return `
              <li>
                <a class="nav-link${activeClass}" href="${href}">
                  <span class="nav-icon" aria-hidden="true">${item.icon}</span>
                  <span class="sidebar-text">${item.label}</span>
                </a>
              </li>
            `;
          })
          .join("")}
      </ul>
    </nav>
  `;

  ensureMobileSidebarButton();
  ensureSidebarOverlay();
  bindSidebarEvents(sidebar);
}

function ensureMobileSidebarButton() {
  if (document.querySelector("#mobileSidebarButton")) {
    return;
  }

  const pageHeader = document.querySelector(".page-header");

  if (!pageHeader) {
    return;
  }

  const button = document.createElement("button");
  button.className = "mobile-sidebar-button";
  button.type = "button";
  button.id = "mobileSidebarButton";
  button.setAttribute("aria-label", "Abrir menu");
  button.textContent = "☰";
  pageHeader.prepend(button);
}

function ensureSidebarOverlay() {
  if (document.querySelector(".sidebar-overlay")) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "sidebar-overlay";
  overlay.setAttribute("aria-hidden", "true");
  document.body.appendChild(overlay);
}

function bindSidebarEvents(sidebar) {
  const toggleButton = sidebar.querySelector("#sidebarToggleButton");
  const mobileButton = document.querySelector("#mobileSidebarButton");
  const closeButton = sidebar.querySelector("#sidebarCloseButton");
  const overlay = document.querySelector(".sidebar-overlay");
  const navLinks = sidebar.querySelectorAll(".nav-link");

  toggleButton?.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-collapsed");
  });

  mobileButton?.addEventListener("click", () => {
    document.body.classList.add("mobile-sidebar-open");
  });

  closeButton?.addEventListener("click", closeMobileSidebar);
  overlay?.addEventListener("click", closeMobileSidebar);

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMobileSidebar);
  });
}

function closeMobileSidebar() {
  document.body.classList.remove("mobile-sidebar-open");
}
