import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
  useMemo,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPause,
  faPlay,
  faVolumeHigh,
  faVolumeXmark,
  faAngleUp,
  faAngleDown,
  faHeart,
  faShare,
  faEllipsisVertical,
  faExpand,
  faCompress,
} from "@fortawesome/free-solid-svg-icons";
import videoData from "./DataProvider";
import abnLogo from "../assets/images/abn-logo.png";

const Short = memo(
  ({ video, isVisible, index, resetInfo, isFullScreen, setFullScreen }) => {
    const [playState, setPlayState] = useState(isVisible);
    const [muteState, setMuteState] = useState(true);
    const [likeState, setLikeState] = useState(
      () => localStorage.getItem(`like_video_${index}`) === "true"
    );
    const [progress, setProgress] = useState(0);
    const [controlsVisible, setControlsVisible] = useState(false);
    const [infoState, setInfoState] = useState(false);
    const videoRef = useRef(null);

    const toggleFullScreen = useCallback(
      () => setFullScreen((prev) => !prev),
      [setFullScreen]
    );
    const updatePlayState = useCallback(
      () =>
        setPlayState((prev) => {
          const newState = !prev;
          videoRef.current?.[newState ? "play" : "pause"]();
          return newState;
        }),
      []
    );
    const updateMuteState = useCallback(
      () =>
        setMuteState((prev) => {
          const newState = !prev;
          if (videoRef.current) videoRef.current.muted = newState;
          return newState;
        }),
      []
    );
    const handleLike = useCallback(
      () =>
        setLikeState((prev) => {
          const newState = !prev;
          localStorage.setItem(`like_video_${index}`, newState.toString());
          return newState;
        }),
      [index]
    );

    useEffect(() => {
      if (!videoRef.current) return;
      if (isVisible) {
        videoRef.current.currentTime = 0;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => setPlayState(true)).catch(() => {});
        }
      } else {
        videoRef.current.pause();
        setPlayState(false);
      }
    }, [isVisible]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;
      const updateProgress = () =>
        setProgress((video.currentTime / video.duration) * 100);
      video.addEventListener("timeupdate", updateProgress);
      return () => video.removeEventListener("timeupdate", updateProgress);
    }, []);

    const handleMouseLeave = useCallback(() => setControlsVisible(false), []);
    const handleMouseEnter = useCallback(() => setControlsVisible(true), []);

    useEffect(() => {
      let timeoutId;
      if (controlsVisible && playState) {
        timeoutId = setTimeout(() => setControlsVisible(false), 1200);
      }
      return () => clearTimeout(timeoutId);
    }, [controlsVisible, playState]);

    useEffect(() => {
      if (resetInfo) setInfoState(false);
    }, [resetInfo]);

    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.code === "Space") {
          e.preventDefault();
          updatePlayState();
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [updatePlayState]);

    const videoClassName = useMemo(
      () => (isFullScreen ? "short-no-border-radius" : ""),
      [isFullScreen]
    );
    const progressWrapperClassName = useMemo(
      () =>
        `video-progress-wrapper | flex aife w-100${
          isFullScreen ? " short-no-border-radius padding-zero" : ""
        }`,
      [isFullScreen]
    );

    return (
      <div
        className={`short | flex jcc fdc w-100${
          isFullScreen ? " short-full-width" : ""
        }`}
      >
        <div
          onClick={toggleFullScreen}
          className="full-screen-toggle-box | center fz-24"
        >
          <FontAwesomeIcon icon={isFullScreen ? faCompress : faExpand} />
        </div>
        <video
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onDoubleClick={handleLike}
          className={videoClassName + " short-video"}
          preload="auto"
          onClick={updatePlayState}
          ref={videoRef}
          autoPlay
          muted
          playsInline
          loop
          src={video.src}
        />
        <div className={progressWrapperClassName}>
          <div
            className="video-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div
          className={`video-details | w-100${
            isFullScreen ? " short-no-border-radius" : ""
          }`}
        >
          <div className="flex aic" style={{ marginBottom: "3px" }}>
            <span className="video-logo-wrapper">
              <img className="abn-logo" src={abnLogo} alt="abn-logo" />
            </span>
            <span className="video-title | fz-14 fw-400">{video.title}</span>
          </div>
          {video.tags.map((tag) => (
            <span key={tag} className="video-tag">{`#${tag} `}</span>
          ))}
        </div>
        <div
          className="video-controls | flex aic w-100 fz-18"
          style={{
            opacity: !playState || controlsVisible ? 1 : 0,
            transition: "opacity 0.15s linear",
          }}
        >
          <button onClick={updatePlayState} className="video-play-pause-btn">
            <FontAwesomeIcon icon={playState ? faPause : faPlay} />
          </button>
          <button onClick={updateMuteState} className="video-mute-unmute-btn">
            <FontAwesomeIcon icon={muteState ? faVolumeXmark : faVolumeHigh} />
          </button>
        </div>
        <div className="video-info-wrapper | flex aic jcfe fdc">
          <div
            onClick={handleLike}
            className={`video-info likes-wrapper | center fz-24 ${
              likeState ? "likes-wrapper-active" : ""
            }`}
          >
            <span>
              <FontAwesomeIcon icon={faHeart} />
            </span>
          </div>
          <div className="video-info share-wrapper | center">
            <span>
              <FontAwesomeIcon icon={faShare} />
            </span>
          </div>
          <div
            onClick={() => setInfoState((prev) => !prev)}
            className="video-info info-wrapper | center"
          >
            <span>
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </span>
          </div>
        </div>
        <div
          onClick={() => setInfoState(false)}
          className={`video-desc-wrapper | fdc${infoState ? " flex" : ""}`}
        >
          <div className="flex aic">
            <img className="abn-logo" src={abnLogo} alt="abn-logo" />
            <h1 className="video-title | fz-20">{video.title}</h1>
          </div>
          <div className="hor-line" />
          <p className="video-desc">{video.desc}</p>
        </div>
      </div>
    );
  }
);

