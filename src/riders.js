import cyanImage from './assets/riders/cyan.webp'
import navyImage from './assets/riders/navy.webp'
import orangeImage from './assets/riders/orange.webp'

// The reference art inspires low-poly riders that fit the existing animated models.
export const RIDERS = [
  { id: 'classic', name: 'Classic', image: null },
  { id: 'cyan', name: 'Cyan', image: cyanImage, jersey: '#263940', jerseyDark: '#263940', accent: '#24e4ec', pants: '#1c252b', skin: '#b97b5c', hair: '#111820', sleeves: true },
  { id: 'navy', name: 'Navy', image: navyImage, jersey: '#283754', jerseyDark: '#202a3a', accent: '#657b8d', pants: '#191f2c', skin: '#b77c60', hair: '#241b19', sleeves: false },
  { id: 'orange', name: 'Orange', image: orangeImage, jersey: '#1b2028', jerseyDark: '#1b2028', accent: '#ff790c', pants: '#22232a', skin: '#ac7055', hair: '#11151a', sleeves: true },
]
export function cleanRider(id) { return RIDERS.some((r) => r.id === id) ? id : 'classic' }
export function getRider(id) { return RIDERS.find((r) => r.id === cleanRider(id)) }
