import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { MdClose as Close, MdZoomIn as ZoomIn } from "react-icons/md";
import { Modal } from "../modal/modal";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "./rbc.scss";
import css from "./schedule.module.scss";
import { StreamEventForm } from "../stream-event-form/stream-event-form";

export function Schedule({ useStreamEvents, useAuth }) {
  const { streamEvents, readAll, StreamEvent } = useStreamEvents();
  const { user } = useAuth();
  const locales = {
    "en-US": enUS,
  };

  const [modalEvent, setModalEvent] = useState(null);

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });

  useEffect(() => {
    readAll(new Date().getMonth() + 1, new Date().getFullYear());
  }, [readAll]);

  return (
    <div className={css.schedule}>
      <Calendar
        messages={{ month: <Close />, day: <ZoomIn /> }}
        selectable
        localizer={localizer}
        events={streamEvents}
        defaultView={Views.MONTH}
        views={["month", "day"]}
        scrollToTime={new Date(2022, 1, 1)}
        defaultDate={new Date()}
        onNavigate={(date) => {
          readAll(date.getMonth() + 1, date.getFullYear());
        }}
        onSelectEvent={(event) => {
          setModalEvent(event);
        }}
        onSelectSlot={({ start, end }) => {
          if (!user || (!user.isStreamer && !user.isAdmin)) return;
          if (
            end.getHours() === 0 &&
            end.getMinutes() === 0 &&
            end.getSeconds() === 0 &&
            end.getMilliseconds() === 0
          ) {
            end.setDate(end.getDate() - 1);
            end.setHours(23, 59, 59, 999);
          }

          setModalEvent(
            new StreamEvent({
              start,
              end,
              streamerId: user ? user.id : null,
              streamer: user,
            })
          );
        }}
        eventPropGetter={(event) => ({
          style: {
            ...(event.streamer.nameColor && {
              color: event.streamer.nameColor,
            }),
            ...(event.streamer.msgBgColor && {
              backgroundColor: event.streamer.msgBgColor,
            }),
          },
        })}
      />
      <Modal
        open={modalEvent}
        requestClose={() => {
          setModalEvent(null);
        }}
      >
        <StreamEventForm
          event={modalEvent}
          setEvent={setModalEvent}
          defaultMode={modalEvent && modalEvent.id ? "read" : "create"}
          useStreamEvents={useStreamEvents}
          useAuth={useAuth}
        />
      </Modal>
    </div>
  );
}
