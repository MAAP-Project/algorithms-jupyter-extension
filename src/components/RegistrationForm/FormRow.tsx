import React from 'react';
import { RegistrationFormInput } from '../../types/registration';
import { Tooltip, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

export declare type FormRowProps = {
  formInput: RegistrationFormInput;
};

export const FormRow = ({ formInput }: FormRowProps) => {
  return (
    <tr>
      <td>
        {formInput.label}
        <Tooltip title={formInput.tooltip}>
          <IconButton
            size="small"
            style={{ marginLeft: '8px', padding: '1px' }}
          >
            <InfoIcon style={{ fontSize: '14px' }} />
          </IconButton>
        </Tooltip>
      </td>
      <td>
        <input
          type="text"
          name={formInput.name}
          placeholder={formInput.placeholder}
          className="st-input"
        />
      </td>
    </tr>
  );
};
