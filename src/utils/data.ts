const randomNumber = () => {
  let val = Math.floor(Math.random() * 990);
  val += Math.floor((val + 110) / 110);
  return ("000" + val).substr(-3);
};

export const desks: Array<string> = [
  randomNumber(),
  randomNumber(),
  randomNumber(),
  randomNumber(),
];

export const activeParticipants: Array<string> = [];
