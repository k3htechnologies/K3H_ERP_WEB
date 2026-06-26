import RichTextEditor from "@/ui/components/forms/RichTextEditor";
import React, { useState } from "react";

interface EmailSenderProps {
  defaultTo?: string;
  defaultSubject?: string;
  defaultBody?: string;
  onSend: (data: EmailPayload) => Promise<void>;
}

interface EmailPayload {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  attachments?: File[];
}

const EmailSender: React.FC<EmailSenderProps> = ({
  defaultTo = "",
  defaultSubject = "",
  defaultBody = "",
  onSend,
}) => {
  const [to, setTo] = useState(defaultTo);
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCC, setShowCC] = useState(false);
  const [showBCC, setShowBCC] = useState(false);

  
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isBodyEmpty = (html: string) => {
    const cleaned = html.replace(/<(.|\n)*?>/g, "").trim();
    return !cleaned;
  };

  const handleSend = async () => {
    if (!to || !isValidEmail(to)) {
      alert("Enter valid email");
      return;
    }

    if (!subject.trim()) {
      alert("Subject required");
      return;
    }

    if (isBodyEmpty(body)) {
      alert("Body cannot be empty");
      return;
    }

    setLoading(true);
    try {
      await onSend({
        to,
        cc,
        bcc,
        subject,
        body,
        attachments: files,
      });

      alert("Email sent successfully");

      
      setTo("");
      setCc("");
      setBcc("");
      setSubject("");
      setBody("");
      setFiles([]);
    } catch (err) {
      console.error(err);
      alert("Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full  mx-auto rounded-xl shadow-lg bg-white border border-gray-200 overflow-hidden">

      
      {/* To */}
      <div className="flex items-center border border-gray-200 px-4 py-2 gap-2">
        <span className="w-12 text-gray-500">To</span>
        <input
          className="flex-1 outline-none focus:ring-0"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="Recipients"
        />
        <button type="button" onClick={() => setShowCC(!showCC)} className="text-blue-500 text-sm">Cc</button>
        <button type="button" onClick={() => setShowBCC(!showBCC)} className="text-blue-500 text-sm">Bcc</button>
      </div>

      {/* CC */}
      {showCC && (
        <div className="flex items-center border border-gray-200 px-4 py-2 gap-2">
          <span className="w-12 text-gray-500">Cc</span>

          <input
            className="flex-1 outline-none"
            value={cc}
            onChange={(e) => setCc(e.target.value)}
          />
        </div>
      )}

      {/* BCC */}
      {showBCC && (
        <div className="flex items-center border border-gray-200 px-4 py-2 gap-">
          <span className="w-12 text-gray-500">Bcc</span>
          <input
            className="flex-1 outline-none"
            value={bcc}
            onChange={(e) => setBcc(e.target.value)}
          />
        </div>
      )}

      {/* Subject */}
      <div className="flex items-center border border-gray-200 px-4 py-2 gap-4">
        <span className="w-12 text-gray-500">Subject</span>
        <input
          className="flex-1 outline-none"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter subject"
        />
      </div>

      {/* Body */}
      <div className="p-3 min-h-[200px]">
        <RichTextEditor
          value={body}
          onChange={setBody}
          placeholder="Write your message..."
        />
      </div>

      {/* Attachments Preview */}
      {files.length > 0 && (
        <div className="px-4 py-2 flex flex-wrap gap-2 border border-gray-200">
          {files.map((file, i) => (
            <div key={i} className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center gap-2">
              {file.name}
              <button
                onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                className="text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center px-4 py-3 border border-gray-200">
        

        <button
          type="button"
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-1.5 rounded-full hover:bg-blue-700"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default EmailSender;