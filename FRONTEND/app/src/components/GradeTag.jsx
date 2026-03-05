export default function GradeTag({ grade }) {
  const color = {
    A1: 'bg-green-100  text-green-800',
    B2: 'bg-green-100  text-green-700',
    B3: 'bg-lime-100   text-lime-700',
    C4: 'bg-yellow-100 text-yellow-700',
    C5: 'bg-yellow-100 text-yellow-600',
    C6: 'bg-orange-100 text-orange-700',
    D7: 'bg-red-100    text-red-600',
    E8: 'bg-red-100    text-red-700',
    F9: 'bg-red-200    text-red-800',
  }[grade] || 'bg-gray-100 text-gray-600'

  const credits = ['A1','B2','B3','C4','C5','C6']
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${color}`}>
      {grade}
      {credits.includes(grade) && <span className="text-xs font-normal">✓</span>}
    </span>
  )
}

