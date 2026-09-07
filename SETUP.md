# GitHub diegimo instrukcija

Žingsnis po žingsnio: sukurkite repozitoriją, įjunkite automatinį vakarinį kainų tikrinimą.

## 1. Sukurkite GitHub repozitoriją

1. Eikite į [github.com/new](https://github.com/new)
2. **Repository name:** pvz. `all-inclusive-sweeper`
3. Pasirinkite **Private** (rekomenduojama) arba Public
4. **NEPAŽYMĖKITE** „Add a README“ — projektas jau turi failus
5. Spauskite **Create repository**

## 2. Nusiųskite kodą į GitHub

Cursor terminale (arba savo kompiuteryje, jei klonuosite):

```bash
cd /kelias/iki/projekto

# Jei dar nėra git remote į jūsų GitHub:
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/JŪSŲ_VARDAS/all-inclusive-sweeper.git

git push -u origin main
```

Pakeiskite `JŪSŲ_VARDAS` ir repo pavadinimą į savo.

**Alternatyva Cursor'e:** spauskite **Create repo** pill viršuje — Cursor sukurs repo ir push'ins automatiškai.

## 3. Įjunkite GitHub Actions

1. Atidarykite repozitoriją GitHub'e
2. **Settings** → **Actions** → **General**
3. **Actions permissions:** pasirinkite **Allow all actions**
4. **Workflow permissions:** pasirinkite **Read and write permissions**
5. Išsaugokite

## 4. Paleiskite pirmą patikrą

1. Eikite į **Actions** skirtuką
2. Kairėje pasirinkite **„Kasdieninis kainų tikrinimas“**
3. Spauskite **Run workflow** → **Run workflow**
4. Po ~1–2 min atsidarykite run — matysite kainas terminale

Jei kainos pasikeitė, Actions automatiškai commit'ina `data/deals.json` į repo.

## 5. Kas vyksta kiekvieną vakarą (~20:00 LT)

| Laikas | Kas |
|---|---|
| 18:00 UTC | GitHub Actions paleidžia `npm run scan` |
| | Tikrina **TEZ Tour API** (5 viešbučiai, 90 dienų) |
| | Išsaugo rezultatus į `data/` |
| | Jei kaina krito ar patenka į 300–400 € — sukuria **GitHub Issue** |

## 6. Pranešimai el. paštu

1. GitHub → **Settings** → **Notifications**
2. Įjunkite **Issues** → Email
3. Kai sukurs Issue „🏖️ Kainų alertas“ — gausite laišką

## 7. Peržiūrėti rezultatus

**Be serverio** — tiesiog atidarykite repo failus:
- `data/deals.json` — visi pasiūlymai
- `data/last-scan-summary.json` — santrauka
- `data/prices.json` — kainų istorija

**Su UI** (lokaliai):
```bash
npm install
npm run dev -- -p 4317
```
Atidarykite `http://localhost:4317` — duomenys skaitomi iš `data/deals.json`.

## Šaltiniai

| Šaltinis | Automatinis? | Pastaba |
|---|---|---|
| **TEZ Tour** | ✅ GitHub Actions | Vienintelis viešas API |
| Novaturas | ❌ Nuoroda UI | Kartais pigiau ne sezonu |
| West Express | ❌ Nuoroda UI | Savaitės TOP akcijos |
| JoinUP | ❌ Nuoroda UI | Paskutinės minutės |
| Coral Travel | ❌ Nuoroda UI | |
| Pasirink Sparnus | ❌ Nuoroda UI | |
| Kelionių Panorama | ❌ Nuoroda UI | |
| TEZ Išpardavimas | ❌ Nuoroda UI | Akcijos ir promo kodai |

Kitos agentūros (Novaturas, West Express ir kt.) neturi viešo API — todėl UI rodo **nuorodas**, kurias galite atidaryti ir palyginti ranka.

## Laiko keitimas

Redaguokite `.github/workflows/daily-scan.yml`:

```yaml
- cron: "0 18 * * *"   # 18:00 UTC ≈ 20:00 Vilnius (žiemą)
```

Pavyzdžiai:
- `0 17 * * *` — 19:00 LT (žiemą)
- `0 19 * * *` — 21:00 LT (žiemą)

## Dažnos problemos

**Actions neveikia** — patikrinkite Settings → Actions permissions (žingsnis 3).

**Push failed** — reikia `workflow` write teisių (žingsnis 3).

**TEZ 429 klaida** — per daug užklausų; workflow bandys kitą dieną. Galite sumažinti `dateRangeDays` nustatymuose.
