import React from "react";
import "./ParticipantsScreen.style.css";
import { Desk } from "../../components/desk/Desk";
import { desks } from "../../utils/data";

const ParticipantsScreen = () => {
  return (
    <div className="grid">
      {desks.map((number, index) => {
        return <Desk no={number} key={index} />;
      })}
    </div>
  );
};

export default ParticipantsScreen;
