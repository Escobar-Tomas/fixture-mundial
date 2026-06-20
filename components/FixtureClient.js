// components/FixtureClient.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Calendar, LayoutGrid, Trophy, Clock, ShieldAlert } from 'lucide-react';

// --- DICCIONARIO DE TRADUCCIÓN DE PAÍSES ---
// Agrega aquí cualquier país que notes que la API envía en inglés
const TEAM_TRANSLATIONS = {
  "Brazil": "Brasil",
  "Spain": "España",
  "England": "Inglaterra",
  "Germany": "Alemania",
  "France": "Francia",
  "Netherlands": "Países Bajos",
  "Italy": "Italia",
  "United States": "Estados Unidos",
  "Mexico": "México",
  "Canada": "Canadá",
  "Japan": "Japón",
  "South Korea": "Corea del Sur",
  "Morocco": "Marruecos",
  "Croatia": "Croacia",
  "Switzerland": "Suiza",
  "Poland": "Polonia",
  "Belgium": "Bélgica",
  "Denmark": "Dinamarca",
  "Sweden": "Suecia",
  "Wales": "Gales",
  "Cameroon": "Camerún",
  "Senegal": "Senegal",
  "Saudi Arabia": "Arabia Saudita",
  "Iran": "Irán",
  "Ivory Coast": "Costa de Marfil",
  "New Zealand": "Nueva Zelanda",
  "South Africa": "Sudáfrica",
  "Czechia": "República Checa",
  "Scotland": "Escocia",
  "Turkey": "Turquía",
  "Curaçao": "Curazao",
  "Egypt": "Egipto",
  "Cape Verde Islands": "Cabo Verde",
  "Norway": "Noruega",
  "Jordan": "Jordania"
};

export default function FixtureClient({ initialMatches }) {
  const [activeTab, setActiveTab] = useState('GROUPS'); 
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
      'FINISHED': 'Finalizado',
      'IN_PLAY': 'En Vivo',
      'PAUSED': 'Entretiempo',
      'TIMED': 'Programado',
      'SCHEDULED': 'Por definir'
    };
    return statuses[status] || status;
  };

  const cleanGroupName = (groupKey) => {
    if (!groupKey) return '';
    return groupKey.replace('GROUP_', 'Grupo ');
  };

  // Función que busca el nombre en el diccionario
  const translateTeam = (englishName) => {
    if (!englishName) return 'Por definir';
    return TEAM_TRANSLATIONS[englishName] || englishName;
  };

  // --- PROCESAMIENTO DE DATOS ---
  const groupMatches = initialMatches.filter(match => match.stage === 'GROUP_STAGE');
  const availableGroups = [...new Set(groupMatches.map(match => match.group))].filter(Boolean).sort();
  const filteredGroupMatches = groupMatches.filter(match => match.group === selectedGroup);

  // --- TARJETA DE PARTIDO ---
  const GroupMatchCard = ({ match }) => {
    const isHomeWinner = match.status === 'FINISHED' && match.score?.fullTime?.home > match.score?.fullTime?.away;
    const isAwayWinner = match.status === 'FINISHED' && match.score?.fullTime?.away > match.score?.fullTime?.home;
    const isLive = match.status === 'IN_PLAY';
    const isUpcoming = match.status === 'TIMED' || match.status === 'SCHEDULED';

    return (
      <div className={`bg-white rounded-2xl border ${
        isLive ? 'border-red-400 ring-2 ring-red-400/10' : 'border-slate-200/60'
      } shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden`}>
        
        {/* Barra superior */}
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

        {/* Cuerpo del enfrentamiento */}
        <div className="p-4 space-y-3">
          {/* Fila Local */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 truncate pr-2">
              <div className="w-6 h-6 relative shrink-0">
                {match.homeTeam?.crest ? (
                  <Image src={match.homeTeam.crest} alt={match.homeTeam.name} fill sizes="24px" className="object-contain" />
                ) : (
                  <div className="w-full h-full bg-slate-100 rounded-full" />
                )}
              </div>
              {/* Aquí aplicamos la función de traducción */}
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

          {/* Fila Visitante */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 truncate pr-2">
              <div className="w-6 h-6 relative shrink-0">
                {match.awayTeam?.crest ? (
                  <Image src={match.awayTeam.crest} alt={match.awayTeam.name} fill sizes="24px" className="object-contain" />
                ) : (
                  <div className="w-full h-full bg-slate-100 rounded-full" />
                )}
              </div>
              {/* Aquí aplicamos la función de traducción */}
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

        {/* Info inferior de horario */}
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
      
      {/* Barra de Navegación Superior */}
      <div className="px-4 py-3 border-b border-slate-200 mb-6 bg-white sticky top-0 z-50 shadow-xs">
        <div className="flex bg-slate-100 p-1 rounded-xl max-w-md mx-auto shadow-inner">
          <button onClick={() => setActiveTab('GROUPS')} className={`flex items-center justify-center gap-2 flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'GROUPS' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <LayoutGrid className="w-3.5 h-3.5" /> Fase de Grupos
          </button>
          <button onClick={() => setActiveTab('KNOCKOUT')} className={`flex items-center justify-center gap-2 flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'KNOCKOUT' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Trophy className="w-3.5 h-3.5" /> Fase Final
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8">
        {/* CONTENIDO 1: FASE DE GRUPOS */}
        {activeTab === 'GROUPS' && (
          <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
            
            {/* Selector Deslizable de Grupos */}
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {availableGroups.map((group) => (
                <button key={group} onClick={() => setSelectedGroup(group)} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedGroup === group ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 scale-105' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                  {cleanGroupName(group)}
                </button>
              ))}
            </div>

            {/* Listado de Partidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2">
              {filteredGroupMatches.map((match) => (
                <GroupMatchCard key={match.id} match={match} />
              ))}
            </div>

          </div>
        )}

        {/* CONTENIDO 2: VISTA PROXIMAMENTE */}
        {activeTab === 'KNOCKOUT' && (
          <div className="max-w-xl mx-auto py-16 px-4 text-center animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Fase Eliminatoria</h3>
              <p className="text-sm text-slate-500 font-medium mt-2 max-w-sm">
                Las llaves y el organigrama simétrico de cruces directos estarán disponibles de forma automática una vez definidos los clasificados de cada zona.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold">
                <ShieldAlert className="w-4 h-4 text-slate-400" />
                <span>Sección en desarrollo (Próximamente)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}