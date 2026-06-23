export const generateStandings = (groupMatches) => {
  const table = {};

  groupMatches.forEach(m => {
    if (!m.homeTeam?.name || !m.awayTeam?.name) return;

    if (!table[m.homeTeam.name]) table[m.homeTeam.name] = { ...m.homeTeam, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    if (!table[m.awayTeam.name]) table[m.awayTeam.name] = { ...m.awayTeam, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };

    if (m.status === 'FINISHED') {
      const hScore = m.score?.fullTime?.home || 0;
      const aScore = m.score?.fullTime?.away || 0;

      table[m.homeTeam.name].pj++;
      table[m.awayTeam.name].pj++;
      table[m.homeTeam.name].gf += hScore;
      table[m.homeTeam.name].gc += aScore;
      table[m.awayTeam.name].gf += aScore;
      table[m.awayTeam.name].gc += hScore;

      if (hScore > aScore) {
        table[m.homeTeam.name].pg++; table[m.homeTeam.name].pts += 3;
        table[m.awayTeam.name].pp++;
      } else if (hScore < aScore) {
        table[m.awayTeam.name].pg++; table[m.awayTeam.name].pts += 3;
        table[m.homeTeam.name].pp++;
      } else {
        table[m.homeTeam.name].pe++; table[m.awayTeam.name].pe++;
        table[m.homeTeam.name].pts += 1; table[m.awayTeam.name].pts += 1;
      }
    }
  });

  // Ordenamiento con datos de la API: 1° Puntos -> 2° Diferencia de Gol -> 3° Goles a Favor
  return Object.values(table).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts; 
    const difA = a.gf - a.gc;
    const difB = b.gf - b.gc;
    if (difB !== difA) return difB - difA; 
    return b.gf - a.gf; 
  });
};