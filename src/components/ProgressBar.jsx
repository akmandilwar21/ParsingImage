import React from "react";

const Progress_bar = ({ bgcolor, progress, height }) => {
  const Parentdiv = {
    height: height,
    width: "100%",
    borderRadius: 40,
    margin: 50,
    background: "#e7eaec",
    height: "32px",
  };

  const Childdiv = {
    width: `${progress}%`,
    backgroundColor: "#acacac",
    borderRadius: 40,
    border: "1px solid",
  };

  const progresstext = {
    padding: 2,
    fontWeight: 900,
    color: "black",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
  };

  return (
    <div style={Parentdiv}>
      <span style={progresstext}>{`${progress}%`}</span>
      <div style={Childdiv}></div>
      <h3
        style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}
      >
        Scanning ...
      </h3>
    </div>
  );
};

export default Progress_bar;
