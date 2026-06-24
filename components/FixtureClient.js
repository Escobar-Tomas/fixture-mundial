// components/FixtureClient.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, LayoutGrid, Trophy, ShieldAlert, ListOrdered, Zap } from 'lucide-react';

import MatchCard from './MatchCard';
import StandingsTable from './StandingsTable'; 

import { cleanGroupName } from '../utils/formatters';
import { generateStandings } from '../utils/standings';

export default function FixtureClient({ initialMatches }) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('TODAY'); 
  const [selectedGroup, setSelectedGroup] = useState('GROUP_A');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const intervalId = setInterval(() => {
      router.refresh(); 
    }, 30000); // 30 segundos
    return () => clearInterval(intervalId);
  }, [router]);

  // --- PROCESAMIENTO DE DATOS ---
  const groupMatches = initialMatches.filter(match => match.stage === 'GROUP_STAGE');
  const availableGroups = [...new Set(groupMatches.map(match => match.group))].filter(Boolean).sort();
  const filteredGroupMatches = groupMatches.filter(match => match.group === selectedGroup);

  const todayString = new Date().toLocaleDateString('es-AR');
  const todaysMatches = initialMatches.filter(match => 
    new Date(match.utcDate).toLocaleDateString('es-AR') === todayString
  );

  const currentGroupStandings = generateStandings(filteredGroupMatches);

  // --- CÁLCULO DE LOS 8 MEJORES TERCEROS (SOLO CON DATOS API) ---
  const allGroupsStandings = availableGroups.map(group => {
    return generateStandings(groupMatches.filter(m => m.group === group));
  });

  const thirdPlaceTeams = allGroupsStandings
    .filter(standings => standings.length >= 3)
    .map(standings => standings[2]); // Extraemos el equipo en la posición 3 (índice 2)

  // Ordenamos a los terceros usando: Puntos > Dif. de Gol > Goles a Favor
  const sortedThirdPlaceTeams = [...thirdPlaceTeams].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts; 
    const difA = a.gf - a.gc;
    const difB = b.gf - b.gc;
    if (difB !== difA) return difB - difA; 
    return b.gf - a.gf; 
  });

  // Guardamos los 8 mejores
  const bestEightThirdsNames = new Set(
    sortedThirdPlaceTeams.slice(0, 8).map(t => t.name)
  );

  if (!isMounted) return null;

  return (
    <div className="w-full max-w-7xl mx-auto pb-16">
      
      {/* Navegación Flotante Estilo iOS */}
      <div className="sticky top-4 z-50 px-4 mb-8">
        <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-white/70 backdrop-blur-md p-1.5 rounded-2xl max-w-fit mx-auto shadow-lg shadow-slate-200/50 border border-slate-200/50 gap-1">
          <button onClick={() => setActiveTab('TODAY')} className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'TODAY' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
            <Zap className={`w-4 h-4 ${activeTab === 'TODAY' ? 'fill-yellow-400 text-yellow-400' : ''}`} /> Hoy
          </button>
          <button onClick={() => setActiveTab('GROUPS')} className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'GROUPS' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
            <LayoutGrid className="w-4 h-4" /> Fixture
          </button>
          <button onClick={() => setActiveTab('STANDINGS')} className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'STANDINGS' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
            <ListOrdered className="w-4 h-4" /> Grupos
          </button>
          <button onClick={() => setActiveTab('KNOCKOUT')} className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'KNOCKOUT' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
            <Trophy className={`w-4 h-4 ${activeTab === 'KNOCKOUT' ? 'text-amber-400' : ''}`} /> Llaves
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8">

        {/* 1. VISTA PARTIDOS DE HOY */}
        {activeTab === 'TODAY' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-baseline justify-between border-b border-slate-200 pb-4">
               <h2 className="text-2xl font-black text-slate-800 tracking-tight">Partidos de Hoy</h2>
               <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{todayString}</span>
             </div>
             
             {todaysMatches.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                 {todaysMatches.map((match) => <MatchCard key={match.id} match={match} />)}
               </div>
             ) : (
               <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Calendar className="w-10 h-10 text-slate-400" />
                 </div>
                 <h3 className="text-lg text-slate-700 font-bold">Día de descanso</h3>
                 <p className="text-slate-500 mt-2 max-w-sm mx-auto">Hoy no hay encuentros programados. ¡Aprovecha para revisar la tabla de posiciones!</p>
               </div>
             )}
           </div>
        )}

        {/* 2. VISTA FASE DE GRUPOS */}
        {activeTab === 'GROUPS' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">              {availableGroups.map((group) => (
                <button key={group} onClick={() => setSelectedGroup(group)} className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${selectedGroup === group ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 -translate-y-0.5' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'}`}>
                  {cleanGroupName(group)}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGroupMatches.map((match) => <MatchCard key={match.id} match={match} />)}
            </div>
          </div>
        )}

        {/* 3. VISTA TABLA DE POSICIONES */}
        {activeTab === 'STANDINGS' && (
          <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex overflow-x-auto gap-3 py-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-4 w-full">              {availableGroups.map((group) => (
                <button key={group} onClick={() => setSelectedGroup(group)} className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${selectedGroup === group ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 -translate-y-0.5' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'}`}>
                  {cleanGroupName(group)}
                </button>
              ))}
            </div>

            <StandingsTable 
              groupName={cleanGroupName(selectedGroup)} 
              standings={currentGroupStandings} 
              bestEightThirdsNames={bestEightThirdsNames} 
            />

          </div>
        )}

        {/* 4. VISTA PROXIMAMENTE */}
        {activeTab === 'KNOCKOUT' && (
           <div className="max-w-2xl mx-auto py-20 px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-gradient-to-br from-white to-slate-50 rounded-[2rem] p-10 border border-slate-200/80 shadow-2xl shadow-slate-200/50 flex flex-col items-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500"></div>
               <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center mb-6 relative">
                 <div className="absolute inset-0 rounded-full border-4 border-amber-100 animate-ping opacity-20"></div>
                 <Trophy className="w-12 h-12 text-amber-500" />
               </div>
               <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-3">Fase Eliminatoria</h3>
               <p className="text-slate-500 font-medium text-lg max-w-md">
                 Las llaves de cruces directos y el camino a la final estarán disponibles aquí una vez definidos los grupos.
               </p>
               <div className="mt-8 flex items-center gap-2 text-sm bg-slate-900 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-slate-900/20">
                 <ShieldAlert className="w-4 h-4 text-amber-400" />
                 <span>Bloqueado temporalmente</span>
               </div>
             </div>
           </div>
        )}
      </div>
    </div>
  );
}