export function requireFields(data, fields) {
  const missingField = fields.find((field) => !String(data[field] ?? "").trim());

  if (missingField) {
    throw new Error("Preencha todos os campos obrigatórios.");
  }
}

export function requirePositiveYear(year) {
  const parsedYear = Number(year);

  if (!Number.isInteger(parsedYear) || parsedYear < 0 || parsedYear > 2100) {
    throw new Error("Informe um ano válido.");
  }
}

export function requireDateOrder(startDate, endDate) {
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new Error("A data de devolução deve ser posterior ao empréstimo.");
  }
}
