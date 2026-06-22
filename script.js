const SAVE_KEY = "idleRamenShopSave";
const BGM_KEY = "idleRamenShopBgmEnabled";
const MAX_VISIBLE_CUSTOMERS = 5;
const BASE_MENU_ID = "base";

const SHOP_RANKS = [
  { id: "stall", min: 1, max: 5, name: "屋台", stars: 1 },
  { id: "independent", min: 6, max: 10, name: "個人店", stars: 2 },
  { id: "popular", min: 11, max: 20, name: "人気店", stars: 3 },
  { id: "line", min: 21, max: 35, name: "行列店", stars: 4 },
  { id: "famous", min: 36, max: 50, name: "有名店", stars: 5 },
  { id: "chain", min: 51, max: Infinity, name: "全国チェーン", stars: 6 }
];

const ACHIEVEMENTS = [
  { id: "first_10", name: "初めての一杯", target: 10 },
  { id: "popular_100", name: "人気店", target: 100 },
  { id: "line_1000", name: "行列店", target: 1000 },
  { id: "famous_10000", name: "名店", target: 10000 }
];

const MENU_CONFIG = [
  { id: "shoyu", name: "醤油ラーメン", cost: 80, multiplier: 1.2, category: "基本ラーメン", description: "定番の味。まずは看板メニューを増やします。" },
  { id: "miso", name: "味噌ラーメン", cost: 220, multiplier: 1.6, category: "基本ラーメン", description: "濃厚な味で客単価が上がります。" },
  { id: "tonkotsu", name: "豚骨ラーメン", cost: 620, multiplier: 2.25, category: "基本ラーメン", description: "人気の一杯。解放すると売上が大きく伸びます。" },

  { id: "soup_shoyu", name: "特製醤油ラーメン", cost: 120, multiplier: 1.3, category: "定番ラーメン", description: "香り高い醤油だれで安定した人気を狙います。" },
  { id: "soup_shio", name: "塩ラーメン", cost: 180, multiplier: 1.45, category: "定番ラーメン", description: "すっきりした味で幅広い客層に届きます。" },
  { id: "soup_miso", name: "辛味噌ラーメン", cost: 280, multiplier: 1.75, category: "定番ラーメン", description: "コクと辛みのある味で満足度を上げます。" },
  { id: "soup_tonkotsu", name: "濃厚豚骨ラーメン", cost: 520, multiplier: 2.05, category: "定番ラーメン", description: "濃厚な一杯でリピーターを増やします。" },
  { id: "soup_gyokai", name: "魚介ラーメン", cost: 760, multiplier: 2.45, category: "定番ラーメン", description: "魚介の旨味で売上を押し上げます。" },
  { id: "soup_toripaitan", name: "鶏白湯ラーメン", cost: 980, multiplier: 2.7, category: "定番ラーメン", description: "まろやかな一杯で客単価が大きく伸びます。" },

  { id: "sapporo", name: "札幌ラーメン", cost: 1300, multiplier: 2.9, category: "ご当地ラーメン", description: "北海道の人気味噌系メニューです。" },
  { id: "hakodate", name: "函館ラーメン", cost: 1600, multiplier: 3.15, category: "ご当地ラーメン", description: "北海道のあっさり塩系メニューです。" },
  { id: "kitakata", name: "喜多方ラーメン", cost: 2100, multiplier: 3.45, category: "ご当地ラーメン", description: "福島県の親しみやすい定番ご当地味です。" },
  { id: "shirakawa", name: "白河ラーメン", cost: 2600, multiplier: 3.75, category: "ご当地ラーメン", description: "福島県の手打ち風メニューで評判を伸ばします。" },
  { id: "tokyo", name: "東京ラーメン", cost: 3200, multiplier: 4.05, category: "ご当地ラーメン", description: "東京都の王道醤油味で売上を底上げします。" },
  { id: "iekei", name: "横浜家系ラーメン", cost: 4200, multiplier: 4.55, category: "ご当地ラーメン", description: "神奈川県の濃厚メニューで客足が伸びます。" },
  { id: "toyama_black", name: "富山ブラックラーメン", cost: 5600, multiplier: 5.1, category: "ご当地ラーメン", description: "富山県のインパクトある一杯です。" },
  { id: "nagoya_taiwan", name: "名古屋台湾ラーメン", cost: 7200, multiplier: 5.7, category: "ご当地ラーメン", description: "愛知県の刺激的な味で話題になります。" },
  { id: "hakata", name: "博多ラーメン", cost: 9200, multiplier: 6.4, category: "ご当地ラーメン", description: "福岡県の人気豚骨で全国級の売上へ。" },
  { id: "kumamoto", name: "熊本ラーメン", cost: 11800, multiplier: 7.2, category: "ご当地ラーメン", description: "熊本県の香ばしい一杯で名店を目指します。" }
];

