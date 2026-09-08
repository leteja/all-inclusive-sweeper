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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_WATCHLIST } from "@/lib/constants";
import { getCompareLinks } from "@/lib/sources";
import type {
  HotelSummary,
  PriceDropAlert,
  ScanResult,
  SweeperConfig,
  TravelDeal,
} from "@/lib/types";
import {
  Award,
  Bell,
  ExternalLink,
  Loader2,
  Plane,
  RefreshCw,
  Search,
  Settings2,
  Star,
  TrendingDown,
} from "lucide-react";

const SOURCE_LABELS: Record<string, string> = {
  "tez-tour": "TEZ Tour",
  "tez-ispardavimas": "TEZ Išpardavimas",
  novaturas: "Novaturas",
  westexpress: "West Express",
  joinup: "JoinUP",
  coral: "Coral Travel",
  anextour: "Anex Tour",
  itaka: "Itaka",
  pasirinksparnus: "Pasirink Sparnus",
  kelioniupanorama: "Kelionių Panorama",
};

export default function HomePage() {
  const [config, setConfig] = useState<SweeperConfig | null>(null);
  const [deals, setDeals] = useState<TravelDeal[]>([]);
  const [targetAlerts, setTargetAlerts] = useState<TravelDeal[]>([]);
  const [priceDrops, setPriceDrops] = useState<PriceDropAlert[]>([]);
  const [bestDeal, setBestDeal] = useState<TravelDeal | null>(null);
  const [hotelSummaries, setHotelSummaries] = useState<HotelSummary[]>([]);
  const [lastScanAt, setLastScanAt] = useState<string | null>(null);
  const [sourcesScanned, setSourcesScanned] = useState<string[]>([]);
  const [dealFilter, setDealFilter] = useState<"all" | "budget" | "joinup">("budget");
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
    const dealsData = await dealsRes.json();
    setConfig(configData);
    setDeals(dealsData.deals ?? []);
    setTargetAlerts(dealsData.targetAlerts ?? []);
    setBestDeal(dealsData.bestDeal ?? null);
    setHotelSummaries(dealsData.hotelSummaries ?? []);
    setLastScanAt(dealsData.lastScanAt ?? null);
    setSourcesScanned(dealsData.sourcesScanned ?? []);
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
      setPriceDrops(data.priceDrops ?? []);
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

  if (!config) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    );
  }

  const alerts = scanResult?.targetAlerts ?? targetAlerts;
  const drops = scanResult?.priceDrops ?? priceDrops;
  const recommended = scanResult?.bestDeal ?? bestDeal;
  const summaries = scanResult?.hotelSummaries ?? hotelSummaries;

  const sortedDeals = [...deals].sort(
    (a, b) => a.pricePerPerson - b.pricePerPerson
  );
  const filteredDeals = sortedDeals.filter((deal) => {
    if (dealFilter === "budget") {
      return (
        deal.inTargetRange ||
        deal.pricePerPerson <= (config?.pricePerPersonMax ?? 400)
      );
    }
    if (dealFilter === "joinup") return deal.source === "joinup";
    return true;
  });

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
                TEZ + JoinUP + Itaka automatiškai · kitos agentūros nuorodomis
              </p>
            </div>
          </div>
          <Button onClick={handleScan} disabled={scanning} size="lg">
            {scanning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            {scanning ? "Ieškoma..." : "Tikrinti kainas"}
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

        <Alert className="border-sky-200 bg-sky-50 text-sky-950">
          <AlertTitle>Šaltiniai</AlertTitle>
          <AlertDescription>
            <strong>Automatiškai</strong> (GitHub Actions ~20:00): TEZ Tour, JoinUP,
            Itaka.
            {sourcesScanned.length > 0 && (
              <>
                {" "}
                Paskutinis skenavimas: {sourcesScanned.join(", ")}.
              </>
            )}
            <br />
            <strong>Rankiniu būdu</strong> (nuorodos po kiekvienu viešbučiu):
            Novaturas, West Express, Coral — jų svetainės blokuoja serverių
            užklausas, todėl ten reikia tikrinti per nuorodą.
          </AlertDescription>
        </Alert>

        <Alert className="border-amber-200 bg-amber-50 text-amber-950">
          <AlertTitle>Kainos skiriasi tarp agentūrų</AlertTitle>
          <AlertDescription>
            TEZ dažnai rodo <strong>brangesnes</strong> kainas (~600–800 €/asm).
            <strong> JoinUP</strong> neretai turi pigesnius variantus — žiūrėkite
            stulpelį „Kainos pagal agentūrą“ prie kiekvieno viešbučio. Jei nematote
            JoinUP kainų, įsitikinkite kad nusiuntėte naujausią kodą į GitHub ir
            paleidote Actions workflow.
          </AlertDescription>
        </Alert>

        {alerts.length > 0 && (
          <Alert className="border-green-300 bg-green-50 text-green-900">
            <Bell className="h-4 w-4 text-green-700" />
            <AlertTitle>Tikslinė kaina pasiekta!</AlertTitle>
            <AlertDescription>
              {alerts.length === 1
                ? `${alerts[0].hotelName} — ${alerts[0].pricePerPerson} €/asm (${alerts[0].departureDate})`
                : `${alerts.length} pasiūlymai jūsų ${config.pricePerPersonMin}–${config.pricePerPersonMax} € biudžete!`}
            </AlertDescription>
          </Alert>
        )}

        {drops.length > 0 && (
          <Alert className="border-sky-300 bg-sky-50 text-sky-900">
            <TrendingDown className="h-4 w-4 text-sky-700" />
            <AlertTitle>Kaina nukrito!</AlertTitle>
            <AlertDescription>
              <ul className="mt-1 space-y-1">
                {drops.map((d) => (
                  <li key={d.hotelId}>
                    <strong>{d.hotelName}</strong>: {d.previousPrice} →{" "}
                    {d.newPrice} €/asm (−{d.dropAmount} €)
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {recommended && (
          <Card className="border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-600" />
                <CardTitle>Rekomenduojamas variantas</CardTitle>
              </div>
              <CardDescription>
                Geriausias kokybės ir kainos balansas — svečių įvertinimas{" "}
                {recommended.guestRating}/10, vertės balas {recommended.valueScore}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DealCard deal={recommended} highlight />
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="hotels">
          <TabsList>
            <TabsTrigger value="hotels">Viešbučiai ({summaries.length})</TabsTrigger>
            <TabsTrigger value="deals">Visi pasiūlymai ({deals.length})</TabsTrigger>
            <TabsTrigger value="settings">
              <Settings2 className="mr-1 h-4 w-4" />
              Nustatymai
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hotels" className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {lastScanAt
                  ? `Paskutinė patikra: ${new Date(lastScanAt).toLocaleString("lt-LT")}`
                  : "Dar nebuvo atlikta patikra"}
              </span>
              <Button variant="ghost" size="sm" onClick={loadData}>
                <RefreshCw className="mr-1 h-4 w-4" />
                Atnaujinti
              </Button>
            </div>

            <div className="grid gap-4">
              {(summaries.length > 0
                ? summaries
                : config.watchlist.map((h) => ({
                    hotelId: h.hotelId,
                    name: h.name,
                    url: h.url,
                    resort: h.resort,
                    stars: h.stars,
                    guestRating: h.guestRating,
                    note: h.note,
                    cheapestDeal: null,
                    valueScore: 0,
                    previousLowest: null,
                    priceDropped: false,
                    dropAmount: 0,
                    compareLinks: getCompareLinks(h),
                    sourcePrices: [],
                  }))
              ).map((summary) => (
                <HotelSummaryCard
                  key={summary.hotelId}
                  summary={summary}
                  targetMax={config.pricePerPersonMax}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="deals" className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={dealFilter === "budget" ? "default" : "outline"}
                onClick={() => setDealFilter("budget")}
              >
                ≤ {config.pricePerPersonMax} €/asm
              </Button>
              <Button
                size="sm"
                variant={dealFilter === "joinup" ? "default" : "outline"}
                onClick={() => setDealFilter("joinup")}
              >
                Tik JoinUP
              </Button>
              <Button
                size="sm"
                variant={dealFilter === "all" ? "default" : "outline"}
                onClick={() => setDealFilter("all")}
              >
                Visi ({deals.length})
              </Button>
            </div>

            {filteredDeals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                  <Search className="h-10 w-10 text-muted-foreground" />
                  <p className="text-lg font-medium">Pasiūlymų dar nėra</p>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Paspauskite „Tikrinti kainas“ — stebėsime 5 geriausiai
                    įvertintus biudžetinius viešbučius ir pranešime, kai kaina
                    kris.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredDeals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Pranešimų nustatymai</CardTitle>
                  <CardDescription>
                    Kada pranešti apie kainų pokyčius
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tikslas min. €/asm</Label>
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
                      <Label>Tikslas max. €/asm</Label>
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
                  <div className="space-y-2">
                    <Label>Kainos kritimo slenkstis (€/asm)</Label>
                    <Input
                      type="number"
                      value={config.priceDropThreshold}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          priceDropThreshold: Number(e.target.value),
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Pranešti, kai kaina nukrenta bent šiuo dydžiu nuo
                      ankstesnio minimumo
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Min. svečių įvertinimas (/10)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={config.minGuestRating}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          minGuestRating: Number(e.target.value),
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
                  <CardTitle>Stebimi viešbučiai</CardTitle>
                  <CardDescription>
                    4–5* AI su Booking įvertinimu ≥ {config.minGuestRating}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {config.watchlist.map((hotel) => (
                    <div
                      key={hotel.hotelId}
                      className="rounded-lg border p-3 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{hotel.name}</span>
                        <div className="flex gap-1">
                          <Badge variant="secondary">{hotel.stars}*</Badge>
                          <Badge variant="outline">
                            <Star className="mr-1 h-3 w-3" />
                            {hotel.guestRating}
                          </Badge>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {hotel.note}
                      </p>
                      <a
                        href={hotel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs text-sky-600 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        tez-tour.com
                      </a>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setConfig({ ...config, watchlist: [...DEFAULT_WATCHLIST] })
                    }
                  >
                    Atstatyti numatytuosius
                  </Button>
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
        </Tabs>
      </main>
    </div>
  );
}

function HotelSummaryCard({
  summary,
  targetMax,
}: {
  summary: HotelSummary;
  targetMax: number;
}) {
  const deal = summary.cheapestDeal;
  const overBudget = deal && deal.pricePerPerson > targetMax;

  return (
    <Card className={summary.priceDropped ? "border-sky-400 bg-sky-50/50" : ""}>
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{summary.name}</h3>
            <Badge variant="secondary">{summary.stars}*</Badge>
            <Badge variant="outline">Svečiai {summary.guestRating}/10</Badge>
            {summary.priceDropped && (
              <Badge className="bg-sky-600">
                <TrendingDown className="mr-1 h-3 w-3" />−{summary.dropAmount} €
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{summary.note}</p>
          {deal && (
            <p className="text-sm">
              Artimiausias: {deal.departureDate}, {deal.nights} n. · {deal.board}
            </p>
          )}
          {(summary.sourcePrices ?? []).length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Kainos pagal agentūrą (mažiausia / asm.):
              </p>
              <div className="flex flex-wrap gap-2">
                {(summary.sourcePrices ?? []).map((item) => (
                  <a
                    key={item.source}
                    href={item.deal.hotelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs hover:bg-muted ${
                      item.deal.inTargetRange
                        ? "border-green-400 bg-green-50 font-medium text-green-800"
                        : item.source === "joinup"
                          ? "border-sky-400 bg-sky-50"
                          : ""
                    }`}
                  >
                    <span>{SOURCE_LABELS[item.source] ?? item.source}</span>
                    <span className="font-semibold">{item.pricePerPerson} €</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </div>
          )}
          {summary.previousLowest !== null && deal && (
            <p className="text-xs text-muted-foreground">
              Ankstesnis minimumas: {summary.previousLowest} €/asm
            </p>
          )}
          {(summary.compareLinks ?? []).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(summary.compareLinks ?? []).map((link) => (
                <a
                  key={link.sourceId}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs hover:bg-muted ${
                    link.automated ? "border-sky-300 bg-sky-50" : ""
                  }`}
                >
                  <ExternalLink className="h-3 w-3" />
                  {link.name}
                  {link.automated && (
                    <span className="text-[10px] text-sky-600">auto</span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {deal ? (
            <>
              <div className="text-right">
                <div
                  className={`text-2xl font-bold ${deal.inTargetRange ? "text-green-600" : overBudget ? "text-muted-foreground" : ""}`}
                >
                  {deal.pricePerPerson} €
                  <span className="text-sm font-normal text-muted-foreground">
                    /asm
                  </span>
                </div>
                {overBudget && (
                  <p className="text-xs text-muted-foreground">
                    +{deal.pricePerPerson - targetMax} € virš tikslo
                  </p>
                )}
                {deal.inTargetRange && (
                  <p className="text-xs font-medium text-green-600">
                    Tinka biudžetui!
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {SOURCE_LABELS[deal.source] ?? deal.source}
                </p>
              </div>
              <a
                href={deal.hotelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1 rounded-lg border px-3 text-sm hover:bg-muted"
              >
                <ExternalLink className="h-4 w-4" />
                Žiūrėti
              </a>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Nėra pasiūlymų</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DealCard({
  deal,
  highlight = false,
}: {
  deal: TravelDeal;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-0 bg-transparent shadow-none" : "overflow-hidden"}>
      {!highlight && deal.hotelImage && (
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
          <div className="flex flex-col items-end gap-1">
            <Badge
              variant={deal.inTargetRange ? "default" : "secondary"}
              className={deal.inTargetRange ? "bg-green-600" : ""}
            >
              {deal.pricePerPerson} €/asm
            </Badge>
            {deal.inTargetRange && (
              <span className="text-xs font-medium text-green-600">
                Tinka biudžetui
              </span>
            )}
          </div>
        </div>
        <CardDescription>
          {deal.resort} · Svečiai {deal.guestRating}/10 ·{" "}
          {SOURCE_LABELS[deal.source] ?? deal.source}
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
            <p className="font-medium">
              {deal.totalPrice} € ({deal.adults} asm.)
            </p>
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
