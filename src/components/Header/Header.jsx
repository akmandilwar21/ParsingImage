import React from "react";

const Header = () => {
  return (
    <div
      style={{
        height: "60px",
        background: "white",
        border: "1 px solid black",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 3.5rem 0 7rem",
        position: "fixed",
        width: "100%",
        zIndex: 3,
        boxShadow: "0 8px 20px 0 rgb(0 0 0 / 10%)",
      }}
    >
      <div>
        <img
          src="https://apply.mindfiresolutions.com/static/media/logo-white.913650c8.png"
          alt="logo"
          style={{ width: "150px" }}
        />
      </div>
      <div>
        <button
          style={{
            background: "red",
            color: "white",
            padding: ".5rem 1rem",
            outline: "none",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
            fontSize: "1rem",
            transition: "all .25s ease-in-out",
          }}
        >
          Current Openings
        </button>
      </div>
    </div>
  );
};
export default Header;