const BASE_MENU = {
  id: BASE_MENU_ID,
  name: "屋台ラーメン",
  multiplier: 1,
  category: "基本メニュー"
};

const initialState = {
  money: 0,
  equipmentLevel: 1,
  totalRamenMade: 0,
  unlockedMenus: [],
  achievedAchievements: [],
  selectedMenuId: BASE_MENU_ID,
  currentRankId: "stall",
  lastSavedAt: Date.now()
};

let state = {
  ...initialState,
  unlockedMenus: [...initialState.unlockedMenus],
  achievedAchievements: [...initialState.achievedAchievements]
};
let messageTimer = null;
let bubbleIndex = 0;
let achievementPopupTimer = null;
let rankUpPopupTimer = null;
let lastRenderedCustomerCount = 1;

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
const shopRankElement = document.getElementById("shopRank");
const selectedMenuBox = document.getElementById("selectedMenuBox");
const selectedMenuNameElement = document.getElementById("selectedMenuName");
const selectedMenuInfoElement = document.getElementById("selectedMenuInfo");
const upgradeInfoElement = document.getElementById("upgradeInfo");
const customerInfoElement = document.getElementById("customerInfo");
const messageElement = document.getElementById("message");
const speechBubbleElement = document.getElementById("speechBubble");
const customerStageElement = document.getElementById("customerStage");
const entryCustomerLayerElement = document.getElementById("entryCustomerLayer");
const menuListElement = document.getElementById("menuList");
const selectableMenuListElement = document.getElementById("selectableMenuList");
const menuModalElement = document.getElementById("menuModal");
const closeMenuModalButton = document.getElementById("closeMenuModalButton");
const achievementListElement = document.getElementById("achievementList");
const achievementPopupElement = document.getElementById("achievementPopup");
const achievementPopupTitleElement = document.getElementById("achievementPopupTitle");
const achievementPopupDetailElement = document.getElementById("achievementPopupDetail");
const rankUpPopupElement = document.getElementById("rankUpPopup");
const rankUpPopupTitleElement = document.getElementById("rankUpPopupTitle");
const rankUpPopupDetailElement = document.getElementById("rankUpPopupDetail");
const bgmAudio = document.getElementById("bgmAudio");
const bgmToggleButton = document.getElementById("bgmToggleButton");
const speakerIconElement = document.getElementById("speakerIcon");
const makeRamenButton = document.getElementById("makeRamenButton");
const upgradeButton = document.getElementById("upgradeButton");
const saveButton = document.getElementById("saveButton");
const loadButton = document.getElementById("loadButton");
const resetButton = document.getElementById("resetButton");

function getEquipmentMultiplier() {
  return 1 + (state.equipmentLevel - 1) * 0.5;
}

function getShopRankForLevel(level) {
  return SHOP_RANKS.find((rank) => level >= rank.min && level <= rank.max) || SHOP_RANKS[0];
}

function getShopRank() {
  return getShopRankForLevel(state.equipmentLevel);
}

function getShopRankText(rank = getShopRank()) {
  return `${rank.name} ${"★".repeat(rank.stars)}`;
}

function getSavedShopRank() {
  return SHOP_RANKS.find((rank) => rank.id === state.currentRankId) || getShopRank();
}

function getSelectedMenu() {
  return MENU_CONFIG.find((menu) => menu.id === state.selectedMenuId) || BASE_MENU;
}

function isMenuUnlocked(menuId) {
  return state.unlockedMenus.includes(menuId);
}

