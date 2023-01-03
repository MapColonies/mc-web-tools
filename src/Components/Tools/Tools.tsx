import React from 'react';
import { NavLink } from 'react-router-dom';

import './Tools.css';

const Tools: React.FC = (): JSX.Element => {

  return (
    <div className='Tools'>
      <div>
        <b>Terrain Verification</b>
        <NavLink to="/terrain-verification">
          <img src="/assets/img/map-marker.gif" alt="" />
        </NavLink>
      </div>
    </div>
  );

};

export default Tools;