import { useState } from 'react'

export default function MultiSelectDropdown({ options = [] }) {
const [isOpen, setIsOpen] = useState(false)
const [selected, setSelected] = useState([])

const toggleOption = (option) => {
    setSelected(prev =>
    prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option]
    )
}

return (
    <div className="relative">
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-white px-3 py-[5px] text-sm cursor-pointer"
        >
            {selected.length > 0 ? selected.join(', ') : 'Selecionar tipos'}
        </button>

    {isOpen && (
        <div className="absolute mt-2 w-48 bg-white rounded shadow z-10">
            {options.map(option => (
                <label key={option} className="flex items-center px-1.5 py-1 hover:bg-gray-100">
                    <input
                        type="checkbox"
                        checked={selected.includes(option)}
                        onChange={() => toggleOption(option)}
                        className="mr-2"
                    />
                    {selected.includes(option) ? <strong> - {option}</strong> : option}
                </label>
            ))}
        </div>
    )}
    </div>
)
}