function getTotalMultiplier() {
  return getEquipmentMultiplier() * getSelectedMenu().multiplier;
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

function isBgmEnabled() {
  return localStorage.getItem(BGM_KEY) === "true";
}

function updateBgmDisplay(isPlaying) {
  bgmToggleButton.setAttribute("aria-label", isPlaying ? "BGMを停止" : "BGMを再生");
  bgmToggleButton.setAttribute("aria-pressed", String(isPlaying));
  bgmToggleButton.classList.toggle("is-playing", isPlaying);
  speakerIconElement.textContent = isPlaying ? "🔊" : "🔇";
}

async function playBgm() {
  try {
    bgmAudio.volume = 0.35;
    bgmAudio.loop = true;
    await bgmAudio.play();
    localStorage.setItem(BGM_KEY, "true");
    updateBgmDisplay(true);
  } catch (error) {
    localStorage.setItem(BGM_KEY, "false");
    updateBgmDisplay(false);
    showMessage("BGMはボタン操作後に再生できます");
  }
}

function stopBgm() {
  bgmAudio.pause();
  localStorage.setItem(BGM_KEY, "false");
  updateBgmDisplay(false);
}

function toggleBgm() {
  if (bgmAudio.paused) {
    playBgm();
  } else {
    stopBgm();
  }
}

function showRankUpPopup(oldRank, newRank) {
  rankUpPopupTitleElement.textContent = `${oldRank.name} → ${newRank.name}`;
  rankUpPopupDetailElement.textContent = `${getShopRankText(newRank)} になりました`;
  rankUpPopupElement.setAttribute("aria-hidden", "false");
  rankUpPopupElement.classList.remove("is-visible");

  if (rankUpPopupTimer) {
    clearTimeout(rankUpPopupTimer);
  }

  window.requestAnimationFrame(() => {
    rankUpPopupElement.classList.add("is-visible");
  });

  rankUpPopupTimer = setTimeout(() => {
    rankUpPopupElement.classList.remove("is-visible");
    rankUpPopupElement.setAttribute("aria-hidden", "true");
  }, 3500);
}

function syncShopRank(shouldShowPopup = false, previousRank = getSavedShopRank()) {
  const currentRank = getShopRank();

  if (state.currentRankId !== currentRank.id) {
    if (shouldShowPopup) {
      showRankUpPopup(previousRank, currentRank);
      showMessage(`店舗ランクアップ: ${currentRank.name}`);
    }

    state.currentRankId = currentRank.id;
    saveGame(false);
  }
}

function triggerEntryCustomerAnimation(count = 1) {
  const animationCount = Math.min(3, Math.max(1, count));

  for (let i = 0; i < animationCount; i += 1) {
    const customer = document.createElement("span");
    customer.className = "entry-customer";
    customer.style.animationDelay = `${i * 0.16}s`;
    entryCustomerLayerElement.appendChild(customer);

    setTimeout(() => {
      customer.remove();
    }, 1500 + i * 160);
  }
}

function updateCustomers() {
  const customerCount = getCustomerCount();
  const visibleCustomers = Math.min(MAX_VISIBLE_CUSTOMERS, customerCount);

  if (customerCount > lastRenderedCustomerCount) {
    triggerEntryCustomerAnimation(customerCount - lastRenderedCustomerCount);
  }
  lastRenderedCustomerCount = customerCount;

  if (customerStageElement.children.length === visibleCustomers) {
    return;
  }

  customerStageElement.innerHTML = "";

  for (let i = 0; i < visibleCustomers; i += 1) {
    const customer = document.createElement("span");
    customer.className = "customer";
    customerStageElement.appendChild(customer);
  }
}

function isAchievementUnlocked(achievementId) {
  return state.achievedAchievements.includes(achievementId);
}

function showAchievementPopup(achievement) {
  achievementPopupTitleElement.textContent = achievement.name;
  achievementPopupDetailElement.textContent = `${achievement.target.toLocaleString("ja-JP")}杯を達成しました`;
  achievementPopupElement.setAttribute("aria-hidden", "false");
  achievementPopupElement.classList.remove("is-visible");

  if (achievementPopupTimer) {
    clearTimeout(achievementPopupTimer);
  }

  window.requestAnimationFrame(() => {
    achievementPopupElement.classList.add("is-visible");
  });

  achievementPopupTimer = setTimeout(() => {
    achievementPopupElement.classList.remove("is-visible");
    achievementPopupElement.setAttribute("aria-hidden", "true");
  }, 3300);
}

function checkAchievements(shouldShowPopup = true) {
  const newlyUnlocked = [];

  ACHIEVEMENTS.forEach((achievement) => {
    if (state.totalRamenMade >= achievement.target && !isAchievementUnlocked(achievement.id)) {
      state.achievedAchievements.push(achievement.id);
      newlyUnlocked.push(achievement);
    }
  });

  if (newlyUnlocked.length > 0) {
    saveGame(false);
  }

  if (newlyUnlocked.length > 0 && shouldShowPopup) {
    const latestAchievement = newlyUnlocked[newlyUnlocked.length - 1];
    showAchievementPopup(latestAchievement);
    showMessage(`実績達成: ${latestAchievement.name}`);
  }
}

function createAchievementCard(achievement) {
  const isUnlocked = isAchievementUnlocked(achievement.id);
  const card = document.createElement("article");
  card.className = `achievement-card ${isUnlocked ? "is-unlocked" : "is-locked"}`;

  const title = document.createElement("p");
  title.className = "achievement-title";
  title.textContent = achievement.name;

  const detail = document.createElement("p");
  detail.className = "achievement-detail";
  detail.textContent = `${achievement.target.toLocaleString("ja-JP")}杯作る`;

  const status = document.createElement("p");
  status.className = "achievement-status";
  status.textContent = isUnlocked ? "達成済み" : `${Math.min(state.totalRamenMade, achievement.target).toLocaleString("ja-JP")} / ${achievement.target.toLocaleString("ja-JP")}杯`;

  card.append(title, detail, status);
  return card;
}

function renderAchievements() {
  achievementListElement.innerHTML = "";
  ACHIEVEMENTS.forEach((achievement) => {
    achievementListElement.appendChild(createAchievementCard(achievement));
  });
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
  badge.textContent = `x${menu.multiplier.toFixed(2).replace(/0$/, "")}`;

  nameRow.append(name, badge);

  const category = document.createElement("p");
  category.className = "menu-category";
  category.textContent = menu.category;

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

  card.append(nameRow, category, description, cost, button);
  return card;
}

function renderMenus() {
  menuListElement.innerHTML = "";
  MENU_CONFIG.forEach((menu) => {
    menuListElement.appendChild(createMenuCard(menu));
  });
}

function createSelectableMenuButton(menu) {
  const isSelected = state.selectedMenuId === menu.id;
  const button = document.createElement("button");
  button.className = `selectable-menu-button ${isSelected ? "is-selected" : ""}`;
  button.type = "button";
  button.dataset.selectMenuId = menu.id;
  button.disabled = isSelected;

  const title = document.createElement("strong");
  title.textContent = menu.name;

  const detail = document.createElement("span");
  detail.textContent = isSelected ? `販売中 / x${menu.multiplier}` : `${menu.category} / x${menu.multiplier}`;

  button.append(title, detail);
  return button;
}

function renderSelectableMenus() {
  selectableMenuListElement.innerHTML = "";
  const menus = [BASE_MENU, ...MENU_CONFIG.filter((menu) => isMenuUnlocked(menu.id))];

  menus.forEach((menu) => {
    selectableMenuListElement.appendChild(createSelectableMenuButton(menu));
  });
}

function openMenuModal() {
  renderSelectableMenus();
  menuModalElement.classList.add("is-open");
  menuModalElement.setAttribute("aria-hidden", "false");
}

function closeMenuModal() {
  menuModalElement.classList.remove("is-open");
  menuModalElement.setAttribute("aria-hidden", "true");
}

function selectMenu(menuId) {
  if (menuId !== BASE_MENU_ID && !isMenuUnlocked(menuId)) {
    showMessage("未解放メニューは選択できません");
    return;
  }

  state.selectedMenuId = menuId;
  const menu = getSelectedMenu();
  saveGame(false);
  closeMenuModal();
  showBubble(`${menu.name}、販売開始！`);
  showMessage(`${menu.name}に切り替えました`);
  render();
}

function unlockOrSelectMenu(menuId) {
  const menu = MENU_CONFIG.find((item) => item.id === menuId);

  if (!menu) {
    return;
  }

  if (isMenuUnlocked(menuId)) {
    selectMenu(menuId);
    return;
  }

  if (state.money < menu.cost) {
    showMessage("所持金が足りません");
    return;
  }

  state.money -= menu.cost;
  state.unlockedMenus.push(menuId);
  state.selectedMenuId = menuId;
  saveGame(false);
  showBubble(`新メニュー ${menu.name} 解放！`);
  showMessage(`${menu.name}を解放しました`);
  render();
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
  shopRankElement.textContent = getShopRankText();
  selectedMenuNameElement.textContent = selectedMenu.name;
  selectedMenuInfoElement.textContent = `メニュー倍率 x${selectedMenu.multiplier}`;
  upgradeInfoElement.textContent = `費用: ${formatYen(upgradeCost)} / 次の設備倍率: x${nextMultiplier.toFixed(1)}`;
  customerInfoElement.textContent = `客数ボーナス +${customerBonusPercent}% / ラーメン累計 ${state.totalRamenMade.toLocaleString("ja-JP")}杯`;
  makeRamenButton.textContent = `${selectedMenu.name}を作る +${formatYen(getRamenPrice())}`;
  upgradeButton.disabled = state.money < upgradeCost;

  updateCustomers();
  renderMenus();
  renderAchievements();

  if (menuModalElement.classList.contains("is-open")) {
    renderSelectableMenus();
  }
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
  const achievedAchievements = Array.isArray(parsedData.achievedAchievements)
    ? parsedData.achievedAchievements.filter((achievementId) => ACHIEVEMENTS.some((achievement) => achievement.id === achievementId))
    : [];
  const equipmentLevel = Number(parsedData.equipmentLevel) || 1;
  const loadedRank = SHOP_RANKS.find((rank) => rank.id === parsedData.currentRankId);
  const currentRankId = loadedRank ? loadedRank.id : getShopRankForLevel(equipmentLevel).id;
  const selectedMenuExists = parsedData.selectedMenuId === BASE_MENU_ID || unlockedMenus.includes(parsedData.selectedMenuId);
  const selectedMenuId = selectedMenuExists ? parsedData.selectedMenuId : BASE_MENU_ID;

  return {
    money: Number(parsedData.money) || 0,
    equipmentLevel,
    totalRamenMade: Number(parsedData.totalRamenMade) || 0,
    unlockedMenus,
    achievedAchievements,
    selectedMenuId,
    currentRankId,
    lastSavedAt: Number(parsedData.lastSavedAt) || Date.now()
  };
}

function loadGame(isManual = true) {
  const savedData = localStorage.getItem(SAVE_KEY);

  if (!savedData) {
    if (isManual) {
      showMessage("セーブデータがありません");
    }
    lastRenderedCustomerCount = getCustomerCount();
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

    checkAchievements(false);
    syncShopRank(false);
    lastRenderedCustomerCount = getCustomerCount();
    render();
  } catch (error) {
    localStorage.removeItem(SAVE_KEY);
    state = {
      ...initialState,
      unlockedMenus: [],
      achievedAchievements: [],
      currentRankId: "stall",
      lastSavedAt: Date.now()
    };
    lastRenderedCustomerCount = getCustomerCount();
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

  state = {
    ...initialState,
    unlockedMenus: [],
    achievedAchievements: [],
    currentRankId: "stall",
    lastSavedAt: Date.now()
  };
  localStorage.removeItem(SAVE_KEY);
  lastRenderedCustomerCount = getCustomerCount();
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

makeRamenButton.addEventListener("click", () => {
  state.money += getRamenPrice();
  state.totalRamenMade += 1;
  checkAchievements(true);
  bubbleIndex = (bubbleIndex + 1) % bubbleMessages.length;
  showBubble(bubbleMessages[bubbleIndex]);
  animateCookingButton();
  render();
});

upgradeButton.addEventListener("click", () => {
  const upgradeCost = getUpgradeCost();
  const previousRank = getShopRank();

  if (state.money < upgradeCost) {
    showMessage("所持金が足りません");
    return;
  }

  state.money -= upgradeCost;
  state.equipmentLevel += 1;
  syncShopRank(true, previousRank);
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

selectedMenuBox.addEventListener("click", openMenuModal);
closeMenuModalButton.addEventListener("click", closeMenuModal);
menuModalElement.addEventListener("click", (event) => {
  if (event.target.matches("[data-close-menu-modal]")) {
    closeMenuModal();
  }
});
selectableMenuListElement.addEventListener("click", (event) => {
  const button = event.target.closest("[data-select-menu-id]");

  if (!button) {
    return;
  }

  selectMenu(button.dataset.selectMenuId);
});

saveButton.addEventListener("click", () => saveGame(true));
loadButton.addEventListener("click", () => loadGame(true));
resetButton.addEventListener("click", resetGame);
bgmToggleButton.addEventListener("click", toggleBgm);

document.addEventListener("pointerdown", (event) => {
  if (event.target.closest("#bgmToggleButton")) {
    return;
  }

  if (isBgmEnabled() && bgmAudio.paused) {
    playBgm();
  }
}, { once: true });

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuModalElement.classList.contains("is-open")) {
    closeMenuModal();
  }
});

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
updateBgmDisplay(false);
render();
