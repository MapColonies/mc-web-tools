import React, { useEffect } from 'react';
import { version } from '../../../package.json';
import Routing from '../Routing/Routing';

const Layout: React.FC = (): JSX.Element => {

  useEffect(() => {
    document.title = `Web Tools App - v${version}`;
  }, []);

  return (
    <div className='Layout'>

      <main>
        <Routing />
      </main>
      
    </div>
  );
  
};

export default Layout;
