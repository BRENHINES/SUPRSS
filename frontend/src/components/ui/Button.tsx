import React from 'react'


type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }


const Button: React.FC<Props> = ({ loading, disabled, children, className = '', ...rest }) => {
    const isDisabled = disabled || loading
    return (
        <button
            disabled={isDisabled}
            className={`w-full rounded-lg bg-black text-white py-2.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...rest}
        >
            {loading ? 'Chargement…' : children}
        </button>
    )
}
export default Button