import { MdOutlineViewList as ViewListOutlined } from "react-icons/md";
import { useEffect, useState } from "react";
import Select from "react-select";
import { tryOperation } from "../../utils/utils";
import { ChannelForm } from "../channel-form";
import css from "./channel-selector.module.scss";
import theme from "../../css/theme.module.scss";

export function ChannelSelector({
  useSettings,
  useChannels,
  showInModal,
  setErrors,
  children,
  setCallbackToTrigger,
}) {
  const { settings, updateSettings, loading: loadingSettings } = useSettings();
  const {
    loading: loadingChannels,
    channels,
    readAll,
    setLiveChannel,
  } = useChannels();
  const [selectedChannelId, setSelectedChannelId] = useState(null);

  const loading = loadingSettings || loadingChannels;

  const customStyles = {
    container: (provided, state) => ({
      ...provided,
    }),
    control: (provided, state) => ({
      ...provided,
      border: 0,
      boxShadow: 0,
      background: 0,
      minWidth: "100px",
      cursor: "pointer",
    }),
    singleValue: (provided, { data }) => ({
      ...provided,
      color: data.value === settings?.liveChannelId ? "#ff7900" : "#9B4900",
      background: 0,
      textTransform: "uppercase",
      display: "flex",
      alignItems: "center",
      transition: "color 0.15s",
    }),
    indicatorSeparator: (provided, state) => ({
      ...provided,
      display: "none",
    }),
    valueContainer: (provided, state) => ({
      ...provided,
      paddingRight: "0",
    }),

    menu: ({ width, ...provided }, state) => ({
      ...provided,
      width: "max-content",
      minWidth: "100%",
      boxShadow: 0,
      background: 0,
      marginTop: 0,
      zIndex: 2,
    }),
    option: (
      { background, ...provided },
      { data, isDisabled, isFocused, isSelected }
    ) => {
      return {
        ...provided,
        background: "black",
        color: data.value === settings?.liveChannelId ? "#ff7900" : "#9B4900",
        cursor: "pointer",
        textTransform: "uppercase",
        paddingTop: "5px",
        paddingBottom: "5px",
        whiteSpace: "nowrap",
      };
    },
  };

  useEffect(() => {
    (async () => {
      tryOperation(async () => {
        await readAll();
      }, setErrors);
    })();
  }, [readAll, setErrors]);

  useEffect(() => {
    (async () => {
      if (settings) {
        setSelectedChannelId(settings?.liveChannelId || null);
      }
    })();
  }, [settings]);

  useEffect(() => {
    const channel = channels.find(
      (channel) => channel.id === selectedChannelId
    );
    if (channel) {
      setLiveChannel(channel);
    }
  }, [selectedChannelId, channels, setLiveChannel]);

  const isSelectedLive =
    settings && selectedChannelId === settings.liveChannelId;
  const options = channels.map((channel) => {
    return {
      value: channel.id,
      label: channel.name,
    };
  });

  return (
    <form
      className={css.channelSelector + " " + (loading ? theme.loading : "")}
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <button
        className={isSelectedLive ? css.lit : ""}
        onClick={() => {
          tryOperation(async () => {
            if (!isSelectedLive) {
              await updateSettings({ liveChannelId: selectedChannelId });
              setCallbackToTrigger({ name: "refreshStream", arguments: [] });
            }
          }, setErrors);
        }}
      >
        LIVE
      </button>
      <ViewListOutlined
        onClick={() => {
          const channel = channels.find(
            (channel) => channel.id === selectedChannelId
          );
          if (channel) {
            showInModal(
              <ChannelForm
                channel={channel}
                useChannels={useChannels}
                resetToLive={async () => {
                  setSelectedChannelId(settings?.liveChannelId || null);
                  showInModal(null);
                }}
              />
            );
          }
        }}
      />
      <Select
        options={options}
        value={options.filter((option) => option.value === selectedChannelId)}
        onChange={(e) => {
          setSelectedChannelId(e.value);
          showInModal(null);
        }}
        styles={customStyles}
        hideSelectedOptions={true}
        maxMenuHeight={150}
      />
      {children}
    </form>
  );
}
