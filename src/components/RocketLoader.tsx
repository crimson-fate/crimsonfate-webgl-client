import React from "react";
import './RocketLoader.css';

const RocketLoader: React.FC = () => {
  return (
    <div className="rocket-loader">
      <div className="rocket">
        <div className="rocket-extras"></div>
        <div className="jet">
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default RocketLoader;