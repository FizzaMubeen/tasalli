import { Helpline } from '../types';

export const HELPLINES: Helpline[] = [
  {
    country_code: 'US',
    country_name: 'United States',
    name: '988 Suicide & Crisis Lifeline',
    phone: '988',
    emergency: '911',
    url: 'https://988lifeline.org',
    hours: '24/7, free and confidential',
    verified_on: '2026-10-01'
  },
  {
    country_code: 'UK',
    country_name: 'United Kingdom',
    name: 'Samaritans & NHS Mental Health',
    phone: '116 123 (Samaritans) / 111 (NHS)',
    emergency: '999',
    url: 'https://www.samaritans.org',
    hours: '24/7, free',
    verified_on: '2026-10-01'
  },
  {
    country_code: 'CA',
    country_name: 'Canada',
    name: 'Naseeha Muslim Mental Health Helpline / 988',
    phone: '1-866-NASEEHA (627-3342) / 988',
    emergency: '911',
    url: 'https://naseeha.org',
    hours: '24/7 support',
    verified_on: '2026-10-01'
  },
  {
    country_code: 'PK',
    country_name: 'Pakistan',
    name: 'Umang Mental Health Helpline',
    phone: '0311-7786264',
    emergency: '1122',
    url: 'https://umang.com.pk',
    hours: '24/7 dedicated support',
    verified_on: '2026-10-01'
  },
  {
    country_code: 'DE',
    country_name: 'Germany',
    name: 'TelefonSeelsorge & Muslimisches Seelsorge-Telefon',
    phone: '0800 111 0 111 / MuSeT: 030 44 35 09 821',
    emergency: '112',
    url: 'https://www.telefonseelsorge.de',
    hours: '24/7 kostenfrei',
    verified_on: '2026-10-01'
  },
  {
    country_code: 'SA',
    country_name: 'Saudi Arabia',
    name: 'National Center for Mental Health Promotion (Estishara)',
    phone: '920033360',
    emergency: '997 (Ambulance) / 911',
    url: 'https://ncmh.org.sa',
    hours: 'Daily 8am - 12 midnight',
    verified_on: '2026-10-01'
  },
  {
    country_code: 'AE',
    country_name: 'United Arab Emirates',
    name: 'National Mental Health Support Line',
    phone: '800-4673 (HOPE)',
    emergency: '999 (Police) / 998 (Ambulance)',
    url: 'https://mop.gov.ae',
    hours: '8:00 AM - 8:00 PM daily',
    verified_on: '2026-10-01'
  },
  {
    country_code: 'IN',
    country_name: 'India',
    name: 'Tele-MANAS (Govt of India Mental Health)',
    phone: '14416 / 1800-891-4416',
    emergency: '112',
    url: 'https://telemanas.mohfw.gov.in',
    hours: '24/7 toll-free multilingual',
    verified_on: '2026-10-01'
  },
  {
    country_code: 'MY',
    country_name: 'Malaysia',
    name: 'Talian Kasih & Befrienders KL',
    phone: '15999 (Talian Kasih) / 03-7627 2929',
    emergency: '999',
    url: 'https://www.befrienders.org.my',
    hours: '24/7 confidential emotional support',
    verified_on: '2026-10-01'
  },
  {
    country_code: 'ID',
    country_name: 'Indonesia',
    name: 'Sejiwa Helpline & Lisa Suicide Hotline',
    phone: '119 ext. 8 / 0811-3855-472',
    emergency: '112',
    url: 'https://kemkes.go.id',
    hours: '24 Jam bebas pulsa',
    verified_on: '2026-10-01'
  }
];

export const DEFAULT_FALLBACK_HELPLINE: Helpline = {
  country_code: 'GLOBAL',
  country_name: 'International / Global Support',
  name: 'Befrienders Worldwide & IASP Network',
  phone: 'Visit befrienders.org for international confidential support',
  emergency: 'Local Emergency Number (e.g. 112, 911, 999)',
  url: 'https://www.befrienders.org',
  hours: 'Global volunteer network 24/7',
  verified_on: '2026-10-01'
};

export function getHelplineForCountry(countryCode?: string): Helpline {
  if (!countryCode) return HELPLINES[0];
  const found = HELPLINES.find(h => h.country_code.toUpperCase() === countryCode.toUpperCase());
  return found || DEFAULT_FALLBACK_HELPLINE;
}
