import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Box } from '@map-colonies/react-components';
import FootprintVerification from '../FootprintVerification/FootprintVerification';
import PageNotFound from '../PageNotFound/PageNotFound';
import TerrainVerification from '../TerrainVerification/TerrainVerification';
import Tools from '../Tools/Tools';
import SimpleCatalogViewer from '../SimpleCatalogViewer/SimpleCatalogViewer';

import './Routing.css';


const Routing: React.FC = (): JSX.Element => {

  return (
    <Box className="Routing">

      <Switch>

        {/* Default Route */}
        <Route path="/" exact>
          <Redirect to="/index" />
        </Route>

        {/* Tools */}
        <Route path="/index">
          <Tools />
        </Route>

        {/* Terrain Verification */}
        <Route path="/terrain-verification">
          <TerrainVerification />
        </Route>

        {/* Simple Catalog Viewer */}
        <Route path="/simple-catalog-viewer">
          <SimpleCatalogViewer />
        </Route>

        <Route path="*">
          <PageNotFound />
        </Route>
        
      </Switch>
      
    </Box>
  );
  
};

export default Routing;
