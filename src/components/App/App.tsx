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

const transposit: Transposit = new Transposit("joseph", "soundboy");

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
  trackToAdd: OptionType | null;
}

/*
 * TODOs
 * - Clear search field on add track
 */
export class App extends React.Component<Props, State> {
  private throttledSearch: any;

  constructor(props: Props) {
    super(props);

    this.throttledSearch = throttle(this.search, 1000);

    this.state = {
      displayName: null,
      tracks: null,
      trackToAdd: null
    };
  }

  componentDidMount() {
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

  componentWillUnmount() {
    (this.throttledSearch as Cancelable).cancel();
  }

  loadSongs = (): Promise<void> => {
    return transposit
      .runOperation("get_soundboy_tracks")
      .then(response => {
        if (response.status !== "SUCCESS") {
          throw response;
        }

        const tracks = response.result.results as Track[];

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

        this.setState({ tracks });
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
    const { displayName, tracks, trackToAdd } = this.state;
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
          <h3 className="ma0 fw5">Fila Brazillia - Mother Nature's Spies</h3>
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
        {tracks && (
          <section className="mw8 center ph2">
            {tracks.length > 0 ? (
              <ol reversed className="songList list ma0 pa0">
                <ReactCSSTransitionGroup
                  transitionName="track"
                  transitionEnterTimeout={500}
                  transitionLeaveTimeout={300}
                >
                  {tracks.map(track => (
                    <li key={track.uri} className="songListItem pa2 pa3-l">
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
