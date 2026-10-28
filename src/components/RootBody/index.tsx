"use client";

import { RootBodyElement } from "./styles";

interface Props {
  children: React.ReactNode;
}

const RootBody = ({ children }: Props) => (
  <RootBodyElement>{children}</RootBodyElement>
);

export default RootBody;
