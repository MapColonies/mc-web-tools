import React from 'react';
import { Box } from '@map-colonies/react-components';

import './Header.css';

const Header: React.FC = (): JSX.Element => {
  return (
    <Box className="Header">
      {
        window.opener &&
        <Box className="Back" onClick={ (): void => { window.close(); } }>
          <Box className="ArrowHead"></Box>
          <Box className="ArrowBody">Back to app</Box>
        </Box>
      }
    </Box>
  );
};

export default Header;