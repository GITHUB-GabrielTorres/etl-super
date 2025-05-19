import { useEffect, useState, useRef } from 'react';
import { GetColaboradores } from '../../services/api';

export default function MultiSelectDropdown({ onChange }) {
    const [colaboradores, setColaboradores] = useState([]);
    const [selecionados, setSelecionados] = useState([]);
    const [aberto, setAberto] = useState(false);
    const dropdownRef = useRef(null);

    // Carrega os colaboradores
    useEffect(() => {
        GetColaboradores().then(lista => {
            if (Array.isArray(lista)) {
                const ativos = lista.filter(c => c.ativo);
                setColaboradores(ativos);
            }
        });
    }, []);

    // Fecha dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setAberto(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Atualiza selecionados externamente
    useEffect(() => {
        const selecionadosInfo = colaboradores.filter(c => selecionados.includes(c.id));
        onChange(selecionadosInfo);
    }, [selecionados, colaboradores, onChange]);

    const toggleSelecionado = (id) => {
        setSelecionados(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    return (
        <div className="relative inline-block w-64" ref={dropdownRef}>
            <button
                className="w-full bg-blue-600 text-white px-4 py-2 rounded shadow"
                onClick={() => setAberto(!aberto)}
            >
                Selecionar Colaboradores
            </button>

            {aberto && (
                <div className="absolute z-10 mt-2 w-full bg-white border rounded shadow max-h-60 overflow-y-auto">
                    {colaboradores.map(colab => (
                        <label key={colab.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selecionados.includes(colab.id)}
                                onChange={() => toggleSelecionado(colab.id)}
                            />
                            <span>{`${colab.primeiro_nome} ${colab.sobrenome}`}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}
