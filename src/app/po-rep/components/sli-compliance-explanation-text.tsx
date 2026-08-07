const statesColorsMap = {
  compliant: "#66a61e",
  nonCompliant: "#ff0029",
  unknown: "orange",
} as const;

export function SliComplianceExplanationText() {
  return (
    <p>
      Deal is considered{" "}
      <strong style={{ color: statesColorsMap.compliant }}>Compliant</strong> if
      average of selected SLIs measured in given time window fulfills deal
      requirements, otherwise it is considered{" "}
      <strong style={{ color: statesColorsMap.nonCompliant }}>
        Non-compliant
      </strong>
      . <strong style={{ color: statesColorsMap.unknown }}>Unknown</strong>{" "}
      state refers to deals for which one or more of the selected SLIs was not
      measured in given time window. Provider is considered{" "}
      <strong style={{ color: statesColorsMap.compliant }}>Compliant</strong>{" "}
      when all of his deals are{" "}
      <strong style={{ color: statesColorsMap.compliant }}>Compliant</strong>.
    </p>
  );
}
