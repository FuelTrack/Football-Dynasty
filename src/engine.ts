import type { Club } from './data'
import { averageRating } from './data'

export type MatchResult = {
  homeGoals: number
  awayGoals: number
  possessionHome: number
  shotsHome: number
  shotsAway: number
  commentary: string[]
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function simulateMatch(home: Club, away: Club): MatchResult {
  const homeStrength = averageRating(home) + 3
  const awayStrength = averageRating(away)
  const strengthDiff = homeStrength - awayStrength
  const homeXg = clamp(1.35 + strengthDiff * 0.045 + Math.random() * 0.8, 0.35, 3.6)
  const awayXg = clamp(1.05 - strengthDiff * 0.035 + Math.random() * 0.8, 0.25, 3.2)

  const convert = (xg: number) => {
    let goals = 0
    const chances = 5
    for (let i = 0; i < chances; i++) {
      if (Math.random() < xg / chances) goals += 1
    }
    return goals
  }

  const homeGoals = convert(homeXg)
  const awayGoals = convert(awayXg)
  const possessionHome = clamp(Math.round(50 + strengthDiff * 0.8 + (Math.random() * 8 - 4)), 38, 64)
  const shotsHome = Math.max(5, Math.round(homeXg * 4.7 + Math.random() * 4))
  const shotsAway = Math.max(4, Math.round(awayXg * 4.7 + Math.random() * 4))

  const commentary = [
    `Kick-off: ${home.shortName} vs ${away.shortName}.`,
    `${Math.floor(12 + Math.random() * 14)}' ${home.shortName} build patiently through midfield.`,
    `${Math.floor(31 + Math.random() * 10)}' ${away.shortName} force a save after a quick counter.`,
    `Half-time: ${home.shortName} ${Math.min(homeGoals, 1)}-${Math.min(awayGoals, 1)} ${away.shortName}.`,
    `${Math.floor(52 + Math.random() * 12)}' Tactical battle intensifies as both sides push higher.`,
    `${Math.floor(72 + Math.random() * 12)}' Big chance created in the final third.`,
    `Full-time: ${home.shortName} ${homeGoals}-${awayGoals} ${away.shortName}.`,
  ]

  return { homeGoals, awayGoals, possessionHome, shotsHome, shotsAway, commentary }
}
