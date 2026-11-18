import React from 'react';

// Default value field for a required input, rendered to match the input's
// declared type.
export const DefaultValueInput = ({
  name,
  type,
  value,
  onChange
}: {
  name: string;
  type: string;
  value: string | number;
  onChange: (value: string) => void;
}) => {
  const commonProps = {
    name,
    className: 'st-input compact',
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange(e.target.value)
  };
  switch (type) {
    case 'boolean':
      return (
        <select {...commonProps}>
          <option value="">No default</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    case 'int':
    case 'long':
      return (
        <input
          {...commonProps}
          type="number"
          step="1"
          placeholder="Enter default value"
        />
      );
    case 'float':
    case 'double':
      return (
        <input
          {...commonProps}
          type="number"
          step="any"
          placeholder="Enter default value"
        />
      );
    default:
      return (
        <input {...commonProps} type="text" placeholder="Enter default value" />
      );
  }
};
