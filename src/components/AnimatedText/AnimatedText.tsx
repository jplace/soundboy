/**
 * Copyright 2019 Transposit Corporation. All Rights Reserved.
 */
import React from "react";
import anime from "animejs";
import "./AnimatedText.css";

interface Props {
  children: string;
  className?: string;
}
interface State {}

/**
 * This code inspired by: http://tobiasahlin.com/moving-letters/#7
 */
export class AnimatedText extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    anime
      .timeline({ loop: true })
      .add({
        targets: ".animeContainer .letter",
        translateY: ["1.1em", 0],
        translateX: ["0.55em", 0],
        translateZ: 0,
        rotateZ: [180, 0],
        duration: 750,
        easing: "easeOutExpo",
        delay: function(el, i) {
          return 50 * i;
        }
      })
      .add({
        targets: ".animeContainer",
        opacity: 0,
        duration: 1000,
        easing: "easeOutExpo",
        delay: 3000
      });
  }

  render() {
    const { children, className } = this.props;
    return (
      <h3 className={`animeContainer ${className || ""}`}>
        <span className="text-wrapper">
          <span className="letters">
            {children.split("").map((char, idx) =>
              char === " " ? (
                " "
              ) : (
                <span key={idx} className="letter">
                  {char + ""}
                </span>
              )
            )}
          </span>
        </span>
      </h3>
    );
  }
}
