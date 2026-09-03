# All Inclusive Stebėtojas

Stebi **5 kokybiškus 5 žvaigždučių** all inclusive viešbučius Turkijoje. Viešbučiai atrinkti pagal **tikrus svečių įvertinimus** (≥ 8.0/10), ne tik oficialią kategoriją. Belpoint Beach ir panašūs pašalinti.

## Stebimi viešbučiai

| Viešbutis | Svečių įvertinimas | Kurortas | Kodėl atrinktas |
|---|---|---|---|
| [Dedeman Kemer Resort 5*](https://www.tez-tour.com/hotel.html?id=648058) | 8.5/10 | Kemeras | Patikimas 5*, geras aptarnavimas |
| [White Lilyum 5*](https://www.tez-tour.com/hotel.html?id=9003188) | 8.3/10 | Kemeras | Daug kartotinių svečių, arti paplūdimio |
| [Holiday Garden Resort 5*](https://www.tez-tour.com/hotel.html?id=42202) | 8.2/10 | Alanija | Plati teritorija, vandens parkas |
| [Orange County Kemer 5*](https://www.tez-tour.com/hotel.html?id=42667) | 8.6/10 | Kemeras | 1-a linija, TripAdvisor 4.3/5 |
| [Limak Limra 5*](https://www.tez-tour.com/hotel.html?id=14795) | 9.1/10 | Kemeras | Geriausia kokybė sąraše |

## Kaip veikia

1. Tikrina kainas **tik** per šiuos 5 TEZ Tour puslapius
2. Rekomenduoja **geriausią variantą** (kokybė ÷ kaina)
3. **Žalias pranešimas** — kai kaina patenka į 300–400 €/asm
4. **Mėlynas pranešimas** — kai kaina nukrenta ≥ 15 € nuo ankstesnio minimumo
5. Saugo kainų istoriją — kiekviena patikra lygina su ankstesniu minimumu

## Paleidimas

```bash
npm install
npm run dev -- -p 4317
```

## Automatinis stebėjimas

```bash
# Kas 6 valandas
0 */6 * * * curl -X POST http://localhost:4317/api/scan
```

## Realistiškos lūkesčios

Dabar šie viešbučiai kainuoja ~810–910 €/asm. 300–400 € realu pagauti ne sezono metu arba paskutinės minutės akcijose. Stebėtojas praneš, kai kaina kris — nereikia rankiniu tikrinti.

## API

- `POST /api/scan` — patikrinti kainas
- `GET /api/deals` — pasiūlymai, rekomendacija, kainų kritimai
- `GET/PUT /api/config` — nustatymai
