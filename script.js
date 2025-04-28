// 貯金目標額と目的（localStorageから読み込むか、初期値としてnullを設定）
let goalAmount = localStorage.getItem("goalAmount")
  ? parseInt(localStorage.getItem("goalAmount"))
  : null;
let goalPurpose = localStorage.getItem("goalPurpose")
  ? localStorage.getItem("goalPurpose")
  : "";

// 貯金残高（localStorageから読み込むか、初期値として0を設定）
let currentBalance = localStorage.getItem("currentBalance")
  ? parseInt(localStorage.getItem("currentBalance"))
  : 0;

// 貯金と購入履歴を記録する配列（localStorageから読み込むか、初期値として空の配列を設定）
let transactions = localStorage.getItem("transactions")
  ? JSON.parse(localStorage.getItem("transactions"))
  : [];

// 要素の取得
const balanceElement = document.getElementById("balance");
const remainingElement = document.getElementById("remaining");
const purposeElement = document.getElementById("purpose");
const addDepositButton = document.getElementById("addDeposit");
const addPurchaseButton = document.getElementById("addPurchase");
const setGoalButton = document.getElementById("setGoal");
const goalAmountInput = document.getElementById("goalAmount");
const goalPurposeInput = document.getElementById("goalPurpose");
const historyElement = document.getElementById("history");

// 初期表示時に目標と残高を表示
updateGoalDisplay();
updateBalanceDisplay();
updateHistory();

// 目標設定ボタンの処理
setGoalButton.addEventListener("click", () => {
  const amountStr = goalAmountInput.value;
  const purpose = goalPurposeInput.value;
  let amount = null;
  if (amountStr.trim() !== "") {
    const parsedAmount = parseInt(amountStr);
    if (!isNaN(parsedAmount)) {
      amount = parsedAmount;
    }
  }
  goalAmount = amount;
  goalPurpose = purpose;
  saveData();
  updateGoalDisplay();
});

// 貯金を追加する処理
addDepositButton.addEventListener("click", () => {
  const date = document.getElementById("depositDate").value;
  const depositAmount = parseInt(
    document.getElementById("depositAmount").value
  );
  if (date && depositAmount) {
    currentBalance += depositAmount;
    transactions.push({ date, amount: depositAmount, type: "deposit" });
    saveData();
    updateBalanceDisplay();
    updateHistory();
    clearInputFields("deposit");
  }
});

// 購入履歴を追加する処理
addPurchaseButton.addEventListener("click", () => {
  const date = document.getElementById("purchaseDate").value;
  const item = document.getElementById("purchaseItem").value;
  const purchaseAmount = parseInt(
    document.getElementById("purchaseAmount").value
  );
  if (date && item && purchaseAmount) {
    currentBalance -= purchaseAmount;
    transactions.push({ date, item, amount: purchaseAmount, type: "purchase" });
    saveData();
    updateBalanceDisplay();
    updateHistory();
    clearInputFields("purchase");
  }
});

// 入力欄をクリアする処理
function clearInputFields(type) {
  if (type === "deposit") {
    document.getElementById("depositDate").value = "";
    document.getElementById("depositAmount").value = "";
  } else if (type === "purchase") {
    document.getElementById("purchaseDate").value = "";
    document.getElementById("purchaseItem").value = "";
    document.getElementById("purchaseAmount").value = "";
  }
}

// 目標と残り金額の表示を更新する処理
function updateGoalDisplay() {
  if (goalAmount !== null) {
    const remainingAmount = goalAmount - currentBalance;
    remainingElement.textContent =
      remainingAmount >= 0 ? remainingAmount + "円" : "達成！";
  } else {
    remainingElement.textContent = "未設定";
  }
  purposeElement.textContent = goalPurpose || "未設定";
  goalAmountInput.value = goalAmount !== null ? goalAmount : "";
  goalPurposeInput.value = goalPurpose;
  localStorage.setItem("goalAmount", goalAmount);
  localStorage.setItem("goalPurpose", goalPurpose);
}

// 貯金残高の表示を更新する処理
function updateBalanceDisplay() {
  balanceElement.textContent = currentBalance + "円";
  localStorage.setItem("currentBalance", currentBalance);
  updateGoalDisplay(); // 残り金額も更新
}

// 履歴を表示する処理
function updateHistory() {
  historyElement.innerHTML = "";
  transactions.forEach((transaction, index) => {
    const item = document.createElement("li");
    let text = "";
    if (transaction.type === "deposit") {
      text = `${transaction.date} に ${
        transaction.amount
      }円 貯金 (残高: ${getTransactionBalance(index)}円)`;
    } else {
      text = `${transaction.date} に ${transaction.item} を ${
        transaction.amount
      }円 で購入 (残高: ${getTransactionBalance(index)}円)`;
    }
    item.textContent = text;

    // 削除ボタンを追加
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "削除";
    deleteButton.addEventListener("click", () => {
      removeTransaction(index);
    });
    item.appendChild(deleteButton);

    historyElement.appendChild(item);
  });
}

// 各取引後の残高を計算する関数
function getTransactionBalance(index) {
  let balance = localStorage.getItem("currentBalance")
    ? parseInt(localStorage.getItem("currentBalance"))
    : 0;
  for (let i = transactions.length - 1; i >= 0; i--) {
    if (i <= index) {
      if (transactions[i].type === "deposit") {
        balance -= transactions[i].amount;
      } else {
        balance += transactions[i].amount;
      }
    }
  }
  return balance;
}

// 履歴を削除する処理
function removeTransaction(index) {
  const removedTransaction = transactions.splice(index, 1)[0];
  if (removedTransaction.type === "deposit") {
    currentBalance -= removedTransaction.amount;
  } else {
    currentBalance += removedTransaction.amount;
  }
  saveData();
  updateBalanceDisplay();
  updateHistory();
}

// データをlocalStorageに保存する関数
function saveData() {
  localStorage.setItem("currentBalance", currentBalance);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("goalAmount", goalAmount);
  localStorage.setItem("goalPurpose", goalPurpose);
}
