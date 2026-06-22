const SAVE_KEY = "idleRamenShopSave";
const MAX_VISIBLE_CUSTOMERS = 5;
const BASE_MENU_ID = "base";

const MENU_CONFIG = [
  {
    id: "shoyu",
    name: "醤油ラーメン",
    cost: 80,
    multiplier: 1.2,
    description: "定番の味。まずは看板メニューを増やします。"
  },
  {
    id: "miso",
    name: "味噌ラーメン",
    cost: 220,
    multiplier: 1.6,
    description: "濃厚な味で客単価が上がります。"
  },
  {
    id: "tonkotsu",
    name: "豚骨ラーメン",
    cost: 620,
    multiplier: 2.2,
    description: "人気の一杯。解放すると売上が大きく伸びます。"
  }
];

const BASE_MENU = {
  id: BASE_MENU_ID,
  name: "屋台ラーメン",
  multiplier: 1
};

const initialState = {
  money: 0,
  equipmentLevel: 1,
  totalRamenMade: 0,
  unlockedMenus: [],
  selectedMenuId: BASE_MENU_ID,
  lastSavedAt: Date.now()
};

let state = { ...initialState, unlockedMenus: [...initialState.unlockedMenus] };
let messageTimer = null;
let bubbleIndex = 0;

const bubbleMessages = [
  "いらっしゃいませ！",
  "あつあつをお願いします！",
  "いい香りですね",
  "替え玉もほしいです",
  "この店、流行りそう！",
  "また来ます！"
];

const moneyElement = document.getElementById("money");
const incomeElement = document.getElementById("incomePerSecond");
const equipmentLevelElement = document.getElementById("equipmentLevel");
const multiplierElement = document.getElementById("multiplier");
const customerCountElement = document.getElementById("customerCount");
const selectedMenuNameElement = document.getElementById("selectedMenuName");
const selectedMenuInfoElement = document.getElementById("selectedMenuInfo");
const upgradeInfoElement = document.getElementById("upgradeInfo");
const customerInfoElement = document.getElementById("customerInfo");
const messageElement = document.getElementById("message");
const speechBubbleElement = document.getElementById("speechBubble");
const customerStageElement = document.getElementById("customerStage");
const menuListElement = document.getElementById("menuList");
const makeRamenButton = document.getElementById("makeRamenButton");
const upgradeButton = document.getElementById("upgradeButton");
const saveButton = document.getElementById("saveButton");
const loadButton = document.getElementById("loadButton");
const resetButton = document.getElementById("resetButton");

function getEquipmentMultiplier() {
  return 1 + (state.equipmentLevel - 1) * 0.5;
}

function getSelectedMenu() {
  return MENU_CONFIG.find((menu) => menu.id === state.selectedMenuId) || BASE_MENU;
}

function isMenuUnlocked(menuId) {
  return state.unlockedMenus.includes(menuId);
}

function getMenuMultiplier() {
  return getSelectedMenu().multiplier;
}

function getTotalMultiplier() {
  return getEquipmentMultiplier() * getMenuMultiplier();
}

function getCustomerCount() {
  const equipmentCustomers = state.equipmentLevel;
  const ramenCustomers = Math.floor(state.totalRamenMade / 8);
  const menuCustomers = state.unlockedMenus.length * 2;
  return Math.max(1, equipmentCustomers + ramenCustomers + menuCustomers);
}

function getCustomerBonus() {
  return 1 + (getCustomerCount() - 1) * 0.12;
}

function getSalesPower() {
  return getTotalMultiplier() * getCustomerBonus();
}

function getIncomePerSecond() {
  return Math.ceil(getTotalMultiplier() + (getCustomerCount() - 1) * 0.45);
}

function getRamenPrice() {
  return Math.floor(10 * getSalesPower());
}

function getUpgradeCost() {
  return Math.floor(30 * Math.pow(1.7, state.equipmentLevel - 1));
}

function formatYen(value) {
  return `${Math.floor(value).toLocaleString("ja-JP")}円`;
}

function showMessage(text) {
  messageElement.textContent = text;

  if (messageTimer) {
    clearTimeout(messageTimer);
  }

  messageTimer = setTimeout(() => {
    messageElement.textContent = "";
  }, 1800);
}

