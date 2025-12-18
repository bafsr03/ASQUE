import ModernTemplate from "./templates/ModernTemplate";
import ClassicTemplate from "./templates/ClassicTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";

interface QuotePDFProps {
  quote: any;
  settings?: any;
}

export default function QuotePDF({ quote, settings }: QuotePDFProps) {
  const template = settings?.template || "modern";

  switch (template) {
    case "classic":
      return <ClassicTemplate quote={quote} settings={settings} />;
    case "minimal":
      return <MinimalTemplate quote={quote} settings={settings} />;
    case "modern":
    default:
      return <ModernTemplate quote={quote} settings={settings} />;
  }
}
