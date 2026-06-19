import { get, post, put, remove } from "../api/httpClient.js";

export async function getLoans() {
  const loans = await get("/emprestimos");
  return loans.map(mapLoanFromApi);
}

export async function getLoanById(id) {
  return mapLoanFromApi(await get(`/emprestimos/${id}`));
}

export async function createLoan(loanData) {
  return mapLoanFromApi(await post("/emprestimos", mapLoanToApi(loanData)));
}

export async function updateLoan(id, loanData) {
  const currentLoan = await getLoanById(id);

  if (!currentLoan) {
    throw new Error("Empréstimo não encontrado.");
  }

  const updatedLoan = {
    ...currentLoan,
    ...loanData,
    id: Number(id),
  };

  return mapLoanFromApi(await put(`/emprestimos/${id}`, mapLoanToApi(updatedLoan)));
}

export async function returnLoan() {
  throw new Error(
    "A devolução ainda não está disponível porque o backend não aceita status e data de devolução no PUT atual.",
  );
}

export async function deleteLoan(id) {
  return remove(`/emprestimos/${id}`);
}

function mapLoanFromApi(loan) {
  if (!loan) {
    return null;
  }

  return {
    id: loan.id,
    bookId: loan.livro?.id ?? loan.livroId ?? null,
    borrowerName: loan.nomePessoa,
    loanDate: loan.dataEmprestimo,
    dueDate: loan.dataDevolucaoPrevista,
    returnDate: loan.dataDevolucaoReal ?? null,
    status: loan.statusEmprestimo,
  };
}

function mapLoanToApi(loanData) {
  return {
    livroId: Number(loanData.bookId),
    nomePessoa: loanData.borrowerName,
    dataEmprestimo: loanData.loanDate,
    dataDevolucaoPrevista: loanData.dueDate,
  };
}
