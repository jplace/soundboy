import React from "react";
import "./App.css";
import "tachyons";
import removeYa from "../../assets/remove-ya.png";

export class App extends React.Component<{}, {}> {
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
          <input
            className="f6 f5-l input-reset bn br2 black-80 bg-white pa3 lh-solid w-100 mw6"
            placeholder="Search for a song"
            type="text"
            name="search"
            value=""
          />
          <div>
            <ul className="searchResults list dib pa0 bg-white br2 pa2 w-100 mw6 tl">
              {new Array(5).fill("Artist - Title").map((text, idx) => (
                <li key={idx} className="searchResultItem pa2">
                  {text}
                </li>
              ))}
            </ul>
          </div>
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
