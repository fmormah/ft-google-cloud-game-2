import { getFaviconVersion } from "@/utils/ftFavicon";

const FaviconEmbed = () => {
  const v = encodeURIComponent(getFaviconVersion());

  return (
    <>
      {/* Same-origin icons for Safari/iOS; `?v=` busts aggressive icon caching on deploys */}
      <link rel="icon" href={`/favicon.ico?v=${v}`} sizes="any" />
      <link rel="shortcut icon" href={`/favicon.ico?v=${v}`} />


      {/* macOS Safari pinned tabs */}
      <link rel="mask-icon" href={`/safari-pinned-tab.svg?v=${v}`} color="#000000" />
    </>
  );
};

export default FaviconEmbed;
