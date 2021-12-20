# SOLUTION (a quick explanation)

- Due to restriction on using third party libraries (like Redux), I used good old event-bus mechanism for the communication between decoupled/independent components which are desks/participants
- System is bulletproof for Nth amount of participants, not just for four
- I tried to be more thorough than what I was asked to and improved the behavior a bit
- I ignored the quality of UI because it wasn't cared, but still used flexbox in order to make it a bit more responsive and to be able to work with Nth amount of participants without distorting screen
- Inside of Desk component might seem ambiguous and complicated but this is the consequence of not using any global state management library. With event-bus, this is the best I could do in a short period of time.
- Even though Context API is built-in and there was no prohibition on not using it, I still prefered event-bus because I don't like the way Context API works. (the way it makes you wrap your components, updating the state of it through a child component etc.)




# Interview Assignment

The goal of this task is to create a single page app which implements fake phone calls between four participants. No actual audio shall be transmitted, we're more interested in how you structure an app, how you manage state and how you perform error handling. We will discuss your results in a one hour technical interview with our development team.

* Subdivide the browser window 2x2 in 4 parts (representing the 4 participants)
* Each part shall include:
  * A random 3-digit phone number
  * An input field to enter whom to call
  * Red and green buttons with the usual semantics: green to call or answer, red to hang up or reject
  * An information about this participant's state: idle, ringing, talking, placing call, remote is ringing, remote unknown, remote busy, remote rejected
* Only 1:1 calls shall be implemented, no group calls
* Please don't add sound or graphics, text only is sufficient
* The language to use shall be TypeScript
* The framework used shall be React
* Don't use libraries in addition to what `create-react-app --template typescript` includes

