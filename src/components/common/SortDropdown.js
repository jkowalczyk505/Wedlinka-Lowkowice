// src/components/common/SortDropdown.js
import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

const CUSTOM_BORDER = '#ffffff';
const HOVER_COLOR  = '#98181b';
const TEXT_COLOR   = '#ffffff';

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    background: 'transparent',
    cursor: 'pointer',               // ← kursor wskazujący
    borderColor: state.isFocused || state.isHovered
      ? HOVER_COLOR
      : CUSTOM_BORDER,
    boxShadow: state.isFocused
      ? `0 0 0 1px ${CUSTOM_BORDER}`
      : `0 0 0 1px ${HOVER_COLOR}`,
    transition: 'border-color 0.2s ease',
    '&:hover': {
      borderColor: HOVER_COLOR,     // ← ramka na hover
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    // hover na cały kontener powoduje koloru tekstu
    '&:hover': {
      color: HOVER_COLOR,
    },
  }),
  singleValue: (provided, state) => ({
    ...provided,
    color: state.isFocused || state.isHovered
      ? HOVER_COLOR
      : TEXT_COLOR,
    transition: 'color 0.2s ease',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: TEXT_COLOR,
    transition: 'color 0.2s ease',
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused || state.isHovered
      ? HOVER_COLOR
      : TEXT_COLOR,
    '&:hover': {
      color: HOVER_COLOR,
    },
    transition: 'color 0.2s ease',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  menu: (provided) => ({
    ...provided,
    background: '#ffffff',
    borderRadius: 4,
    overflow: 'hidden',
    zIndex: 4,
  }),
  menuList: (provided) => ({
    ...provided,
    padding: 0,
    margin: 0,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused
      ? '#f5f1e0'
      : 'transparent',
    color: state.isFocused
      ? HOVER_COLOR
      : '#333',
    cursor: 'pointer',
    padding: '8px 12px',
    '&:active': {
      backgroundColor: HOVER_COLOR + '33',
    },
    transition: 'background-color 0.2s ease, color 0.2s ease',
  }),
};

export default function SortDropdown({ value, options, onChange }) {
  const selected = options.find((o) => o.value === value) || null;

  return (
    <div className="sort-dropdown-wrapper">
      <label htmlFor="sort-select" className="sort-label">Sortuj:</label>
      <Select
        inputId="sort-select"
        value={selected}
        onChange={(option) => onChange(option.value)}
        options={options}
        styles={customStyles}
        isSearchable={false}
        placeholder="Domyślnie"
      />
    </div>
  );
}

SortDropdown.propTypes = {
  value: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  onChange: PropTypes.func.isRequired,
};
