import { pixelBasedPreset, Tailwind } from "@react-email/components";

export default function Tw({ children }: { children: React.ReactNode }) {
  return (
    <Tailwind
      config={{
        presets: [pixelBasedPreset],
        theme: {
          fontFamily: {
            sans: [
              "-apple-system",
              "BlinkMacSystemFont",
              "'Segoe UI'",
              "'Roboto'",
              "'Oxygen'",
              "'Ubuntu'",
              "'Cantarell'",
              "'Fira Sans'",
              "'Droid Sans'",
              "'Helvetica Neue'",
              "sans-serif",
            ],
          },
          extend: {
            colors: {
              primary: "#04b694",
              secondary: "#1f94d2",
              accent: "#78828b",
              muted: "#dadcdc",
              destructive: "#ef4444",
            },
          },
        },
      }}
    >
      {children}
    </Tailwind>
  );
}
