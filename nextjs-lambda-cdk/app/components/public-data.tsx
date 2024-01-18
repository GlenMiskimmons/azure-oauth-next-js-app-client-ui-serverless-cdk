import React, { useState } from 'react';

import { Button, Grid } from '@mui/material';

import { callPublicEndpoint } from '../services/RestApi';

const PublicData = () => {
  const [response, setResponse] = useState<string>();

  const onClick = async () => {
    const response = await callPublicEndpoint();
    setResponse(JSON.stringify(response, null, 4));
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
            Call API Public Endpoint
          </Button>
        </Grid>
      </div>
    </div>
  );
};

export default PublicData;
