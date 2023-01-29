import React from 'react';
import { NavLink } from 'react-router-dom';
import appConfig from '../../Utils/Config';

import './Tools.css';

const Tools: React.FC = (): JSX.Element => {

  return (
    <div className="Tools">

      <div className="Grid">

        <div>
          <b>Terrain Verification</b>
          <NavLink to="/terrain-verification">
            <img src="/assets/img/map-marker.gif" alt="" />
          </NavLink>
        </div>

        {
          Object.values(appConfig.apps).forEach((app: {category: string, title: string, icon: string}): JSX.Element => {
            return (
              <div>
                <b>{app.category}</b>
                <b>{app.title}</b>
                <NavLink to="/footprint-verification">
                  <img src={app.icon} width="118" alt="" />
                </NavLink>
              </div>
            )
          })
        }

      </div>

    </div>
  );

};

export default Tools;