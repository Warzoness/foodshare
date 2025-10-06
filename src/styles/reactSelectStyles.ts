import { StylesConfig } from 'react-select';

export const customSelectStyles: StylesConfig = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '40px',
    border: `1px solid ${state.isFocused ? '#54a65c' : '#e6ebef'}`,
    borderRadius: '10px',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(84, 166, 92, 0.15)' : 'none',
    '&:hover': {
      borderColor: '#54a65c',
      boxShadow: '0 0 0 2px rgba(84, 166, 92, 0.1)',
    },
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  }),
  
  valueContainer: (provided) => ({
    ...provided,
    padding: '8px 12px',
  }),
  
  input: (provided) => ({
    ...provided,
    margin: 0,
    padding: 0,
  }),
  
  indicatorSeparator: () => ({
    display: 'none',
  }),
  
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? '#54a65c' : '#666',
    padding: '8px 12px',
    transition: 'color 0.2s ease',
    '&:hover': {
      color: '#54a65c',
    },
  }),
  
  menu: (provided) => ({
    ...provided,
    borderRadius: '10px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e6ebef',
    marginTop: '4px',
    zIndex: 1000,
  }),
  
  menuList: (provided) => ({
    ...provided,
    padding: '8px',
    borderRadius: '8px',
  }),
  
  option: (provided, state) => ({
    ...provided,
    padding: '12px 16px',
    borderRadius: '6px',
    margin: '2px 0',
    fontSize: '14px',
    lineHeight: '1.4',
    cursor: 'pointer',
    backgroundColor: state.isSelected 
      ? '#54a65c' 
      : state.isFocused 
        ? '#f8fdf8' 
        : 'transparent',
    color: state.isSelected 
      ? '#fff' 
      : state.isFocused 
        ? '#54a65c' 
        : '#374151',
    fontWeight: state.isSelected ? '600' : state.isFocused ? '500' : '400',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: state.isSelected ? '#54a65c' : '#f8fdf8',
      color: state.isSelected ? '#fff' : '#54a65c',
      fontWeight: '500',
    },
  }),
  
  placeholder: (provided) => ({
    ...provided,
    color: '#9ca3af',
    fontSize: '14px',
  }),
  
  singleValue: (provided) => ({
    ...provided,
    color: '#374151',
    fontSize: '14px',
  }),
  
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#f0f9f0',
    borderRadius: '6px',
  }),
  
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#54a65c',
    fontSize: '13px',
    fontWeight: '500',
  }),
  
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#54a65c',
    '&:hover': {
      backgroundColor: '#54a65c',
      color: '#fff',
    },
  }),
};

