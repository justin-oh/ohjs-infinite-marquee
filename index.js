import 'ohjs-html-element';
import { isInstanceOf } from 'ohjs-is';

/**
 * Repeats an HTMLElement to mimic marquee scrolling. The scrolling will
 * automatically start/stop depending on visibility of the marquee.
 *
 * @param {HTMLElement} element
 * @param {string} speed - 'slow'|'medium'|'fast'
 */
export default function(element, speed) {
    if (!isInstanceOf(element, HTMLElement)) {
        throw '`element` must be an HTMLElement';
    }

    const pixels = ('slow' === speed)
        ? 0.5
        : (('fast' === speed)
            ? 2
            : 1
        );

    const isBlock = 'block' === window.getComputedStyle(element, 
null).display;

    const marquee = document.createElement('div');
    marquee.style.overflow = 'hidden';
    marquee.style.display = 'inline-block';
    marquee.classList.add('marquee');

    const container = document.createElement('div');
    container.style.height = '100%';
    container.style.display = 'block';
    container.classList.add('marquee-container');

    element.parentNode.insertBefore(marquee, element);

    marquee.appendChild(container);

    element.style.display = 'inline-block';

    let width = element.outerWidth();

    if (width <= 0) {
        // prevent infinite loop
        width = 1;
    }

    container.appendChild(element);

    // insert a bunch of clones to cover a large width
    let goal = 9999 - width;

    let count = 1;
    while (goal > 0) {
        const clone = element.cloneNode(true);

        container.appendChild(clone);

        goal -= width;

        count++;
    }

    // make sure the container exactly fits the elements
    // and account for any style changes related to screen size
    function updateDimensions() {
        width = element.outerWidth();

        container.style.width = (count * width) + 'px';

        const height = element.outerHeight();

        marquee.style.width = isBlock ? '100%' : width + 'px';
        marquee.style.height = height + 'px';
    };

    updateDimensions();

    let scroll = 0;

    function updateScroll(timestamp) {
        scroll += pixels;

        // TODO: there are problems with jerkiness if the
        // value of `pixels` doesn't evenly go into `width`
        if (scroll >= width) {
            scroll = 0;
        }

        marquee.scrollLeft = scroll;
    }

    let paused = true;

    function callback(timestamp) {
        updateScroll(timestamp);

        if (paused) {
            return;
        }

        window.requestAnimationFrame(callback);
    }

    function start() {
        if (!paused) {
            return;
        }

        paused = false;

        window.requestAnimationFrame(callback);
    }

    const resizeObserver = new ResizeObserver(updateDimensions);

    resizeObserver.observe(element);

    const intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                start();
            } else {
                paused = true;
            }
        });
    });

    intersectionObserver.observe(marquee);
}

