"use client";

import dynamic from "next/dynamic";

const ClientSideCustomEditor = dynamic(() => import("./custom-editor"), {
  ssr: false,
});

export default ClientSideCustomEditor;
