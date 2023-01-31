import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Box } from '@map-colonies/react-components';
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
      <Box className="Details">
        <Box className="Category">{app.category}</Box>
        <Box className="Name">{app.name}</Box>
        <Box><img src={app.icon} width={app.width} alt="" /></Box>
      </Box>
    );
  };

  return (
    <Box className="Tools">

      <Box className="Grid">

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
                <Box key={`${app.category}-${app.name}-${index}`} onClick={() => openInNewTab(app.url)} className="Item">
                  {appDetails(app)}
                </Box>
              );
            }
          })
        }

      </Box>

    </Box>
  );

};

export default Tools;