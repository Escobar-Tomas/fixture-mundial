// utils/formatters.js

export const TEAM_TRANSLATIONS = {
  "United States": "Estados Unidos", "USA": "Estados Unidos", "Mexico": "México", "Canada": "Canadá",
  "Argentina": "Argentina", "Brazil": "Brasil", "Uruguay": "Uruguay", "Colombia": "Colombia",
  "Ecuador": "Ecuador", "Paraguay": "Paraguay", "Spain": "España", "England": "Inglaterra",
  "Germany": "Alemania", "France": "Francia", "Netherlands": "Países Bajos", "Portugal": "Portugal",
  "Belgium": "Bélgica", "Croatia": "Croacia", "Switzerland": "Suiza", "Austria": "Austria",
  "Scotland": "Escocia", "Norway": "Noruega", "Sweden": "Suecia", "Turkey": "Turquía",
  "Türkiye": "Turquía", "Czech Republic": "República Checa", "Czechia": "República Checa",
  "Bosnia and Herzegovina": "Bosnia y Herzegovina", "Japan": "Japón", "South Korea": "Corea del Sur",
  "Korea Republic": "Corea del Sur", "Iran": "Irán", "IR Iran": "Irán", "Saudi Arabia": "Arabia Saudita",
  "Qatar": "Catar", "Uzbekistan": "Uzbekistán", "Jordan": "Jordania", "Iraq": "Irak",
  "Australia": "Australia", "Morocco": "Marruecos", "Senegal": "Senegal", "Egypt": "Egipto",
  "Tunisia": "Túnez", "Algeria": "Argelia", "South Africa": "Sudáfrica", "Ivory Coast": "Costa de Marfil",
  "Côte d'Ivoire": "Costa de Marfil", "Ghana": "Ghana", "Cape Verde": "Cabo Verde",
  "Cabo Verde": "Cabo Verde", "DR Congo": "R.D. del Congo", "Congo DR": "R.D. del Congo",
  "Panama": "Panamá", "Haiti": "Haití", "Curaçao": "Curazao", "Curacao": "Curazao",
  "New Zealand": "Nueva Zelanda"
};

export const translateTeam = (englishName) => {
  if (!englishName) return 'Por definir';
  return TEAM_TRANSLATIONS[englishName] || englishName;
};

export const translateStatus = (status) => {
  const safeStatus = status?.trim().toUpperCase() || 'SCHEDULED';
  const statuses = {
    'FINISHED': 'Finalizado', 'IN_PLAY': 'En Vivo', 'PAUSED': 'Entretiempo',
    'EXTRA_TIME': 'T. Extra', 'PENALTY_SHOOTOUT': 'Penales', 'TIMED': 'Programado', 
    'SCHEDULED': 'Por definir', 'POSTPONED': 'Postergado', 'SUSPENDED': 'Suspendido',
    'CANCELLED': 'Cancelado', 'AWARDED': 'Adjudicado'
  };
  return statuses[safeStatus] || safeStatus;
};

export const getStatusBadgeStyles = (status) => {
  const safeStatus = status?.trim().toUpperCase() || 'SCHEDULED';
  switch (safeStatus) {
    case 'IN_PLAY':
    case 'EXTRA_TIME':
    case 'PENALTY_SHOOTOUT':
      return 'bg-red-500 text-white animate-pulse shadow-sm shadow-red-500/40';
    case 'PAUSED':
      return 'bg-amber-500 text-white'; 
    case 'FINISHED':
      return 'bg-slate-200 text-slate-600';
    case 'TIMED':
    case 'SCHEDULED':
      return 'bg-blue-50 text-blue-600';
    case 'POSTPONED':
    case 'SUSPENDED':
    case 'CANCELLED':
      return 'bg-stone-700 text-white';
    default:
      return 'bg-slate-100 text-slate-500';
  }
};

export const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

export const formatDateLabel = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
};

export const cleanGroupName = (groupKey) => {
  if (!groupKey) return '';
  return groupKey.replace('GROUP_', 'Grupo ');
};