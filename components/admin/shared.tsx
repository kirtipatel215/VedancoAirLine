
import React from 'react';

export const DataTable = ({ headers, children }: { headers: string[], children: React.ReactNode }) => (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm animate-fade-in">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                        {headers.map((h, i) => <th key={i} className="p-5">{h}</th>)}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {children}
                </tbody>
            </table>
        </div>
    </div>
);
