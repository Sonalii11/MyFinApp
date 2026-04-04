import { buildDashboardSnapshot } from '../selectors';

export async function getDigitalWalletPreview(snapshot) {
  // Future API integration: fetch wallet summary and available credit from Wallet service.
  return buildDashboardSnapshot(snapshot).walletPreview;
}
