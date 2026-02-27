export interface ValidationError {
  field: string
  message: string
}

export function validateEmail(email: string): boolean {
  if (!email) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validateURL(url: string): boolean {
  if (!url) return true
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function validateCNPJ(cnpj: string): boolean {
  if (!cnpj) return true
  const digits = cnpj.replace(/\D/g, '')
  if (digits.length !== 14) return false
  if (/^(\d)\1{13}$/.test(digits)) return false

  const calc = (slice: string, weights: number[]) => {
    const sum = slice
      .split('')
      .reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0)
    const rest = sum % 11
    return rest < 2 ? 0 : 11 - rest
  }

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const d1 = calc(digits.slice(0, 12), w1)
  const d2 = calc(digits.slice(0, 13), w2)

  return d1 === Number(digits[12]) && d2 === Number(digits[13])
}

export function validatePhone(phone: string): boolean {
  if (!phone) return true
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 11
}

export function validateCEP(cep: string): boolean {
  if (!cep) return true
  return /^\d{5}-?\d{3}$/.test(cep.replace(/\s/g, ''))
}

export function validateSettings(settings: Record<string, string>): ValidationError[] {
  const errors: ValidationError[] = []

  if (!validateEmail(settings.email_main)) {
    errors.push({ field: 'email_main', message: 'E-mail principal inválido.' })
  }
  if (!validateEmail(settings.email_support)) {
    errors.push({ field: 'email_support', message: 'E-mail de suporte inválido.' })
  }
  if (!validateEmail(settings.email_privacy)) {
    errors.push({ field: 'email_privacy', message: 'E-mail de privacidade inválido.' })
  }

  if (!validatePhone(settings.phone_whatsapp)) {
    errors.push({ field: 'phone_whatsapp', message: 'Telefone/WhatsApp inválido.' })
  }
  if (!validatePhone(settings.phone_landline)) {
    errors.push({ field: 'phone_landline', message: 'Telefone fixo inválido.' })
  }

  if (!validateCNPJ(settings.company_cnpj)) {
    errors.push({ field: 'company_cnpj', message: 'CNPJ inválido.' })
  }

  if (!validateCEP(settings.address_zip)) {
    errors.push({ field: 'address_zip', message: 'CEP inválido.' })
  }

  if (!validateURL(settings.address_maps_url)) {
    errors.push({ field: 'address_maps_url', message: 'URL do Google Maps inválida.' })
  }

  return errors
}
