import { useEffect, useState } from "react";
import { Modal } from "../modal/modal";
import css from "./stream.module.scss";

export function Stream({
  className,
  useChannels,
  modalMessages: otherModalMessages,
  errors: otherErrors,
}) {
  const { liveChannel: channel } = useChannels();
  const [errors, setErrors] = useState(["Cannot validate channel name."]);

  const [modalMessages, setModalMessages] = useState(otherModalMessages);

  useEffect(() => {
    setModalMessages(otherModalMessages);
  }, [otherModalMessages]);

  useEffect(() => {
    if (Array.isArray(otherErrors)) {
      setErrors(otherErrors.map((x) => x.message || x));
    }
  }, [otherErrors]);

  return channel ? (
    <div className={className + " " + css.outer}>
      <div className={css.inner}>
        <iframe
          title="stream"
          className={css.stream}
          src={channel.source}
          scrolling="no"
          frameBorder="0"
          allowtransparency="true"
          allowFullScreen={true}
          webkitallowfullscreen="true"
          mozallowfullscreen="true"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        ></iframe>
        <Modal
          open={modalMessages.length}
          requestClose={() => {
            setModalMessages([]);
          }}
        >
          {modalMessages.map((message, i) => (
            <div key={`stream-modal-message-${i}`}>{message}</div>
          ))}
        </Modal>
        <Modal
          open={errors.length}
          requestClose={() => {
            setErrors([]);
          }}
        >
          {errors.map((error, i) => (
            <div key={`stream-error-message-${i}`} className={css.error}>
              {error}
            </div>
          ))}
        </Modal>
      </div>
    </div>
  ) : (
    <div className={css.outer}>
      <div className={css.inner}></div>
    </div>
  );
}
