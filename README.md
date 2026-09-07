# All Inclusive Stebėtojas

Stebi **5 geriausiai įvertintus** all inclusive viešbučius Turkijoje su **mažiausiomis TEZ kainomis** iš Vilniaus. Viešbučiai atrinkti pagal Booking įvertinimus (≥ 8.0/10) ir realų potencialą pagauti nuolaidas ne sezonu.

## Stebimi viešbučiai (nuorodos)

| Viešbutis | Įvertinimas | ~Kaina ne sezonu | Kodėl stebime |
|---|---|---|---|
| [Rose Garden Premium 4*](https://www.tez-tour.com/hotel.html?id=7003264) | 9.0/10 | nuo ~678 €/asm | Geriausias kokybės/kainos balansas TEZ |
| [Ramada Resort Side 4+](https://www.tez-tour.com/hotel.html?id=4118481) | 8.7/10 | nuo ~678 €/asm | Geras 4+ Sidėje, spalis–lapkritis pigiau |
| [Club Hotel Belpinar 4*](https://www.tez-tour.com/hotel.html?id=14733) | 8.3/10 | nuo ~602 €/asm | Dažnos akcijos, istoriškai iki ~300 € |
| [Akdora Elite & Spa 4*](https://www.tez-tour.com/hotel.html?id=386383) | 8.0/10 | nuo ~678 €/asm | Geras variantas Alanijoje |
| [Senza Grand Santana 5*](https://www.tez-tour.com/hotel.html?id=52579) | 8.6/10 | nuo ~816 €/asm | 5* UAI, didesnis nuolaidų potencialas |

## Ar 400 €/asm realu?

**Trumpai:** per TEZ packaged AI iš Vilniaus dabar **ne** — net ne sezonu (lapkritis 2026) geriausi 8+ variantai kainuoja **~678 €/asm**.

| Kas | Kaina |
|---|---|
| Absoliutus TEZ minimumas (4* AI, bet prastos apžvalgos) | ~621 €/asm |
| Geri įvertinimai (8.0+) su mažiausia kaina | ~678 €/asm |
| Jūsų tikslas | 300–400 €/asm |

**400 € įmanoma** tik su: paskutinės minutės akcijomis, promo kodais (pvz. TEZ12), arba kitų agentūrų pasiūlymais — ne reguliaria TEZ kaina. Stebėtojas praneš, kai kaina **kris** arba pasieks jūsų tikslą.

**Geriausios datos:** spalis–lapkritis, balandžio pradžia.

## Kaip veikia

1. Tikrina kainas per šiuos 5 TEZ Tour puslapius (90 dienų langas)
2. Rekomenduoja geriausią variantą (kokybė ÷ kaina)
3. **Žalias pranešimas** — kai kaina patenka į 300–400 €/asm
4. **Mėlynas pranešimas** — kai kaina nukrenta ≥ 15 € nuo ankstesnio minimumo

## Kasdieninis tikrinimas vakare (nemokamai)

**Svarbu:** Cursor Cloud Agent (aš) pats automatiškai kiekvieną vakarą **netikrina** — tam reikia suplanuotos užduoties žemiau. Visi variantai nemokami.

### 1 rekomenduojama: GitHub Actions (be nuolatinio kompiuterio)

Kai sukursite GitHub repozitoriją iš šio projekto, workflow jau paruoštas:

1. Push'inkite kodą į GitHub
2. Eikite į **Settings → Actions → General** ir leiskite workflows
3. Kiekvieną vakarą **~20:00** (Lietuvos laiku) automatiškai paleidžiamas `npm run scan`
4. Jei kaina krito ar patenka į 300–400 € — sukuriamas **GitHub Issue** (pranešimas el. paštu, jei įjungta GitHub notifikacijose)

Rankinis testas: **Actions → „Kasdieninis kainų tikrinimas“ → Run workflow**

Laiką keisti: redaguokite `.github/workflows/daily-scan.yml` — `cron: "0 18 * * *"` (UTC).

### 2 variantas: Vercel (jei deploy'insite app)

```bash
npx vercel
```

Vercel projekte nustatykite env kintamąjį `CRON_SECRET` (bet koks slaptažodis). `vercel.json` jau sukonfigūruotas — cron kiekvieną dieną kviečia `/api/scan`.

### 3 variantas: Jūsų kompiuteris (cron)

Jei app veikia namuose (`npm run dev` arba `npm start`):

```bash
# Mac/Linux — atidarykite crontab:
crontab -e

# Pridėkite (20:00 kiekvieną dieną):
0 20 * * * curl -s -X POST http://localhost:4317/api/scan
```

Arba be serverio — tiesiog skriptas:

```bash
0 20 * * * cd /kelias/iki/projekto && npm run scan
```

### 4 variantas: cron-job.org (jei app viešai internete)

1. Deploy'inkite app (Vercel ir pan.)
2. Užsiregistruokite [cron-job.org](https://cron-job.org) (nemokama)
3. Sukurkite job: `POST https://jūsų-app.vercel.app/api/scan` su header `Authorization: Bearer JŪSŲ_CRON_SECRET`
4. Laikas: 20:00, timezone: Europe/Vilnius

## Paleidimas

```bash
npm install
npm run dev -- -p 4317
```

Atidarykite `http://localhost:4317` ir paspauskite **„Tikrinti kainas“**.

## Automatinis stebėjimas (lokalus serveris)

```bash
# Kas 6 valandas, jei app veikia nuolat
0 */6 * * * curl -X POST http://localhost:4317/api/scan
```

Kasdieniniam vakariniam tikrinimui žiūrėkite skyrių **„Kasdieninis tikrinimas vakare“** aukščiau.

## API

- `POST /api/scan` — patikrinti kainas
- `GET /api/deals` — pasiūlymai, rekomendacija, kainų kritimai
- `GET/PUT /api/config` — nustatymai
