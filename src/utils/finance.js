export function parseRenewalDate(dateStr) {
  const [month, day] = dateStr.split(' ');
  const monthIndex = new Date(`${month} 1, 2026`).getMonth();
  return new Date(2026, monthIndex, Number(day));
}

export function getRenewalDaysLeft(dateStr, today = new Date()) {
  return Math.round((parseRenewalDate(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatShortDate(value) {
  if (!value) return 'Mar 18';
  if (/^[A-Z][a-z]{2}\s\d{1,2}$/.test(value)) return value;
  const [year, month, day] = String(value).split('-').map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }).replace(',', '');
}

export function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export function getAIReply(message, responses) {
  const lower = message.toLowerCase();
  if (lower.includes('food') || lower.includes('eat') || lower.includes('zomato')) return responses.food;
  if (lower.includes('save') || lower.includes('saving')) return responses.save;
  if (lower.includes('invest') || lower.includes('stock') || lower.includes('portfolio')) return responses.invest;
  if (lower.includes('sub') || lower.includes('netflix') || lower.includes('spotify')) return responses.subs;
  if (lower.includes('budget') || lower.includes('spend')) return responses.budget;
  if (lower.includes('tip') || lower.includes('suggest') || lower.includes('advice')) return responses.tip;
  return responses.default;
}
