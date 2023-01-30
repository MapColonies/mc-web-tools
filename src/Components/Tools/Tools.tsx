import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import appConfig from '../../Utils/Config';

import './Tools.css';

interface IApp {
  category: string;
  name: string;
  icon: string;
  url: string;
  isRouting?: boolean;
}

const Tools: React.FC = (): JSX.Element => {

  const [apps] = useState({
    'terrain-verification': { category: 'DEM', name: 'Terrain Verification', icon: '/assets/img/map-marker.gif', url: '/terrain-verification', isRouting: true },
    ...appConfig.apps
  });

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noreferrer');
  };

  const appDetails = (app: IApp): JSX.Element => {
    return (
      <div className="Details">
        <div className="Category">{app.category}</div>
        <div className="Name">{app.name}</div>
        <div>
          {
            app.isRouting ?
            <img src={app.icon} alt="" /> :
            <img src={app.icon} width="132" alt="" />
          }
        </div>
      </div>
    );
  };

  return (
    <div className="Tools">

      <div className="Grid">

        {
          (Object.values(apps) as IApp[]).map((app: IApp): JSX.Element => {
            if (app.isRouting === true) {
              return (
                <NavLink key={`${app.category}-${app.name}`} to="/terrain-verification">
                  <div className="Item">
                    {appDetails(app)}
                  </div>
                </NavLink>
              );
            } else {
              return (
                <div key={`${app.category}-${app.name}`} onClick={() => openInNewTab(app.url)} className="Item">
                  {appDetails(app)}
                </div>
              );
            }
          })
        }

      </div>

    </div>
  );

};

export default Tools;