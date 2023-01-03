import React from 'react';
import Routing from '../Routing/Routing';

const Layout: React.FC = (): JSX.Element => {

  return (
    <div className='Layout'>

      <main>
        <Routing />
      </main>
      
    </div>
  );
  
};

export default Layout;
