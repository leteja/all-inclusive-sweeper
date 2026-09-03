import type { SweeperConfig, TravelDeal } from "./types";

function formatDealMessage(deal: TravelDeal): string {
  return [
    `🏖️ *${deal.hotelName}*`,
    `📍 ${deal.resort}, ${deal.country}`,
    `📅 ${deal.departureDate} → ${deal.returnDate} (${deal.nights} n.)`,
    `🍽 ${deal.board}`,
    `💰 *${deal.pricePerPerson} €/asm* (${deal.totalPrice} € už ${deal.adults})`,
    `✈️ Išvykimas: ${deal.departureCity}`,
    `[Peržiūrėti](${deal.hotelUrl})`,
  ].join("\n");
}

export async function sendTelegramNotification(
  config: SweeperConfig,
  deals: TravelDeal[]
): Promise<number> {
  if (!config.telegram.enabled || !config.telegram.botToken || !config.telegram.chatId) {
    return 0;
  }

  if (deals.length === 0) return 0;

  const header =
    deals.length === 1
      ? "🎯 Rastas naujas pasiūlymas!"
      : `🎯 Rasti ${deals.length} nauji pasiūlymai!`;

  const body = deals.map(formatDealMessage).join("\n\n—\n\n");
  const text = `${header}\n\n${body}`;

  const response = await fetch(
    `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.telegram.chatId,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: false,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram klaida: ${error}`);
  }

  return deals.length;
}
