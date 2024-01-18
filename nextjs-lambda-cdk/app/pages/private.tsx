import { signIn, useSession } from 'next-auth/react';
import React from 'react';
import { useEffect, useState } from 'react';
import { isDataView } from 'util/types';

import { Divider, Paper } from '@mui/material';

import AccessDenied from '../components/access-denied';
import Layout from '../components/layout';
import PrivateData from '../components/private-data';
import PublicData from '../components/public-data';
import TokenContainer from '../components/token-container';

const PrivatePage = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    const isSignedIn = async () => {
      if (status === 'unauthenticated') {
        void signIn('azure-ad');
      }
    };
    isSignedIn();
  }, [status]);

  // Fetch content from protected route
  if (!session) {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    );
  }

  // If session exists, display content
  return (
    <Layout>
      <Paper>
        <div className='page-container'>
          <h1>Private Page</h1>
          <p>
            This is a private page, only users who are authenticated can access
            this page.
          </p>
          <TokenContainer token={session.user.accessToken} />
          <Divider />
          <PrivateData token={session.user.accessToken} />
          <Divider />
          <PublicData />
        </div>
      </Paper>
    </Layout>
  );
};

export default PrivatePage;
