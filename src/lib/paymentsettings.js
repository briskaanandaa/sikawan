const API_URL = "/api/sikawan/bacs-accounts";
const HEADERS = {
  "X-Sikawan-Key": "sikawan-secret-2024",
  "Content-Type": "application/json",
};

/**
 * GET all bank accounts
 * @returns {Promise<Array>} list of bank accounts
 */
export async function getBankAccounts() {
  const res = await fetch(API_URL, {
    method: "GET",
    headers: HEADERS,
  });
  if (!res.ok) throw new Error(`Failed to fetch accounts: ${res.statusText}`);
  return res.json();
}

/**
 * GET single bank account by ID
 * @param {string|number} id
 * @returns {Promise<Object>}
 */
export async function getBankAccount(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: HEADERS,
  });
  if (!res.ok) throw new Error(`Failed to fetch account: ${res.statusText}`);
  return res.json();
}

/**
 * POST create a new bank account
 * @param {Object} data
 * @param {string} data.account_name
 * @param {string} data.account_number
 * @param {string} data.bank_name
 * @param {string} [data.sort_code]
 * @param {string} [data.iban]
 * @param {string} [data.bic]
 * @returns {Promise<Object>} created account
 */
export async function createBankAccount(data) {
  const payload = {
    account_name: data.account_name,
    account_number: data.account_number,
    bank_name: data.bank_name,
    sort_code: data.sort_code || "",
    iban: data.iban || "",
    bic: data.bic || "",
  };
  const res = await fetch(API_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create account: ${res.statusText}`);
  return res.json();
}

/**
 * PUT update an existing bank account
 * @param {string|number} id
 * @param {Object} data
 * @returns {Promise<Object>} updated account
 */
export async function updateBankAccount(id, data) {
  const payload = {
    account_name: data.account_name,
    account_number: data.account_number,
    bank_name: data.bank_name,
    sort_code: data.sort_code || "",
    iban: data.iban || "",
    bic: data.bic || "",
  };
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: HEADERS,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update account: ${res.statusText}`);
  return res.json();
}

/**
 * DELETE a bank account
 * @param {string|number} id
 * @returns {Promise<Object>} deletion result
 */
export async function deleteBankAccount(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: HEADERS,
  });
  if (!res.ok) throw new Error(`Failed to delete account: ${res.statusText}`);
  return res.json();
}