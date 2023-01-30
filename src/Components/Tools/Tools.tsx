import React from 'react';
import { NavLink } from 'react-router-dom';
import appConfig from '../../Utils/Config';

import './Tools.css';

interface IApp {
  category: string;
  name: string;
  icon: string;
  url: string;
}

const Tools: React.FC = (): JSX.Element => {

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noreferrer');
  };

  return (
    <div className="Tools">

      <div className="Grid">

        <NavLink to="/terrain-verification">
          <div className="Item">
            <p>DEM</p>
            <p>Terrain Verification</p>
            <img src="/assets/img/map-marker.gif" alt="" />
          </div>
        </NavLink>

        {
          (Object.values(appConfig.apps) as IApp[]).map((app: IApp): JSX.Element => {
            return (
              <div key={`${app.category}-${app.name}`} onClick={() => openInNewTab(app.url)} className="Item">
                <p>{app.category}</p>
                <p>{app.name}</p>
                <img src={app.icon} width="118" alt="" />
              </div>
            );
          })
        }

      </div>

    </div>
  );

};

export default Tools;