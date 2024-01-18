import React, { useState } from 'react';

import { Button, Grid } from '@mui/material';

import { PrivateEndpointInvokerProps } from '../models/rest-api/PrivateEndpointInvokerProps';
import { callPrivateEndpoint } from '../services/RestApi';

const PrivateData = ({ token = '' }: PrivateEndpointInvokerProps) => {
  const [response, setResponse] = useState<string>();

  const onClick = async () => {
    try {
      const response = await callPrivateEndpoint(token);
      setResponse(JSON.stringify(response, null, 4));
    } catch (error: any) {
      const {
        response: {
          status,
          data: { message },
        },
      } = error;
      setResponse(JSON.stringify({ status, message }, null, 4));
    }
  };

  return (
    <div className='App-code-container'>
      <div>
        {response && (
          <pre className='App-code'>
            <code>{response}</code>
          </pre>
        )}
      </div>
      <div>
        <Grid container justifyContent='center'>
          <Button variant='contained' onClick={onClick}>
            Call API Private Endpoint
          </Button>
        </Grid>
      </div>
    </div>
  );
};

export default PrivateData;
