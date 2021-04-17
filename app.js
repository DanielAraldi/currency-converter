import { APIKey } from "./env.js";

const currencyOneEl = document.querySelector('[data-js="currency-one"]');
const currencyTwoEl = document.querySelector('[data-js="currency-two"]');
const currenciesEl = document.querySelector('[data-js="currencies-container"]');
const convertedValueEl = document.querySelector('[data-js="converted-value"]');
const valuePrecisionEl = document.querySelector(
  '[data-js="conversion-precision"]'
);
const timesCurrencyOneEl = document.querySelector(
  '[data-js="currency-one-times"]'
);

let internalExchangeRate = {};

const getUrl = (currency) =>
  `https://v6.exchangerate-api.com/v6/${APIKey}/latest/${currency}`;

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

const showAlert = (err) => {
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
};

const fetchExchangeRate = async (url) => {
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
    showAlert(err);
  }
};

const init = async () => {
  internalExchangeRate = { ...(await fetchExchangeRate(getUrl("USD"))) };

  if (internalExchangeRate.conversion_rates) {
    // Return name property of the object
    const getOptions = (selectedCurrency) =>
      Object.keys(internalExchangeRate.conversion_rates)
        .map(
          (currency) =>
            `<option ${
              currency === selectedCurrency ? "selected" : ""
            }>${currency}</option>`
        )
        .join("");

    currencyOneEl.innerHTML = getOptions("USD");
    currencyTwoEl.innerHTML = getOptions("BRL");

    convertedValueEl.textContent = internalExchangeRate.conversion_rates.BRL.toFixed(
      2
    );
    valuePrecisionEl.textContent = `1 USD = ${internalExchangeRate.conversion_rates.BRL} BRL`;
  }
};

timesCurrencyOneEl.addEventListener("input", (e) => {
  convertedValueEl.textContent = (
    e.target.value * internalExchangeRate.conversion_rates[currencyTwoEl.value]
  ).toFixed(2);
});

currencyTwoEl.addEventListener("input", (e) => {
  const currencyTwoValue =
    internalExchangeRate.conversion_rates[e.target.value];

  convertedValueEl.textContent = (
    timesCurrencyOneEl.value * currencyTwoValue
  ).toFixed(2);

  valuePrecisionEl.textContent = `1 ${currencyOneEl.value} = ${
    1 * internalExchangeRate.conversion_rates[currencyTwoEl.value]
  } ${currencyTwoEl.value}`;
});

currencyOneEl.addEventListener("input", async (e) => {
  internalExchangeRate = {
    ...(await fetchExchangeRate(getUrl(e.target.value))),
  };

  convertedValueEl.textContent = (
    timesCurrencyOneEl.value *
    internalExchangeRate.conversion_rates[currencyTwoEl.value]
  ).toFixed(2);
  valuePrecisionEl.textContent = `1 ${currencyOneEl.value} = ${
    1 * internalExchangeRate.conversion_rates[currencyTwoEl.value]
  } ${currencyTwoEl.value}`;
});

init();
