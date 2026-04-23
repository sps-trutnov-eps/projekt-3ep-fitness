# Fitness Tracker - Osobní Fitness Aplikace

Tento projekt je webová aplikace pro sledování fitness cílů, která umožňuje uživatelům monitorovat svou váhu, denní příjem kalorií a fyzické aktivity. Projekt byl vytvořen jako ukázka dovedností ve full-stack vývoji s použitím moderních technologií.

## Hlavní Funkce

- **Autentizace Uživatele:** Registrace, přihlášení a správa sezení (sessions).
- **Sledování Váhy:** Záznam denní váhy a vizualizace pokroku pomocí interaktivních grafů.
- **Správa Aktivit:** Logování různých typů fyzických aktivit a automatický výpočet spálených kalorií na základě váhy uživatele a typu aktivity.
- **Kalorické Cíle:** Nastavení denního cíle příjmu kalorií.
- **Fotodokumentace Pokroku:** Možnost nahrávat fotografie pro vizuální sledování změny postavy.
- **Interaktivní Rozhraní:** Responzivní design s dynamickými prvky.

## Použité Technologie

- **Backend:** Node.js, Express.js
- **Databáze:** MongoDB s ODM Mongoose
- **Frontend:** EJS (Embedded JavaScript templates), Vanilla CSS, JavaScript (jQuery)
- **Autentizace:** bcryptjs pro bezpečné hashování hesel, express-session
- **Ostatní:** Multer (upload souborů), Chart.js (grafy), UUID

## Instalace a Spuštění

1. **Klonování repozitáře:**
   ```bash
   git clone <repo-url>
   cd projekt-3ep-fitness
   ```

2. **Instalace závislostí:**
   ```bash
   npm install
   ```

3. **Konfigurace prostředí:**
   Vytvořte soubor `.env` v kořenovém adresáři podle `.env.example` a vyplňte potřebné údaje (např. `MONGO_URI`, `SESSION_SECRET`).

4. **Spuštění aplikace:**
   ```bash
   npm start
   ```
   Aplikace bude dostupná na `http://localhost:3000`.

## Struktura Projektu

- `src/controllers/` - Logika pro zpracování požadavků.
- `src/models/` - Definice databázových schémat (Mongoose).
- `src/routers/` - Definice rout (směrování).
- `src/middleware/` - Vlastní middleware (flash zprávy, upload souborů).
- `src/views/` - Šablony pro generování HTML (EJS).
- `src/public/` - Statické soubory (CSS, JS, obrázky).

---

## 👥 Autoři
- **Matyáš Sýs**
- **Lukáš Hajnyš**
- **Ondřej Kutáček**