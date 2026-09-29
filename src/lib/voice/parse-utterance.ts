import { DEFAULT_CATEGORY_VALUE, DEFAULT_UNIT_VALUE, UNIT_CATALOG } from "@/lib/mindercart/catalog";

export type VoiceCatalogItem = {
  itemKey?: string;
  name: string;
  nameEs?: string;
  nameEn?: string;
  category?: string;
  unit?: string;
  defaultStore?: string;
};

export type ParsedVoiceItem = {
  itemKey: string;
  name: string;
  category: string;
  unit: string;
  quantity: string;
  store: string;
  isCustom: boolean;
};

const NUMBER_WORDS: Record<string, number> = {
  un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5,
  seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

function safe(value: unknown) {
  return String(value ?? "").trim();
}

export function normalizeVoiceText(value: unknown) {
  return safe(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function makeItemKey(value: unknown) {
  return normalizeVoiceText(value).replace(/\s+/g, "-") || "custom-item";
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function catalogTerms(item: VoiceCatalogItem) {
  return [item.name, item.nameEs, item.nameEn]
    .map(normalizeVoiceText)
    .filter(Boolean);
}

function stripCommand(value: string) {
  return value
    .replace(/^\s*(?:agrega|agregar|anade|anadir|apunta|pon|necesito|add)\s+(?:(?:a|en)\s+)?(?:mi\s+lista\s+)?/i, "")
    .trim();
}

function splitItems(value: string) {
  return stripCommand(value)
    .replace(/\s+(?:tambien|ademas)\s+/gi, ",")
    .replace(/\s+(?:coma|comma)\s+/gi, ",")
    .split(/\s*[,;\n\r•]+\s*|\s+\b(?:y|e|and)\b\s+/i)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function readQuantity(value: string) {
  const match = normalizeVoiceText(value).match(/^(\d+(?:\.\d+)?|[a-z]+)\b\s*/);
  if (!match) return { quantity: "1", rest: value.trim() };

  const normalized = match[1];
  const numeric = Number(normalized);
  const quantity = Number.isFinite(numeric) && numeric > 0 ? numeric : NUMBER_WORDS[normalized];
  if (!quantity) return { quantity: "1", rest: value.trim() };

  return {
    quantity: String(quantity),
    rest: value.slice(match[0].length).trim(),
  };
}

function readUnit(value: string) {
  const normalized = normalizeVoiceText(value);

  for (const unit of UNIT_CATALOG.filter((entry) => entry.active)) {
    const aliases = [unit.legacyValue, ...unit.aliases]
      .map(normalizeVoiceText)
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);

    const alias = aliases.find((candidate) =>
      normalized === candidate || normalized.startsWith(`${candidate} `)
    );

    if (!alias) continue;

    const consumedWords = alias.split(" ").length;
    const words = value.trim().split(/\s+/);
    const rest = words.slice(consumedWords).join(" ").replace(/^de\s+/i, "").trim();
    return { unit: unit.legacyValue, rest };
  }

  return { unit: "", rest: value.trim() };
}

function findCatalogItem(name: string, catalog: VoiceCatalogItem[]) {
  const target = normalizeVoiceText(name);
  if (!target) return null;

  return catalog.find((item) => catalogTerms(item).includes(target)) || null;
}

export function parseVoiceUtterance(
  utterance: string,
  catalog: VoiceCatalogItem[],
  preferredStore = "",
): ParsedVoiceItem[] {
  return splitItems(utterance).flatMap((rawPart) => {
    const { quantity, rest: afterQuantity } = readQuantity(rawPart);
    const { unit: spokenUnit, rest: afterUnit } = readUnit(afterQuantity);
    const cleanedName = afterUnit.replace(/^(?:de|del)\s+/i, "").trim();
    if (!cleanedName) return [];

    const match = findCatalogItem(cleanedName, catalog);
    const name = safe(match?.nameEs) || safe(match?.name) || titleCase(cleanedName);

    return [{
      itemKey: safe(match?.itemKey) || makeItemKey(name),
      name,
      category: safe(match?.category) || DEFAULT_CATEGORY_VALUE,
      unit: spokenUnit || safe(match?.unit) || DEFAULT_UNIT_VALUE,
      quantity,
      store: safe(match?.defaultStore) || safe(preferredStore),
      isCustom: !match,
    }];
  });
}
