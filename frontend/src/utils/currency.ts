export const getCurrencySymbol = (currencyCode?: string): string => {
  switch (currencyCode) {
    case 'INR':
      return '₹';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'CAD':
      return 'C$';
    case 'AUD':
      return 'A$';
    case 'USD':
    default:
      return '$';
  }
};
