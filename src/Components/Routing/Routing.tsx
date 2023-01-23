import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import FootprintVerification from '../FootprintVerification/FootprintVerification';
import PageNotFound from '../PageNotFound/PageNotFound';
import TerrainVerification from '../TerrainVerification/TerrainVerification';
import Tools from '../Tools/Tools';

const Routing: React.FC = (): JSX.Element => {
  return (
    <div className="Routing">

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

        {/* Footprint Verification */}
        <Route path="/footprint-verification">
          <FootprintVerification />
        </Route>

        <Route path="*">
          <PageNotFound />
        </Route>
        
      </Switch>
      
    </div>
  );
};

export default Routing;
