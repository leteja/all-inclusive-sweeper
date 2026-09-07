# All Inclusive Stebėtojas

Stebi **5 geriausiai įvertintus** all inclusive viešbučius Turkijoje. **TEZ Tour** tikrinamas automatiškai per GitHub Actions; kitoms agentūroms — nuorodos palyginimui.

📋 **Pilna diegimo instrukcija:** [SETUP.md](./SETUP.md)

## Šaltiniai

| Šaltinis | Kaip veikia |
|---|---|
| **TEZ Tour** | Automatiškai kiekvieną vakarą (GitHub Actions) |
| Novaturas, West Express, JoinUP, Coral, Pasirink Sparnus, Kelionių Panorama, TEZ Išpardavimas | Nuorodos po kiekvienu viešbučiu — atidarykite ir palyginkite ranka |

## Stebimi viešbučiai

| Viešbutis | Įvertinimas | ~Kaina ne sezonu |
|---|---|---|
| [Rose Garden Premium 4*](https://www.tez-tour.com/hotel.html?id=7003264) | 9.0/10 | nuo ~678 €/asm |
| [Ramada Resort Side 4+](https://www.tez-tour.com/hotel.html?id=4118481) | 8.7/10 | nuo ~678 €/asm |
| [Club Hotel Belpinar 4*](https://www.tez-tour.com/hotel.html?id=14733) | 8.3/10 | nuo ~602 €/asm |
| [Akdora Elite & Spa 4*](https://www.tez-tour.com/hotel.html?id=386383) | 8.0/10 | nuo ~678 €/asm |
| [Senza Grand Santana 5*](https://www.tez-tour.com/hotel.html?id=52579) | 8.6/10 | nuo ~816 €/asm |

## Greitas startas (GitHub)

1. Sukurkite repo → push'inkite kodą ([SETUP.md](./SETUP.md))
2. Settings → Actions → įjunkite write permissions
3. Actions → „Kasdieninis kainų tikrinimas“ → Run workflow
4. Peržiūrėkite `data/last-scan-summary.json` arba paleiskite UI lokaliai

## Lokaliai

```bash
npm install
npm run dev -- -p 4317
npm run scan   # rankinis tikrinimas
```

## API

- `POST /api/scan` — patikrinti kainas
- `GET /api/deals` — pasiūlymai ir santraukos
- `GET/PUT /api/config` — nustatymai
