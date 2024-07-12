import css from "./modal.module.scss";
import { MdClose as Close } from "react-icons/md";

export function Modal({ open, requestClose, title, children }) {
  return open ? (
    <div
      className={css.modalWrapper}
      onClick={() => {
        requestClose();
      }}
    >
      <div
        className={css.modal}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <header>
          <div className={css.title}>{title}</div>
          <Close
            onClick={() => {
              requestClose();
            }}
          />
        </header>
        <main>{children}</main>
      </div>
    </div>
  ) : (
    <></>
  );
}
