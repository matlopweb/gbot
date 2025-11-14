const PROFILE_THEMES = {
  aqua: {
    gradient: 'from-slate-900 via-cyan-950 to-slate-900',
    accent: 'text-cyan-200',
    ring: 'ring-cyan-400'
  },
  ember: {
    gradient: 'from-slate-900 via-rose-950 to-slate-900',
    accent: 'text-rose-200',
    ring: 'ring-rose-400'
  },
  forest: {
    gradient: 'from-slate-900 via-emerald-950 to-slate-900',
    accent: 'text-emerald-200',
    ring: 'ring-emerald-400'
  },
  neon: {
    gradient: 'from-black via-purple-950 to-black',
    accent: 'text-purple-200',
    ring: 'ring-purple-400'
  },
  default: {
    gradient: 'from-slate-900 via-slate-800 to-slate-900',
    accent: 'text-white',
    ring: 'ring-blue-400'
  }
};

export function getProfileTheme(themeKey) {
  if (!themeKey) return PROFILE_THEMES.default;
  return PROFILE_THEMES[themeKey] || PROFILE_THEMES.default;
}

export default PROFILE_THEMES;
