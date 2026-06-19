export const BOOK_STATUS = {
  NOT_READ: "NAO_LIDO",
  READING: "LENDO",
  READ: "LIDO",
};

export const LOAN_STATUS = {
  BORROWED: "EMPRESTADO",
  RETURNED: "DEVOLVIDO",
};

export const BOOK_STATUS_LABELS = {
  [BOOK_STATUS.NOT_READ]: "Não lido",
  [BOOK_STATUS.READING]: "Lendo",
  [BOOK_STATUS.READ]: "Lido",
};

export const LOAN_STATUS_LABELS = {
  [LOAN_STATUS.BORROWED]: "Emprestado",
  [LOAN_STATUS.RETURNED]: "Devolvido",
};
