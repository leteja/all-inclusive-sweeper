"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DEPARTURE_CITIES,
  DESTINATION_COUNTRIES,
} from "@/lib/constants";
import type { ScanResult, SweeperConfig, TravelDeal } from "@/lib/types";
import {
  Bell,
  ExternalLink,
  Loader2,
  Plane,
  RefreshCw,
  Search,
  Settings2,
} from "lucide-react";

export default function HomePage() {
  const [config, setConfig] = useState<SweeperConfig | null>(null);
  const [deals, setDeals] = useState<TravelDeal[]>([]);
  const [lastScanAt, setLastScanAt] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [configRes, dealsRes] = await Promise.all([
      fetch("/api/config"),
      fetch("/api/deals"),
    ]);
    const configData = (await configRes.json()) as SweeperConfig;
    const dealsData = (await dealsRes.json()) as {
      deals: TravelDeal[];
      lastScanAt?: string;
    };
    setConfig(configData);
    setDeals(dealsData.deals ?? []);
    setLastScanAt(dealsData.lastScanAt ?? null);
  }, []);

  useEffect(() => {
    loadData().catch((err) =>
      setError(err instanceof Error ? err.message : "Nepavyko užkrauti duomenų")
    );
  }, [loadData]);

  const handleScan = async () => {
    setScanning(true);
    setError(null);
    setScanResult(null);
    try {
      const res = await fetch("/api/scan", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Paieška nepavyko");
      setScanResult(data as ScanResult);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Paieškos klaida");
    } finally {
      setScanning(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Išsaugoti nepavyko");
      setConfig(data as SweeperConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Išsaugojimo klaida");
    } finally {
      setSaving(false);
    }
  };

  const toggleCountry = (countryId: number) => {
    if (!config) return;
    const exists = config.countryIds.includes(countryId);
    setConfig({
      ...config,
      countryIds: exists
        ? config.countryIds.filter((id) => id !== countryId)
        : [...config.countryIds, countryId],
    });
  };

  if (!config) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white">
              <Plane className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                All Inclusive Stebėtojas
              </h1>
              <p className="text-sm text-muted-foreground">
                2 žmonėms · 4+ žvaigždutės · viskas įskaičiuota
              </p>
            </div>
          </div>
          <Button onClick={handleScan} disabled={scanning} size="lg">
            {scanning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            {scanning ? "Ieškoma..." : "Ieškoti dabar"}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Klaida</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {scanResult && (
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertTitle>Paieška baigta</AlertTitle>
            <AlertDescription>
              Rasta {scanResult.totalFound} atitinkančių pasiūlymų
              {scanResult.newDeals.length > 0 &&
                `, iš jų ${scanResult.newDeals.length} nauji`}
              {scanResult.notificationsSent > 0 &&
                `. Išsiųsta ${scanResult.notificationsSent} Telegram pranešimų.`}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="deals">
          <TabsList>
            <TabsTrigger value="deals">Pasiūlymai ({deals.length})</TabsTrigger>
            <TabsTrigger value="settings">
              <Settings2 className="mr-1 h-4 w-4" />
              Nustatymai
            </TabsTrigger>
            <TabsTrigger value="guide">Parametrų gidas</TabsTrigger>
          </TabsList>

          <TabsContent value="deals" className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {lastScanAt
                  ? `Paskutinė paieška: ${new Date(lastScanAt).toLocaleString("lt-LT")}`
                  : "Dar nebuvo atlikta paieška"}
              </span>
              <Button variant="ghost" size="sm" onClick={loadData}>
                <RefreshCw className="mr-1 h-4 w-4" />
                Atnaujinti
              </Button>
            </div>

            {deals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                  <Search className="h-10 w-10 text-muted-foreground" />
                  <p className="text-lg font-medium">Pasiūlymų dar nėra</p>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Paspauskite „Ieškoti dabar“, kad pradėtumėte stebėti TEZ Tour
                    pasiūlymus pagal jūsų kriterijus.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {deals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Biudžetas ir trukmė</CardTitle>
                  <CardDescription>
                    Kaina už vieną asmenį, visa kelionė su skrydžiu
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Min. €/asm</Label>
                      <Input
                        type="number"
                        value={config.pricePerPersonMin}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            pricePerPersonMin: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max. €/asm</Label>
                      <Input
                        type="number"
                        value={config.pricePerPersonMax}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            pricePerPersonMax: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Min. nakvynės</Label>
                      <Input
                        type="number"
                        value={config.nightsMin}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            nightsMin: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max. nakvynės</Label>
                      <Input
                        type="number"
                        value={config.nightsMax}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            nightsMax: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Suaugusių</Label>
                    <Input
                      type="number"
                      value={config.adults}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          adults: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Datų langas (dienų į priekį)</Label>
                    <Input
                      type="number"
                      value={config.dateRangeDays}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          dateRangeDays: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Kryptys ir pranešimai</CardTitle>
                  <CardDescription>
                    Pasirinkite šalis ir Telegram integraciją
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label>Šalys</Label>
                    {DESTINATION_COUNTRIES.map((country) => (
                      <label
                        key={country.id}
                        className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-muted/50"
                      >
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={config.countryIds.includes(country.id)}
                          onChange={() => toggleCountry(country.id)}
                        />
                        <div>
                          <div className="font-medium">{country.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {country.note}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Tik nauji pasiūlymai</Label>
                      <p className="text-xs text-muted-foreground">
                        Telegram pranešti tik apie dar nematytus
                      </p>
                    </div>
                    <Switch
                      checked={config.notifyOnlyNew}
                      onCheckedChange={(checked) =>
                        setConfig({ ...config, notifyOnlyNew: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Telegram pranešimai</Label>
                      <p className="text-xs text-muted-foreground">
                        Reikia boto token ir chat ID
                      </p>
                    </div>
                    <Switch
                      checked={config.telegram.enabled}
                      onCheckedChange={(checked) =>
                        setConfig({
                          ...config,
                          telegram: { ...config.telegram, enabled: checked },
                        })
                      }
                    />
                  </div>

                  {config.telegram.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label>Bot Token</Label>
                        <Input
                          type="password"
                          placeholder="123456:ABC..."
                          value={config.telegram.botToken}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              telegram: {
                                ...config.telegram,
                                botToken: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Chat ID</Label>
                        <Input
                          placeholder="-100..."
                          value={config.telegram.chatId}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              telegram: {
                                ...config.telegram,
                                chatId: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Išsaugoti nustatymus
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="guide" className="space-y-4">
            <GuideContent />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function DealCard({ deal }: { deal: TravelDeal }) {
  return (
    <Card className="overflow-hidden">
      {deal.hotelImage && (
        <div className="relative h-40 w-full bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={deal.hotelImage}
            alt={deal.hotelName}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{deal.hotelName}</CardTitle>
          <Badge variant="secondary">{deal.pricePerPerson} €/asm</Badge>
        </div>
        <CardDescription>
          {deal.resort}, {deal.country}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Išvykimas</span>
            <p className="font-medium">{deal.departureDate}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Trukmė</span>
            <p className="font-medium">{deal.nights} nakvynės</p>
          </div>
          <div>
            <span className="text-muted-foreground">Maitinimas</span>
            <p className="font-medium">{deal.board}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Viso</span>
            <p className="font-medium">{deal.totalPrice} € ({deal.adults} asm.)</p>
          </div>
        </div>
        <a
          href={deal.hotelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
        >
          <ExternalLink className="h-4 w-4" />
          Peržiūrėti pasiūlymą
        </a>
      </CardContent>
    </Card>
  );
}

function GuideContent() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Rekomenduojami parametrai jūsų biudžetui</CardTitle>
          <CardDescription>300–400 €/asm · 4+ žvaigždutės · AI · 2 žmonės</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>
            <strong>Biudžetas:</strong> 300–400 €/asm reiškia 600–800 € už
            abu suaugusiuosius (visa kelionė su skrydžiu, pervežimu ir AI
            maitinimu).
          </p>
          <p>
            <strong>Geriausios kryptys:</strong> Turkija (Antalija, Alanya,
            Kemer, Belek) ir Egiptas (Hurgada) — realiausia pagauti 4* AI šiame
            diapazone. Bulgarija kartais telpa, bet AI retesnis.
          </p>
          <p>
            <strong>Sunkesnės kryptys:</strong> Graikija, Ispanija, Kanarai —
            4* AI dažniau 450–550 €+ / asm, nebent paskutinės minutės arba
            ne sezonas.
          </p>
          <p>
            <strong>Trukmė:</strong> 7–10 nakvynių optimalu. Trumpesnės
            kelionės (5–6 n.) dažnai brangesnės už naktį.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kada ieškoti</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>
            <strong>Geriausias sezonas kainai:</strong> balandis–gegužė,
            rugsėjis–spalis. Vasara (liepa–rugpjūtis) 4* AI retai telpa į
            400 €.
          </p>
          <p>
            <strong>Paskutinės minutės:</strong> 2–4 savaitės iki išvykimo
            dažnai geriausios akcijos. Stebėtojas tikrina artimiausias{" "}
            <em>45 dienas</em> — galite padidinti iki 60–90.
          </p>
          <p>
            <strong>Išvykimas:</strong> Vilnius (VNO). Kaunas kartais pigesnis,
            bet mažesnis pasirinkimas.
          </p>
          <p>
            <strong>Ką filtruojame:</strong> 4+ žvaigždutės, viskas įskaičiuota
            (AI), dvivietis kambarys, 2 suaugę.
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Automatinis stebėjimas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-relaxed">
          <p>
            Šis įrankis naudoja TEZ Tour viešą paieškos API. Paleiskite
            periodiškai per cron arba GitHub Actions:
          </p>
          <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`# Kas valandą
0 * * * * curl -X POST http://localhost:4317/api/scan

# Arba su Telegram — įjunkite nustatymuose`}
          </pre>
          <p className="text-muted-foreground">
            Išvykimo miestai:{" "}
            {DEPARTURE_CITIES.map((c) => `${c.name} (${c.iata})`).join(", ")}.
            Duomenys saugomi lokaliai <code>data/</code> aplanke.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
