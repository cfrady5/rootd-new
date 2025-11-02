import React from 'react';
import { TextInput as DirectorTextInput } from '../../components/director/SharedComponents.jsx';

export default function Input({ label, value, onChange, placeholder, type }){
  return <DirectorTextInput label={label} value={value} onChange={onChange} placeholder={placeholder} type={type} />;
}
