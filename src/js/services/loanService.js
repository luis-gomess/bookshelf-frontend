import { apiConfig } from "../config/apiConfig.js";
import { get, post, put, remove } from "../api/httpClient.js";
import { BOOK_STATUS, LOAN_STATUS } from "../constants/status.js";
import { updateBookStatus } from "./bookService.js";

let loans = [
  { id: 1, bookId: 3, borrowerName: "Carla Souza", loanDate: "2026-06-01", dueDate: "2026-06-20", status: LOAN_STATUS.ACTIVE },
  { id: 2, bookId: 1, borrowerName: "Rafael Lima", loanDate: "2026-05-10", dueDate: "2026-05-30", status: LOAN_STATUS.RETURNED },
];

let nextLoanId = 3;

export async function getLoans() {
  if (!apiConfig.useMocks) {
    return get("/loans");
  }

  return [...loans];
}

export async function getLoanById(id) {
  if (!apiConfig.useMocks) {
    return get(`/loans/${id}`);
  }

  return loans.find((loan) => loan.id === Number(id)) || null;
}

export async function createLoan(loanData) {
  if (!apiConfig.useMocks) {
    return post("/loans", loanData);
  }

  const loan = {
    id: nextLoanId,
    ...loanData,
    bookId: Number(loanData.bookId),
  };

  nextLoanId += 1;
  loans.push(loan);

  if (loan.status === LOAN_STATUS.ACTIVE || loan.status === LOAN_STATUS.LATE) {
    await updateBookStatus(loan.bookId, BOOK_STATUS.LOANED);
  }

  return loan;
}

export async function updateLoan(id, loanData) {
  if (!apiConfig.useMocks) {
    return put(`/loans/${id}`, loanData);
  }

  const index = loans.findIndex((loan) => loan.id === Number(id));

  if (index < 0) {
    throw new Error("Empréstimo não encontrado.");
  }

  loans[index] = {
    ...loans[index],
    ...loanData,
    id: Number(id),
    bookId: Number(loanData.bookId),
  };

  if (loans[index].status === LOAN_STATUS.RETURNED) {
    await updateBookStatus(loans[index].bookId, BOOK_STATUS.AVAILABLE);
  }

  return loans[index];
}

export async function returnLoan(id) {
  const loan = await getLoanById(id);

  if (!loan) {
    throw new Error("Empréstimo não encontrado.");
  }

  return updateLoan(id, {
    ...loan,
    status: LOAN_STATUS.RETURNED,
  });
}

export async function deleteLoan(id) {
  if (!apiConfig.useMocks) {
    return remove(`/loans/${id}`);
  }

  loans = loans.filter((loan) => loan.id !== Number(id));
  return true;
}
