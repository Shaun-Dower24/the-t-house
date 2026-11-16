import { CopyButton } from "@/components/ui/copy-button";

export default function CopyButtonDemo() {
  return (
    <div className="copy-button-demo flex items-center justify-center bg-background p-4 text-foreground">
      <CopyButton content="npx shadcn add copy-button" />
    </div>
  );
}
