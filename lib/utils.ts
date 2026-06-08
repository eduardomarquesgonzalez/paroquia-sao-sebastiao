import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// \u2500\u2500\u2500 Constantes de locale e timezone \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const TZ = 'America/Cuiaba'
const LOCALE = 'pt-BR'

// \u2500\u2500\u2500 Utilit\u00e1rios de exibi\u00e7\u00e3o de data/hora (l\u00eaem UTC, exibem em Cuiab\u00e1) \u2500\u2500\u2500\u2500\u2500

/** Ex: "15" */
export function formatDay(date: Date | string): string {
  return new Date(date).toLocaleDateString(LOCALE, { timeZone: TZ, day: '2-digit' })
}

/** Ex: "JAN" */
export function formatMonthShort(date: Date | string): string {
  return new Date(date)
    .toLocaleDateString(LOCALE, { timeZone: TZ, month: 'short' })
    .replace('.', '')
    .toUpperCase()
}

/** Ex: "19:00" */
export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString(LOCALE, {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Ex: "segunda-feira" */
export function formatWeekday(date: Date | string): string {
  return new Date(date).toLocaleDateString(LOCALE, { timeZone: TZ, weekday: 'long' })
}

/** Ex: "15 de janeiro de 2024" */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString(LOCALE, {
    timeZone: TZ,
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

/** Ex: "segunda-feira, 15 de janeiro de 2024" */
export function formatDateFull(date: Date | string): string {
  return new Date(date).toLocaleDateString(LOCALE, {
    timeZone: TZ,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

/** Ex: "15 jan. 2024, 19:00" \u2014 para tabelas administrativas */
export function formatDateTimeShort(date: Date | string): string {
  return new Date(date).toLocaleString(LOCALE, {
    timeZone: TZ,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// \u2500\u2500\u2500 Convers\u00e3o UTC \u2194 input datetime-local no fuso de Cuiab\u00e1 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

/**
 * Converte uma ISO string UTC para o formato "YYYY-MM-DDTHH:MM" no hor\u00e1rio
 * de Cuiab\u00e1, usado em <input type="datetime-local">.
 */
export function toDatetimeLocalCuiaba(isoString: string): string {
  if (!isoString) return ''
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date(isoString)).map((p) => [p.type, p.value])
  )
  const hour = parts.hour === '24' ? '00' : parts.hour
  return `${parts.year}-${parts.month}-${parts.day}T${hour}:${parts.minute}`
}

/**
 * Converte o valor de <input type="datetime-local"> (hor\u00e1rio local de Cuiab\u00e1)
 * para uma ISO string UTC pronta para envio \u00e0 API.
 * Cuiab\u00e1 usa UTC-4 permanentemente desde a extin\u00e7\u00e3o do hor\u00e1rio de ver\u00e3o em 2019.
 */
export function fromDatetimeLocalCuiaba(localString: string): string {
  if (!localString) return ''
  return new Date(`${localString}:00-04:00`).toISOString()
}

/** Verifica se uma data (em UTC) j\u00e1 passou */
export function isDatePast(date: Date | string): boolean {
  return new Date(date) < new Date()
}

// \u2500\u2500\u2500 Outras utilidades \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}
