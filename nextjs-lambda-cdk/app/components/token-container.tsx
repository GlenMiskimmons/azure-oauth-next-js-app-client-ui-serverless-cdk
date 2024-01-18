import React from 'react';

import { PrivateEndpointInvokerProps } from '../models/rest-api/PrivateEndpointInvokerProps';

const TokenContainer = ({ token = '' }: PrivateEndpointInvokerProps) => {
  return (
    <div className='App-code-container'>
      <div>
        {token && (
          <pre className='App-code'>
            <code>Access Token: {token}</code>
          </pre>
        )}
      </div>
    </div>
  );
};

export default TokenContainer;
