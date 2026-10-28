import React from "react";

export type MaterialIconName =
  | "frame_person"
  | "error"
  | "language"
  | "orbit"
  | "account_circle"
  | "select_window"
  | "cloud"
  | "package_2"
  | "settings"
  | "graph_5"
  | "graph_3"
  | "insert_chart"
  | "factory"
  | "finance_mode"
  | "nest_eco_leaf"
  | "solar_power"
  | "assignment"
  | "adaptive_audio_mic"
  | "area_chart"
  | "emergency_home"
  | "ads_click"
  | "bolt"
  | "bar_chart_4_bars"
  | "sentiment_satisfied"
  | "front_loader"
  | "build"
  | "checked_circle_unread"
  | "rule"
  | "crisis_alert"
  | "admin_panel_settings"
  | "grocery"
  | "article"
  | "stars_2"
  | "browse_activity"
  | "arrow_drop_down"
  | "arrow_drop_up"
  | "info"
  | "hub"
  | "inventory_2"
  | "verified"
  | "warning"
  | "check_circle"
  | "help"
  | "search"
  | "favorite"
  | "star"
  | "thumb_up"
  | "thumb_down"
  | "visibility"
  | "visibility_off"
  | "delete"
  | "edit"
  | "add"
  | "remove"
  | "close"
  | "menu"
  | "more_vert"
  | "more_horiz"
  | "refresh"
  | "sync"
  | "sync_problem"
  | "arrow_back"
  | "arrow_forward"
  | "arrow_up"
  | "arrow_down"
  | "expand_more"
  | "expand_less"
  | "chevron_left"
  | "chevron_right"
  | "keyboard_arrow_left"
  | "keyboard_arrow_right"
  | "keyboard_arrow_up"
  | "keyboard_arrow_down"
  | "campaign";

export interface MaterialIconProps {
  name: MaterialIconName;
  className?: string;
  title?: string;
  fill?: 0 | 1;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  grade?: -50 | 0 | 200;
  opticalSize?: 20 | 24 | 40 | 48;
  sizePx?: number;
  style?: React.CSSProperties;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({
  name,
  className,
  title,
  fill = 0,
  weight = 100,
  grade = 0,
  opticalSize = 24,
  sizePx,
  style,
}) => {
  const fontVariationSettings = `"FILL" ${fill}, "wght" ${weight}, "GRAD" ${grade}, "opsz" ${opticalSize}`;

  const mergedStyle: React.CSSProperties = {
    fontVariationSettings,
    fontSize: sizePx ?? opticalSize,
    ...style,
  };

  return (
    <span
      className={["material-symbols-rounded", className]
        .filter(Boolean)
        .join(" ")}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      title={title}
      style={mergedStyle}
    >
      {name}
    </span>
  );
};

export default MaterialIcon;
