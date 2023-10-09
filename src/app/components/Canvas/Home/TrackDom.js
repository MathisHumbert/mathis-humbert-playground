import gsap from 'gsap';

import Component from '../../../classes/Component';
import { smooth } from '../../../utils/easing';

export default class TrackDom extends Component {
  constructor() {
    super({
      element: '.home__track',
      elements: {
        current: '.home__track__current',
        line: '.home__track__line',
        total: '.home__track__total',
      },
    });

    gsap.set([this.elements.current, this.elements.total], { opacity: 0 });
    gsap.set(this.elements.line, { scale: 0, transformOrigin: 'top' });

    this.tl = gsap.timeline({
      paused: true,
      delay: 0.5,
      defaults: { duration: 1, ease: smooth },
    });

    this.tl
      .to(this.elements.current, { opacity: 1 })
      .to(
        this.elements.line,
        {
          scale: 1,
        },
        0.2
      )
      .to(this.elements.total, { opacity: 1 }, 0.7);
  }

  show() {
    this.tl.play();
  }

  hide() {
    this.tl.reverse();
  }

  onChange(index) {
    this.elements.current.innerText =
      index + 1 < 10 ? `0${index + 1}` : index + 1;
  }
}
