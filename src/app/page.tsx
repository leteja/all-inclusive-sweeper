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
import type {
  HotelSummary,
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

export default function HomePage() {
  const [config, setConfig] = useState<SweeperConfig | null>(null);
  const [deals, setDeals] = useState<TravelDeal[]>([]);
  const [targetAlerts, setTargetAlerts] = useState<TravelDeal[]>([]);
  const [bestDeal, setBestDeal] = useState<TravelDeal | null>(null);
  const [hotelSummaries, setHotelSummaries] = useState<HotelSummary[]>([]);
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
    const dealsData = await dealsRes.json();
    setConfig(configData);
    setDeals(dealsData.deals ?? []);
    setTargetAlerts(dealsData.targetAlerts ?? []);
    setBestDeal(dealsData.bestDeal ?? null);
    setHotelSummaries(dealsData.hotelSummaries ?? []);
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

  if (!config) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    );
  }

  const alerts = scanResult?.targetAlerts ?? targetAlerts;
  const recommended = scanResult?.bestDeal ?? bestDeal;
  const summaries = scanResult?.hotelSummaries ?? hotelSummaries;

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
                5 atrinkti viešbučiai · kokybė + kaina · 300–400 €/asm
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

        {alerts.length > 0 && (
          <Alert className="border-green-300 bg-green-50 text-green-900">
            <Bell className="h-4 w-4 text-green-700" />
            <AlertTitle>Tikslinė kaina pasiekta!</AlertTitle>
            <AlertDescription>
              {alerts.length === 1
                ? `Rastas pasiūlymas ${alerts[0].pricePerPerson} €/asm — ${alerts[0].hotelName}`
                : `Rasti ${alerts.length} pasiūlymai jūsų 300–400 € biudžete!`}
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
                Geriausias kainos ir kokybės balansas (įvertinimas{" "}
                {recommended.qualityScore}/10, balas{" "}
                {recommended.valueScore})
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
                  ? `Paskutinė paieška: ${new Date(lastScanAt).toLocaleString("lt-LT")}`
                  : "Dar nebuvo atlikta paieška"}
              </span>
              <Button variant="ghost" size="sm" onClick={loadData}>
                <RefreshCw className="mr-1 h-4 w-4" />
                Atnaujinti
              </Button>
            </div>

            <div className="grid gap-4">
              {(summaries.length > 0 ? summaries : config.watchlist.map((h) => ({
                hotelId: h.hotelId,
                name: h.name,
                url: h.url,
                resort: h.resort,
                stars: h.stars,
                qualityScore: h.qualityScore,
                note: h.note,
                cheapestDeal: null,
                valueScore: 0,
              }))).map((summary) => (
                <HotelSummaryCard key={summary.hotelId} summary={summary} targetMax={config.pricePerPersonMax} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="deals" className="space-y-4">
            {deals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                  <Search className="h-10 w-10 text-muted-foreground" />
                  <p className="text-lg font-medium">Pasiūlymų dar nėra</p>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Paspauskite „Ieškoti dabar“ — tikrinsime tik 5 atrinktus
                    viešbučius.
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
                  <CardTitle>Tikslinė kaina</CardTitle>
                  <CardDescription>
                    Pranešime, kai kaina patenka į šį diapazoną
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
                    Tik per šiuos 5 TEZ Tour puslapius ieškoma
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
                        <Badge variant="outline">
                          <Star className="mr-1 h-3 w-3" />
                          {hotel.qualityScore}
                        </Badge>
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
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{summary.name}</h3>
            <Badge variant="secondary">{summary.stars}*</Badge>
            <Badge variant="outline">Kokybė {summary.qualityScore}/10</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {summary.resort} · {summary.note}
          </p>
          {deal && (
            <p className="text-sm">
              Artimiausias: {deal.departureDate}, {deal.nights} n. ·{" "}
              {deal.board}
            </p>
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
                  <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                    <TrendingDown className="h-3 w-3" />
                    virš tikslo {deal.pricePerPerson - targetMax} €
                  </p>
                )}
                {deal.inTargetRange && (
                  <p className="text-xs font-medium text-green-600">
                    Tinka biudžetui!
                  </p>
                )}
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
          {deal.resort}, {deal.country} · Kokybė {deal.qualityScore}/10
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