const Shorts = () => {
  const [visibleIndex, setVisibleIndex] = useState(() => {
    const savedIndex = localStorage.getItem("lastSeenVideoIndex");
    return savedIndex !== null ? parseInt(savedIndex, 10) : 0;
  });
  const [newVideoScrolled, setNewVideoScrolled] = useState(false);
  const [hasPrev, setHasPrev] = useState(() => visibleIndex > 0);
  const [hasNext, setHasNext] = useState(
    () => visibleIndex < videoData.length - 1
  );
  const [isFullScreen, setIsFullScreen] = useState(false);
  const sectionRef = useRef(null);

  const handleScroll = useCallback(() => {
    if (!sectionRef.current) return;
    const shorts = sectionRef.current.querySelectorAll(".short");
    const scrollPosition = sectionRef.current.scrollTop;
    const windowHeight = window.innerHeight;

    shorts.forEach((short, index) => {
      const shortRect = short.getBoundingClientRect();
      const shortTop = shortRect.top + scrollPosition;
      const shortBottom = shortTop + shortRect.height;
      const shortCenter = (shortTop + shortBottom) / 2;

      if (shortCenter >= scrollPosition && shortCenter <= scrollPosition + windowHeight) {
        setVisibleIndex(index);
        setNewVideoScrolled(true);
      }
    });
  }, []);

  useEffect(() => {
    if (newVideoScrolled) setNewVideoScrolled(false);
  }, [newVideoScrolled]);

  const scrollToIndex = useCallback((index) => {
    if (!sectionRef.current) return;
    const shorts = sectionRef.current.querySelectorAll(".short");
    const targetShort = shorts[index];
    if (targetShort) {
      const targetTop =
        targetShort.offsetTop -
        (window.innerHeight - targetShort.offsetHeight) / 2;
      sectionRef.current.scrollTo({ top: targetTop, behavior: "smooth" });
    }
  }, []);

  const scrollToPrevious = useCallback(() => {
    setVisibleIndex((prev) => {
      const newIndex = Math.max(0, prev - 1);
      scrollToIndex(newIndex);
      return newIndex;
    });
  }, [scrollToIndex]);

  const scrollToNext = useCallback(() => {
    setVisibleIndex((prev) => {
      const newIndex = Math.min(videoData.length - 1, prev + 1);
      scrollToIndex(newIndex);
      return newIndex;
    });
  }, [scrollToIndex]);

  useEffect(() => {
    localStorage.setItem("lastSeenVideoIndex", visibleIndex.toString());
    setHasPrev(visibleIndex !== 0);
    setHasNext(visibleIndex !== videoData.length - 1);
  }, [visibleIndex]);

  useEffect(() => {
    scrollToIndex(visibleIndex);
  }, [visibleIndex, scrollToIndex]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    section.addEventListener("scroll", handleScroll);
    scrollToIndex(visibleIndex);
    handleScroll();
    return () => section.removeEventListener("scroll", handleScroll);
  }, [handleScroll, scrollToIndex, visibleIndex]);

  return (
    <section className="shorts-section | h-100 w-100" ref={sectionRef}>
      <div className="shorts-wrapper | ff-roboto flex aic fdc">
        {videoData.map((video, videoIndex) => (
          <Short
            key={videoIndex}
            video={video}
            isVisible={videoIndex === visibleIndex}
            index={videoIndex}
            resetInfo={newVideoScrolled}
            isFullScreen={isFullScreen}
            setFullScreen={setIsFullScreen}
          />
        ))}
        <div className="video-nav-controls | flex fdc jcsb fz-24">
          <div
            onClick={scrollToPrevious}
            className="nav-btn-wrapper | center"
            style={{ visibility: !hasPrev && "hidden" }}
          >
            <span className="nav-btn prev">
              <FontAwesomeIcon icon={faAngleUp} />
            </span>
          </div>
          <div
            onClick={scrollToNext}
            className="nav-btn-wrapper | center"
            style={{ visibility: !hasNext && "hidden" }}
          >
            <span className="nav-btn next">
              <FontAwesomeIcon icon={faAngleDown} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Shorts;
