import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  poster: string;
  /** Classes for the video element itself (sizing / object-fit). */
  className?: string;
  /** Classes for the wrapper that is measured against the viewport. */
  wrapperClassName?: string;
};

/**
 * A muted looping video that only downloads while it is on (or near) screen.
 *
 * The homepage had three autoplaying `<video>` elements — two of them pointing
 * at the same 5.7 MB file — all fetching and decoding from the first paint,
 * which starved the images and text below them. Here the `src` is not even
 * attached until an IntersectionObserver says the band is close, and playback
 * pauses again when it scrolls away. The poster carries the visual until then.
 */
export function InViewVideo({ src, poster, className, wrapperClassName }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setArmed(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (visible) setArmed(true);
        const v = video.current;
        if (!v) return;
        if (visible) void v.play().catch(() => undefined);
        else v.pause();
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className={wrapperClassName}>
      <video
        ref={video}
        className={className}
        poster={poster}
        muted
        loop
        playsInline
        autoPlay={armed}
        preload={armed ? "auto" : "none"}
      >
        {armed ? <source src={src} type="video/mp4" /> : null}
      </video>
    </div>
  );
}
