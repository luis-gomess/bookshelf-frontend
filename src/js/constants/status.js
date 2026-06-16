export const BOOK_STATUS = {
  AVAILABLE: "available",
  READING: "reading",
  LOANED: "loaned",
};

export const LOAN_STATUS = {
  ACTIVE: "active",
  RETURNED: "returned",
  LATE: "late",
};

export const BOOK_STATUS_LABELS = {
  [BOOK_STATUS.AVAILABLE]: "Disponível",
  [BOOK_STATUS.READING]: "Lendo",
  [BOOK_STATUS.LOANED]: "Emprestado",
};

export const LOAN_STATUS_LABELS = {
  [LOAN_STATUS.ACTIVE]: "Ativo",
  [LOAN_STATUS.RETURNED]: "Devolvido",
  [LOAN_STATUS.LATE]: "Atrasado",
};
