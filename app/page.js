// app/page.jsx
import FixtureClient from '../components/FixtureClient';
import { Trophy } from 'lucide-react';

// Función que se ejecuta en el servidor
async function getMatches() {
  try {
    // Reemplaza "2000" por el ID correcto del Mundial en Football-Data
    const res = await fetch('https://api.football-data.org/v4/competitions/2000/matches', {
      headers: { 
        'X-Auth-Token': process.env.API_KEY_FOOTBALL 
      },
      // Actualiza la info automáticamente cada 60 segundos
      next: { revalidate: 60 } 
    });

    if (!res.ok) throw new Error('Error al conectar con la API');
    
    const data = await res.json();
    return data.matches || [];
  } catch (error) {
    console.error(error);
    return []; // Retorna un array vacío si hay error
  }
}

export default async function Home() {
  const matches = await getMatches();

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto mb-6">
        <header className="bg-gradient-to-r from-blue-700 to-indigo-900 rounded-2xl p-6 text-white shadow-lg flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Fixture del Mundial 2026</h1>
            <p className="text-blue-200 text-sm">Resultados en tiempo real</p>
          </div>
        </header>
      </div>
      
      {/* Pasamos los datos al componente interactivo */}
      <FixtureClient initialMatches={matches} />
    </main>
  );
}