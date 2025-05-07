import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  {
    field: 'firstName',
    headerName: 'Nome',
    width: 150,
    renderCell: (params) => (
      <div className="text-blue-300 font-bold">{params.value}</div>
    ),
  },
  {
    field: 'lastName',
    headerName: 'Sobrenome',
    width: 150,
    renderCell: (params) => (
      <div className="text-white bg-cyan-600 px-2 py-1 rounded">
        {params.value}
      </div>
    ),
  },
  {
    field: 'city',
    headerName: 'Cidade',
    width: 180,
    renderCell: (params) => {
      const value = params.value.length * 100; // simula valor numérico
      const percent = Math.min((value / 2000) * 100, 100);
      return (
        <div className="w-full relative bg-green-100 h-full my-1">
          <div
            className="bg-green-300 h-full rounded"
            style={{ width: `${percent}%` }}
          />
          <span className="absolute inset-0 text-xs text-right pr-1">{params.value}</span>
        </div>
      );
    },
  },
  {
    field: 'actions',
    headerName: 'Ações',
    width: 80,
    renderCell: (params) => (
      <button
        className="bg-green-500 text-white w-full hover:bg-green-600 cursor-pointer"
        onClick={() =>
          alert(`ID: ${params.row.id}, Nome: ${params.row.firstName} que mora em ${params.row.city}`)
        }
      >
        ✔️
      </button>
    ),
  },
];

const rows = [
  { id: 1, lastName: 'Silva', firstName: 'João', city: 'Londrinaaaaaaaaaaaaaaa' },
  { id: 2, lastName: 'Souza', firstName: 'Maria', city: 'Porto Alegre' },
  { id: 3, lastName: 'Costa', firstName: 'Pedro', city: 'ASD' },
];

export default function BasicDataGrid() {
  return (
    <div className="w-full bg-[#fff5] rounded shadow p-4 h-[400px]">
      <DataGrid rows={rows} columns={columns} loading={false} />
    </div>
  );
}
