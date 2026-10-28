"use client";

import classNames from "classnames";
import React from "react";
import styles from "./InfoCard.module.scss";

type ElementTag = "div" | "section" | "article";

export interface InfoCardProps extends React.HTMLAttributes<HTMLElement> {
  as?: ElementTag;
  children?: React.ReactNode;
  markdown?: string;
  variant?: "positive" | "negative";
  animationVariant?: "intro" | "reverse";
}

function simpleMarkdownToHtml(md: string): string {
  const html = md
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n\n+/g, "</p><p>")
    .replace(/\n/g, "<br/>");
  return `<p>${html}</p>`;
}

const InfoCard: React.FC<InfoCardProps> = ({
  as = "div",
  children,
  markdown,
  className,
  variant,
  animationVariant,
  ...rest
}) => {
  const Tag = as as React.ElementType;
  const classList = classNames(
    styles.InfoCard,
    {
      [styles["InfoCard--positive"]]: variant === "positive",
      [styles["InfoCard--negative"]]: variant === "negative",
      [styles["InfoCard--intro"]]: animationVariant === "intro",
      [styles["InfoCard--reverse"]]: animationVariant === "reverse",
    },
    className
  );

  return (
    <Tag className={classList} data-infocard {...rest}>
      <span
        className={classNames(
          styles.InfoCard__corner,
          styles["InfoCard__corner--tl"]
        )}
        aria-hidden
        data-testid="corner-tl"
      />
      <span
        className={classNames(
          styles.InfoCard__corner,
          styles["InfoCard__corner--tr"]
        )}
        aria-hidden
        data-testid="corner-tr"
      />
      <span
        className={classNames(
          styles.InfoCard__corner,
          styles["InfoCard__corner--br"]
        )}
        aria-hidden
        data-testid="corner-br"
      />
      <span
        className={classNames(
          styles.InfoCard__corner,
          styles["InfoCard__corner--bl"]
        )}
        aria-hidden
        data-testid="corner-bl"
      />

      <div className={styles.InfoCard__content}>
        {markdown ? (
          <div
            dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(markdown) }}
          />
        ) : (
          children
        )}
      </div>
    </Tag>
  );
};

export default InfoCard;
