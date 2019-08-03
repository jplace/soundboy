import React, { FormEvent } from "react";
import "./App.css";
import "tachyons";
import removeYa from "../../assets/remove-ya.png";
import AsyncSelect from "react-select/lib/Async";
import { OptionsType, ValueType, ActionMeta } from "react-select/lib/types";
import throttle from "lodash/throttle";
import { Cancelable } from "lodash";
import { Transposit } from "transposit";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import { AnimatedText } from "../AnimatedText/AnimatedText";
import { strict } from "assert";

const transposit: Transposit = new Transposit(
  "https://soundboy-44uqk.transposit.io"
);

const REFRESH_MS = 5000; // 5 seconds

interface OptionType {
  value: string;
  label: string;
}

interface Track {
  artist: string;
  name: string;
  uri: string;
  key?: string;
}

interface Props {}

interface State {
  displayName: string | null;
  tracks: Track[] | null;
  currentlyPlaying: number;
  trackToAdd: OptionType | null;
}

/**
 * Current bugs:
 * - Does not properly support duplicates in playlist (https://github.com/spotify/web-api/issues/1157)
 * - Does not really cache data properly (since cache key will be unique to each client)
 */
export class App extends React.Component<Props, State> {
  private throttledSearch: any;
  private refreshInterval: number | null = null;

  constructor(props: Props) {
    super(props);

    this.throttledSearch = throttle(this.search, 1000);

    this.state = {
      displayName: null,
      tracks: null,
      currentlyPlaying: -1,
      trackToAdd: null
    };
  }

  componentDidMount() {
    window.addEventListener("focus", this.onWindowFocus);
    window.addEventListener("blur", this.onWindowFocus);
    this.onWindowFocus();

    transposit
      .runOperation("get_display_name")
      .then(response => {
        if (response.status !== "SUCCESS") {
          throw response;
        }
        const results = response.result.results;
        this.setState({ displayName: results![0].display_name });
      })
      .catch(response => console.log(response));

    this.loadSongs();
  }

  onWindowFocus = () => {
    if (this.refreshInterval == null) {
      this.refreshInterval = window.setInterval(
        () => this.loadSongs(),
        REFRESH_MS
      );
    }
  };

  onWindowBlur = () => {
    if (this.refreshInterval !== null) {
      window.clearInterval(this.refreshInterval);
    }
  };

  componentWillUnmount() {
    (this.throttledSearch as Cancelable).cancel();

    window.removeEventListener("focus", this.onWindowFocus);
    window.removeEventListener("blur", this.onWindowBlur);
    if (this.refreshInterval !== null) {
      window.clearInterval(this.refreshInterval);
    }
  }

  loadSongs = (): Promise<void> => {
    return transposit
      .runOperation("soundboy_poll")
      .then(response => {
        if (response.status !== "SUCCESS") {
          throw response;
        }

        const results = response.result.results![0] as {
          tracks: Track[];
          currentlyPlaying: number;
        };
        const { tracks, currentlyPlaying } = results;

        // Assign a unique key to each track
        const seen: { [uri: string]: number } = {};
        for (const track of tracks) {
          let key: string;
          if (seen[track.uri]) {
            key = `${track.uri}-${seen[track.uri]}`;
            seen[track.uri] += 1;
          } else {
            key = track.uri;
            seen[track.uri] = 1;
          }
          track.key = key;
        }

        this.setState({ tracks, currentlyPlaying });
      })
      .catch(response => console.log(response));
  };

  addTrack = (option: OptionType) => {
    transposit
      .runOperation("add_to_soundboy", { trackUri: option.value })
      .then(response => {
        if (response.status !== "SUCCESS") {
          throw response;
        }
        this.loadSongs().then(() => this.setState({ trackToAdd: null }));
      })
      .catch(response => console.log(response));
  };

  // Use throtteled version instead
  search = (
    q: string,
    callback: (options: OptionsType<OptionType>) => void
  ): void => {
    transposit
      .runOperation("search", { q })
      .then(response => {
        if (response.status !== "SUCCESS") {
          throw response;
        }
        const results = response.result.results;
        callback(results!);
      })
      .catch(response => console.log(response));
  };

  loadOptions = (
    inputValue: string,
    callback: (options: OptionsType<OptionType>) => void
  ) => {
    this.throttledSearch(inputValue, callback);
  };

  onChange = (option: ValueType<OptionType>, actionMeta: ActionMeta) => {
    this.setState({ trackToAdd: option as OptionType });

    if (actionMeta.action === "select-option") {
      this.addTrack(option as OptionType);
    }
  };

  render() {
    const { displayName, tracks, currentlyPlaying, trackToAdd } = this.state;

    let currentTrack: Track | null = null;
    let upcomingTracks: Track[] | null = tracks;
    if (currentlyPlaying !== -1 && tracks !== null) {
      currentTrack = tracks![currentlyPlaying];
      upcomingTracks = tracks.slice(currentlyPlaying);
    }

    return (
      <div className="sans-serif">
        <header className="header pa4 tc white">
          <h1 className="headerText mb0 lh-title f2 f1-ns">SOUNDBOY</h1>
          <h2 className="mt0 o-50 f4 f3-ns lh-title">
            find a tune, add to the queue
          </h2>
          <span className="db white pa2 fw5 o-50 sans-serif">
            {displayName || "..."}
          </span>
        </header>
        <section className="w-100 ph2 pv3 tc white bg-dark-gray">
          <span className="o-50 dib pb2">Currently playing:</span>
          {currentTrack ? (
            <AnimatedText className="ma0 fw5">{`${currentTrack.artist} - ${
              currentTrack.name
            }`}</AnimatedText>
          ) : (
            <h3 className="ma0 fw5">-</h3>
          )}
        </section>
        <section className="mw8 tc center ph2 pv4">
          <AsyncSelect
            cacheOptions
            loadOptions={this.loadOptions}
            value={trackToAdd}
            onChange={this.onChange}
            placeholder="Search for a song..."
            noOptionsMessage={({ inputValue }) => "No songs found"}
            className="mw6 center"
          />
        </section>
        <section />
        {tracks !== null && (
          <section className="mw8 mb4 center ph2">
            {tracks !== null && tracks.length > 0 ? (
              <ol reversed className="songList list ma0 pa0">
                <ReactCSSTransitionGroup
                  transitionName="track"
                  transitionEnterTimeout={1000}
                  transitionLeaveTimeout={500}
                >
                  {upcomingTracks!.map((track, idx) => (
                    <li
                      key={track.uri}
                      className={`songListItem ${
                        currentTrack && idx === 0 ? "fw6" : ""
                      } pa2 pa3-l`}
                    >
                      {`${track.artist} - ${track.name} `}
                    </li>
                  ))}
                </ReactCSSTransitionGroup>
              </ol>
            ) : (
              <article className="br2 ba b--purple bg-lightest-blue">
                <div className="pa3 pa4-ns dtc-ns v-mid">
                  <div>
                    <h2 className="fw4 blue mt0 mb3">SOUNDBOY is empty</h2>
                    <p className="black-70 measure lh-copy mv0">
                      Add a song to the SOUNDBOY playlist to begin
                    </p>
                  </div>
                </div>
              </article>
            )}
          </section>
        )}
      </div>
    );
  }
}
