import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import appConfig from '../../Utils/Config';

import './Tools.css';

interface IApp {
  category: string;
  name: string;
  icon: string;
  url: string;
  isInternal?: boolean;
  width?: number;
}

const Tools: React.FC = (): JSX.Element => {

  const [apps] = useState({
    'terrain-verification': { category: 'DEM', name: 'Terrain Verification', icon: '/assets/img/map-marker.gif', url: '/terrain-verification', isInternal: true },
    ...appConfig.apps
  });

  useEffect(() => {
    const numberOfApps = Object.values(apps).length;
    const toolSize = +window.getComputedStyle(document.querySelector('.Tools') as Element).getPropertyValue('--toolSize').slice(0, -2);
    const maxNumberOfTools = Math.floor(window.innerWidth / toolSize);
    const cols = Math.min(maxNumberOfTools, Math.ceil(Math.sqrt(numberOfApps)));
    const rows = Math.ceil(numberOfApps / cols);
    document.documentElement.style.setProperty('--toolsColNum', cols.toString());
    document.documentElement.style.setProperty('--toolsRowNum', rows.toString());
  }, []);

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noreferrer');
  };

  const appDetails = (app: IApp): JSX.Element => {
    return (
      <div className="Details">
        <div className="Category">{app.category}</div>
        <div className="Name">{app.name}</div>
        <div>
            <img src={app.icon} width={app.width} alt="" />
        </div>
      </div>
    );
  };

  return (
    <div className="Tools">

      <div className="Grid">

        {
          (Object.values(apps) as IApp[]).map((app: IApp, index: number): JSX.Element => {
            if (app.isInternal === true) {
              return (
                <NavLink key={`${app.category}-${app.name}-${index}`} to={app.url} className="Item">
                  {appDetails(app)}
                </NavLink>
              );
            } else {
              return (
                <div key={`${app.category}-${app.name}-${index}`} onClick={() => openInNewTab(app.url)} className="Item">
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