// components/MatchCard.jsx
import React from 'react';
import Image from 'next/image';
import { Calendar, Clock } from 'lucide-react';
import { translateTeam, translateStatus, getStatusBadgeStyles, formatDateLabel, formatTime } from '../utils/formatters';

export default function MatchCard({ match }) {
  const currentStatus = match.status?.trim().toUpperCase() || 'SCHEDULED';
  
  const isHomeWinner = currentStatus === 'FINISHED' && match.score?.fullTime?.home > match.score?.fullTime?.away;
  const isAwayWinner = currentStatus === 'FINISHED' && match.score?.fullTime?.away > match.score?.fullTime?.home;
  
  const isLive = ['IN_PLAY', 'LIVE', 'PLAYING', 'PAUSED', 'EXTRA_TIME', 'PENALTY_SHOOTOUT'].includes(currentStatus);
  const isUpcoming = currentStatus === 'TIMED' || currentStatus === 'SCHEDULED';

  return (
    <div className={`group relative bg-white rounded-2xl border ${
      isLive ? 'border-red-400 shadow-lg shadow-red-500/20' : 'border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200'
    } transition-all duration-300 overflow-hidden flex flex-col`}>
      
      {/* Cabecera de la tarjeta: Fecha y Estado */}
      <div className={`px-5 py-3 flex justify-between items-center text-[11px] font-bold border-b ${
        isLive ? 'bg-red-50/80 text-red-700 border-red-100' : 'bg-slate-50/80 text-slate-500 border-slate-100'
      }`}>
        <span className="flex items-center gap-1.5 uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          {formatDateLabel(match.utcDate)}
        </span>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] tracking-widest uppercase transition-colors ${getStatusBadgeStyles(currentStatus)}`}>
          {translateStatus(currentStatus)}
        </span>
      </div>

      {/* Contenido principal: Equipos y Resultados */}
      <div className="p-5 flex flex-col justify-center gap-4 flex-grow relative z-10 bg-white">
        
        {/* Efecto visual de fondo para partidos en vivo */}
        {isLive && (
          <div className="absolute top-1/2 right-4 -translate-y-1/2 w-24 h-24 bg-red-400/10 rounded-full blur-2xl animate-pulse pointer-events-none" />
        )}

        {/* Equipo Local */}
        <div className="flex items-center justify-between group-hover:translate-x-1 transition-transform duration-300">
          <div className="flex items-center gap-4 truncate pr-4">
            <div className="w-9 h-9 relative shrink-0 drop-shadow-sm">
              {match.homeTeam?.crest ? (
                <Image src={match.homeTeam.crest} alt={match.homeTeam.name} fill sizes="36px" className="object-contain" />
              ) : ( <div className="w-full h-full bg-slate-100 rounded-full" /> )}
            </div>
            <span className={`text-[15px] truncate ${isHomeWinner ? 'font-black text-slate-900' : 'text-slate-700 font-semibold'}`}>
              {translateTeam(match.homeTeam?.name)}
            </span>
          </div>
          {!isUpcoming && match.score?.fullTime?.home !== null && (
            <span className={`text-xl font-mono font-black w-8 text-center ${isHomeWinner ? 'text-blue-600' : 'text-slate-800'}`}>
              {match.score?.fullTime?.home}
            </span>
          )}
        </div>

        {/* Equipo Visitante */}
        <div className="flex items-center justify-between group-hover:translate-x-1 transition-transform duration-300">
          <div className="flex items-center gap-4 truncate pr-4">
            <div className="w-9 h-9 relative shrink-0 drop-shadow-sm">
              {match.awayTeam?.crest ? (
                <Image src={match.awayTeam.crest} alt={match.awayTeam.name} fill sizes="36px" className="object-contain" />
              ) : ( <div className="w-full h-full bg-slate-100 rounded-full" /> )}
            </div>
            <span className={`text-[15px] truncate ${isAwayWinner ? 'font-black text-slate-900' : 'text-slate-700 font-semibold'}`}>
              {translateTeam(match.awayTeam?.name)}
            </span>
          </div>
          {!isUpcoming && match.score?.fullTime?.away !== null && (
            <span className={`text-xl font-mono font-black w-8 text-center ${isAwayWinner ? 'text-blue-600' : 'text-slate-800'}`}>
              {match.score?.fullTime?.away}
            </span>
          )}
        </div>
      </div>

      {/* Pie de la tarjeta: Solo visible si el partido no empezó */}
      {isUpcoming && (
        <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-500 font-semibold flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Inicio: {formatTime(match.utcDate)} hs</span>
          </div>
        </div>
      )}
    </div>
  );
}