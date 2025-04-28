import React from "react";
import MouseMoveEffect from "../homepage/MouseMoveEffect";

const HomeLayout = ({ children }) => {
  return (
    <div>
      <main>{children}</main>
      {/* <MouseMoveEffect /> */}
    </div>
  );
};

export default HomeLayout;
