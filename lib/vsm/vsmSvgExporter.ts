export function exportVSMMap(svgEl: SVGSVGElement, filename?: string): void {
  const cloned = svgEl.cloneNode(true) as SVGSVGElement;
  cloned.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  // Reset zoom/pan so export always shows full map at 1:1
  const contentG = cloned.querySelector("#vsm-content") as SVGGElement | null;
  if (contentG) contentG.setAttribute("transform", "translate(0,0) scale(1)");

  // Remove interaction attributes not needed in static export
  cloned.querySelectorAll("[data-draggable]").forEach((el) =>
    el.removeAttribute("data-draggable")
  );

  let src = new XMLSerializer().serializeToString(cloned);
  if (!src.match(/^<\?xml/)) {
    src = '<?xml version="1.0" encoding="UTF-8"?>\n' + src;
  }

  const blob = new Blob([src], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), {
    href: url,
    download: filename ?? `VSM_map_${new Date().toISOString().slice(0, 10)}.svg`,
  });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
