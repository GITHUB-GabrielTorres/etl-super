    import { useEffect, useState } from 'react';
    import { GetChamadores } from '../../services/api';

    export default function ListOptions001({ onChange }) {
        const [chamadores, setChamadores] = useState([])
        const [selecionados, setSelecionados] = useState([])


        useEffect(() => {
            GetChamadores().then(lista => {
                if (lista && Array.isArray(lista)) {
                    setChamadores(lista.sort())
                }
            });
        }, [])

        useEffect(() => {
            onChange(selecionados);
        }, [selecionados, onChange])

        const handleToggle = (nome) => {
            if (selecionados.includes(nome)) {
              setSelecionados(selecionados.filter(n => n !== nome)); // remove se já estiver
            } else {
              setSelecionados([...selecionados, nome]); // adiciona se não estiver
            }
        };
        return (
            <div className="bg-white p-4 rounded-xl shadow-md w-full max-w-sm">
                <p className="font-semibold mb-2">Filtrar Chamadores:</p>
                <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
                    {chamadores.map((nome) => (
                        <label key={nome} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                value={nome}
                                onChange={() => handleToggle(nome)}
                            />
                            <span>{nome}</span>
                        </label>
                    ))}
                </div>
            </div>
        );
    }
