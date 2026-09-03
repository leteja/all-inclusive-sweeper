# All Inclusive Stebėtojas

Automatinis all inclusive kelionių pasiūlymų stebėtojas 2 žmonėms. Ieško 4+ žvaigždučių viešbučių su viskas įskaičiuota maitinimu per TEZ Tour API ir praneša apie naujus pasiūlymus.

## Rekomenduojami parametrai (300–400 €/asm)

| Parametras | Rekomendacija | Kodėl |
|---|---|---|
| Kaina | 300–400 €/asm (600–800 € už 2) | Visa kelionė su skrydžiu ir AI |
| Žvaigždutės | 4+ | Geras komfortas jūsų biudžete |
| Maitinimas | All Inclusive (AI) | Be papildomų išlaidų atostogų metu |
| Trukmė | 7–10 nakvynių | Optimalus kainos/trukmės santykis |
| Kryptys | Turkija, Egiptas | Realiausia pagauti 4* AI šiame diapazone |
| Sezonas | Bal–geg, rugs–spalis | Pigiausia ne vasaros pikas |
| Išvykimas | Vilnius (VNO) | Didžiausias pasirinkimas |

**Svarbu:** Graikija, Ispanija ir Kanarai retai telpa į 300–400 €/asm su 4* AI, nebent paskutinės minutės arba ne sezonas.

## Paleidimas

```bash
npm install
npm run dev -- -p 4317
```

Atidarykite [http://localhost:4317](http://localhost:4317).

## Naudojimas

1. Atidarykite skydelį ir peržiūrėkite **Parametrų gidą**
2. **Nustatymuose** pakoreguokite biudžetą, kryptis ir Telegram (nebūtina)
3. Paspauskite **Ieškoti dabar** arba paleiskite automatiškai:

```bash
# Kas valandą
0 * * * * curl -X POST http://localhost:4317/api/scan
```

## Telegram pranešimai

1. Sukurkite botą per [@BotFather](https://t.me/BotFather)
2. Gaukite `chat_id` (pvz. per [@userinfobot](https://t.me/userinfobot))
3. Įjunkite Telegram nustatymuose skydelyje

## Technologijos

- Next.js + TypeScript + Tailwind + shadcn/ui
- TEZ Tour vieša paieškos API (`search.tez-tour.com`)
- Lokali duomenų saugykla (`data/config.json`, `data/deals.json`)

## API

- `POST /api/scan` — paleisti paiešką
- `GET /api/deals` — gauti rastus pasiūlymus
- `GET/PUT /api/config` — nustatymai

## Apribojimai

- Šiuo metu stebima tik TEZ Tour (didžiausias LT organizatorius)
- Kainos gali keistis realiu laiku — visada patikrinkite prieš rezervuojant
- API grąžina iki 100 rezultatų per užklausą
