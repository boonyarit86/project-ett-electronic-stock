import React from 'react'

const Input = ({ type, name, label, placeholder }) => {
  return (
      <div className="Input">
          <label htmlFor={name}>{label}</label>
          <input type={type} name={name} id={name} placeholder={placeholder} />
      </div>
  )
}

export default Input