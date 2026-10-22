// Derives README.ru.md from README.md: Russian asset variants, headings and alt texts.
import { readFileSync, writeFileSync } from "node:fs";

let s = readFileSync("README.md", "utf8");

// assets that have a Russian variant (stats and langs only carry numbers, so they are shared)
const RU_ASSETS = ["header", "profile", "build", "focus", "contrib-3d", "label-main", "label-also", "label-tools", "label-cloud", "label-favorites", "note-langs", "note-private", "note-client", "stack-more", "maps", "tools-clients", "tools-cloud", "footer"];
s = s.replace(/(\.\/assets\/(?:core|data|art)\/)([a-z0-9-]+)(\.light)?\.svg/g, (m, dir, name, light) =>
  RU_ASSETS.includes(name) ? `${dir}${name}.ru${light ?? ""}.svg` : m);

const PAIRS = [
  ['<sub>EN · <a href="./README.ru.md">RU</a></sub>', '<sub><a href="./README.md">EN</a> · RU</sub>'],
  ["## ⌁ about", "## ⌁ обо мне"], ["## ⌁ stack", "## ⌁ стек"], ["## ⌁ what i build", "## ⌁ что я строю"], ["## ⌁ focus", "## ⌁ фокус"], ["## ⌁ maps", "## ⌁ карты"],
  ["MrxZeroDay — Full-Stack Developer, Backend Specialist", "MrxZeroDay — Full-Stack разработчик, Backend-специалист"],
  ["Z, MrxZeroDay: full-stack developer, backend by nature. Main languages: PHP and C#", "Z, MrxZeroDay: full-stack разработчик, backend по призванию. Основные языки: PHP и C#"],
  ['alt="Contributions in the last year"', 'alt="Вклады за последний год"'],
  ['alt="Repositories by primary language"', 'alt="Репозитории по основному языку"'],
  ["Languages are counted per repository (including private ones), not as a measure of skill.", "Языки считаются по репозиториям (включая приватные) и не отражают уровень навыков."],
  ["Most of my work lives in private repositories, so this profile shows only a small part of it.", "Большая часть моей работы в приватных репозиториях, поэтому профиль показывает лишь малую её часть."],
  ['alt="main"', 'alt="основное"'], ['alt="also"', 'alt="ещё"'], ['alt="tools"', 'alt="инструменты"'],
  ['alt="cloud, occasional"', 'alt="облако, иногда"'], ['alt="favorite tools"', 'alt="любимые инструменты"'],
  ["Main: PHP, Laravel, C#, .NET", "Основное: PHP, Laravel, C#, .NET"],
  ["Also: JavaScript,", "Ещё: JavaScript,"], ["Databases and tools", "Базы данных и инструменты"],
  ["Favorite tools: Visual Studio", "Любимое: Visual Studio"],
  ["Libraries, payments, hosting and patterns", "Библиотеки, платежи, хостинг и паттерны"],
  ["Maps: addresses to coordinates through Wialon, Nominatim and Yandex, then an optimized route", "Карты: адреса в координаты через Wialon, Nominatim и Yandex, затем оптимальный маршрут"],
  ["Payment integrations, dashboards and reports, APIs and background jobs", "Платёжные интеграции, дашборды и отчёты, API и фоновые задачи"],
  ["Client work is private, so there are no public repos to link here.", "Работы для клиентов закрытые, поэтому публичных репозиториев для ссылок нет."],
  ["Learning new .NET and Laravel patterns, building private enterprise projects", "Учусь новым паттернам .NET и Laravel, строю частные корпоративные проекты"],
  ["GitHub stats for the last year", "Статистика GitHub за последний год"],
  ['alt="end of transmission"', 'alt="конец передачи"'],
];
for (const [from, to] of PAIRS) {
  if (!s.includes(from)) throw new Error(`README.md: missing "${from}"`);
  s = s.split(from).join(to);
}
writeFileSync("README.ru.md", s);
console.log("README.ru.md written");
