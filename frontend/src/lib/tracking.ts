type TrackClickPayload = {
  type: 'affiliate_click' | 'accessory_click';
  productId?: string;
  accessoryId?: string;
  merchantName?: string;
  url?: string;
  placement?: string;
};

export async function trackClick(payload: TrackClickPayload): Promise<void> {
  try {
    await fetch('/api/tracking/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify(payload),
    });
  } catch {
    // Ne bloque jamais la navigation affiliée
  }
}
