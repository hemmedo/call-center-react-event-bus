import React, { useState, useLayoutEffect, useEffect } from "react";
import { DeskProps } from ".";
import { PhoneAction, Status } from "../../utils/enums";
import { EventBus } from "../../utils/event-bus";
import { activeParticipants, desks } from "../../utils/data";
import "./Desk.style.css";

export const Desk: React.FC<DeskProps> = (props) => {
  const { no } = props;
  const [dialedNumber, setdialedNumber] = useState("");
  const [caller, setCaller] = useState("");
  const [phoneProceedAction, setPhoneProceedAction] = useState<PhoneAction>(
    PhoneAction.Call
  );
  const [phoneCancelAction, setPhoneCancelAction] = useState<PhoneAction>(
    PhoneAction.Reject
  );
  const [status, setStatus] = useState<Status>(Status.Idle);
  const [callButtonDisabled, setCallButtonDisabled] = useState<boolean>(false);
  const [numberInputDisabled, setNumberInputDisabled] =
    useState<boolean>(false);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setdialedNumber(e.target.value);
  };

  useEffect(() => {
    if (dialedNumber.length > 0) {
      setStatus(Status.PlacingCall);
    } else {
      setStatus(Status.Idle);
    }
  }, [dialedNumber]);

  const onClickGreenButton = () => {
    if (
      status === Status.PlacingCall &&
      phoneProceedAction === PhoneAction.Call
    ) {
      if (dialedNumber === no) {
        alert("You cannot call yourself.");
        setdialedNumber("");
      } else if (!desks.includes(dialedNumber)) {
        setStatus(Status.RemoteUnknown);
        setTimeout(() => {
          setStatus(Status.Idle);
        }, 2000);
      } else if (activeParticipants.includes(dialedNumber)) {
        setStatus(Status.RemoteBusy);
        setTimeout(() => {
          setStatus(Status.Idle);
        }, 2000);
      } else {
        activeParticipants.push(dialedNumber);
        activeParticipants.push(no);
        EventBus.getInstance().dispatch<{
          dialer: string;
          dialedNumber: string;
        }>("tryCall", {
          dialer: no,
          dialedNumber,
        });
      }
    } else if (
      status === Status.Ringing &&
      phoneProceedAction === PhoneAction.Answer
    ) {
      EventBus.getInstance().dispatch<{
        answererNumber: string;
        callerNumber: string;
      }>("tryAnswer", {
        answererNumber: no,
        callerNumber: caller,
      });
    }
  };

  const onClickRedButton = () => {
    if (status === Status.Ringing && phoneCancelAction === PhoneAction.Reject) {
      EventBus.getInstance().dispatch<{
        rejecterNumber: string;
        callerNumber: string;
      }>("tryReject", {
        rejecterNumber: no,
        callerNumber: caller,
      });
    } else if (
      status === Status.RemoteIsRinging &&
      phoneCancelAction === PhoneAction.HangUp
    ) {
      setdialedNumber("");
      EventBus.getInstance().dispatch<{
        hangUpNumber: string;
        dialedNumber: string;
      }>("tryHangUp", {
        hangUpNumber: no,
        dialedNumber: dialedNumber,
      });
    } else if (
      status === Status.Talking &&
      phoneCancelAction === PhoneAction.HangUp
    ) {
      setdialedNumber("");

      EventBus.getInstance().dispatch<{
        hangUpNumber: string;
        dialedNumber: string;
      }>("tryHangUp", {
        hangUpNumber: no,
        dialedNumber: caller,
      });
    }
  };

  const registryTryReject = EventBus.getInstance().register(
    "tryReject",
    ({
      rejecterNumber,
      callerNumber,
    }: {
      rejecterNumber: string;
      callerNumber: string;
    }) => {
      if (rejecterNumber === no) {
        setCallButtonDisabled(false);
        setNumberInputDisabled(false);

        activeParticipants.splice(
          activeParticipants.indexOf(rejecterNumber),
          1
        );
        setStatus(Status.Idle);
        setPhoneProceedAction(PhoneAction.Call);
        setPhoneCancelAction(PhoneAction.Reject);
      }
      if (callerNumber === no) {
        setCallButtonDisabled(false);
        setNumberInputDisabled(false);
        activeParticipants.splice(activeParticipants.indexOf(callerNumber), 1);
        setdialedNumber("");
        setStatus(Status.RemoteRejected);
        setPhoneCancelAction(PhoneAction.Reject);
        setTimeout(() => {
          setStatus(Status.Idle);
        }, 2000);
      }
    }
  );

  const registryTryHangUp = EventBus.getInstance().register(
    "tryHangUp",
    ({
      hangUpNumber,
      dialedNumber,
    }: {
      hangUpNumber: string;
      dialedNumber: string;
    }) => {
      if (hangUpNumber === no) {
        setCallButtonDisabled(false);
        setNumberInputDisabled(false);

        activeParticipants.splice(activeParticipants.indexOf(hangUpNumber), 1);
        setStatus(Status.Idle);
        setPhoneCancelAction(PhoneAction.Reject);
      }
      if (dialedNumber === no) {
        setCallButtonDisabled(false);
        setNumberInputDisabled(false);
        setdialedNumber("");

        activeParticipants.splice(activeParticipants.indexOf(dialedNumber), 1);
        setPhoneProceedAction(PhoneAction.Call);
        setStatus(Status.Idle);
        setPhoneCancelAction(PhoneAction.Reject);
      }
    }
  );

  const registryTryCall = EventBus.getInstance().register(
    "tryCall",
    ({ dialer, dialedNumber }: { dialer: string; dialedNumber: string }) => {
      if (dialedNumber === no) {
        setStatus(Status.Ringing);
        setCaller(dialer);
        setPhoneProceedAction(PhoneAction.Answer);
        setPhoneCancelAction(PhoneAction.Reject);
      } else if (dialer === no) {
        setCallButtonDisabled(true);
        setNumberInputDisabled(true);

        setStatus(Status.RemoteIsRinging);
        setCaller(dialedNumber);
        setPhoneCancelAction(PhoneAction.HangUp);
      }
    }
  );

  const registryTryAnswer = EventBus.getInstance().register(
    "tryAnswer",
    ({
      answererNumber,
      callerNumber,
    }: {
      answererNumber: string;
      callerNumber: string;
    }) => {
      if (answererNumber === no) {
        setCallButtonDisabled(true);
        setNumberInputDisabled(true);

        setStatus(Status.Talking);
        setPhoneProceedAction(PhoneAction.Call);
        setPhoneCancelAction(PhoneAction.HangUp);
      } else if (callerNumber === no) {
        setStatus(Status.Talking);
        setPhoneCancelAction(PhoneAction.HangUp);
      }
    }
  );

  useLayoutEffect(() => {
    return () => {
      registryTryCall.unregister();
      registryTryAnswer.unregister();
      registryTryReject.unregister();
      registryTryHangUp.unregister();
    };
  }, []);

  return (
    <div className="desk">
      <span>{no}</span>
      <input
        value={dialedNumber}
        onChange={onChange}
        className="input"
        disabled={numberInputDisabled}
      />
      <div>
        <button onClick={onClickGreenButton} disabled={callButtonDisabled}>
          {phoneProceedAction}
        </button>
        <button onClick={onClickRedButton}>{phoneCancelAction}</button>
      </div>
      <span>{status}</span>
    </div>
  );
};
