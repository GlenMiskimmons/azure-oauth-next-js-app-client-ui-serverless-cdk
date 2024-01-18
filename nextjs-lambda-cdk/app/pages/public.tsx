import React from 'react';

import { Divider, Paper } from '@mui/material';

import Layout from '../components/layout';
import PrivateData from '../components/private-data';
import PublicData from '../components/public-data';

const PublicPage = () => (
  <Layout>
    <Paper>
      <div className='page-container'>
        <h1>Public Page</h1>
        <p>This is a public page, anyone should be able to view this.</p>
        <PublicData />
        <Divider />
        <PrivateData />
      </div>
    </Paper>
  </Layout>
);

export default PublicPage;
