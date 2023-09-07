import React, { Fragment, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Tooltip, Typography } from '@map-colonies/react-core';
import { Box } from '@map-colonies/react-components';
import appConfig from '../../Utils/Config';

import './Tools.css';

interface IApp {
  category: string;
  name: string;
  icon?: string;
  externalIconURL?: string;
  width?: number;
  url: string;
  description?: string;
  isInternal?: boolean;
}

const Tools: React.FC = (): JSX.Element => {

  const [apps] = useState({
    'terrain-verification': { category: 'DEM', name: 'Terrain Verification Tool', icon: 'map-marker.gif', url: '/terrain-verification', description: 'A Terrain Verification Tool', isInternal: true },
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
    window.open(url, '_blank', 'noopener noreferrer');
  };

  const format = (text: string): JSX.Element => {
    return <Typography tag='div' dangerouslySetInnerHTML={{__html: `${text.replaceAll('. ', '.<br/>')}`}}></Typography>;
  };

  const appDetails = (app: IApp): JSX.Element => {
    return (
      <Box className="Details">
        <Box className="Category">{app.category}</Box>
        <Box className="Name">{app.name}</Box>
        <Box><img src={app.externalIconURL ? `${app.externalIconURL}` : `${appConfig.publicUrl}/assets/img/${app.icon}`} width={app.width} alt="" /></Box>
        {
          app.description &&
          <Tooltip content={format(app.description)}>
            <Box className="Description">{app.description}</Box>
          </Tooltip>
        }
      </Box>
    );
  };

  const internalTool = (app: IApp, index: number): JSX.Element => {
    return (
      <NavLink to={app.url} className="Item Internal">
        {appDetails(app)}
      </NavLink>
    );
  };

  const externalTool = (app: IApp, index: number): JSX.Element => {
    return (
      <Box onClick={() => openInNewTab(app.url)} className="Item">
        {appDetails(app)}
      </Box>
    );
  };

  return (
    <Box className="Tools">

      <Box className="Grid">

        {
          (Object.values(apps) as IApp[]).map((app: IApp, index: number): JSX.Element => {
            return (
              <Fragment key={`${app.category}-${app.name}-${index}`}>
                {
                  app.isInternal ?
                  internalTool(app, index) :
                  externalTool(app, index)
                }
              </Fragment>
            );
          })
        }

      </Box>

    </Box>
  );

};

export default Tools;