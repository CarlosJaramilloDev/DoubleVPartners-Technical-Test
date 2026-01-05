/**
 * Formatea un monto como peso colombiano (COP)
 * Ejemplo: 10000 -> "$ 10.000 COP"
 */
export const formatCurrencyCOP = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};

/**
 * Formatea un número con separadores de miles estilo colombiano
 * Ejemplo: 10000 -> "10.000"
 */
export const formatNumber = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat('es-CO').format(numValue);
};

