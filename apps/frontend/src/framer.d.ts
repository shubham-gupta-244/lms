// Ambient types for Framer's Code Component runtime.
// When this file is pasted into Framer, "framer" resolves to Framer's real
// runtime module — this declaration only exists so `bun run check-types`
// can typecheck the file outside of Framer.
declare module "framer" {
  export enum ControlType {
    String = "string",
    Color = "color",
    Array = "array",
    Object = "object",
  }

  export function addPropertyControls(component: unknown, controls: Record<string, unknown>): void;
}
