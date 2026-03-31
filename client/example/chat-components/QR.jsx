import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { LinkButton } from "@react-spectrum/s2";

export const QR = ({ children }) => {
  let url = children;

  if (React.isValidElement(children) || Array.isArray(children)) {
    url = React.Children.toArray(children)
      .map((child) =>
        typeof child === "string" ? child : child.props?.children || ""
      )
      .join("");
  } else if (typeof children !== "string") {
    url = String(children);
  }

  const [qrSvg, setQrSvg] = useState("");

  useEffect(() => {
    let cancelled = false;
    QRCode.toString(String(url), { type: "svg", width: 200, margin: 0 })
      .then((svg) => {
        if (!cancelled) setQrSvg(svg);
      })
      .catch((err) => console.error("QR generation failed:", err));
    return () => {
      cancelled = true;
    };
  }, [url]);

  const svgBlob =
    "data:application/octet-stream;charset=utf-8," +
    encodeURIComponent(qrSvg);

  return (
    <div className="qr">
      <div className="qr-code">
        {qrSvg ? (
          <span dangerouslySetInnerHTML={{ __html: qrSvg }} />
        ) : null}
      </div>
      <div>
        <code>{url}</code>
      </div>
      <LinkButton variant="secondary" href={svgBlob} download="qr.svg">
        Download SVG
      </LinkButton>
    </div>
  );
};
