/**
 * Package / Courier Tracking Number Detector for major shipping providers:
 * UPS, FedEx, USPS, DHL, Amazon Logistics.
 */

export interface DetectedPackage {
  carrier: 'UPS' | 'FedEx' | 'USPS' | 'DHL' | 'Amazon' | 'Generic';
  carrierName: string;
  trackingNumber: string;
  trackingUrl: string;
  status?: string;
}

export function detectPackageTracking(
  subject?: string,
  bodyText?: string,
  bodyHtml?: string
): DetectedPackage | null {
  const combined = `${subject || ''} ${bodyText || ''} ${bodyHtml ? bodyHtml.replace(/<[^>]+>/g, ' ') : ''}`.trim();
  if (!combined) return null;

  // Quick context filter to avoid false positives with random phone numbers
  const hasShippingContext = /(?:track(?:ing)?|ship(?:ment|ped|ping)?|courier|delivery|order|package|parcel|carrier|dispatch)/i.test(combined);
  if (!hasShippingContext) return null;

  // Extract shipment status if present
  let status: string | undefined = undefined;
  if (/out\s+for\s+delivery/i.test(combined)) status = 'Out for Delivery';
  else if (/delivered/i.test(combined)) status = 'Delivered';
  else if (/shipped|in\s+transit/i.test(combined)) status = 'In Transit';

  // 1. Amazon Logistics (TBA + 12 digits)
  const amazonMatch = combined.match(/\b(TBA[0-9]{12})\b/i);
  if (amazonMatch) {
    return {
      carrier: 'Amazon',
      carrierName: 'Amazon Logistics',
      trackingNumber: amazonMatch[1].toUpperCase(),
      trackingUrl: `https://www.amazon.com/progress-tracker/package/ref=ppx_yo_dt_b_track_package?itemId=${amazonMatch[1]}`,
      status,
    };
  }

  // 2. UPS (Starts with 1Z and 16 alphanumerics)
  const upsMatch = combined.match(/\b(1Z[0-9A-Z]{16})\b/i);
  if (upsMatch) {
    return {
      carrier: 'UPS',
      carrierName: 'UPS Express',
      trackingNumber: upsMatch[1].toUpperCase(),
      trackingUrl: `https://www.ups.com/track?tracknum=${upsMatch[1].toUpperCase()}`,
      status,
    };
  }

  // 3. USPS (94..., 92..., 93... with 22 digits, or 2 letters + 9 digits + US)
  const uspsUsMatch = combined.match(/\b([A-Z]{2}[0-9]{9}US)\b/i);
  if (uspsUsMatch) {
    return {
      carrier: 'USPS',
      carrierName: 'USPS Priority Mail',
      trackingNumber: uspsUsMatch[1].toUpperCase(),
      trackingUrl: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${uspsUsMatch[1].toUpperCase()}`,
      status,
    };
  }

  const uspsNumMatch = combined.match(/\b(94[0-9]{20}|92[0-9]{20}|93[0-9]{20})\b/);
  if (uspsNumMatch) {
    return {
      carrier: 'USPS',
      carrierName: 'USPS Tracking',
      trackingNumber: uspsNumMatch[1],
      trackingUrl: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${uspsNumMatch[1]}`,
      status,
    };
  }

  // 4. FedEx (12, 15, or 20 digits in FedEx context)
  if (/fedex/i.test(combined)) {
    const fedexMatch = combined.match(/\b([0-9]{12}|[0-9]{15}|[0-9]{20})\b/);
    if (fedexMatch) {
      return {
        carrier: 'FedEx',
        carrierName: 'FedEx Express',
        trackingNumber: fedexMatch[1],
        trackingUrl: `https://www.fedex.com/fedextrack/?trknbr=${fedexMatch[1]}`,
        status,
      };
    }
  }

  // 5. DHL (10 or 11 digits in DHL context)
  if (/dhl/i.test(combined)) {
    const dhlMatch = combined.match(/\b([0-9]{10}|[0-9]{11})\b/);
    if (dhlMatch) {
      return {
        carrier: 'DHL',
        carrierName: 'DHL Express',
        trackingNumber: dhlMatch[1],
        trackingUrl: `https://www.dhl.com/en/express/tracking.html?AWB=${dhlMatch[1]}`,
        status,
      };
    }
  }

  return null;
}
