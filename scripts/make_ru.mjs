// Derives the Russian variants of the hand-written SVGs (header, build, focus) by swapping their text.
import { readFileSync, writeFileSync } from "node:fs";

const FILES = {
  header: [
    ["Full-Stack Developer  ·  Backend Specialist", "Full-Stack разработчик  ·  Backend-специалист"],
    ["exploring systems, writing code, learning how things work", "изучаю системы, пишу код, разбираюсь, как всё устроено"],
    ["MrxZeroDay terminal header", "Шапка профиля MrxZeroDay"],
  ],
  build: [
    ["What I build: payment integrations, dashboards and reports, APIs and background jobs", "Что я строю: платёжные интеграции, дашборды и отчёты, API и фоновые задачи"],
    ["01 / payments", "01 / платежи"], ["Payment integrations", "Платёжные интеграции"],
    ["Stripe, PayPal, ArCa, Evocabank", "Stripe, PayPal, ArCa, Evocabank"],
    ["and custom gateways in Laravel", "и свои шлюзы в бэкендах"], ["and .NET backends.", "на Laravel и .NET."],
    ["02 / insight", "02 / аналитика"], ["Dashboards &amp; reports", "Дашборды и отчёты"],
    ["Admin panels, analytics views", "Админ-панели, аналитика и"], ["and Excel exports that turn", "выгрузки в Excel, которые"], ["business data into answers.", "превращают данные в ответы."],
    ["03 / backbone", "03 / основа"], ["APIs &amp; background jobs", "API и фоновые задачи"],
    ["Clean REST APIs with solid", "Чистые REST API с надёжной"], ["auth, queues and scheduled", "авторизацией, очередями и"], ["work that runs by itself.", "задачами по расписанию."],
  ],
  maps: [
    ["Maps: addresses to coordinates through Wialon, Nominatim and Yandex, then an optimized route", "Карты: адреса в координаты через Wialon, Nominatim и Yandex, затем оптимальный маршрут"],
    ["geocode chain", "цепочка геокодеров"],
    [">start<", ">старт<"],
    ["geocoder · units · routes", "геокодер · юниты · маршруты"],
    ["OpenStreetMap · fallback", "OpenStreetMap · запасной"],
    ["geocoder · fallback", "геокодер · запасной"],
    [">route<", ">маршрут<"],
    ["order · legs · live", "порядок · перегоны · live"],
    ["addresses → coordinates → optimized route, streamed as they resolve", "адреса → координаты → оптимальный маршрут, по мере геокодинга"],
  ],
  focus: [
    ["Current focus: learning new .NET and Laravel patterns, building private enterprise projects, shipping payment flows, dashboards and APIs", "Текущий фокус: учусь новым паттернам .NET и Laravel, строю частные корпоративные проекты, выпускаю платёжные потоки, дашборды и API"],
    [">LEARNING<", ">УЧУСЬ<"], [">BUILDING<", ">СТРОЮ<"], [">SHIPPING<", ">ВЫПУСКАЮ<"],
    ["new .NET and Laravel patterns", "новым паттернам .NET и Laravel"], ["private enterprise projects", "частные корпоративные проекты"], ["payment flows, dashboards, APIs", "платёжные потоки, дашборды, API"],
  ],
};

for (const [name, pairs] of Object.entries(FILES)) {
  let s = readFileSync(`assets/core/${name}.svg`, "utf8");
  for (const [from, to] of pairs) {
    if (!s.includes(from)) throw new Error(`${name}.svg: missing "${from}"`);
    s = s.split(from).join(to);
  }
  writeFileSync(`assets/core/${name}.ru.svg`, s);
}
console.log("assets/core/*.ru.svg written");
