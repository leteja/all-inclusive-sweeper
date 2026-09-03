# All Inclusive Stebėtojas

Stebi **5 atrinktus** 4–5 žvaigždučių all inclusive viešbučius Turkijoje, lygina kainas ir rekomenduoja geriausią variantą pagal **kokybę ir kainą**. Praneša skydelyje, kai kaina patenka į **300–400 €/asm** diapazoną.

## Stebimi viešbučiai (numatytieji)

| Viešbutis | Kurortas | Kokybė | Kodėl atrinktas |
|---|---|---|---|
| [Belpoint Beach 4*](https://www.tez-tour.com/hotel.html?id=242482) | Kemeras | 7.8/10 | Pigiausias variantas |
| [Beldibi Beach 4*](https://www.tez-tour.com/hotel.html?id=4117593) | Kemeras | 8.0/10 | Ramus, geras šeimoms |
| [Bieno Club SVS 4*](https://www.tez-tour.com/hotel.html?id=57194) | Alanija | 8.2/10 | Populiarus, geras aptarnavimas |
| [Garden Park Beldibi 4*](https://www.tez-tour.com/hotel.html?id=9001063) | Kemeras | 8.4/10 | Aukštesnė kokybė, baseinai |
| [Campus Hill 5*](https://www.tez-tour.com/hotel.html?id=427996) | Alanija | 8.6/10 | 5* už 4* kainą |

## Kaip veikia

1. Ieško **tik** per šiuos 5 TEZ Tour puslapius (ne visą katalogą)
2. Kiekvienam viešbučiui randa pigiausią datą artimiausioms 45 dienoms
3. Skaičiuoja **vertės balą** = kokybė ÷ kaina (kuo didesnis, tuo geriau)
4. Rekomenduoja **geriausią variantą** skydelyje
5. **Žalias pranešimas**, kai kaina patenka į 300–400 €/asm

## Paleidimas

```bash
npm install
npm run dev -- -p 4317
```

Atidarykite [http://localhost:4317](http://localhost:4317).

## Automatinis stebėjimas

```bash
# Kas valandą
0 * * * * curl -X POST http://localhost:4317/api/scan
```

## API

- `POST /api/scan` — paleisti paiešką
- `GET /api/deals` — pasiūlymai, rekomendacija, pranešimai
- `GET/PUT /api/config` — nustatymai ir watchlist

## Realistiškos lūkesčiai

Šiuo metu (rugsėjis) šie viešbučiai kainuoja ~540–680 €/asm. 300–400 € realu pagauti:
- **Paskutinės minutės** (2–3 sav. prieš išvykimą)
- **Ne sezonas** (balandis–gegužė, spalis–lapkritis)
- **Ankstyvas booking** kitam sezonui

Stebėtojas praneš, kai kaina nukris — nereikia rankiniu tikrinti.
