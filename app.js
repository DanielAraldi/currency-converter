import { APIKey } from "./env.js";

const currencyOneEl = document.querySelector('[data-js="currency-one"]');
const currencyTwoEl = document.querySelector('[data-js="currency-two"]');
const currenciesEl = document.querySelector('[data-js="currencies-container"]');

const url = `https://v6.exchangerate-api.com/v6/${APIKey}/latest/USD`;

const getErrorMessage = (errorType) =>
  ({
    "unsupported-code": "A moeda não existe em nosso banco de dados",
    "base-code-only-on-pro":
      "A solicitação para o ponto de extremidade free.exchange-api.com foi para um código base diferente de USB ou EUR!",
    "malformed-request": "Sua solicitação não segue a estrutura da requisição!",
    "invalid-key": "Chave da API não é válida!",
    "quota-reached": "O número de solicitações do seu plano já foi alcançado!",
    "not-available-on-plan":
      "Nível do plano não compatível com esse tipo de solicitação!",
  }[errorType] || "Não foi possível obter as informações!");

const fetchExchangeRate = async () => {
  try {
    const response = await fetch(url);

    if (!response.ok)
      throw new Error(
        "Sua conexão falhou! Não foi possível obter as informações."
      );

    const exchangeRateData = await response.json();

    if (exchangeRateData.result === "error")
      throw new Error(getErrorMessage(exchangeRateData["error-type"]));

    return exchangeRateData;
  } catch (err) {
    const div = document.createElement("div");
    const button = document.createElement("button");

    div.textContent = err.message;
    div.classList.add(
      "alert",
      "alert-warning",
      "alert-dismissible",
      "fade",
      "show"
    );
    div.setAttribute("role", "alert");
    button.classList.add("btn-close");
    button.setAttribute("type", "button");
    button.setAttribute("aria-label", "Close");
    button.setAttribute("data-bs-dismiss", "alert");

    button.addEventListener("click", () => div.remove());

    div.appendChild(button);
    // Add alert after the currencies
    currenciesEl.insertAdjacentElement("afterend", div);
  }
};

const init = async () => {
  const exchangeRateData = await fetchExchangeRate();

  // Return name property of the object
  const getOptions = (selectedCurrency) =>
    Object.keys(exchangeRateData.conversion_rates)
      .map(
        (currency) =>
          `<option ${
            currency === selectedCurrency ? "selected" : ""
          }>${currency}</option>`
      )
      .join("");

  currencyOneEl.innerHTML = getOptions("USD");
  currencyTwoEl.innerHTML = getOptions("BRL");
};

init();
