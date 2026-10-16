import { useMemo, useState } from 'react'
import { clubs, type Club } from './data'
import { simulateMatch, type MatchResult } from './engine'

const navItems = ['Dashboard', 'Squad', 'Tactics', 'Match Centre'] as const
type View = (typeof navItems)[number]

type SaveData = {
  clubId: string
  managerName: string
  view: View
  lastResult?: MatchResult
}

function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem('football-dynasty-save')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function App() {
  const saved = loadSave()
  const [managerName, setManagerName] = useState(saved?.managerName ?? '')
  const [clubId, setClubId] = useState(saved?.clubId ?? '')
  const [view, setView] = useState<View>(saved?.view ?? 'Dashboard')
  const [lastResult, setLastResult] = useState<MatchResult | undefined>(saved?.lastResult)

  const club = useMemo(() => clubs.find((item) => item.id === clubId), [clubId])
  const opponent = useMemo(() => club ? clubs.find((item) => item.id !== club.id)! : undefined, [club])

  const persist = (next: Partial<SaveData> = {}) => {
    if (!clubId || !managerName) return
    const payload: SaveData = { clubId, managerName, view, lastResult, ...next }
    localStorage.setItem('football-dynasty-save', JSON.stringify(payload))
  }

  if (!club) {
    return (
      <main className="welcome-shell">
        <section className="welcome-card">
          <div className="eyebrow">FOOTBALL DYNASTY</div>
          <h1>Build your football legacy.</h1>
          <p>Create a manager, choose a fictional club, and start shaping your first season.</p>
          <label>
            Manager name
            <input value={managerName} onChange={(e) => setManagerName(e.target.value)} placeholder="Your name" />
          </label>
          <div className="club-grid">
            {clubs.map((item) => (
              <button key={item.id} className="club-choice" onClick={() => managerName.trim() && setClubId(item.id)}>
                <span className="club-dot" style={{ background: item.colour }} />
                <strong>{item.name}</strong>
                <small>{item.city} · Reputation {item.reputation}</small>
              </button>
            ))}
          </div>
          {!managerName.trim() && <div className="hint">Enter your manager name before selecting a club.</div>}
        </section>
      </main>
    )
  }

  const simulate = () => {
    if (!opponent) return
    const result = simulateMatch(club, opponent)
    setLastResult(result)
    setView('Match Centre')
    persist({ lastResult: result, view: 'Match Centre' })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand">FD</div>
          <div className="brand-copy"><strong>Football Dynasty</strong><span>Season 1</span></div>
        </div>
        <nav>
          {navItems.map((item) => (
            <button key={item} className={view === item ? 'active' : ''} onClick={() => { setView(item); persist({ view: item }) }}>{item}</button>
          ))}
        </nav>
        <div className="manager-card"><span>{managerName}</span><small>Manager · {club.shortName}</small></div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div><div className="eyebrow">{view.toUpperCase()}</div><h2>{club.name}</h2></div>
          <button className="primary" onClick={() => persist()}>Save career</button>
        </header>

        {view === 'Dashboard' && <Dashboard club={club} opponent={opponent} onSimulate={simulate} />}
        {view === 'Squad' && <Squad club={club} />}
        {view === 'Tactics' && <Tactics club={club} />}
        {view === 'Match Centre' && <MatchCentre club={club} opponent={opponent} result={lastResult} onSimulate={simulate} />}
      </main>
    </div>
  )
}

function Dashboard({ club, opponent, onSimulate }: { club: Club; opponent?: Club; onSimulate: () => void }) {
  const topPlayers = [...club.players].sort((a, b) => b.rating - a.rating).slice(0, 5)
  return <div className="page-grid">
    <section className="hero-panel">
      <div><div className="eyebrow">NEXT FIXTURE</div><h3>{club.shortName} vs {opponent?.shortName}</h3><p>Dynasty League · Matchday 1</p></div>
      <button className="primary" onClick={onSimulate}>Play match</button>
    </section>
    <section className="stat-grid">
      <article><span>Transfer budget</span><strong>£{(club.budget / 1_000_000).toFixed(1)}m</strong></article>
      <article><span>Squad morale</span><strong>{Math.round(club.players.reduce((a,p)=>a+p.morale,0)/club.players.length)}%</strong></article>
      <article><span>Average fitness</span><strong>{Math.round(club.players.reduce((a,p)=>a+p.fitness,0)/club.players.length)}%</strong></article>
    </section>
    <section className="panel"><h3>Key players</h3>{topPlayers.map(p => <div className="list-row" key={p.id}><span><b>{p.name}</b><small>{p.position} · Age {p.age}</small></span><strong>{p.rating}</strong></div>)}</section>
    <section className="panel"><h3>Board expectations</h3><div className="objective"><span>League</span><b>Top 4 finish</b></div><div className="objective"><span>Cup</span><b>Quarter-final</b></div><div className="objective"><span>Identity</span><b>Develop young players</b></div></section>
  </div>
}

function Squad({ club }: { club: Club }) {
  return <section className="panel"><h3>First-team squad</h3><div className="table-wrap"><table><thead><tr><th>Player</th><th>Pos</th><th>Age</th><th>OVR</th><th>POT</th><th>Fitness</th></tr></thead><tbody>{club.players.map(p => <tr key={p.id}><td>{p.name}</td><td>{p.position}</td><td>{p.age}</td><td>{p.rating}</td><td>{p.potential}</td><td>{p.fitness}%</td></tr>)}</tbody></table></div></section>
}

function Tactics({ club }: { club: Club }) {
  const xi = [...club.players].sort((a,b)=>b.rating-a.rating).slice(0,11)
  return <div className="tactics-grid"><section className="pitch"><div className="pitch-lines" />{xi.map((p, i) => <div key={p.id} className={`player-dot p${i}`}><span>{p.position}</span><small>{p.name.split(' ').pop()}</small></div>)}</section><section className="panel"><h3>Team instructions</h3><label>Formation<select defaultValue="4-3-3"><option>4-3-3</option><option>4-2-3-1</option><option>3-4-2-1</option></select></label><label>Mentality<select defaultValue="Balanced"><option>Balanced</option><option>Attacking</option><option>Defensive</option></select></label><label>Pressing<select defaultValue="Standard"><option>Standard</option><option>High press</option><option>Low block</option></select></label></section></div>
}

function MatchCentre({ club, opponent, result, onSimulate }: { club: Club; opponent?: Club; result?: MatchResult; onSimulate: () => void }) {
  if (!opponent) return null
  return <div className="match-layout"><section className="score-card"><div><span>{club.shortName}</span><strong>{result?.homeGoals ?? '-'}</strong></div><b>FT</b><div><strong>{result?.awayGoals ?? '-'}</strong><span>{opponent.shortName}</span></div></section>{result ? <><section className="panel stats"><h3>Match stats</h3><div><span>Possession</span><b>{result.possessionHome}% - {100-result.possessionHome}%</b></div><div><span>Shots</span><b>{result.shotsHome} - {result.shotsAway}</b></div></section><section className="panel"><h3>Commentary</h3>{result.commentary.map((line,i)=><p key={i} className="commentary">{line}</p>)}</section></> : <section className="panel empty"><p>No match played yet.</p><button className="primary" onClick={onSimulate}>Simulate match</button></section>}</div>
}

export default App
