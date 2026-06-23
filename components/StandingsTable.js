import React from 'react';
import Image from 'next/image';
import { translateTeam } from '../utils/formatters';

export default function StandingsTable({ groupName, standings, bestEightThirdsNames }) {
  if (!standings || standings.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/40 overflow-hidden">
      
      {/* Cabecera con el Nombre del Grupo */}
      <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-white font-bold text-lg">{groupName}</h3>
      </div>
      
      {/* Tabla Responsiva */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/80 tracking-wider">
            <tr>
              <th className="px-6 py-4 font-bold text-center w-12">Pos</th>
              <th className="px-6 py-4 font-bold">Selección</th>
              <th className="px-4 py-4 font-black text-slate-700 text-center text-xs" title="Puntos">Pts</th>
              <th className="px-4 py-4 font-bold text-center" title="Partidos Jugados">PJ</th>
              <th className="px-4 py-4 font-bold text-center hidden sm:table-cell" title="Ganados">PG</th>
              <th className="px-4 py-4 font-bold text-center hidden sm:table-cell" title="Empatados">PE</th>
              <th className="px-4 py-4 font-bold text-center hidden sm:table-cell" title="Perdidos">PP</th>
              <th className="px-4 py-4 font-bold text-center hidden md:table-cell" title="Goles a Favor">GF</th>
              <th className="px-4 py-4 font-bold text-center hidden md:table-cell" title="Goles en Contra">GC</th>
              <th className="px-4 py-4 font-bold text-center" title="Diferencia de Gol">DIF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {standings.map((team, index) => {
              
              // --- LÓGICA DE COLORES ---
              const isTopTwo = index < 2;
              const isThird = index === 2;
              const isBestThird = isThird && bestEightThirdsNames.has(team.name);
              const isLast = index === 3; // (O index > 2 si el grupo tuviera más, pero en el Mundial son 4)

              let rowClass = 'hover:bg-slate-50/80';
              let badgeClass = 'bg-slate-100 text-slate-500';
              let nameClass = 'font-bold text-slate-700';

              if (isTopTwo) {
                rowClass = 'bg-green-50/20 hover:bg-green-50/40';
                badgeClass = 'bg-green-500 text-white shadow-md shadow-green-500/30';
                nameClass = 'font-black text-slate-900';
              } else if (isBestThird) {
                rowClass = 'bg-yellow-50/30 hover:bg-yellow-50/50';
                badgeClass = 'bg-yellow-400 text-yellow-950 shadow-md shadow-yellow-500/20';
                nameClass = 'font-black text-slate-900';
              } else if (isLast) {
                rowClass = 'bg-red-50/20 opacity-90 hover:bg-red-50/30 hover:opacity-100';
                badgeClass = 'bg-red-500 text-white shadow-md shadow-red-500/30';
                nameClass = 'font-semibold text-slate-600';
              }

              return (
                <tr key={team.id || team.name} className={`transition-colors group ${rowClass}`}>
                  <td className="px-6 py-4">
                    <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-black transition-colors ${badgeClass}`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 relative shrink-0 drop-shadow-sm group-hover:scale-110 transition-transform">
                        {team.crest ? (
                          <Image src={team.crest} alt={team.name} fill sizes="32px" className="object-contain" />
                        ) : ( <div className="w-full h-full bg-slate-200 rounded-full" /> )}
                      </div>
                      <span className={`text-[15px] ${nameClass}`}>
                        {translateTeam(team.name)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center font-black text-base text-slate-800 bg-white/40 mix-blend-multiply">{team.pts}</td>
                  <td className="px-4 py-4 text-center text-slate-600 font-semibold">{team.pj}</td>
                  <td className="px-4 py-4 text-center text-slate-500 hidden sm:table-cell">{team.pg}</td>
                  <td className="px-4 py-4 text-center text-slate-500 hidden sm:table-cell">{team.pe}</td>
                  <td className="px-4 py-4 text-center text-slate-500 hidden sm:table-cell">{team.pp}</td>
                  <td className="px-4 py-4 text-center text-slate-500 hidden md:table-cell">{team.gf}</td>
                  <td className="px-4 py-4 text-center text-slate-500 hidden md:table-cell">{team.gc}</td>
                  <td className="px-4 py-4 text-center font-bold text-slate-700">
                    <span className={team.gf - team.gc > 0 ? 'text-green-600' : team.gf - team.gc < 0 ? 'text-red-500' : ''}>
                      {team.gf - team.gc > 0 ? `+${team.gf - team.gc}` : team.gf - team.gc}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Leyenda de la tabla */}
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></div> 16avos
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm shadow-yellow-500/50"></div> Mejor 3ro
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></div> Eliminado
        </div>
      </div>
    </div>
  );
}