import React, { InputHTMLAttributes } from 'react'
import { RegisterOptions, UseFormRegister } from 'react-hook-form'

interface InputType extends InputHTMLAttributes<HTMLInputElement> {
  register?: UseFormRegister<any>
  classNameInput?: string
  classNameError?: string
  errorMessage?: string
}

export default function Input({
  className,
  register,
  name,
  errorMessage,
  classNameInput = 'w-full rounded-sm border border-gray-300 p-3 outline-none focus:border-gray-500 focus:shadow-sm',
  classNameError = 'mt-1 min-h-[1.25rem] text-sm text-red-600',
  ...rest
}: InputType) {
  const registerResult = register && name ? register(name) : {}

  return (
    <div className={className}>
      <input className={classNameInput} {...registerResult} {...rest} />
      <div className={classNameError}>{errorMessage}</div>
    </div>
  )
}
