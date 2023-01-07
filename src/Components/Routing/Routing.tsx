import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import PageNotFound from '../PageNotFound/PageNotFound';
import TerrainVerification from '../TerrainVerification/TerrainVerification';
import Tools from '../Tools/Tools';

const Routing: React.FC = (): JSX.Element => {
  return (
    <div className="Routing">

      <Switch>

        {/* Tools */}
        <Route path="/tools">
          <Tools />
        </Route>

        {/* Terrain Verification */}
        <Route path="/terrain-verification">
          <TerrainVerification />
        </Route>

        {/* Default Route */}
        <Route exact path="/">
          <Redirect to="/tools" />
        </Route>
        
        <Route path="*">
          <PageNotFound />
        </Route>

      </Switch>
      
    </div>
  );
};

export default Routing;
