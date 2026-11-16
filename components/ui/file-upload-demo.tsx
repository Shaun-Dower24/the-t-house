import { FileUpload } from "@/components/ui/file-upload";

export default function FileUploadDemo() {
  return (
    <div className="mx-auto grid w-full max-w-md gap-3 px-4 py-8 sm:px-6">
      <p className="text-sm text-muted-foreground">Files selected for this demo stay in your browser.</p>
      <FileUpload />
    </div>
  );
}
