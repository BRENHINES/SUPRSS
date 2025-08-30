import React from 'react'


type Props = React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string | null }


const TextField = React.forwardRef<HTMLInputElement, Props>(({ label, error, id, className = '', ...rest }, ref) => {
    const inputId = id || (rest.name as string) || label
    return (
        <div className="space-y-1">
            <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
                {label}
            </label>
            <input
                id={inputId}
                ref={ref}
                className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black/60 focus:border-black ${className} ${error ? 'border-red-500' : 'border-neutral-300'}`}
                {...rest}
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    )
})
TextField.displayName = 'TextField'
export default TextField