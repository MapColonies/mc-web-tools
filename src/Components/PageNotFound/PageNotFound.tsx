import React from 'react';

import './PageNotFound.css';

const PageNotFound: React.FC = (): JSX.Element => {

  return (
    <div className="PageNotFound">
      <div className="Description">The page you are looking for does not exist</div>
      <div className="Title">404</div>
      <img src="/assets/img/404.png" alt="" />
    </div>
  );
  
};

export default PageNotFound;
