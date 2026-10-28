"use client";

import LoadingScreen from "@/components/organisms/scenes/LoadingScreen/LoadingScreen";
import styles from "./OrientationPrompt.module.scss";
import { assetUrl } from "@/utils/assetUrl";
import { getOpeningSplashVideoUrl } from "@/utils/browser";

const OrientationPrompt = () => {
  return (
    <div className={styles.overlay}>
      <video
        className={styles.video}
        src={assetUrl(getOpeningSplashVideoUrl())}
        muted
        loop
        autoPlay
        playsInline
        preload="auto"
        aria-hidden
      />
      <span className={"blurBackdrop"} />
      <LoadingScreen
        className={styles.loadingScreen}
        type="persistent"
        message="Please rotate your device. This experience is designed to be viewed in landscape mode."
        primaryIrisDashLength={2}
        primaryIrisDashHeight={1}
        primaryIrisGapLength={5}
        primaryIrisRotationSpeedSec={60}
        primaryIrisColor="#ffffff"
        primaryIrisDirection="clockwise"
        secondaryIrisDashLength={5}
        secondaryIrisDashHeight={1}
        secondaryIrisGapLength={14}
        secondaryIrisRotationSpeedSec={60}
        secondaryIrisColor="#ffffff"
        secondaryIrisDirection="counter-clockwise"
      />
    </div>
  );
};

export default OrientationPrompt;
