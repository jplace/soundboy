import React, { FormEvent } from "react";
import "./App.css";
import "tachyons";
import removeYa from "../../assets/remove-ya.png";
import AsyncSelect from "react-select/lib/Async";
import { OptionsType, ValueType, ActionMeta } from "react-select/lib/types";
import throttle from "lodash/throttle";
import { Cancelable } from "lodash";

interface OptionType {
  value: string;
  label: string;
}

interface Props {}

interface State {}

export class App extends React.Component<Props, State> {
  private throttledSearch: any;

  constructor(props: Props) {
    super(props);

    this.throttledSearch = throttle(this.search, 1000);

    this.state = {};
  }

  componentWillUnmount() {
    (this.throttledSearch as Cancelable).cancel();
  }

  addTrack = (option: OptionType) => {
    console.log("Adding...");
    console.log(option);
  };

  // Use throtteled version instead
  search = (
    q: string,
    callback: (options: OptionsType<OptionType>) => void
  ): void => {};

  loadOptions = (
    inputValue: string,
    callback: (options: OptionsType<OptionType>) => void
  ) => {
    callback([
      { value: "banana", label: "Banana" },
      { value: "apple", label: "Apple" }
    ]);
  };

  onChange = (option: ValueType<OptionType>, actionMeta: ActionMeta) => {
    if (actionMeta.action === "select-option") {
      this.addTrack(option as OptionType);
    }
  };

  render() {
    return (
      <div className="sans-serif">
        <header className="header pa4 tc white">
          <h1 className="headerText mb0 lh-title f2 f1-ns">SOUNDBOY</h1>
          <h2 className="mt0 o-50 f4 f3-ns lh-title">
            find a tune, add to the queue
          </h2>
          <span className="db white pa2 fw5 o-50 sans-serif">
            spotify: jpwain
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
            onChange={this.onChange}
            placeholder="Search for a song..."
            noOptionsMessage={({ inputValue }) => "No songs found"}
            className="mw6 center"
          />
        </section>
        <section className="mw8 center ph2">
          <ol reversed className="songList ma0 pa0 fw5">
            {new Array(7).fill("Artist - Title").map((text, idx) => (
              <li key={idx} className="songListItem pa2 pa3-l">
                {text}{" "}
                <a href="#" style={{ float: "right" }}>
                  <img className="removeItem" src={removeYa} />
                </a>
              </li>
            ))}
          </ol>
        </section>
      </div>
    );
  }
}
