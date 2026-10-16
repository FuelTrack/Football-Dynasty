export type Player = {
  id: number
  name: string
  position: 'GK' | 'DEF' | 'MID' | 'FWD'
  age: number
  rating: number
  potential: number
  fitness: number
  morale: number
}

export type Club = {
  id: string
  name: string
  shortName: string
  city: string
  budget: number
  reputation: number
  colour: string
  players: Player[]
}

const firstNames = ['Leo','Mason','Elliot','Noah','Oscar','Theo','Max','Isaac','Sam','Finn','Luca','Jamie','Jude','Alex','Harry','Ben','Owen','Callum','Rhys','Tom','Jack','Ethan']
const lastNames = ['Mercer','Vale','Rowan','Hale','Bennett','Sutton','Webb','Cross','Warren','Keane','Drake','Holt','Marsh','Frost','Reid','Parker','Stone','Brooks','Flynn','Cole','Doyle','Hart']
const positions: Player['position'][] = ['GK','GK','DEF','DEF','DEF','DEF','DEF','DEF','MID','MID','MID','MID','MID','MID','FWD','FWD','FWD','FWD','DEF','MID','FWD','GK']

function makePlayers(seed: number, strength: number): Player[] {
  return positions.map((position, index) => {
    const rating = Math.max(55, Math.min(88, strength + ((index * 7 + seed * 3) % 11) - 5))
    return {
      id: seed * 100 + index + 1,
      name: `${firstNames[(index + seed) % firstNames.length]} ${lastNames[(index * 3 + seed) % lastNames.length]}`,
      position,
      age: 18 + ((index * 2 + seed) % 16),
      rating,
      potential: Math.min(92, rating + ((index + seed) % 8)),
      fitness: 88 + ((index + seed) % 13),
      morale: 70 + ((index * 4 + seed) % 26),
    }
  })
}

const clubSeed = [
  ['Crown Athletic','Crown','London',78,'#8b5cf6'],
  ['Northbridge FC','Northbridge','Manchester',76,'#22c55e'],
  ['Harbour City','Harbour','Liverpool',75,'#38bdf8'],
  ['Kingsport United','Kingsport','Newcastle',73,'#f59e0b'],
  ['Redwood Rovers','Redwood','Nottingham',72,'#ef4444'],
  ['Westmere Albion','Westmere','Birmingham',71,'#14b8a6'],
  ['Riverside 1889','Riverside','Leeds',70,'#e879f9'],
  ['Ironvale FC','Ironvale','Sheffield',69,'#a3e635'],
  ['Southbank Town','Southbank','Bristol',68,'#fb7185'],
  ['Oakchester','Oakchester','Leicester',67,'#60a5fa'],
] as const

export const clubs: Club[] = clubSeed.map(([name, shortName, city, strength, colour], index) => ({
  id: `club-${index + 1}`,
  name,
  shortName,
  city,
  budget: 8_000_000 + strength * 310_000,
  reputation: strength,
  colour,
  players: makePlayers(index + 1, strength),
}))

export function averageRating(club: Club) {
  return Math.round(club.players.slice().sort((a,b) => b.rating - a.rating).slice(0,11).reduce((sum,p) => sum + p.rating, 0) / 11)
}
