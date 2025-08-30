import React from 'react'


const Alert: React.FC<{ kind?: 'info' | 'error' | 'success'; children: React.ReactNode }> = ({ kind = 'info', children }) => {
    const map = {
        info: 'bg-blue-50 text-blue-800 border-blue-200',
        error: 'bg-red-50 text-red-800 border-red-200',
        success: 'bg-green-50 text-green-800 border-green-200',
    } as const
    return <div className={`text-sm border rounded-lg px-3 py-2 ${map[kind]}`}>{children}</div>
}
export default Alert