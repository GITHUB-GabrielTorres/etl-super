import { useState } from 'react';

export default function MultiSelectDropdown({ options = [], onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const toggleOption = (id) => {
        const updated = selectedIds.includes(id)
            ? selectedIds.filter(item => item !== id)
            : [...selectedIds, id];

        setSelectedIds(updated);

        // Envia os objetos completos para o pai
        // const selecionadosCompletos = options.filter(opt => updated.includes(opt.id));
        const nomesCompletos = options
        .filter(opt => updated.includes(opt.id))
        .map(opt => `${opt.primeiro_nome} ${opt.sobrenome}`);
    };

    return (
        <div className="relative ">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-[#313131] cursor-pointer px-2 py-1"
            >
                {selectedIds.length > 0
                    ? `Chamadores: ${options
                        .filter(opt => selectedIds.includes(opt.id))
                        .map(opt => `${opt.primeiro_nome} ${opt.sobrenome}`)
                        .join(', ')}`
                    : 'Selecionar Chamadores'}
            </button>

            {/* Aqui é a definição da caixa de seleção */}
            {isOpen && (
                <div className="caixa-selecao absolute mt-2 w-64 bg-[#e0e0e6] py-1 rounded-[10px_10px_10px_10px] border-1 border-[#fdfdfd] z-1 overflow-y-auto">
                    {options.map(option => {
                        const fullName = `${option.primeiro_nome} ${option.sobrenome}`;
                        return (
                            <label
                                key={option.id}
                                className="flex items-center px-2 py-1 hover:bg-gray-100 hover:text-[#000] duration-200 text-[#313131]  cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(option.id)}
                                    onChange={() => toggleOption(option.id)}
                                    className="mr-2"
                                />
                                <span>{fullName}</span>
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
