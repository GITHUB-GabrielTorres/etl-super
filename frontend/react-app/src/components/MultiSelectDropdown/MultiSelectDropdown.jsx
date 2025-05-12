import { useState } from 'react'

export default function MultiSelectDropdown({ options = [], chamadores }) {
const [isOpen, setIsOpen] = useState(false)
const [selected, setSelected] = useState([])

const toggleOption = (option) => {
    setSelected(prev =>
    prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option]
    )

    // Isso adiciona no pai os items
    chamadores(prev => prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option])
}

return (
    <div className="relative">
        <button
            onClick={() => setIsOpen(!isOpen)}
            className=" px-3 py-[5px] cursor-pointer"
        >
            {selected.length > 0 ? `Chamadores: ${selected.join(', ')}` : 'Chamadores'}
        </button>

    {isOpen && (
        <div className="absolute mt-2 w-48 bg-[#e0e0e633] backdrop-blur-[3px] border-1 border-[#fdfdfd] rounded shadow z-10">
            {options.map(option => (
                <label key={option} className="flex items-center px-1.5 py-1 hover:bg-[#afafb4]">
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