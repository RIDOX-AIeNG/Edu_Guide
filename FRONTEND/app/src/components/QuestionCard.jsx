export default function QuestionCard({ question, index, total, selected, onSelect }) {
  const options = [
    { key: 'A', text: question.option_a },
    { key: 'B', text: question.option_b },
    { key: 'C', text: question.option_c },
    { key: 'D', text: question.option_d },
  ]

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Question {index + 1} of {total}
        </span>
        {selected && <span className="badge-green">Answered</span>}
      </div>

      <p className="text-gray-900 font-medium mb-6 leading-relaxed">
        {question.question_text}
      </p>

      <div className="space-y-3">
        {options.map(({ key, text }) => (
          <button key={key} onClick={() => onSelect(question.id, key)}
            className={`w-full text-left flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-150
              ${selected === key
                ? 'border-green-500 bg-green-50 text-green-800'
                : 'border-gray-200 hover:border-green-300 hover:bg-green-50/40'}`}
          >
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
              ${selected === key ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {key}
            </span>
            <span className="text-sm">{text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

