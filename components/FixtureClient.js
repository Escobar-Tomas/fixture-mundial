// components/FixtureClient.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Calendar, LayoutGrid, Trophy, Clock, ShieldAlert, ListOrdered, Zap } from 'lucide-react';

const TEAM_TRANSLATIONS = {
  "Brazil": "Brasil", "Spain": "España", "England": "Inglaterra", 
  "Germany": "Alemania", "France": "Francia", "Netherlands": "Países Bajos", 
  "Italy": "Italia", "United States": "Estados Unidos", "Mexico": "México", 
  "Canada": "Canadá", "Japan": "Japón", "South Korea": "Corea del Sur", 
  "Morocco": "Marruecos", "Croatia": "Croacia", "Switzerland": "Suiza", 
  "Poland": "Polonia", "Belgium": "Bélgica", "Denmark": "Dinamarca", 
  "Sweden": "Suecia", "Wales": "Gales", "Cameroon": "Camerún", 
  "Senegal": "Senegal", "Saudi Arabia": "Arabia Saudita", "Iran": "Irán", 
  "Ivory Coast": "Costa de Marfil", "New Zealand": "Nueva Zelanda"
};

export default function FixtureClient({ initialMatches }) {
  // Ahora iniciamos por defecto en los partidos del día
  const [activeTab, setActiveTab] = useState('TODAY'); 
  const [selectedGroup, setSelectedGroup] = useState('GROUP_A');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- FORMATEADORES Y TRADUCTORES ---
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateLabel = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const translateStatus = (status) => {
    const statuses = {
      'FINISHED': 'Finalizado', 'IN_PLAY': 'En Vivo', 'PAUSED': 'Entretiempo',
      'TIMED': 'Programado', 'SCHEDULED': 'Por definir'
    };
    return statuses[status] || status;
  };

  const cleanGroupName = (groupKey) => {
    if (!groupKey) return '';
    return groupKey.replace('GROUP_', 'Grupo ');
  };

  const translateTeam = (englishName) => {
    if (!englishName) return 'Por definir';
    return TEAM_TRANSLATIONS[englishName] || englishName;
  };

  // --- PROCESAMIENTO DE DATOS ---
  const groupMatches = initialMatches.filter(match => match.stage === 'GROUP_STAGE');
  const availableGroups = [...new Set(groupMatches.map(match => match.group))].filter(Boolean).sort();
  const filteredGroupMatches = groupMatches.filter(match => match.group === selectedGroup);

  // 1. Filtro de partidos para HOY
  const todayString = new Date().toLocaleDateString('es-AR');
  const todaysMatches = initialMatches.filter(match => 
    new Date(match.utcDate).toLocaleDateString('es-AR') === todayString
  );

  // 2. Motor de cálculo de Tabla de Posiciones
  const generateStandings = (groupMatches) => {
    const table = {};

    groupMatches.forEach(m => {
      if (!m.homeTeam?.name || !m.awayTeam?.name) return;

      // Inicializar equipos si no existen en la tabla
      if (!table[m.homeTeam.name]) table[m.homeTeam.name] = { ...m.homeTeam, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
      if (!table[m.awayTeam.name]) table[m.awayTeam.name] = { ...m.awayTeam, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };

      // Solo computar si el partido finalizó
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

    // Convertir objeto a array y ordenar por Puntos -> Diferencia de Gol -> Goles a Favor
    return Object.values(table).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts; 
      const difA = a.gf - a.gc;
      const difB = b.gf - b.gc;
      if (difB !== difA) return difB - difA; 
      return b.gf - a.gf; 
    });
  };

  const currentGroupStandings = generateStandings(filteredGroupMatches);

  // --- TARJETA DE PARTIDO REUTILIZABLE ---
  const MatchCard = ({ match }) => {
    const isHomeWinner = match.status === 'FINISHED' && match.score?.fullTime?.home > match.score?.fullTime?.away;
    const isAwayWinner = match.status === 'FINISHED' && match.score?.fullTime?.away > match.score?.fullTime?.home;
    const isLive = match.status === 'IN_PLAY';
    const isUpcoming = match.status === 'TIMED' || match.status === 'SCHEDULED';

    return (
      <div className={`bg-white rounded-2xl border ${
        isLive ? 'border-red-400 ring-2 ring-red-400/10' : 'border-slate-200/60'
      } shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden`}>
        
        <div className={`px-4 py-2 flex justify-between items-center text-[11px] font-semibold border-b border-slate-100 ${
          isLive ? 'bg-red-50/40 text-red-600' : 'bg-slate-50/50 text-slate-500'
        }`}>
          <span className="flex items-center gap-1.5 capitalize">
            <Calendar className="w-3.5 h-3.5" />
            {formatDateLabel(match.utcDate)}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${
            isLive ? 'bg-red-500 text-white animate-pulse' : 
            match.status === 'FINISHED' ? 'bg-slate-200 text-slate-600' : 'bg-blue-50 text-blue-600'
          }`}>
            {translateStatus(match.status)}
          </span>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 truncate pr-2">
              <div className="w-6 h-6 relative shrink-0">
                {match.homeTeam?.crest ? (
                  <Image src={match.homeTeam.crest} alt={match.homeTeam.name} fill sizes="24px" className="object-contain" />
                ) : ( <div className="w-full h-full bg-slate-100 rounded-full" /> )}
              </div>
              <span className={`text-sm truncate ${isHomeWinner ? 'font-bold text-slate-900' : 'text-slate-600 font-medium'}`}>
                {translateTeam(match.homeTeam?.name)}
              </span>
            </div>
            {!isUpcoming && match.score?.fullTime?.home !== null ? (
              <span className={`text-sm font-mono font-bold px-2 py-0.5 rounded-md ${isHomeWinner ? 'bg-blue-50 text-blue-600' : 'text-slate-400 bg-slate-50'}`}>
                {match.score.fullTime.home}
              </span>
            ) : null}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 truncate pr-2">
              <div className="w-6 h-6 relative shrink-0">
                {match.awayTeam?.crest ? (
                  <Image src={match.awayTeam.crest} alt={match.awayTeam.name} fill sizes="24px" className="object-contain" />
                ) : ( <div className="w-full h-full bg-slate-100 rounded-full" /> )}
              </div>
              <span className={`text-sm truncate ${isAwayWinner ? 'font-bold text-slate-900' : 'text-slate-600 font-medium'}`}>
                {translateTeam(match.awayTeam?.name)}
              </span>
            </div>
            {!isUpcoming && match.score?.fullTime?.away !== null ? (
              <span className={`text-sm font-mono font-bold px-2 py-0.5 rounded-md ${isAwayWinner ? 'bg-blue-50 text-blue-600' : 'text-slate-400 bg-slate-50'}`}>
                {match.score.fullTime.away}
              </span>
            ) : null}
          </div>
        </div>

        {isUpcoming && (
          <div className="px-4 py-2 bg-slate-50/30 border-t border-slate-50 text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-300" />
            <span>Horario: {formatTime(match.utcDate)} hs</span>
          </div>
        )}
      </div>
    );
  };

  if (!isMounted) return null;

  return (
    <div className="w-full max-w-full mx-auto pb-12 bg-slate-50 min-h-screen">
      
      {/* Barra de Navegación Superior (Scrollable horizontalmente) */}
      <div className="px-4 py-3 border-b border-slate-200 mb-6 bg-white sticky top-0 z-50 shadow-xs">
        <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-slate-100 p-1 rounded-xl max-w-2xl mx-auto shadow-inner gap-1">
          <button onClick={() => setActiveTab('TODAY')} className={`flex items-center justify-center gap-2 min-w-[120px] flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'TODAY' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Zap className={`w-3.5 h-3.5 ${activeTab === 'TODAY' ? 'fill-blue-500' : ''}`} /> Hoy
          </button>
          <button onClick={() => setActiveTab('GROUPS')} className={`flex items-center justify-center gap-2 min-w-[120px] flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'GROUPS' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <LayoutGrid className="w-3.5 h-3.5" /> Grupos
          </button>
          <button onClick={() => setActiveTab('STANDINGS')} className={`flex items-center justify-center gap-2 min-w-[120px] flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'STANDINGS' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <ListOrdered className="w-3.5 h-3.5" /> Posiciones
          </button>
          <button onClick={() => setActiveTab('KNOCKOUT')} className={`flex items-center justify-center gap-2 min-w-[120px] flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'KNOCKOUT' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Trophy className="w-3.5 h-3.5" /> Fase Final
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8">

        {/* 1. VISTA PARTIDOS DE HOY */}
        {activeTab === 'TODAY' && (
          <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight border-b border-slate-200 pb-2">
              Jornada de Hoy <span className="text-sm font-medium text-slate-400 ml-2">({todayString})</span>
            </h2>
            
            {todaysMatches.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {todaysMatches.map((match) => <MatchCard key={match.id} match={match} />)}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-slate-600 font-bold">Sin partidos programados</h3>
                <p className="text-slate-400 text-sm mt-1">No hay encuentros agendados para el día de la fecha.</p>
              </div>
            )}
          </div>
        )}

        {/* 2. VISTA FASE DE GRUPOS (FIXTURE) */}
        {activeTab === 'GROUPS' && (
          <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {availableGroups.map((group) => (
                <button key={group} onClick={() => setSelectedGroup(group)} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedGroup === group ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 scale-105' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                  {cleanGroupName(group)}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2">
              {filteredGroupMatches.map((match) => <MatchCard key={match.id} match={match} />)}
            </div>
          </div>
        )}

        {/* 3. VISTA TABLA DE POSICIONES */}
        {activeTab === 'STANDINGS' && (
          <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
            
            {/* Selector de Grupos compartido */}
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {availableGroups.map((group) => (
                <button key={group} onClick={() => setSelectedGroup(group)} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedGroup === group ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 scale-105' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                  {cleanGroupName(group)}
                </button>
              ))}
            </div>

            {/* Tabla Estilizada */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-center w-10">#</th>
                      <th className="px-4 py-3 font-semibold">Selección</th>
                      <th className="px-3 py-3 font-bold text-slate-800 text-center" title="Puntos">PTS</th>
                      <th className="px-3 py-3 font-semibold text-center hidden sm:table-cell" title="Partidos Jugados">PJ</th>
                      <th className="px-3 py-3 font-semibold text-center hidden md:table-cell" title="Partidos Ganados">PG</th>
                      <th className="px-3 py-3 font-semibold text-center hidden md:table-cell" title="Partidos Empatados">PE</th>
                      <th className="px-3 py-3 font-semibold text-center hidden md:table-cell" title="Partidos Perdidos">PP</th>
                      <th className="px-3 py-3 font-semibold text-center hidden sm:table-cell" title="Goles a Favor">GF</th>
                      <th className="px-3 py-3 font-semibold text-center hidden sm:table-cell" title="Goles en Contra">GC</th>
                      <th className="px-3 py-3 font-semibold text-center" title="Diferencia de Gol">DIF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentGroupStandings.map((team, index) => {
                      const isClassified = index < 2; // Los 2 primeros pasan (ejemplo estándar)
                      return (
                        <tr key={team.id || team.name} className={`border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${isClassified ? 'bg-blue-50/10' : ''}`}>
                          <td className="px-4 py-3 text-center">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isClassified ? 'bg-blue-100 text-blue-700' : 'text-slate-400'}`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 relative shrink-0">
                                {team.crest ? (
                                  <Image src={team.crest} alt={team.name} fill sizes="24px" className="object-contain" />
                                ) : ( <div className="w-full h-full bg-slate-200 rounded-full" /> )}
                              </div>
                              <span className="font-bold text-slate-800">{translateTeam(team.name)}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center font-black text-slate-900 bg-slate-50/50">{team.pts}</td>
                          <td className="px-3 py-3 text-center text-slate-500 font-medium hidden sm:table-cell">{team.pj}</td>
                          <td className="px-3 py-3 text-center text-slate-500 hidden md:table-cell">{team.pg}</td>
                          <td className="px-3 py-3 text-center text-slate-500 hidden md:table-cell">{team.pe}</td>
                          <td className="px-3 py-3 text-center text-slate-500 hidden md:table-cell">{team.pp}</td>
                          <td className="px-3 py-3 text-center text-slate-500 hidden sm:table-cell">{team.gf}</td>
                          <td className="px-3 py-3 text-center text-slate-500 hidden sm:table-cell">{team.gc}</td>
                          <td className="px-3 py-3 text-center font-medium text-slate-700">{team.gf - team.gc > 0 ? `+${team.gf - team.gc}` : team.gf - team.gc}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. VISTA PROXIMAMENTE */}
        {activeTab === 'KNOCKOUT' && (
          <div className="max-w-xl mx-auto py-16 px-4 text-center animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Fase Eliminatoria</h3>
              <p className="text-sm text-slate-500 font-medium mt-2 max-w-sm">
                Las llaves de cruces directos estarán disponibles automáticamente una vez definidos los clasificados.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold">
                <ShieldAlert className="w-4 h-4 text-slate-400" />
                <span>Próximamente</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}