function showBubble(text) {
  speechBubbleElement.textContent = text;
  speechBubbleElement.classList.remove("bubble-pop");
  window.requestAnimationFrame(() => {
    speechBubbleElement.classList.add("bubble-pop");
  });
}

function updateCustomers() {
  const customerCount = getCustomerCount();
  const visibleCustomers = Math.min(MAX_VISIBLE_CUSTOMERS, customerCount);
  const currentCustomers = customerStageElement.children.length;

  if (currentCustomers === visibleCustomers) {
    return;
  }

  customerStageElement.innerHTML = "";

  for (let i = 0; i < visibleCustomers; i += 1) {
    const customer = document.createElement("span");
    customer.className = "customer";
    customerStageElement.appendChild(customer);
  }
}

function createMenuCard(menu) {
  const isUnlocked = isMenuUnlocked(menu.id);
  const isSelected = state.selectedMenuId === menu.id;
  const card = document.createElement("article");
  card.className = `menu-card ${isUnlocked ? "is-unlocked" : "is-locked"} ${isSelected ? "is-selected" : ""}`;

  const nameRow = document.createElement("div");
  nameRow.className = "menu-name-row";

  const name = document.createElement("p");
  name.className = "menu-name";
  name.textContent = menu.name;

  const badge = document.createElement("span");
  badge.className = "menu-badge";
  badge.textContent = `x${menu.multiplier.toFixed(1)}`;

  nameRow.append(name, badge);

  const description = document.createElement("p");
  description.className = "menu-description";
  description.textContent = menu.description;

  const cost = document.createElement("p");
  cost.className = "menu-cost";
  cost.textContent = isUnlocked ? "解放済み" : `解放費用: ${formatYen(menu.cost)}`;

  const button = document.createElement("button");
  button.className = `menu-button ${isSelected ? "is-selected" : ""}`;
  button.type = "button";
  button.dataset.menuId = menu.id;

  if (isSelected) {
    button.textContent = "販売中";
    button.disabled = true;
  } else if (isUnlocked) {
    button.textContent = "このメニューを売る";
  } else {
    button.textContent = "購入して解放";
    button.disabled = state.money < menu.cost;
  }

  card.append(nameRow, description, cost, button);
  return card;
}

function renderMenus() {
  menuListElement.innerHTML = "";
  MENU_CONFIG.forEach((menu) => {
    menuListElement.appendChild(createMenuCard(menu));
  });
}

function render() {
  const upgradeCost = getUpgradeCost();
  const nextMultiplier = getEquipmentMultiplier() + 0.5;
  const customerCount = getCustomerCount();
  const customerBonusPercent = Math.round((getCustomerBonus() - 1) * 100);
  const selectedMenu = getSelectedMenu();

  moneyElement.textContent = formatYen(state.money);
  incomeElement.textContent = `${formatYen(getIncomePerSecond())} / 秒`;
  equipmentLevelElement.textContent = `Lv. ${state.equipmentLevel}`;
  multiplierElement.textContent = `x${getTotalMultiplier().toFixed(1)}`;
  customerCountElement.textContent = `${customerCount.toLocaleString("ja-JP")}人`;
  selectedMenuNameElement.textContent = selectedMenu.name;
  selectedMenuInfoElement.textContent = `メニュー倍率 x${selectedMenu.multiplier.toFixed(1)}`;
  upgradeInfoElement.textContent = `費用: ${formatYen(upgradeCost)} / 次の設備倍率: x${nextMultiplier.toFixed(1)}`;
  customerInfoElement.textContent = `客数ボーナス +${customerBonusPercent}% / ラーメン累計 ${state.totalRamenMade.toLocaleString("ja-JP")}杯`;
  makeRamenButton.textContent = `${selectedMenu.name}を作る +${formatYen(getRamenPrice())}`;
  upgradeButton.disabled = state.money < upgradeCost;

  updateCustomers();
  renderMenus();
}

function saveGame(isManual = true) {
  state.lastSavedAt = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));

  if (isManual) {
    showMessage("セーブしました");
  }
}

