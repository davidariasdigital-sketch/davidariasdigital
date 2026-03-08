import { useEffect } from "react";

const ElevenLabsWidget = () => {
  useEffect(() => {
    // Load the ElevenLabs widget script
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
    script.async = true;
    script.type = "text/javascript";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: '<elevenlabs-convai agent-id="agent_5101kejswz3sfq9atmnjg54n3h05"></elevenlabs-convai>',
      }}
    />
  );
};

export default ElevenLabsWidget;
