export default function Spinner({ size = 'md', color = 'green' }) {
  const s = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' }[size]
  const c = color === 'white' ? 'border-white/30 border-t-white' : 'border-green-200 border-t-green-600'
  return <div className={`${s} ${c} rounded-full animate-spin`} />
}