function normalizeLoadedState(parsedData) {
  const unlockedMenus = Array.isArray(parsedData.unlockedMenus)
    ? parsedData.unlockedMenus.filter((menuId) => MENU_CONFIG.some((menu) => menu.id === menuId))
    : [];
  const selectedMenuId = unlockedMenus.includes(parsedData.selectedMenuId)
    ? parsedData.selectedMenuId
    : BASE_MENU_ID;

  return {
    money: Number(parsedData.money) || 0,
    equipmentLevel: Number(parsedData.equipmentLevel) || 1,
    totalRamenMade: Number(parsedData.totalRamenMade) || 0,
    unlockedMenus,
    selectedMenuId,
    lastSavedAt: Number(parsedData.lastSavedAt) || Date.now()
  };
}

function loadGame(isManual = true) {
  const savedData = localStorage.getItem(SAVE_KEY);

  if (!savedData) {
    if (isManual) {
      showMessage("セーブデータがありません");
    }
    render();
    return;
  }

  try {
    state = normalizeLoadedState(JSON.parse(savedData));

    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - state.lastSavedAt) / 1000));
    const offlineIncome = elapsedSeconds * getIncomePerSecond();

    if (offlineIncome > 0) {
      state.money += offlineIncome;
      showMessage(`留守中の売上 +${formatYen(offlineIncome)}`);
    } else if (isManual) {
      showMessage("ロードしました");
    }

    render();
  } catch (error) {
    localStorage.removeItem(SAVE_KEY);
    state = { ...initialState, unlockedMenus: [], lastSavedAt: Date.now() };
    render();

    if (isManual) {
      showMessage("セーブデータを読み込めませんでした");
    }
  }
}

function resetGame() {
  const shouldReset = confirm("データをリセットしますか？");

  if (!shouldReset) {
    return;
  }

  state = { ...initialState, unlockedMenus: [], lastSavedAt: Date.now() };
  localStorage.removeItem(SAVE_KEY);
  render();
  showBubble("また一杯目から！");
  showMessage("リセットしました");
}

function animateCookingButton() {
  makeRamenButton.classList.remove("cooking");
  window.requestAnimationFrame(() => {
    makeRamenButton.classList.add("cooking");
  });
}

function unlockOrSelectMenu(menuId) {
  const menu = MENU_CONFIG.find((item) => item.id === menuId);

  if (!menu) {
    return;
  }

  if (isMenuUnlocked(menuId)) {
    state.selectedMenuId = menuId;
    showBubble(`${menu.name}、販売開始！`);
    showMessage(`${menu.name}に切り替えました`);
    render();
    return;
  }

  if (state.money < menu.cost) {
    showMessage("所持金が足りません");
    return;
  }

  state.money -= menu.cost;
  state.unlockedMenus.push(menuId);
  state.selectedMenuId = menuId;
  showBubble(`新メニュー ${menu.name} 解放！`);
  showMessage(`${menu.name}を解放しました`);
  render();
}

makeRamenButton.addEventListener("click", () => {
  state.money += getRamenPrice();
  state.totalRamenMade += 1;
  bubbleIndex = (bubbleIndex + 1) % bubbleMessages.length;
  showBubble(bubbleMessages[bubbleIndex]);
  animateCookingButton();
  render();
});

upgradeButton.addEventListener("click", () => {
  const upgradeCost = getUpgradeCost();

  if (state.money < upgradeCost) {
    showMessage("所持金が足りません");
    return;
  }

  state.money -= upgradeCost;
  state.equipmentLevel += 1;
  showBubble("お店が広くなった！");
  render();
  showMessage("設備を強化しました");
});

menuListElement.addEventListener("click", (event) => {
  const button = event.target.closest("[data-menu-id]");

  if (!button) {
    return;
  }

  unlockOrSelectMenu(button.dataset.menuId);
});

saveButton.addEventListener("click", () => saveGame(true));
loadButton.addEventListener("click", () => loadGame(true));
resetButton.addEventListener("click", resetGame);

setInterval(() => {
  state.money += getIncomePerSecond();
  render();
}, 1000);

setInterval(() => {
  bubbleIndex = (bubbleIndex + 1) % bubbleMessages.length;
  showBubble(bubbleMessages[bubbleIndex]);
}, 4200);

setInterval(() => {
  saveGame(false);
}, 10000);

loadGame(false);
render();
